import { ShoppingBag, TrendingUp } from 'lucide-react';

import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import {
  IM430F_ORIGINAL_TONER_PRODUCT_ID,
  IM550F_COMPATIBLE_TONER_PRODUCT_ID,
  IM600F_ORIGINAL_TONER_PRODUCT_ID,
  IM_C320F_COMPATIBLE_TONER_IDS,
  IM_C320F_EQUIPMENT_PRODUCT_ID,
  IM_C320F_ORIGINAL_TONER_IDS,
  M320F_COMPATIBLE_TONER_PRODUCT_ID,
  M320F_EQUIPMENT_PRODUCT_ID,
  M320F_ORIGINAL_TONER_PRODUCT_ID,
  MPC407_COMPATIBLE_TONER_IDS,
  MPC407_EQUIPMENT_PRODUCT_ID,
  MPC407_ORIGINAL_TONER_IDS,
} from '@/lib/equipment-config-catalog';
import {
  flattenConsumableGroupItems,
  resolveEquipmentConsumables,
  splitTonerItemsBySupplyType,
} from '@/lib/product-equipment-consumables';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { ensureFullPrices, type ProductRolePrices } from '@/lib/roles';
import { usdToPen } from '@/lib/utils';
import type { InventoryProduct, MerchandisingOptionalProduct, Product } from '@/types/product';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
// @ts-expect-error módulo JS compartido sin declaración de tipos
import { normalizeMerchandisingOptionalProducts } from '../../shared/merchandising-optional-product.js';

export { normalizeMerchandisingOptionalProducts };

export const MERCHANDISING_CROSS_SELL_STEP_ID = 'merchandising-cross-sell';
export const MERCHANDISING_UPSELL_STEP_ID = 'merchandising-upsell';

export function isMerchandisingEquipmentStepId(stepId: string): boolean {
  return stepId === MERCHANDISING_CROSS_SELL_STEP_ID || stepId === MERCHANDISING_UPSELL_STEP_ID;
}

export function crossSellOptionId(productId: string): string {
  return `cross-sell-${productId}`;
}

export function upsellOptionId(productId: string): string {
  return `upsell-${productId}`;
}

function toCatalogProduct(row: Product | InventoryProduct): Product {
  if ('price' in row && typeof row.price === 'number') {
    return row;
  }
  const inventory = row as InventoryProduct;
  return {
    ...inventory,
    price: inventory.prices.public,
  };
}

export function normalizeMerchandisingProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const id = entry.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function normalizeEquipmentName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Varios tóneres originales conocidos (p. ej. CMYK en equipos color). */
export function resolveKnownOriginalTonerProductIds(equipment: Product): string[] {
  if (
    equipment.id === IM_C320F_EQUIPMENT_PRODUCT_ID ||
    /\bim\s*c\s*320\s*f\b/i.test(equipment.name)
  ) {
    return [...IM_C320F_ORIGINAL_TONER_IDS];
  }

  if (
    equipment.id === MPC407_EQUIPMENT_PRODUCT_ID ||
    /\bmp\s*c\s*407\b/i.test(equipment.name) ||
    /\bmp\s*c\s*306\b/i.test(equipment.name) ||
    /\bmp\s*c\s*406\b/i.test(equipment.name) ||
    /\bmp\s*c\s*307\b/i.test(equipment.name)
  ) {
    return [...MPC407_ORIGINAL_TONER_IDS];
  }

  if (equipment.id === M320F_EQUIPMENT_PRODUCT_ID || /\bm\s*320\s*f\b/i.test(equipment.name)) {
    return [M320F_ORIGINAL_TONER_PRODUCT_ID];
  }

  if (equipment.id === 'ricoh-im-430f' || /\bim\s*430f\b/i.test(equipment.name)) {
    return [IM430F_ORIGINAL_TONER_PRODUCT_ID];
  }

  if (/\bim\s*600\s*f\b/i.test(equipment.name)) {
    return [IM600F_ORIGINAL_TONER_PRODUCT_ID];
  }

  // IM 550F: no ofrecer el cartucho 418480 (listado IM 600F).
  if (/\bim\s*550\s*f\b/i.test(equipment.name)) {
    return [];
  }

  const normalized = normalizeEquipmentName(equipment.name);
  if (/\bim\s*c\s*3000\b/.test(normalized) || /\bmp\s*c\s*3003\b/.test(normalized)) {
    return ['ricoh-toner-mp'];
  }

  return [];
}

