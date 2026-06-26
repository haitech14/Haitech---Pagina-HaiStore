// Categoría canónica para rodillos de esponja compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_SPONGE_ROLLERS = 'Repuestos Compatibles, Rodillo de Esponja';

export const COMPATIBLE_SPONGE_ROLLERS_SUBCATEGORY_ID = 'cat-rodillo-esponja-compatibles';
export const COMPATIBLE_SPONGE_ROLLERS_SUBCATEGORY_SLUG = 'rodillo-de-esponja';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_SPONGE_ROLLERS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_SPONGE_ROLLERS,
  'Rodillo de Esponja',
  'Rodillos de Esponja',
  'Repuestos, Repuestos Compatibles, Rodillo de Esponja',
];

/**
 * @param {unknown} category
 */
export function isCompatibleSpongeRollersCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_SPONGE_ROLLERS_INVENTORY_LABELS.includes(normalized);
}
