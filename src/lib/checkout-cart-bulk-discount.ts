import { ensureFullPrices } from '@/lib/roles';
import {
  DEFAULT_BULK_DISCOUNT_TIERS,
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
} from '@/lib/bulk-discount-tiers';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { CartItem, Product } from '@/types/product';

export interface CartVolumeDiscountSummary {
  listSubtotalUsd: number;
  volumeDiscountUsd: number;
  discountPercent: number;
}

export type CartLineVolumeDiscountSummary = CartVolumeDiscountSummary;

function resolveCartLinePublicUnitUsd(item: CartItem): number {
  return ensureFullPrices(
    item.product.prices ? item.product.prices : { public: item.product.price },
  ).public;
}

function resolveCartLinePaidUnitUsd(item: CartItem): number {
  return item.volumeUnitPriceUsd ?? item.product.price;
}

/** Descuento por volumen aplicado en el carrito (precio lista vs precio pagado). */
export function resolveCartVolumeDiscountSummary(
  items: CartItem[],
): CartVolumeDiscountSummary {
  let listSubtotalUsd = 0;
  let paidSubtotalUsd = 0;

  for (const item of items) {
    listSubtotalUsd += resolveCartLinePublicUnitUsd(item) * item.quantity;
    paidSubtotalUsd += resolveCartLinePaidUnitUsd(item) * item.quantity;
  }

  listSubtotalUsd = Math.round(listSubtotalUsd * 100) / 100;
  paidSubtotalUsd = Math.round(paidSubtotalUsd * 100) / 100;
  const volumeDiscountUsd = Math.max(
    0,
    Math.round((listSubtotalUsd - paidSubtotalUsd) * 100) / 100,
  );
  const discountPercent =
    listSubtotalUsd > 0
      ? Math.max(1, Math.round((volumeDiscountUsd / listSubtotalUsd) * 100))
      : 0;

  return {
    listSubtotalUsd,
    volumeDiscountUsd,
    discountPercent: volumeDiscountUsd > 0.001 ? discountPercent : 0,
  };
}

/** Descuento por volumen de una línea (precio lista vs precio pagado). */
export function resolveCartLineVolumeDiscountSummary(
  item: CartItem,
): CartLineVolumeDiscountSummary | null {
  const listUnitUsd = resolveCartLinePublicUnitUsd(item);
  const paidUnitUsd = resolveCartLinePaidUnitUsd(item);
  const listSubtotalUsd = Math.round(listUnitUsd * item.quantity * 100) / 100;
  const paidSubtotalUsd = Math.round(paidUnitUsd * item.quantity * 100) / 100;
  const volumeDiscountUsd = Math.max(
    0,
    Math.round((listSubtotalUsd - paidSubtotalUsd) * 100) / 100,
  );

  if (volumeDiscountUsd <= 0.001) return null;

  const discountPercent =
    listSubtotalUsd > 0
      ? Math.max(1, Math.round((volumeDiscountUsd / listSubtotalUsd) * 100))
      : 0;

  return { listSubtotalUsd, volumeDiscountUsd, discountPercent };
}

export interface CartLineBulkDiscountHint {
  savingsUsd: number;
  targetQuantity: number;
  isActive: boolean;
  volumeUnitUsd: number;
}

export function resolveCartLineBulkDiscountHint(
  item: CartItem,
  tiers: BulkDiscountTier[] = DEFAULT_BULK_DISCOUNT_TIERS,
): CartLineBulkDiscountHint | null {
  const fullPrices = ensureFullPrices(
    item.product.prices ? item.product.prices : { public: item.product.price },
  );
  const basePriceUsd = fullPrices.public;
  const floorPriceUsd = fullPrices.tecnico;

  const hint = resolveBulkDiscountSavingsHint(item.quantity, basePriceUsd, tiers, {
    floorPriceUsd,
  });
  if (!hint) return null;

  const pricing = resolveBulkDiscountPricing(hint.targetQuantity, basePriceUsd, tiers, {
    floorPriceUsd,
  });

  return {
    savingsUsd: hint.savingsUsd,
    targetQuantity: hint.targetQuantity,
    isActive: hint.isActive,
    volumeUnitUsd: pricing.unitUsd,
  };
}

export function resolveCartLineVolumeUnitUsd(
  item: CartItem,
  quantity: number,
  tiers: BulkDiscountTier[] = DEFAULT_BULK_DISCOUNT_TIERS,
): number | null {
  const fullPrices = ensureFullPrices(
    item.product.prices ? item.product.prices : { public: item.product.price },
  );
  const pricing = resolveBulkDiscountPricing(quantity, fullPrices.public, tiers, {
    floorPriceUsd: fullPrices.tecnico,
  });
  if (!pricing.tier || pricing.savingsUsd <= 0.001) return null;
  return pricing.unitUsd;
}

export interface ProductBulkDiscountPricingOptions {
  basePriceUsd?: number;
  floorPriceUsd?: number;
}

function resolveProductBulkDiscountPrices(
  product: Product,
  options: ProductBulkDiscountPricingOptions = {},
) {
  const fullPrices = ensureFullPrices(
    product.prices ? product.prices : { public: product.price },
  );
  return {
    basePriceUsd: options.basePriceUsd ?? fullPrices.public,
    floorPriceUsd: options.floorPriceUsd ?? fullPrices.tecnico,
  };
}

export function resolveProductBulkDiscountHint(
  product: Product,
  quantity: number,
  tiers: BulkDiscountTier[] = DEFAULT_BULK_DISCOUNT_TIERS,
  options: ProductBulkDiscountPricingOptions = {},
): CartLineBulkDiscountHint | null {
  const { basePriceUsd, floorPriceUsd } = resolveProductBulkDiscountPrices(product, options);
  const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, tiers, {
    floorPriceUsd,
  });
  if (!hint) return null;

  const pricing = resolveBulkDiscountPricing(hint.targetQuantity, basePriceUsd, tiers, {
    floorPriceUsd,
  });

  return {
    savingsUsd: hint.savingsUsd,
    targetQuantity: hint.targetQuantity,
    isActive: hint.isActive,
    volumeUnitUsd: pricing.unitUsd,
  };
}

export function resolveProductVolumeUnitUsd(
  product: Product,
  quantity: number,
  tiers: BulkDiscountTier[] = DEFAULT_BULK_DISCOUNT_TIERS,
  options: ProductBulkDiscountPricingOptions = {},
): number | null {
  const { basePriceUsd, floorPriceUsd } = resolveProductBulkDiscountPrices(product, options);
  const pricing = resolveBulkDiscountPricing(quantity, basePriceUsd, tiers, {
    floorPriceUsd,
  });
  if (!pricing.tier || pricing.savingsUsd <= 0.001) return null;
  return pricing.unitUsd;
}
