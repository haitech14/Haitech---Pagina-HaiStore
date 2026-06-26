import { inferPpmDigitsFromRicohModelName } from './ricoh-model-ppm.js';

export const SPEED_FILTER_OPTIONS = [
  { key: 'speed-30-35', sidebarLabel: '30 ppm – 35 ppm', min: 30, max: 35 },
  { key: 'speed-40-45', sidebarLabel: '40 ppm – 45 ppm', min: 40, max: 45 },
  { key: 'speed-50-55', sidebarLabel: '50 ppm – 55 ppm', min: 50, max: 55 },
  { key: 'speed-60-65', sidebarLabel: '60 ppm – 65 ppm', min: 60, max: 65 },
  { key: 'speed-70-75', sidebarLabel: '70 ppm – 75 ppm', min: 70, max: 75 },
  { key: 'speed-90-96', sidebarLabel: '90 ppm – 96 ppm', min: 90, max: 96 },
  { key: 'speed-110-150', sidebarLabel: '110 ppm – 150 ppm', min: 110, max: 150 },
];

/**
 * @param {string | null | undefined} text
 * @returns {number | null}
 */
export function parsePpmFromText(text) {
  const match = String(text ?? '').match(/(\d{1,3})\s*ppm/i);
  if (!match) return null;
  const ppm = Number(match[1]);
  return Number.isFinite(ppm) ? ppm : null;
}

/**
 * @param {{ name?: string | null; attributes?: { name?: string; value?: string }[] }} product
 * @returns {number | null}
 */
export function resolveProductSpeedPpm(product) {
  for (const attr of product?.attributes ?? []) {
    const name = String(attr?.name ?? '').toLowerCase();
    if (!name.includes('velocidad') && name !== 'ppm') continue;
    const ppm = parsePpmFromText(attr?.value);
    if (ppm != null) return ppm;
  }

  const fromModel = inferPpmDigitsFromRicohModelName(product?.name ?? '');
  if (fromModel) {
    const ppm = Number(fromModel);
    if (Number.isFinite(ppm)) return ppm;
  }

  const haystack = `${product?.name ?? ''} ${product?.code ?? ''}`;
  return parsePpmFromText(haystack);
}

/**
 * @param {import('./catalog-speed-filter.js').SPEED_FILTER_OPTIONS[number]['key'] | string | null | undefined} speedKey
 */
export function findSpeedFilterOption(speedKey) {
  if (!speedKey) return null;
  return SPEED_FILTER_OPTIONS.find((option) => option.key === speedKey) ?? null;
}

/**
 * @param {object} product
 * @param {string | null | undefined} speedKey
 */
export function productMatchesSpeedFilterKey(product, speedKey) {
  if (!speedKey) return true;
  const option = findSpeedFilterOption(speedKey);
  if (!option) return true;
  const ppm = resolveProductSpeedPpm(product);
  if (ppm == null) return false;
  return ppm >= option.min && ppm <= option.max;
}

/**
 * @param {object} product
 * @param {readonly string[]} speedKeys
 */
export function productMatchesSpeedFilterKeys(product, speedKeys) {
  if (!speedKeys?.length) return true;
  return speedKeys.some((key) => productMatchesSpeedFilterKey(product, key));
}

/**
 * @param {readonly object[]} products
 * @param {string} speedKey
 */
export function countProductsForSpeedFilterKey(products, speedKey) {
  return products.filter((product) => productMatchesSpeedFilterKey(product, speedKey)).length;
}
