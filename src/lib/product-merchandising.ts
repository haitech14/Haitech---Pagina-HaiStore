import { ShoppingBag, TrendingUp } from 'lucide-react';

import {
  IM430F_ORIGINAL_TONER_PRODUCT_ID,
  IM550F_COMPATIBLE_TONER_PRODUCT_ID,
  IM550F_ORIGINAL_TONER_PRODUCT_ID,
  M320F_COMPATIBLE_TONER_PRODUCT_ID,
  M320F_EQUIPMENT_PRODUCT_ID,
  M320F_ORIGINAL_TONER_PRODUCT_ID,
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

export function resolveKnownOriginalTonerProductId(equipment: Product): string | null {
  if (equipment.id === M320F_EQUIPMENT_PRODUCT_ID || /\bm\s*320\s*f\b/i.test(equipment.name)) {
    return M320F_ORIGINAL_TONER_PRODUCT_ID;
  }

  if (equipment.id === 'ricoh-im-430f' || /\bim\s*430f\b/i.test(equipment.name)) {
    return IM430F_ORIGINAL_TONER_PRODUCT_ID;
  }

  if (/\bim\s*550f\b/i.test(equipment.name) || /\bim\s*600f\b/i.test(equipment.name)) {
    return IM550F_ORIGINAL_TONER_PRODUCT_ID;
  }

  const normalized = normalizeEquipmentName(equipment.name);
  if (/\bim\s*c\s*3000\b/.test(normalized) || /\bmp\s*c\s*3003\b/.test(normalized)) {
    return 'ricoh-toner-mp';
  }

  return null;
}

export function resolveKnownCompatibleTonerProductId(equipment: Product): string | null {
  if (equipment.id === M320F_EQUIPMENT_PRODUCT_ID || /\bm\s*320\s*f\b/i.test(equipment.name)) {
    return M320F_COMPATIBLE_TONER_PRODUCT_ID;
  }

  if (/\bim\s*550f\b/i.test(equipment.name) || /\bim\s*600f\b/i.test(equipment.name)) {
    return IM550F_COMPATIBLE_TONER_PRODUCT_ID;
  }

  return null;
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
  const knownOriginalId = resolveKnownOriginalTonerProductId(equipmentProduct);
  if (knownOriginalId && !ids.includes(knownOriginalId)) {
    ids.push(knownOriginalId);
  }

  const knownCompatibleId = resolveKnownCompatibleTonerProductId(equipmentProduct);
  if (knownCompatibleId && !ids.includes(knownCompatibleId)) {
    ids.push(knownCompatibleId);
  }

  const groups = resolveEquipmentConsumables(equipmentProduct, catalogProducts);
  const tonerGroup = groups.find((group) => group.id === 'toner');
  if (tonerGroup) {
    const { original, compatible } = splitTonerItemsBySupplyType(
      flattenConsumableGroupItems([tonerGroup]),
    );
    for (const item of [original[0], compatible[0]]) {
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

  const imageCandidates = buildProductImageCandidates(product, { stockFallback: true });
  const image = imageCandidates[0] ?? '/categories/toner-suministros.png';
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
    const image = item.image_url?.trim() || '/categories/repuestos.png';
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
