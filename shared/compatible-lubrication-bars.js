// Categoría canónica para barras lubricadoras compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_LUBRICATION_BARS = 'Repuestos Compatibles, Barra Lubricadora';

export const COMPATIBLE_LUBRICATION_BARS_SUBCATEGORY_ID = 'cat-barra-lubricadora-compatibles';
export const COMPATIBLE_LUBRICATION_BARS_SUBCATEGORY_SLUG = 'barra-lubricadora';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_LUBRICATION_BARS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_LUBRICATION_BARS,
  'Barra Lubricadora',
  'Barras Lubricadoras',
  'Repuestos, Repuestos Compatibles, Barra Lubricadora',
];

/**
 * @param {unknown} category
 */
export function isCompatibleLubricationBarsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_LUBRICATION_BARS_INVENTORY_LABELS.includes(normalized);
}
