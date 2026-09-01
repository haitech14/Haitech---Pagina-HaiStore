/** Precios de vitrina: actual, comparación y % de descuento. */

import {
  isEquipmentDisplayPriceCategory,
  roundEquipmentDisplayUsd,
} from '@/lib/pen-pricing';

export interface ProductCardPricing {
  currentUsd: number;
  compareUsd: number;
  discountPercent: number;
}

function normalizeDisplayUsd(
  usd: number,
  category?: string | null,
): number {
  const price = Math.max(0, usd);
  if (price <= 0) return 0;
  if (!isEquipmentDisplayPriceCategory(category)) return price;
  return roundEquipmentDisplayUsd(price);
}

/**
 * Resuelve precio de tarjeta.
 * Solo muestra «precio anterior» si hay `oldPrice` real (compare-at / catálogo).
 * No inventa markup ficticio.
 * Equipos: USD al 49/99 más cercano con centavos .00.
 */
export function resolveProductCardPricing(
  productId: string,
  currentUsd: number,
  existing?: { oldPrice?: number; discount?: number; category?: string | null },
): ProductCardPricing {
  void productId;

  const price = normalizeDisplayUsd(currentUsd, existing?.category);

  if (price <= 0) {
    return { currentUsd: 0, compareUsd: 0, discountPercent: 0 };
  }

  if (existing?.oldPrice != null && existing.oldPrice > 0) {
    const compareUsd = normalizeDisplayUsd(existing.oldPrice, existing.category);
    if (compareUsd > price) {
      const discountPercent =
        existing.discount ?? Math.max(1, Math.round((1 - price / compareUsd) * 100));
      return { currentUsd: price, compareUsd, discountPercent };
    }
  }

  return { currentUsd: price, compareUsd: price, discountPercent: 0 };
}