export function resolveKnownOriginalTonerProductId(equipment: Product): string | null {
  return resolveKnownOriginalTonerProductIds(equipment)[0] ?? null;
}

export function resolveKnownCompatibleTonerProductId(equipment: Product): string | null {
  const ids = resolveKnownCompatibleTonerProductIds(equipment);
  return ids[0] ?? null;
}

/** Varios tóneres compatibles conocidos (p. ej. CMYK en equipos color). */
export function resolveKnownCompatibleTonerProductIds(equipment: Product): string[] {
  if (
    equipment.id === IM_C320F_EQUIPMENT_PRODUCT_ID ||
    /\bim\s*c\s*320\s*f\b/i.test(equipment.name)
  ) {
    return [...IM_C320F_COMPATIBLE_TONER_IDS];
  }

  if (
    equipment.id === MPC407_EQUIPMENT_PRODUCT_ID ||
    /\bmp\s*c\s*407\b/i.test(equipment.name) ||
    /\bmp\s*c\s*306\b/i.test(equipment.name) ||
    /\bmp\s*c\s*406\b/i.test(equipment.name) ||
    /\bmp\s*c\s*307\b/i.test(equipment.name)
  ) {
    return [...MPC407_COMPATIBLE_TONER_IDS];
  }

  if (equipment.id === M320F_EQUIPMENT_PRODUCT_ID || /\bm\s*320\s*f\b/i.test(equipment.name)) {
    return [M320F_COMPATIBLE_TONER_PRODUCT_ID];
  }

  if (/\bim\s*550f\b/i.test(equipment.name)) {
    return [IM550F_COMPATIBLE_TONER_PRODUCT_ID];
  }

  if (/\bim\s*600f\b/i.test(equipment.name)) {
    return [];
  }

  return [];
}

function isCompatibleTonerName(name: string): boolean {
  const haystack = name.toLowerCase();
  return (
    haystack.includes('compatible') ||
    haystack.includes('compatibles') ||
    haystack.includes('alternativ') ||
    haystack.includes('->')
  );
}

export function isTonerMerchandisingProduct(product: Product): boolean {
  const haystack = normalizeEquipmentName(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''}`,
  );
  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }
  return (
    haystack.includes('toner') ||
    haystack.includes('tóner') ||
    haystack.includes('cartucho') ||
    haystack.includes('cartridge')
  );
}

export function resolveTonerSupplyTypeFromProduct(product: Product): 'original' | 'compatible' {
  return isCompatibleTonerName(product.name) ? 'compatible' : 'original';
}

/** Productos válidos para venta cruzada en el selector de tóner (admin). */
export function isCrossSellEligibleProduct(product: Product): boolean {
  if (isTonerMerchandisingProduct(product)) return true;
  const haystack = normalizeEquipmentName(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''}`,
  );
  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }
  return /repuesto|consumible|accesorio|suministro|tank|cartucho|unidad|waste|toner|tóner|casetera|bandeja|gabinete|tambor|drum|fusor|adf|rodillo/.test(
    haystack,
  );
}

