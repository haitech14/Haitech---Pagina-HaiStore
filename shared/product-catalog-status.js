import { isPrinterEquipmentProduct, productMatchesCatalogFamily } from './home-catalog-filter.js';

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
 * Tóner, cartuchos y repuestos ocultos en tienda pública (siguen en admin).
 * @param {{ name?: unknown; category?: unknown; description?: unknown } | null | undefined} product
 * @returns {boolean}
 */
export function isStorefrontHiddenConsumableProduct(product) {
  if (!product) return false;
  // Equipos (multifuncionales, impresoras…) no se ocultan aunque la descripción mencione tóner de regalo.
  if (isPrinterEquipmentProduct(product)) return false;
  if (productMatchesCatalogFamily(product, 'toner-suministros')) return true;
  if (productMatchesCatalogFamily(product, 'repuestos')) return true;
  return false;
}

/**
 * @param {{ status?: unknown; brand?: unknown; name?: unknown; category?: unknown; description?: unknown } | null | undefined} product
 * @returns {boolean}
 */
export function isProductVisibleOnStorefront(product) {
  if (normalizeProductCatalogStatus(product?.status) !== 'activa') return false;
  if (isStorefrontHiddenBrand(product?.brand)) return false;
  if (isStorefrontHiddenConsumableProduct(product)) return false;
  return true;
}
