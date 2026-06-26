// Categoría canónica para piñones de fusor compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_FUSER_PINION = 'Repuestos Compatibles, Piñon de Fusor';

export const COMPATIBLE_FUSER_PINION_SUBCATEGORY_ID = 'cat-pinon-fusor-compatibles';
export const COMPATIBLE_FUSER_PINION_SUBCATEGORY_SLUG = 'pinon-fusor';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_FUSER_PINION_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_FUSER_PINION,
  'Piñon de Fusor',
  'Piñón de Fusor',
  'Repuestos, Repuestos Compatibles, Piñon de Fusor',
];

/**
 * @param {unknown} category
 */
export function isCompatibleFuserPinionCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_FUSER_PINION_INVENTORY_LABELS.includes(normalized);
}