export function suggestCrossSellProductIds(
  equipment: Product | InventoryProduct,
  catalog: Array<Product | InventoryProduct>,
): string[] {
  const equipmentProduct = toCatalogProduct(equipment);
  const catalogProducts = catalog.map(toCatalogProduct);
  const ids: string[] = [];
  for (const tonerId of resolveKnownOriginalTonerProductIds(equipmentProduct)) {
    if (!ids.includes(tonerId)) ids.push(tonerId);
  }

  for (const tonerId of resolveKnownCompatibleTonerProductIds(equipmentProduct)) {
    if (!ids.includes(tonerId)) ids.push(tonerId);
  }

  const groups = resolveEquipmentConsumables(equipmentProduct, catalogProducts);
  const tonerGroup = groups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    const { original, compatible } = splitTonerItemsBySupplyType(
      flattenConsumableGroupItems([tonerGroup]).filter(
        (item) => !/\bPack x04\b/i.test(item.name),
      ),
    );
    const takeOriginal = isColorPrinterEquipment(equipmentProduct)
      ? original
      : original.slice(0, 1);
    const takeCompatible = isColorPrinterEquipment(equipmentProduct)
      ? compatible
      : compatible.slice(0, 1);

    for (const item of [...takeOriginal, ...takeCompatible]) {
      if (item?.productId && !ids.includes(item.productId)) {
        ids.push(item.productId);
      }
    }
  }

  for (const group of groups) {
    if (group.id === 'toner') continue;
    const items = flattenConsumableGroupItems([group]).slice(0, 4);
    for (const item of items) {
      if (item.productId && !ids.includes(item.productId)) {
        ids.push(item.productId);
      }
    }
  }

  return normalizeMerchandisingProductIds(ids).slice(0, 16);
}

export interface MerchandisingConfigureCard {
  productId: string;
  title: string;
  name: string;
  description: string;
  image: string;
  imageCandidates: string[];
  pricePen: number;
  priceUsd: number;
  prices: ProductRolePrices;
  sku?: string;
  optional?: boolean;
}

export function resolveMerchandisingConfigureCard(
  product: Product,
  title?: string,
): MerchandisingConfigureCard | null {
  const prices = ensureFullPrices(product.prices ?? { public: product.price });
  const priceUsd = prices.public ?? product.price;
  if (priceUsd <= 0) return null;

  const imageCandidates = buildProductImageCandidates(product);
  const image = imageCandidates[0] ?? '';
  const description = product.description?.trim() || product.name;

  return {
    productId: product.id,
    title: title?.trim() || 'Recomendado',
    name: product.name,
    description,
    image,
    imageCandidates,
    pricePen: usdToPen(priceUsd),
    priceUsd,
    prices,
  };
}

export function resolveMerchandisingConfigureCards(
  productIds: string[] | undefined,
  catalog: Product[],
  options?: { title?: string; excludeProductId?: string; excludeProductIds?: string[] },
): MerchandisingConfigureCard[] {
  const ids = normalizeMerchandisingProductIds(productIds);
  const excluded = new Set(
    [
      options?.excludeProductId,
      ...(options?.excludeProductIds ?? []),
    ].filter((id): id is string => Boolean(id)),
  );
  const cards: MerchandisingConfigureCard[] = [];

  for (const id of ids) {
    if (excluded.has(id)) continue;
    const product = catalog.find((row) => row.id === id);
    if (!product) continue;
    const card = resolveMerchandisingConfigureCard(product, options?.title);
    if (card) cards.push(card);
  }

  return cards;
}

export function resolveOptionalMerchandisingConfigureCards(
  items: MerchandisingOptionalProduct[] | undefined,
  title = 'Opcional',
): MerchandisingConfigureCard[] {
  const normalized = normalizeMerchandisingOptionalProducts(items);
  const cards: MerchandisingConfigureCard[] = [];

  for (const item of normalized) {
    const priceUsd = item.price_usd;
    const image = item.image_url?.trim() || '';
    cards.push({
      productId: item.id,
      title,
      name: item.name,
      description: item.description?.trim() || item.name,
      image,
      imageCandidates: image ? [image] : [],
      pricePen: usdToPen(priceUsd),
      priceUsd,
      prices: ensureFullPrices({ public: priceUsd }),
      ...(item.code ? { sku: item.code } : {}),
      optional: true,
    });
  }

  return cards;
}

