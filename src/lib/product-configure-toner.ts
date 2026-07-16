import { formatYieldLabel } from '@/lib/product-cost-per-copy';
import { isTonerPackProduct } from '@/lib/product-bundle';
import {
  isCrossSellEligibleProduct,
  isTonerMerchandisingProduct,
  resolveKnownOriginalTonerProductIds,
  resolveKnownCompatibleTonerProductIds,
  resolveTonerSupplyTypeFromProduct,
  normalizeMerchandisingProductIds,
} from '@/lib/product-merchandising';
import {
  flattenConsumableGroupItems,
  formatConsumableListDisplayName,
  isTonerSupplyAssemblyName,
  isTonerSupplyAssemblyProduct,
  splitTonerItemsBySupplyType,
  tonerProductMatchesEquipment,
  type ConsumableGroup,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { ensureFullPrices, type ProductRolePrices } from '@/lib/roles';
import {
  resolveProductEquipmentConditionLabel,
  resolveProductHeroConditionLabel,
} from '@/lib/product-hero-meta';
import { penToUsd, usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

export type ConfigureTonerSupplyType = 'original' | 'compatible';

function conditionLabelImpliesCompatibleToner(conditionLabel: string): boolean {
  const normalized = conditionLabel
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return normalized.includes('seminueva') || normalized.includes('remanufacturada');
}

/** Pestaña Toner por defecto según condición del equipo (Nueva → original; seminueva/remanufacturada → compatible). */
export function resolveDefaultTonerSupplyTypeForEquipment(
  product: Product,
): ConfigureTonerSupplyType {
  const fromHero = resolveProductHeroConditionLabel(product);
  if (fromHero) {
    return conditionLabelImpliesCompatibleToner(fromHero) ? 'compatible' : 'original';
  }

  const fromEquipment = resolveProductEquipmentConditionLabel(product);
  if (fromEquipment === 'Seminueva' || fromEquipment === 'Remanufacturada') {
    return 'compatible';
  }

  return 'original';
}

interface TonerCardBuildOptions {
  allowZeroPrice?: boolean;
  equipment?: Product;
}

const TONER_COLOR_ORDER = ['cyan', 'magenta', 'amarillo', 'yellow', 'negro', 'black'] as const;

function normalizeTonerModelToken(model: string): string {
  return model.replace(/\s+/g, ' ').trim().toUpperCase();
}

function extractRicohModelLabel(name: string): string | null {
  const trimmed = name.trim();
  const ricohMatch = trimmed.match(/\bRICOH\s+(IM\s*C?\s*\d{3,4}[A-Z]?)\b/i);
  if (ricohMatch?.[1]) {
    return `RICOH ${normalizeTonerModelToken(ricohMatch[1])}`;
  }

  const imMatch = trimmed.match(/\b(IM\s*C?\s*\d{3,4}[A-Z]?)\b/i);
  if (imMatch?.[1]) {
    return `RICOH ${normalizeTonerModelToken(imMatch[1])}`;
  }

  const mpMatch = trimmed.match(/\b(MP\s*[\w]+)\b/i);
  if (mpMatch?.[1]) {
    return `RICOH ${normalizeTonerModelToken(mpMatch[1])}`;
  }

  const mSeriesMatch = trimmed.match(/\bM\s+\d{3,4}[A-Z]?\b/i);
  if (mSeriesMatch?.[0]) {
    return `RICOH ${normalizeTonerModelToken(mSeriesMatch[0])}`;
  }

  return null;
}

function resolveTonerEquipmentModelLabel(equipment?: Product, fallbackName?: string): string {
  if (equipment) {
    const fromEquipment = extractRicohModelLabel(equipment.name);
    if (fromEquipment) return fromEquipment;
  }

  if (fallbackName) {
    const fromName = extractRicohModelLabel(fallbackName);
    if (fromName) return fromName;
  }

  const brand = equipment?.brand?.trim();
  return brand ? brand.toUpperCase() : 'RICOH';
}

export function resolveTonerColorLabel(
  product: Product | undefined,
  fallbackName?: string,
): string | null {
  const colorAttr = product?.attributes?.find((attribute) =>
    /^color$/i.test(attribute.name.trim()),
  )?.value;
  const raw = (colorAttr ?? fallbackName ?? product?.name ?? '').trim();
  if (!raw) return null;

  if (/\bcyan\b|\bcy\b/i.test(raw)) return 'Cyan';
  if (/\bmagenta\b|\bmg\b/i.test(raw)) return 'Magenta';
  if (/\bamarillo\b|\byellow\b|\byw\b/i.test(raw)) return 'Amarillo';
  if (/\bnegro\b|\bblack\b|\bbk\b/i.test(raw)) return 'Negro';
  return null;
}

function tonerColorSortKey(label: string | null | undefined): number {
  const normalized = (label ?? '').toLowerCase();
  const index = TONER_COLOR_ORDER.indexOf(
    normalized as (typeof TONER_COLOR_ORDER)[number],
  );
  return index >= 0 ? index : 99;
}

export function resolveConfigureTonerCardTitle(
  supplyType: ConfigureTonerSupplyType,
  equipment?: Product,
  fallbackName?: string,
  product?: Product,
): string {
  const catalogName = product?.name?.trim() || fallbackName?.trim() || '';
  if (catalogName) {
    return formatTonerCardDisplayTitle(catalogName);
  }

  const modelLabel = resolveTonerEquipmentModelLabel(equipment, fallbackName);
  const colorLabel = resolveTonerColorLabel(product, fallbackName);
  const base =
    supplyType === 'original'
      ? `Toner Original ${modelLabel}`
      : `Toner compatible ${modelLabel}`;
  return colorLabel ? `${base} — ${colorLabel}` : base;
}

function resolveKnownTonerIdsForEquipment(equipment: Product): readonly string[] {
  return [
    ...resolveKnownOriginalTonerProductIds(equipment),
    ...resolveKnownCompatibleTonerProductIds(equipment),
  ];
}

function isTonerProductAllowedForEquipment(
  toner: Product | undefined,
  equipment: Product | undefined,
): boolean {
  if (!toner || !equipment) return true;
  if (isTonerSupplyAssemblyProduct(toner)) return false;

  const knownTonerIds = resolveKnownTonerIdsForEquipment(equipment);
  if (knownTonerIds.includes(toner.id)) return true;

  return tonerProductMatchesEquipment(toner, equipment, { knownTonerIds });
}

/** Quita «Cartucho» y normaliza Intercopy / M 320F en títulos de tóner en UI. */
export function formatTonerCardDisplayTitle(title: string): string {
  return formatConsumableListDisplayName(title);
}

function shouldSkipZeroPriceCard(
  pricePen: number,
  priceUsd: number,
  options?: TonerCardBuildOptions,
): boolean {
  return !options?.allowZeroPrice && pricePen <= 0 && priceUsd <= 0;
}

function resolveTonerCardCode(
  productId: string,
  catalog: Product[],
  fallbackSku?: string,
): string {
  const product = catalog.find((row) => row.id === productId);
  if (product) {
    const formatted = formatProductDisplayCode(product.code, {
      brand: product.brand,
      category: product.category,
      name: product.name,
    });
    if (formatted) return formatted;
    const raw = product.code?.trim();
    if (raw) return raw;
  }

  const sku = fallbackSku?.trim();
  if (sku) return sku;

  return productId;
}

export interface ConfigureTonerCard {
  supplyType: ConfigureTonerSupplyType;
  title: string;
  optionId: string;
  productId: string;
  code: string;
  name: string;
  description: string;
  image: string;
  imageCandidates: string[];
  pricePen: number;
  priceUsd: number;
  prices: ProductRolePrices;
}

const GENERIC_TONER_IMAGES = new Set([
  '/categories/toner-suministros.png',
  '/products/toner-418480.webp',
  '/products/toner-419078.webp',
]);

function isGenericTonerImage(image: string | undefined): boolean {
  if (!image) return false;
  if (GENERIC_TONER_IMAGES.has(image)) return true;
  // Packs demo Intercopy (bundle CMYK) no deben mostrarse como foto del cartucho individual.
  if (/\/toner-pack-/i.test(image)) return true;
  if (/\/categories\/toner/i.test(image)) return true;
  return false;
}

function resolveTonerProductImageCandidates(
  productId: string,
  catalog: Product[],
  itemImage: string | null,
): string[] {
  const product = catalog.find((row) => row.id === productId);
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (url: string | null | undefined) => {
    if (!url || seen.has(url) || isGenericTonerImage(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(itemImage);
  if (product) {
    for (const url of buildProductImageCandidates(product)) {
      push(url);
    }
  }

  return candidates;
}

function resolveTonerCardMedia(
  productId: string,
  catalog: Product[],
  itemImage: string | null,
  optionImage: string | undefined,
  _fallbackImage: string,
): { image: string; imageCandidates: string[] } {
  const candidates = resolveTonerProductImageCandidates(productId, catalog, itemImage);

  if (optionImage && !isGenericTonerImage(optionImage) && !candidates.includes(optionImage)) {
    candidates.push(optionImage);
  }

  // Sin imagen demo: la UI muestra el placeholder «Sin imagen».
  if (candidates.length === 0) {
    return { image: '', imageCandidates: [] };
  }

  return { image: candidates[0], imageCandidates: candidates };
}

function isPackTonerProduct(product: Product | undefined): boolean {
  if (!product) return false;
  return isTonerPackProduct(product);
}

function isPackTonerName(name: string | undefined): boolean {
  return /\bPack x04\b/i.test(name ?? '');
}

function isCompatibleOption(option: EquipmentConfigOption): boolean {
  const haystack = `${option.id} ${option.name}`.toLowerCase();
  return haystack.includes('compatible') || haystack.includes('alternativ');
}

function shouldOfferPurchasableTonerFromOption(option: EquipmentConfigOption): boolean {
  if (!option.productId) return false;
  if (!option.included) return true;
  if (option.id === 'toner-inicio') return false;
  return option.id.startsWith('toner-');
}

/** IDs de catálogo necesarios para resolver precios/imágenes del selector de tóner sin esperar al catálogo completo. */
export function resolveTonerCatalogLookupIds(
  equipment: Product,
  equipmentConfigSteps: EquipmentConfigStep[],
): string[] {
  const ids = new Set<string>();
  const tonerStep = equipmentConfigSteps.find((step) => step.id === 'toner');

  for (const option of tonerStep?.options ?? []) {
    if (option.productId) ids.add(option.productId);
  }

  for (const productId of resolveKnownOriginalTonerProductIds(equipment)) {
    ids.add(productId);
  }

  for (const productId of resolveKnownCompatibleTonerProductIds(equipment)) {
    ids.add(productId);
  }

  for (const productId of normalizeMerchandisingProductIds(equipment.cross_sell_product_ids)) {
    ids.add(productId);
  }

  return [...ids];
}

function consumableToOption(item: ConsumableItem, supplyType: ConfigureTonerSupplyType): EquipmentConfigOption {
  const priceUsd = ensureFullPrices({ public: item.priceUsd }).public;
  const yieldText = formatYieldLabel(item.yieldPages ?? null, item.yieldLabel ?? null);
  const description =
    yieldText !== '—' ? yieldText : supplyType === 'compatible' ? 'Rendimiento según modelo' : 'Cartucho original';

  return {
    id: `toner-${supplyType}-${item.productId}`,
    productId: item.productId,
    name: item.name,
    ...(description ? { description } : {}),
    pricePen: usdToPen(priceUsd),
    priceUsd,
    ...(item.image ? { image: item.image } : {}),
    ...(item.sku ? { sku: item.sku } : {}),
  };
}

function mergeOptionFromConsumable(
  existing: EquipmentConfigOption | undefined,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const fromInventory = consumableToOption(item, supplyType);
  if (!existing) return fromInventory;

  const keepIncludedFree = Boolean(existing.included);
  const resolvedImage =
    item.image ??
    (existing.image && !isGenericTonerImage(existing.image) ? existing.image : undefined);

  return {
    ...existing,
    productId: item.productId,
    name: item.name.trim() ? item.name : existing.name,
    ...(fromInventory.description ? { description: fromInventory.description } : {}),
    pricePen: keepIncludedFree ? 0 : fromInventory.pricePen,
    ...(keepIncludedFree
      ? { priceUsd: 0 }
      : fromInventory.priceUsd != null
        ? { priceUsd: fromInventory.priceUsd }
        : {}),
    ...(resolvedImage ? { image: resolvedImage } : {}),
    ...((item.sku ?? existing.sku) ? { sku: item.sku ?? existing.sku } : {}),
  };
}

function syncOptionFromInventory(
  option: EquipmentConfigOption,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const fromInventory = consumableToOption(item, supplyType);
  const resolvedImage =
    item.image ??
    (option.image && !isGenericTonerImage(option.image) ? option.image : undefined);
  const keepIncludedFree = Boolean(option.included);

  return {
    ...option,
    productId: item.productId,
    name: item.name,
    ...(fromInventory.description ? { description: fromInventory.description } : {}),
    pricePen: keepIncludedFree ? 0 : fromInventory.pricePen,
    ...(keepIncludedFree
      ? { priceUsd: 0 }
      : fromInventory.priceUsd != null
        ? { priceUsd: fromInventory.priceUsd }
        : {}),
    ...(resolvedImage ? { image: resolvedImage } : {}),
    ...(item.sku ?? option.sku ? { sku: item.sku ?? option.sku } : {}),
  };
}

function resolvePurchasableOptionForInventoryItem(
  tonerStep: EquipmentConfigStep,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption {
  const purchasableByProduct = tonerStep.options.find(
    (option) => !option.included && option.productId === item.productId,
  );
  if (purchasableByProduct) {
    return syncOptionFromInventory(purchasableByProduct, item, supplyType);
  }

  // Opción genérica del mismo supply type sin productId (o ya apuntando a este ítem).
  // No reutilizar una opción ya vinculada a otro producto: cada tóner CMYK necesita su propio optionId.
  const bySupplyType = tonerStep.options.find((option) => {
    if (option.included) return false;
    if (option.productId && option.productId !== item.productId) return false;
    return supplyType === 'compatible'
      ? isCompatibleOption(option)
      : !isCompatibleOption(option);
  });
  if (bySupplyType) {
    const synced = syncOptionFromInventory(bySupplyType, item, supplyType);
    return {
      ...synced,
      id: bySupplyType.productId === item.productId ? synced.id : `toner-${supplyType}-${item.productId}`,
      productId: item.productId,
    };
  }

  return consumableToOption(item, supplyType);
}

function mergeInventoryTonerItemIntoOptions(
  options: EquipmentConfigOption[],
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption[] {
  const existingByProduct = options.find((option) => option.productId === item.productId);

  if (existingByProduct?.included) {
    const starter = mergeOptionFromConsumable(existingByProduct, item, supplyType);
    const next = options.filter((option) => option.id !== starter.id);
    next.push(starter);

    const purchasable = consumableToOption(item, supplyType);
    if (
      !next.some(
        (option) =>
          !option.included &&
          (option.id === purchasable.id || option.productId === item.productId),
      )
    ) {
      next.push(purchasable);
    }
    return next;
  }

  if (existingByProduct) {
    const merged = mergeOptionFromConsumable(existingByProduct, item, supplyType);
    return options.map((option) => (option.id === existingByProduct.id ? merged : option));
  }

  // Primera opción genérica del supply type (sin productId) se puede enriquecer una sola vez.
  const generic = options.find((option) => {
    if (option.included || option.productId) return false;
    return supplyType === 'compatible'
      ? isCompatibleOption(option)
      : !isCompatibleOption(option);
  });

  if (generic) {
    const merged = {
      ...mergeOptionFromConsumable(generic, item, supplyType),
      id: `toner-${supplyType}-${item.productId}`,
      productId: item.productId,
    };
    return [...options.filter((option) => option.id !== generic.id), merged];
  }

  return [...options, consumableToOption(item, supplyType)];
}

/** Enriquece el paso de tóner con todos los tóners del inventario (p. ej. CMYK). */
export function mergeConsumableTonerOptions(
  steps: EquipmentConfigStep[],
  consumableGroups: ConsumableGroup[],
): EquipmentConfigStep[] {
  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (!tonerGroup) return steps;

  const tonerItems = flattenConsumableGroupItems([tonerGroup]).filter(
    (item) => !isPackTonerName(item.name) && !isTonerSupplyAssemblyName(item.name),
  );
  const { original, compatible } = splitTonerItemsBySupplyType(tonerItems);

  if (original.length === 0 && compatible.length === 0) return steps;

  return steps.map((step) => {
    if (step.id !== 'toner') return step;

    let options = [...step.options];

    for (const item of original) {
      options = mergeInventoryTonerItemIntoOptions(options, item, 'original');
    }
    for (const item of compatible) {
      options = mergeInventoryTonerItemIntoOptions(options, item, 'compatible');
    }

    return { ...step, options };
  });
}

function resolveTonerProductPrices(
  productId: string,
  catalog: Product[],
  fallbackUsd: number,
): ProductRolePrices {
  const product = catalog.find((row) => row.id === productId);
  if (!product) {
    return ensureFullPrices({ public: fallbackUsd });
  }
  return ensureFullPrices(product.prices ?? { public: product.price });
}

function optionToCard(
  option: EquipmentConfigOption,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  if (!shouldOfferPurchasableTonerFromOption(option)) return null;
  const productId = option.productId!;

  const prices = resolveTonerProductPrices(
    productId,
    catalog,
    option.priceUsd ?? penToUsd(option.pricePen),
  );
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const media = resolveTonerCardMedia(
    productId,
    catalog,
    null,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: resolveConfigureTonerCardTitle(
      supplyType,
      buildOptions?.equipment,
      option.name,
      catalog.find((row) => row.id === productId),
    ),
    optionId: option.id,
    productId,
    code: resolveTonerCardCode(productId, catalog, option.sku),
    name: option.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function inventoryItemToCard(
  tonerStep: EquipmentConfigStep,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  const option = resolvePurchasableOptionForInventoryItem(tonerStep, item, supplyType);
  const prices = resolveTonerProductPrices(item.productId, catalog, item.priceUsd);
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const media = resolveTonerCardMedia(
    item.productId,
    catalog,
    item.image,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: resolveConfigureTonerCardTitle(
      supplyType,
      buildOptions?.equipment,
      item.name,
      catalog.find((row) => row.id === item.productId),
    ),
    optionId: option.id,
    productId: item.productId,
    code: resolveTonerCardCode(item.productId, catalog, item.sku ?? option.sku),
    name: item.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function catalogProductToTonerCard(
  product: Product,
  supplyType: ConfigureTonerSupplyType,
  tonerStep: EquipmentConfigStep,
  fallbackImage: string,
  buildOptions?: TonerCardBuildOptions,
): ConfigureTonerCard | null {
  const prices = resolveTonerProductPrices(product.id, [product], product.price);
  const priceUsd = prices.public;
  const pricePen = usdToPen(priceUsd);
  if (shouldSkipZeroPriceCard(pricePen, priceUsd, buildOptions)) return null;

  const matchingOption = tonerStep.options.find((option) => option.productId === product.id);
  const optionId = matchingOption?.id ?? `toner-${supplyType}-${product.id}`;

  const media = resolveTonerCardMedia(
    product.id,
    [product],
    null,
    matchingOption?.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: resolveConfigureTonerCardTitle(supplyType, buildOptions?.equipment, product.name, product),
    optionId,
    productId: product.id,
    code: resolveTonerCardCode(product.id, [product], matchingOption?.sku),
    name: product.name,
    description:
      matchingOption?.description?.trim() ||
      product.description?.trim() ||
      'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
    prices,
  };
}

function pushUniqueTonerCard(
  cards: ConfigureTonerCard[],
  seenProductIds: Set<string>,
  card: ConfigureTonerCard | null,
  equipment?: Product,
  catalog: Product[] = [],
): void {
  if (!card || seenProductIds.has(card.productId)) return;
  if (isTonerSupplyAssemblyName(card.name)) return;

  const catalogProduct = catalog.find((row) => row.id === card.productId);
  if (catalogProduct && isTonerSupplyAssemblyProduct(catalogProduct)) return;
  if (equipment && catalogProduct && !isTonerProductAllowedForEquipment(catalogProduct, equipment)) {
    return;
  }

  seenProductIds.add(card.productId);
  cards.push(card);
}

function sortTonerCards(cards: ConfigureTonerCard[]): ConfigureTonerCard[] {
  return [...cards].sort((a, b) => {
    if (a.supplyType !== b.supplyType) {
      return a.supplyType === 'original' ? -1 : 1;
    }
    const colorDiff =
      tonerColorSortKey(resolveTonerColorLabel(undefined, a.name) ?? resolveTonerColorLabel(undefined, a.title)) -
      tonerColorSortKey(resolveTonerColorLabel(undefined, b.name) ?? resolveTonerColorLabel(undefined, b.title));
    if (colorDiff !== 0) return colorDiff;
    return a.name.localeCompare(b.name, 'es');
  });
}

function mergeTonerCardsPreferPrimary(
  primary: ConfigureTonerCard[],
  fallback: ConfigureTonerCard[],
): ConfigureTonerCard[] {
  const merged = [...primary];
  const seen = new Set(primary.map((card) => card.productId));

  // No limitar a 1 original / 1 compatible: el inventario puede traer CMYK (4 colores).
  for (const card of fallback) {
    if (seen.has(card.productId)) continue;
    seen.add(card.productId);
    merged.push(card);
  }

  return sortTonerCards(merged);
}

function buildCrossSellTonerCards(
  tonerStep: EquipmentConfigStep,
  equipment: Product,
  catalog: Product[],
  fallbackImage: string,
): ConfigureTonerCard[] {
  const cards: ConfigureTonerCard[] = [];
  const seenProductIds = new Set<string>();
  const buildOptions: TonerCardBuildOptions = { allowZeroPrice: true, equipment };

  for (const productId of normalizeMerchandisingProductIds(equipment.cross_sell_product_ids)) {
    const catalogProduct = catalog.find((row) => row.id === productId);
    if (
      !catalogProduct ||
      isPackTonerProduct(catalogProduct) ||
      isTonerSupplyAssemblyProduct(catalogProduct) ||
      !isCrossSellEligibleProduct(catalogProduct) ||
      !isTonerMerchandisingProduct(catalogProduct)
    ) {
      continue;
    }

    const supplyType = resolveTonerSupplyTypeFromProduct(catalogProduct);
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      catalogProductToTonerCard(
        catalogProduct,
        supplyType,
        tonerStep,
        fallbackImage,
        buildOptions,
      ),
      equipment,
      catalog,
    );
  }

  return cards;
}

function pushKnownEquipmentTonerCards(
  cards: ConfigureTonerCard[],
  seenProductIds: Set<string>,
  tonerStep: EquipmentConfigStep,
  catalog: Product[],
  fallbackImage: string,
  equipment: Product,
  buildOptions: TonerCardBuildOptions,
): void {
  const knownOriginalIds = resolveKnownOriginalTonerProductIds(equipment);
  for (const knownOriginalId of knownOriginalIds) {
    const catalogProduct = catalog.find((row) => row.id === knownOriginalId);
    if (!catalogProduct) continue;

    pushUniqueTonerCard(
      cards,
      seenProductIds,
      catalogProductToTonerCard(catalogProduct, 'original', tonerStep, fallbackImage, buildOptions),
      equipment,
      catalog,
    );
  }

  const knownCompatibleIds = resolveKnownCompatibleTonerProductIds(equipment);
  for (const knownCompatibleId of knownCompatibleIds) {
    const catalogProduct = catalog.find((row) => row.id === knownCompatibleId);
    if (!catalogProduct) continue;

    pushUniqueTonerCard(
      cards,
      seenProductIds,
      catalogProductToTonerCard(
        catalogProduct,
        'compatible',
        tonerStep,
        fallbackImage,
        buildOptions,
      ),
      equipment,
      catalog,
    );
  }
}

function resolveAutoConfigureTonerCards(
  tonerStep: EquipmentConfigStep,
  consumableGroups: ConsumableGroup[],
  fallbackImage: string,
  catalog: Product[],
  equipment?: Product,
): ConfigureTonerCard[] {
  const cards: ConfigureTonerCard[] = [];
  const seenProductIds = new Set<string>();
  const buildOptions: TonerCardBuildOptions = equipment ? { equipment } : {};

  if (equipment) {
    pushKnownEquipmentTonerCards(
      cards,
      seenProductIds,
      tonerStep,
      catalog,
      fallbackImage,
      equipment,
      buildOptions,
    );
  }

  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    const { original, compatible } = splitTonerItemsBySupplyType(
      flattenConsumableGroupItems([tonerGroup]).filter(
        (item) => !isPackTonerName(item.name) && !isTonerSupplyAssemblyName(item.name),
      ),
    );

    // Incluir todos los tóners del inventario por supply type (CMYK = 4, no solo el primero).
    for (const item of original) {
      pushUniqueTonerCard(
        cards,
        seenProductIds,
        inventoryItemToCard(tonerStep, item, 'original', catalog, fallbackImage, buildOptions),
        equipment,
        catalog,
      );
    }
    for (const item of compatible) {
      pushUniqueTonerCard(
        cards,
        seenProductIds,
        inventoryItemToCard(tonerStep, item, 'compatible', catalog, fallbackImage, buildOptions),
        equipment,
        catalog,
      );
    }
  }

  for (const option of tonerStep.options) {
    if (!shouldOfferPurchasableTonerFromOption(option)) continue;
    if (isPackTonerName(option.name) || isTonerSupplyAssemblyName(option.name)) continue;

    const supplyType = isCompatibleOption(option) ? 'compatible' : 'original';
    const catalogProduct = catalog.find((row) => row.id === option.productId);
    if (catalogProduct && isPackTonerProduct(catalogProduct)) continue;
    if (catalogProduct && isTonerSupplyAssemblyProduct(catalogProduct)) continue;

    if (catalogProduct && isCrossSellEligibleProduct(catalogProduct)) {
      pushUniqueTonerCard(
        cards,
        seenProductIds,
        catalogProductToTonerCard(catalogProduct, supplyType, tonerStep, fallbackImage, buildOptions),
        equipment,
        catalog,
      );
      continue;
    }

    pushUniqueTonerCard(
      cards,
      seenProductIds,
      optionToCard(option, supplyType, catalog, fallbackImage, buildOptions),
      equipment,
      catalog,
    );
  }

  if (cards.length > 0) return sortTonerCards(cards);

  const purchasable = tonerStep.options.filter(
    (option) =>
      !option.included &&
      !isPackTonerName(option.name) &&
      !isTonerSupplyAssemblyName(option.name),
  );
  for (const option of purchasable) {
    const supplyType = isCompatibleOption(option) ? 'compatible' : 'original';
    pushUniqueTonerCard(
      cards,
      seenProductIds,
      optionToCard(option, supplyType, catalog, fallbackImage, buildOptions),
      equipment,
      catalog,
    );
  }

  return sortTonerCards(cards);
}

/** Añade opciones de tóner del inventario según venta cruzada configurada en admin. */
export function mergeCrossSellTonerOptions(
  steps: EquipmentConfigStep[],
  equipment: Product,
  catalog: Product[] = [],
): EquipmentConfigStep[] {
  const ids = normalizeMerchandisingProductIds(equipment.cross_sell_product_ids);
  if (ids.length === 0) return steps;

  return steps.map((step) => {
    if (step.id !== 'toner') return step;

    const options = [...step.options];
    for (const productId of ids) {
      const product = catalog.find((row) => row.id === productId);
      if (!product || !isCrossSellEligibleProduct(product) || !isTonerMerchandisingProduct(product)) {
        continue;
      }
      if (
        isTonerPackProduct(product) ||
        isPackTonerName(product.name) ||
        isTonerSupplyAssemblyProduct(product)
      ) {
        continue;
      }
      if (!tonerProductMatchesEquipment(product, equipment)) {
        continue;
      }

      const supplyType = resolveTonerSupplyTypeFromProduct(product);
      const optionId = `toner-${supplyType}-${productId}`;
      if (options.some((option) => option.id === optionId || option.productId === productId)) {
        continue;
      }

      const prices = ensureFullPrices(product.prices ?? { public: product.price });
      const priceUsd = prices.public;
      const description = product.description?.trim();
      options.push({
        id: optionId,
        productId,
        name: product.name,
        pricePen: usdToPen(priceUsd),
        priceUsd,
        ...(description ? { description } : {}),
        ...(product.image_url ? { image: product.image_url } : {}),
      });
    }

    return { ...step, options };
  });
}

export function resolveConfigureTonerCards(
  tonerStep: EquipmentConfigStep | undefined,
  consumableGroups: ConsumableGroup[],
  fallbackImage: string,
  catalog: Product[] = [],
  equipment?: Product,
): ConfigureTonerCard[] {
  if (!tonerStep) return [];

  const crossSellIds = normalizeMerchandisingProductIds(equipment?.cross_sell_product_ids);
  const autoCards = resolveAutoConfigureTonerCards(
    tonerStep,
    consumableGroups,
    fallbackImage,
    catalog,
    equipment,
  );

  if (crossSellIds.length > 0 && equipment) {
    const crossSellCards = buildCrossSellTonerCards(
      tonerStep,
      equipment,
      catalog,
      fallbackImage,
    );
    if (crossSellCards.length > 0) {
      return mergeTonerCardsPreferPrimary(crossSellCards, autoCards);
    }
  }

  return autoCards;
}
