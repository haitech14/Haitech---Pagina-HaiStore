// Categoría canónica para engranajes/piñones compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_GEARS = 'Repuestos Compatibles, Engranaje/Piñon';

export const COMPATIBLE_GEARS_SUBCATEGORY_ID = 'cat-engranaje-pinon-compatibles';
export const COMPATIBLE_GEARS_SUBCATEGORY_SLUG = 'engranaje-pinon';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_GEARS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_GEARS,
  'Engranaje/Piñon',
  'Engranaje',
  'Piñon',
  'Repuestos, Repuestos Compatibles, Engranaje/Piñon',
];

/**
 * @param {unknown} category
 */
export function isCompatibleGearsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_GEARS_INVENTORY_LABELS.includes(normalized);
}
