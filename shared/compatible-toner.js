import { LANDING_CATEGORY, landingInventoryCategory } from './landing-categories.js';

export const COMPATIBLE_TONER_BRAND_SUFFIX = 'HaiPrint';
export const COMPATIBLE_TONER_BRAND_SUFFIX_LEGACY = 'Haitone';

export const CATEGORY_COMPATIBLE_TONER = landingInventoryCategory(
  LANDING_CATEGORY.toner,
  LANDING_CATEGORY.tonerCompatible,
);
export const CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY = 'Toner Compatibles Haitone';
export const CATEGORY_COMPATIBLE_TONER_LEGACY = 'Toner Compatibles';
export const CATEGORY_COMPATIBLE_TONER_HAIPRINT_LEGACY = 'Toner Compatibles HaiPrint';

export const COMPATIBLE_TONER_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TONER,
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
 * @param {unknown} text
 */
export function replaceLegacyCompatibleTonerBrand(text) {
  return String(text ?? '').replace(/\bHaitone\b/gi, COMPATIBLE_TONER_BRAND_SUFFIX);
}

/**
 * @param {unknown} name
 */
export function appendHaiPrintProductSuffix(name) {
  const trimmed = replaceLegacyCompatibleTonerBrand(String(name ?? '').trim());
  if (!trimmed) return trimmed;
  if (/\bHaiPrint\b/i.test(trimmed)) return trimmed;
  return `${trimmed} ${COMPATIBLE_TONER_BRAND_SUFFIX}`;
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

  const name = appendHaiPrintProductSuffix(product.name);
  const rawDescription = product.description;
  const description =
    rawDescription == null || rawDescription === product.name
      ? name
      : appendHaiPrintProductSuffix(rawDescription);

  return {
    ...product,
    category: CATEGORY_COMPATIBLE_TONER,
    name,
    description,
  };
}
