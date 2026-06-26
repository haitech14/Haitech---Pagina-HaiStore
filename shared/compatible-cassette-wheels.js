// Categoría canónica para ruedas de casetera compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_CASSETTE_WHEELS = 'Repuestos Compatibles, Ruedas de Casetera';

export const COMPATIBLE_CASSETTE_WHEELS_SUBCATEGORY_ID = 'cat-ruedas-casetera-compatibles';
export const COMPATIBLE_CASSETTE_WHEELS_SUBCATEGORY_SLUG = 'ruedas-casetera';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_CASSETTE_WHEELS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_CASSETTE_WHEELS,
  'Ruedas de Casetera',
  'Rueda de Casetera',
  'Repuestos, Repuestos Compatibles, Ruedas de Casetera',
];

/**
 * @param {unknown} category
 */
export function isCompatibleCassetteWheelsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_CASSETTE_WHEELS_INVENTORY_LABELS.includes(normalized);
}
