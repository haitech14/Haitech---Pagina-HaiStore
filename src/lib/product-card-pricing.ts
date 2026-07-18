/** Precios de vitrina: actual, comparación y % de descuento. */

export interface ProductCardPricing {

  currentUsd: number;

  compareUsd: number;

  discountPercent: number;

}



/**

 * Resuelve precio de tarjeta.

 * Solo muestra «precio anterior» si hay `oldPrice` real (compare-at / catálogo).

 * No inventa markup ficticio.

 */

export function resolveProductCardPricing(

  productId: string,

  currentUsd: number,

  existing?: { oldPrice?: number; discount?: number },

): ProductCardPricing {

  void productId;

  const price = Math.max(0, currentUsd);



  if (price <= 0) {

    return { currentUsd: 0, compareUsd: 0, discountPercent: 0 };

  }



  if (existing?.oldPrice != null && existing.oldPrice > price) {

    const compareUsd = existing.oldPrice;

    const discountPercent =

      existing.discount ?? Math.max(1, Math.round((1 - price / compareUsd) * 100));

    return { currentUsd: price, compareUsd, discountPercent };

  }



  return { currentUsd: price, compareUsd: price, discountPercent: 0 };

}


