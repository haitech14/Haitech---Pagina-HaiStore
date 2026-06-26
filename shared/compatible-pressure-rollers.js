// Categoría canónica para rodillos de presión compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_PRESSURE_ROLLERS = 'Repuestos Compatibles, Rodillo de Presión';

export const COMPATIBLE_PRESSURE_ROLLERS_SUBCATEGORY_ID = 'cat-rodillos-presion-compatibles';
export const COMPATIBLE_PRESSURE_ROLLERS_SUBCATEGORY_SLUG = 'rodillos-de-presion';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_PRESSURE_ROLLERS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_PRESSURE_ROLLERS,
  'Rodillo de Presión',
  'Rodillos de Presión',
  'Repuestos, Repuestos Compatibles, Rodillo de Presión',
];

/**
 * @param {unknown} category
 */
export function isCompatiblePressureRollersCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_PRESSURE_ROLLERS_INVENTORY_LABELS.includes(normalized);
}
