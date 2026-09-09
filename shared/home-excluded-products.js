/** Duplicado de IM C320F (ficha A4); la ficha principal sí va en vitrina. */
export const HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS = new Set(['ricoh-im-c320f-a4']);

export function isHomeCarouselExcludedProduct(product) {
  const id = String(product?.id ?? '').trim();
  return Boolean(id && HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS.has(id));
}
