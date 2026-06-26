// Categoría canónica para chips de toner compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_TONER_CHIPS = 'Repuestos Compatibles, Chip de Toner';

export const COMPATIBLE_TONER_CHIPS_SUBCATEGORY_ID = 'cat-chip-toner-compatibles';
export const COMPATIBLE_TONER_CHIPS_SUBCATEGORY_SLUG = 'chip-toner';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_TONER_CHIPS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_TONER_CHIPS,
  'Chip de Toner',
  'Chip de toner',
  'Repuestos, Repuestos Compatibles, Chip de Toner',
];

/**
 * @param {unknown} category
 */
export function isCompatibleTonerChipsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_TONER_CHIPS_INVENTORY_LABELS.includes(normalized);
}
