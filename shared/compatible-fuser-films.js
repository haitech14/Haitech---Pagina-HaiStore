// Categoría canónica para fajas fusoras compatibles bajo Repuestos Compatibles.
export const CATEGORY_COMPATIBLE_FUSER_FILMS = 'Repuestos Compatibles, Faja Fusora';

export const COMPATIBLE_FUSER_FILMS_SUBCATEGORY_ID = 'cat-faja-fusora-compatibles';
export const COMPATIBLE_FUSER_FILMS_SUBCATEGORY_SLUG = 'faja-fusora';
export const REPUESTOS_COMPATIBLES_PARENT_ID = 'cat-repuestos-compatibles';

export const COMPATIBLE_FUSER_FILMS_INVENTORY_LABELS = [
  CATEGORY_COMPATIBLE_FUSER_FILMS,
  'Faja Fusora',
  'Fajas Fusoras',
  'Repuestos, Repuestos Compatibles, Faja Fusora',
];

/**
 * @param {unknown} category
 */
export function isCompatibleFuserFilmsCategory(category) {
  const normalized = String(category ?? '').trim();
  return COMPATIBLE_FUSER_FILMS_INVENTORY_LABELS.includes(normalized);
}
