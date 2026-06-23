import { formatYieldLabel } from '@/lib/product-cost-per-copy';
import {
  flattenConsumableGroupItems,
  splitTonerItemsBySupplyType,
  type ConsumableGroup,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { ensureFullPrices } from '@/lib/roles';
import { usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

export type ConfigureTonerSupplyType = 'original' | 'compatible';

export interface ConfigureTonerCard {
  supplyType: ConfigureTonerSupplyType;
  title: string;
  optionId: string;
  productId: string;
  name: string;
  description: string;
  image: string;
  imageCandidates: string[];
  pricePen: number;
  priceUsd: number;
}

const GENERIC_TONER_IMAGES = new Set([
  '/categories/toner-suministros.png',
  '/products/toner-418480.webp',
  '/products/toner-419078.webp',
]);

function isGenericTonerImage(image: string | undefined): boolean {
  if (!image) return false;
  return GENERIC_TONER_IMAGES.has(image);
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
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(itemImage);
  if (product) {
    for (const url of buildProductImageCandidates(product, { stockFallback: true })) {
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
  fallbackImage: string,
): { image: string; imageCandidates: string[] } {
  const candidates = resolveTonerProductImageCandidates(productId, catalog, itemImage);

  if (optionImage && !isGenericTonerImage(optionImage)) {
    if (!candidates.includes(optionImage)) {
      candidates.push(optionImage);
    }
  }

  if (candidates.length === 0) {
    return { image: fallbackImage, imageCandidates: [fallbackImage] };
  }

  return { image: candidates[0], imageCandidates: candidates };
}

function isCompatibleOption(option: EquipmentConfigOption): boolean {
  const haystack = `${option.id} ${option.name}`.toLowerCase();
  return haystack.includes('compatible') || haystack.includes('alternativ');
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

function findMatchingOption(
  options: EquipmentConfigOption[],
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
): EquipmentConfigOption | undefined {
  const byProductId = options.find((option) => option.productId === item.productId);
  if (byProductId) return byProductId;

  if (supplyType === 'compatible') {
    return options.find((option) => !option.included && isCompatibleOption(option));
  }

  return options.find(
    (option) =>
      !option.included &&
      !isCompatibleOption(option) &&
      (option.productId != null || /^toner-ricoh/i.test(option.id)),
  );
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

  const bySupplyType = tonerStep.options.find((option) => {
    if (option.included) return false;
    return supplyType === 'compatible'
      ? isCompatibleOption(option)
      : !isCompatibleOption(option);
  });
  if (bySupplyType) {
    return syncOptionFromInventory(bySupplyType, item, supplyType);
  }

  return consumableToOption(item, supplyType);
}

/** Enriquece el paso de tóner con original y compatible del inventario (precio, imagen, rendimiento). */
export function mergeConsumableTonerOptions(
  steps: EquipmentConfigStep[],
  consumableGroups: ConsumableGroup[],
): EquipmentConfigStep[] {
  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (!tonerGroup) return steps;

  const tonerItems = flattenConsumableGroupItems([tonerGroup]);
  const { original, compatible } = splitTonerItemsBySupplyType(tonerItems);
  const primaryOriginal = original[0] ?? null;
  const primaryCompatible = compatible[0] ?? null;

  if (!primaryOriginal && !primaryCompatible) return steps;

  return steps.map((step) => {
    if (step.id !== 'toner') return step;

    let options = [...step.options];

    if (primaryOriginal) {
      const existing = findMatchingOption(options, primaryOriginal, 'original');

      if (existing?.included) {
        const starter = mergeOptionFromConsumable(existing, primaryOriginal, 'original');
        options = options.filter((option) => option.id !== starter.id);
        options.push(starter);

        const purchasable = consumableToOption(primaryOriginal, 'original');
        if (!options.some((option) => option.id === purchasable.id)) {
          options.push(purchasable);
        }
      } else {
        const merged = mergeOptionFromConsumable(existing, primaryOriginal, 'original');
        options = options.filter((option) => option.id !== merged.id);
        options.push(merged);
      }
    }

    if (primaryCompatible) {
      const existing = findMatchingOption(options, primaryCompatible, 'compatible');
      const merged = mergeOptionFromConsumable(existing, primaryCompatible, 'compatible');
      options = options.filter((option) => option.id !== merged.id);
      options.push(merged);
    }

    return { ...step, options };
  });
}

function optionToCard(
  option: EquipmentConfigOption,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
): ConfigureTonerCard | null {
  if (option.included || !option.productId) return null;
  if (option.pricePen <= 0 && (option.priceUsd == null || option.priceUsd <= 0)) return null;

  const media = resolveTonerCardMedia(
    option.productId,
    catalog,
    null,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: supplyType === 'original' ? 'Original' : 'Compatible',
    optionId: option.id,
    productId: option.productId,
    name: option.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen: option.pricePen,
    priceUsd: option.priceUsd ?? 0,
  };
}

function inventoryItemToCard(
  tonerStep: EquipmentConfigStep,
  item: ConsumableItem,
  supplyType: ConfigureTonerSupplyType,
  catalog: Product[],
  fallbackImage: string,
): ConfigureTonerCard | null {
  const option = resolvePurchasableOptionForInventoryItem(tonerStep, item, supplyType);
  const priceUsd = ensureFullPrices({ public: item.priceUsd }).public;
  const pricePen = usdToPen(priceUsd);
  if (pricePen <= 0 && priceUsd <= 0) return null;

  const media = resolveTonerCardMedia(
    item.productId,
    catalog,
    item.image,
    option.image,
    fallbackImage,
  );

  return {
    supplyType,
    title: supplyType === 'original' ? 'Original' : 'Compatible',
    optionId: option.id,
    productId: item.productId,
    name: item.name,
    description: option.description?.trim() || 'Rendimiento según modelo',
    image: media.image,
    imageCandidates: media.imageCandidates,
    pricePen,
    priceUsd,
  };
}

export function resolveConfigureTonerCards(
  tonerStep: EquipmentConfigStep | undefined,
  consumableGroups: ConsumableGroup[],
  fallbackImage: string,
  catalog: Product[] = [],
): ConfigureTonerCard[] {
  if (!tonerStep) return [];

  const tonerGroup = consumableGroups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    const { original, compatible } = splitTonerItemsBySupplyType(
      flattenConsumableGroupItems([tonerGroup]),
    );
    const cards: ConfigureTonerCard[] = [];

    if (original[0]) {
      const card = inventoryItemToCard(tonerStep, original[0], 'original', catalog, fallbackImage);
      if (card) cards.push(card);
    }

    if (compatible[0]) {
      const card = inventoryItemToCard(tonerStep, compatible[0], 'compatible', catalog, fallbackImage);
      if (card) cards.push(card);
    }

    if (cards.length > 0) return cards;
  }

  const purchasable = tonerStep.options.filter((option) => !option.included);
  const cards: ConfigureTonerCard[] = [];
  const compatibleOption = purchasable.find((option) => isCompatibleOption(option));
  const originalOption = purchasable.find((option) => !isCompatibleOption(option));

  if (originalOption) {
    const card = optionToCard(originalOption, 'original', catalog, fallbackImage);
    if (card) cards.push(card);
  }

  if (compatibleOption) {
    const card = optionToCard(compatibleOption, 'compatible', catalog, fallbackImage);
    if (card) cards.push(card);
  }

  return cards;
}
