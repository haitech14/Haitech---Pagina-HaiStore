// Categoría canónica para unidades de imagen compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_UNITS = 'Repuestos Compatibles, Unidades Compatibles';

export const COMPATIBLE_UNITS_SUBCATEGORY_ID = 'cat-unidades-compatibles';
export const COMPATIBLE_UNITS_SUBCATEGORY_SLUG = 'unidades-compatibles';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_UNITS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_UNITS,
  'Unidades Compatibles',
  'Unidad Compatible',
  'Repuestos, Repuestos Compatibles, Unidades Compatibles',
];

/**
 * @param {unknown} category
 */
export function isCompatibleUnitsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_UNITS_INVENTORY_LABELS.includes(normalized);
}
