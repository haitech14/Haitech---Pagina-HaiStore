// Categoría canónica para reveladores compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_DEVELOPERS = 'Repuestos Compatibles, Revelador';

export const COMPATIBLE_DEVELOPERS_SUBCATEGORY_ID = 'cat-revelador-compatibles';
export const COMPATIBLE_DEVELOPERS_SUBCATEGORY_SLUG = 'revelador';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_DEVELOPERS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_DEVELOPERS,
  'Revelador',
  'Reveladores',
  'Repuestos, Repuestos Compatibles, Revelador',
];

/**
 * @param {unknown} category
 */
export function isCompatibleDevelopersCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_DEVELOPERS_INVENTORY_LABELS.includes(normalized);
}
