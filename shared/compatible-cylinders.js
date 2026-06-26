// Categoría canónica para cilindros OPC compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_CYLINDERS = 'Repuestos Compatibles, Cilindros';

export const COMPATIBLE_CYLINDERS_SUBCATEGORY_ID = 'cat-cilindros-compatibles';
export const COMPATIBLE_CYLINDERS_SUBCATEGORY_SLUG = 'cilindros';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_CYLINDERS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_CYLINDERS,
  'Cilindros',
  'Cilindro Compatible',
  'Repuestos, Repuestos Compatibles, Cilindros',
];

/**
 * @param {unknown} category
 */
export function isCompatibleCylindersCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_CYLINDERS_INVENTORY_LABELS.includes(normalized);
}
