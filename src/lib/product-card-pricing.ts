/** Precios de vitrina: actual, comparación y % de descuento. */
export interface ProductCardPricing {
  currentUsd: number;
  compareUsd: number;
  discountPercent: number;
}

/** Porcentaje de markup estable (12–29 %) a partir del id del producto. */
function stableMarkupPercent(productId: string): number {
  let hash = 0;
  for (const char of productId) {
    hash = (hash + char.charCodeAt(0)) % 97;
  }
  return 12 + (hash % 18);
}

export function resolveProductCardPricing(
  productId: string,
  currentUsd: number,
  existing?: { oldPrice?: number; discount?: number },
): ProductCardPricing {
  const price = Math.max(0, currentUsd);

  if (existing?.oldPrice != null && existing.oldPrice > price) {
    const compareUsd = existing.oldPrice;
    const discountPercent =
      existing.discount ?? Math.max(1, Math.round((1 - price / compareUsd) * 100));
    return { currentUsd: price, compareUsd, discountPercent };
  }

  const markup = stableMarkupPercent(productId);
  const compareUsd = Math.round(price * (1 + markup / 100) * 100) / 100;
  const discountPercent = Math.max(1, Math.round((1 - price / compareUsd) * 100));

  return { currentUsd: price, compareUsd, discountPercent };
}
