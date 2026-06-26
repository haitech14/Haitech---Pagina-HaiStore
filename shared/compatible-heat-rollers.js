// Categoría canónica para rodillos de calor compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_HEAT_ROLLERS = 'Repuestos Compatibles, Rodillo de Calor';

export const COMPATIBLE_HEAT_ROLLERS_SUBCATEGORY_ID = 'cat-rodillos-calor-compatibles';
export const COMPATIBLE_HEAT_ROLLERS_SUBCATEGORY_SLUG = 'rodillos-de-calor';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_HEAT_ROLLERS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_HEAT_ROLLERS,
  'Rodillo de Calor',
  'Rodillos de Calor',
  'Repuestos, Repuestos Compatibles, Rodillo de Calor',
];

/**
 * @param {unknown} category
 */
export function isCompatibleHeatRollersCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_HEAT_ROLLERS_INVENTORY_LABELS.includes(normalized);
}
