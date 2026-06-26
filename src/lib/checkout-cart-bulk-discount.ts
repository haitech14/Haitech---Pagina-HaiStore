import { ensureFullPrices } from '@/lib/roles';
import {
  DEFAULT_BULK_DISCOUNT_TIERS,
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
} from '@/lib/bulk-discount-tiers';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { CartItem } from '@/types/product';

export interface CartLineBulkDiscountHint {
  message: string;
  savingsUsd: number;
  targetQuantity: number;
  isActive: boolean;
  nextUnitUsd?: number;
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

  if (hint.isActive) {
    const percent = Math.round(pricing.effectiveDiscountPercent);
    return {
      message: `Llevas ${hint.targetQuantity} unidades · ${percent}% de descuento aplicado`,
      savingsUsd: hint.savingsUsd,
      targetQuantity: hint.targetQuantity,
      isActive: true,
      nextUnitUsd: pricing.unitUsd,
    };
  }

  const percent = Math.round(pricing.effectiveDiscountPercent);
  const unitsNeeded = hint.targetQuantity - item.quantity;
  return {
    message:
      unitsNeeded === 1
        ? `Lleva ${hint.targetQuantity} y ahorra ${percent}%`
        : `Lleva ${hint.targetQuantity} unidades y ahorra ${percent}%`,
    savingsUsd: hint.savingsUsd,
    targetQuantity: hint.targetQuantity,
    isActive: false,
    nextUnitUsd: pricing.unitUsd,
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
