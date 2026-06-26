// Categoría canónica para fajas de transferencia compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_TRANSFER_BELTS = 'Repuestos Compatibles, Faja de Transferencia';

export const COMPATIBLE_TRANSFER_BELTS_SUBCATEGORY_ID = 'cat-faja-transferencia-compatibles';
export const COMPATIBLE_TRANSFER_BELTS_SUBCATEGORY_SLUG = 'faja-de-transferencia';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_TRANSFER_BELTS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TRANSFER_BELTS,
  'Faja de Transferencia',
  'Fajas de Transferencia',
  'Repuestos, Repuestos Compatibles, Faja de Transferencia',
];

/**
 * @param {unknown} category
 */
export function isCompatibleTransferBeltsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_TRANSFER_BELTS_INVENTORY_LABELS.includes(normalized);
}
