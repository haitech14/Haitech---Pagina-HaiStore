// Categoría canónica usada en inventario y filtros.
// Se deja fija para evitar cambios por renombres de la landing.
export const CATEGORY_COMPATIBLE_TONER = 'Suministros, Toner Compatible';

export const COMPATIBLE_TONER_BRAND_SUFFIX = 'HaiPrint';
export const COMPATIBLE_TONER_BRAND_SUFFIX_LEGACY = 'Haitone';

export const CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY = 'Toner Compatibles Haitone';
export const CATEGORY_COMPATIBLE_TONER_LEGACY = 'Toner Compatibles';
export const CATEGORY_COMPATIBLE_TONER_HAIPRINT_LEGACY = 'Toner Compatibles HaiPrint';

export const COMPATIBLE_TONER_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TONER,
  'Toner Compatible',
  // Legacy / importaciones previas cuando el padre era "Toner y Suministros".
  'Toner y Suministros, Toner Compatible',
  // Variante cuando el padre se renombró a "Suministros".
  'Suministros, Toner Compatible',
  // Variante previa cuando se normalizaba como "Toner".
  'Toner, Toner Compatible',
  'Toner, Toner Compatibles',
  CATEGORY_COMPATIBLE_TONER_HAIPRINT_LEGACY,
  CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY,
  CATEGORY_COMPATIBLE_TONER_LEGACY,
];

export const COMPATIBLE_TONER_SUBCATEGORY_ID = 'cat-toner-compatibles';
export const COMPATIBLE_TONER_SUBCATEGORY_SLUG = 'toner-compatibles';

/**
 * @param {unknown} category
 */
export function isCompatibleTonerCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_TONER_INVENTORY_LABELS.includes(normalized);
}

/**
 * @param {unknown} category
 */
export function normalizeCompatibleTonerCategory(category) {
  if (isCompatibleTonerCategory(category)) return CATEGORY_COMPATIBLE_TONER;
  return category;
}

/**
 * Quita sufijos de marca legacy (HaiPrint / Haitone) del texto visible.
 * @param {unknown} text
 */
export function replaceLegacyCompatibleTonerBrand(text) {
  return String(text ?? '')
    .replace(/\bHaiPrint\b/gi, ' ')
    .replace(/\bHaitone\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—·|/]+|[\s\-–—·|/]+$/g, '')
    .trim();
}

/**
 * Normaliza el nombre de tóner compatible sin añadir marca al título.
 * Conserva el nombre de la API por compatibilidad con importadores.
 * @param {unknown} name
 */
export function appendHaiPrintProductSuffix(name) {
  return replaceLegacyCompatibleTonerBrand(name);
}

/** @deprecated Usar appendHaiPrintProductSuffix */
export function appendHaitoneProductSuffix(name) {
  return appendHaiPrintProductSuffix(name);
}

/**
 * @param {Record<string, unknown> | null | undefined} product
 */
export function normalizeCompatibleTonerProductFields(product) {
  if (!product || !isCompatibleTonerCategory(product.category)) {
    return product;
  }

  if (String(product.brand ?? '').trim().toLowerCase() === 'intercopy') {
    return { ...product, category: 'Toner Compatible' };
  }

  const name = appendHaiPrintProductSuffix(product.name);
  const rawDescription = product.description;
  const description =
    rawDescription == null || rawDescription === product.name
      ? name
      : appendHaiPrintProductSuffix(rawDescription);

  const brandRaw = String(product.brand ?? '').trim();
  const brand =
    /\b(?:haiprint|haitone)\b/i.test(brandRaw) &&
    brandRaw.replace(/\b(?:haiprint|haitone)\b/gi, '').trim() === ''
      ? ''
      : replaceLegacyCompatibleTonerBrand(brandRaw) || brandRaw;

  return {
    ...product,
    category: CATEGORY_COMPATIBLE_TONER,
    name,
    description,
    brand,
  };
}
