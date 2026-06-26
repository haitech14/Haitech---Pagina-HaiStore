// Categoría canónica para mantas web compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_CLEANING_WEBS = 'Repuestos Compatibles, Manta Web';

export const COMPATIBLE_CLEANING_WEBS_SUBCATEGORY_ID = 'cat-manta-web-compatibles';
export const COMPATIBLE_CLEANING_WEBS_SUBCATEGORY_SLUG = 'manta-web';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_CLEANING_WEBS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_CLEANING_WEBS,
  'Manta Web',
  'Mantas Web',
  'Repuestos, Repuestos Compatibles, Manta Web',
];

/**
 * @param {unknown} category
 */
export function isCompatibleCleaningWebsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_CLEANING_WEBS_INVENTORY_LABELS.includes(normalized);
}
