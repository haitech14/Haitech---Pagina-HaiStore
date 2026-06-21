import { CATEGORY_COMPATIBLE_TONER } from './compatible-toner.js';

export const CATEGORY_IAICON_TONER = CATEGORY_COMPATIBLE_TONER;

export const IAICON_TONER_INVENTORY_LABELS = [
  CATEGORY_IAICON_TONER,
  'Toner Compatibles',
  'Toner Compatibles HaiPrint',
  'Toner Compatibles Haitone',
];

export const SUPPLIER_IAICON = 'iAicon';
export const SUPPLIER_YYB_GLOBAL = 'Y y B Global SAC';

export const IAICON_CARTRIDGE_PREFIX = 'Toner Cartucho Compatible iAicon';

export const IAICON_TONER_SUBCATEGORY_ID = 'cat-toner-compatibles';
export const IAICON_TONER_SUBCATEGORY_SLUG = 'toner-compatibles';

/**
 * @param {unknown} category
 */
export function isIaiconTonerCategory(category) {
  const normalized = String(category ?? '').trim();
  return IAICON_TONER_INVENTORY_LABELS.some(
    (label) => normalized === label || normalized.includes(label),
  );
}
