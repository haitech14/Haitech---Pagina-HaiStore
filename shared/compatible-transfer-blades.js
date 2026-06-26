// Categoría canónica para cuchillas de transferencia compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_TRANSFER_BLADES = 'Repuestos Compatibles, Cuchillas de Transferencia';

export const COMPATIBLE_TRANSFER_BLADES_SUBCATEGORY_ID = 'cat-cuchillas-transferencia-compatibles';
export const COMPATIBLE_TRANSFER_BLADES_SUBCATEGORY_SLUG = 'cuchillas-de-transferencia';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_TRANSFER_BLADES_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TRANSFER_BLADES,
  'Cuchillas de Transferencia',
  'Cuchilla de Transferencia',
  'Repuestos, Repuestos Compatibles, Cuchillas de Transferencia',
];

/**
 * @param {unknown} category
 */
export function isCompatibleTransferBladesCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_TRANSFER_BLADES_INVENTORY_LABELS.includes(normalized);
}
