// Categoría canónica para guillotinas bajo Equipos de Oficina.
export const CATEGORY_OFFICE_GUILLOTINES = 'Equipos de Oficina, Guillotina';

export const OFFICE_GUILLOTINES_SUBCATEGORY_ID = 'cat-guillotinas';
export const OFFICE_GUILLOTINES_SUBCATEGORY_SLUG = 'guillotinas';
export const EQUIPOS_OFICINA_PARENT_ID = 'cat-equipos-oficina';

export const OFFICE_GUILLOTINES_INVENTORY_LABELS = [
  CATEGORY_OFFICE_GUILLOTINES,
  'Guillotinas',
  'Guillotina',
  'Equipos de Oficina, Guillotina',
];

/**
 * @param {unknown} category
 */
export function isOfficeGuillotinesCategory(category) {
  const normalized = String(category ?? '').trim();
  return OFFICE_GUILLOTINES_INVENTORY_LABELS.includes(normalized);
}
