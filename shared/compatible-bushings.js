// Categoría canónica para bocinas compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_BUSHINGS = 'Repuestos Compatibles, Bocinas';

export const COMPATIBLE_BUSHINGS_SUBCATEGORY_ID = 'cat-bocinas-compatibles';
export const COMPATIBLE_BUSHINGS_SUBCATEGORY_SLUG = 'bocinas';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_BUSHINGS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_BUSHINGS,
  'Bocinas',
  'Bocina',
  'Repuestos, Repuestos Compatibles, Bocinas',
];

/**
 * @param {unknown} category
 */
export function isCompatibleBushingsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_BUSHINGS_INVENTORY_LABELS.includes(normalized);
}
