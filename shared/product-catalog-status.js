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
 * Los productos nuevos en admin se guardan con status explícito (p. ej. borrador).
 * @param {unknown} value
 * @returns {ProductCatalogStatus}
 */
export function normalizeProductCatalogStatus(value) {
  return parseProductCatalogStatus(value) ?? 'activa';
}

/** Marcas ocultas en vitrina / catálogo público (siguen visibles en admin). */
export const STOREFRONT_HIDDEN_BRAND_KEYS = new Set(['canon', 'pantum']);

/**
 * @param {unknown} brand
 * @returns {boolean}
 */
export function isStorefrontHiddenBrand(brand) {
  const raw = String(brand ?? '').trim().toLowerCase();
  if (!raw) return false;
  const tags = raw.includes(',') || raw.includes(';') || raw.includes('|')
    ? raw.split(/[,;|]+/).map((tag) => tag.trim()).filter(Boolean)
    : [raw];
  return tags.some((tag) => {
    if (STOREFRONT_HIDDEN_BRAND_KEYS.has(tag)) return true;
    const firstToken = tag.split(/\s+/)[0] ?? '';
    return STOREFRONT_HIDDEN_BRAND_KEYS.has(firstToken);
  });
}

/**
 * @param {{ status?: unknown; brand?: unknown } | null | undefined} product
 * @returns {boolean}
 */
export function isProductVisibleOnStorefront(product) {
  if (normalizeProductCatalogStatus(product?.status) !== 'activa') return false;
  if (isStorefrontHiddenBrand(product?.brand)) return false;
  return true;
}