/** Venta cruzada en «Configura tu equipo» (repuestos, accesorios, tambor, etc.; sin tóner). */
export function resolveCrossSellConfigureCards(
  equipment: Product,
  catalog: Product[],
  options?: { excludeProductIds?: string[] },
): MerchandisingConfigureCard[] {
  const ids = normalizeMerchandisingProductIds(equipment.cross_sell_product_ids);
  const excluded = new Set(
    [equipment.id, ...(options?.excludeProductIds ?? [])].filter(Boolean),
  );
  const cards: MerchandisingConfigureCard[] = [];

  for (const id of ids) {
    if (excluded.has(id)) continue;
    const product = catalog.find((row) => row.id === id);
    if (!product || isTonerMerchandisingProduct(product)) continue;
    if (!isCrossSellEligibleProduct(product)) continue;

    const card = resolveMerchandisingConfigureCard(product, 'Venta cruzada');
    if (card) cards.push(card);
  }

  cards.push(
    ...resolveOptionalMerchandisingConfigureCards(
      equipment.cross_sell_optional_products,
      'Venta cruzada',
    ),
  );

  return cards;
}

/** Upselling en «Configura tu equipo». */
export function resolveUpsellConfigureCards(
  equipment: Product,
  catalog: Product[],
  options?: { excludeProductId?: string },
): MerchandisingConfigureCard[] {
  const inventoryCards = resolveMerchandisingConfigureCards(equipment.upsell_product_ids, catalog, {
    title: 'Upselling',
    excludeProductId: options?.excludeProductId ?? equipment.id,
  });
  const optionalCards = resolveOptionalMerchandisingConfigureCards(
    equipment.upsell_optional_products,
    'Upselling',
  );
  return [...inventoryCards, ...optionalCards];
}

export function hasCrossSellConfigureCards(equipment: Product, catalog: Product[]): boolean {
  return resolveCrossSellConfigureCards(equipment, catalog).length > 0;
}

function merchandisingCardToOption(
  card: MerchandisingConfigureCard,
  optionId: string,
): EquipmentConfigOption {
  return {
    id: optionId,
    productId: card.productId,
    name: card.name,
    description: card.description,
    pricePen: card.pricePen,
    priceUsd: card.priceUsd,
    image: card.image,
    ...(card.sku ? { sku: card.sku } : {}),
  };
}

/** Inyecta venta cruzada y upselling como pasos de configuración (suman al total del equipo). */
export function mergeMerchandisingEquipmentSteps(
  steps: EquipmentConfigStep[],
  equipment: Product,
  catalog: Product[],
): EquipmentConfigStep[] {
  const upsellCards = resolveUpsellConfigureCards(equipment, catalog, {
    excludeProductId: equipment.id,
  });
  const crossSellCards = resolveCrossSellConfigureCards(equipment, catalog, {
    excludeProductIds: upsellCards.map((card) => card.productId),
  });

  const withoutMerchandising = steps.filter((step) => !isMerchandisingEquipmentStepId(step.id));
  const maxStepNumber = withoutMerchandising.reduce(
    (max, step) => Math.max(max, step.stepNumber),
    0,
  );

  const merchandisingSteps: EquipmentConfigStep[] = [];

  if (crossSellCards.length > 0) {
    merchandisingSteps.push({
      id: MERCHANDISING_CROSS_SELL_STEP_ID,
      stepNumber: maxStepNumber + 1,
      title: 'Venta cruzada',
      subtitle: 'Repuestos y consumibles recomendados',
      pricePen: 0,
      icon: ShoppingBag,
      defaultSelected: false,
      selectionMode: 'multiple',
      options: crossSellCards.map((card) =>
        merchandisingCardToOption(card, crossSellOptionId(card.productId)),
      ),
    });
  }

  if (upsellCards.length > 0) {
    merchandisingSteps.push({
      id: MERCHANDISING_UPSELL_STEP_ID,
      stepNumber: maxStepNumber + (crossSellCards.length > 0 ? 2 : 1),
      title: 'Upselling',
      subtitle: 'Complementos sugeridos para tu equipo',
      pricePen: 0,
      icon: TrendingUp,
      defaultSelected: false,
      selectionMode: 'multiple',
      options: upsellCards.map((card) =>
        merchandisingCardToOption(card, upsellOptionId(card.productId)),
      ),
    });
  }

  if (merchandisingSteps.length === 0) return withoutMerchandising;

  return [...withoutMerchandising, ...merchandisingSteps];
}
