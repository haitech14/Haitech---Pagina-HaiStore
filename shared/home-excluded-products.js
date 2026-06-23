/** Equipos que no deben mostrarse en vitrinas del inicio ni filas destacadas del catálogo. */
export const HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS = new Set([
  'ab878d89-61e0-4e51-a941-03455e1da407',
]);

const HOME_CAROUSEL_EXCLUDED_NAME_PATTERNS = [/\bmultifuncional\b.*\bmp\s*305\s*\+/i];

export function isHomeCarouselExcludedProduct(product) {
  const id = String(product?.id ?? '').trim();
  if (id && HOME_CAROUSEL_EXCLUDED_PRODUCT_IDS.has(id)) return true;

  const name = String(product?.name ?? '');
  return HOME_CAROUSEL_EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(name));
}
