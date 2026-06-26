// Categoría canónica para uñas de fusor compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_FUSER_NAILS = 'Repuestos Compatibles, Uñas de Fusor';

export const COMPATIBLE_FUSER_NAILS_SUBCATEGORY_ID = 'cat-unas-fusor-compatibles';
export const COMPATIBLE_FUSER_NAILS_SUBCATEGORY_SLUG = 'unas-fusor';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_FUSER_NAILS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_FUSER_NAILS,
  'Uñas de Fusor',
  'Uñas de fusor',
  'Repuestos, Repuestos Compatibles, Uñas de Fusor',
];

/**
 * @param {unknown} category
 */
export function isCompatibleFuserNailsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_FUSER_NAILS_INVENTORY_LABELS.includes(normalized);
}
