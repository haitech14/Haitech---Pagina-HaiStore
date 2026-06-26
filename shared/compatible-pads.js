// Categoría canónica para almohadillas compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_PADS = 'Repuestos Compatibles, Almohadilla';

export const COMPATIBLE_PADS_SUBCATEGORY_ID = 'cat-almohadilla-compatibles';
export const COMPATIBLE_PADS_SUBCATEGORY_SLUG = 'almohadilla';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_PADS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_PADS,
  'Almohadilla',
  'Almohadillas',
  'Repuestos, Repuestos Compatibles, Almohadilla',
];

/**
 * @param {unknown} category
 */
export function isCompatiblePadsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_PADS_INVENTORY_LABELS.includes(normalized);
}
