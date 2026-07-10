/** @typedef {'activa' | 'borrador' | 'inactiva'} ProductCatalogStatus */

export const PRODUCT_CATALOG_STATUSES = /** @type {const} */ (['activa', 'borrador', 'inactiva']);

/**
 * @param {unknown} value
 * @returns {ProductCatalogStatus | null}
 */
export function parseProductCatalogStatus(value) {
  if (value === 'activa' || value === 'borrador' || value === 'inactiva') return value;
  return null;
}

/**
 * Normaliza el estado de catálogo.
 * Sin valor explícito → activa (catálogo legacy sin campo status).
 * Los productos nuevos en admin se guardan con status explícito (p. ej. inactiva).
 * @param {unknown} value
 * @returns {ProductCatalogStatus}
 */
export function normalizeProductCatalogStatus(value) {
  return parseProductCatalogStatus(value) ?? 'activa';
}

/**
 * @param {{ status?: unknown } | null | undefined} product
 * @returns {boolean}
 */
export function isProductVisibleOnStorefront(product) {
  return normalizeProductCatalogStatus(product?.status) === 'activa';
}
