// Categoría canónica para cuchillas de cilindro compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_CYLINDER_BLADES = 'Repuestos Compatibles, Cuchillas de Cilindro';

export const COMPATIBLE_CYLINDER_BLADES_SUBCATEGORY_ID = 'cat-cuchillas-cilindro-compatibles';
export const COMPATIBLE_CYLINDER_BLADES_SUBCATEGORY_SLUG = 'cuchillas-de-cilindro';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_CYLINDER_BLADES_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_CYLINDER_BLADES,
  'Cuchillas de Cilindro',
  'Cuchilla de Cilindro',
  'Repuestos, Repuestos Compatibles, Cuchillas de Cilindro',
];

/**
 * @param {unknown} category
 */
export function isCompatibleCylinderBladesCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_CYLINDER_BLADES_INVENTORY_LABELS.includes(normalized);
}
