// Categoría canónica para espiraladoras bajo Equipos de Oficina.
export const CATEGORY_OFFICE_SPIRAL_BINDERS = 'Equipos de Oficina, Espiraladoras';

export const OFFICE_SPIRAL_BINDERS_SUBCATEGORY_ID = 'cat-espiraladoras';
export const OFFICE_SPIRAL_BINDERS_SUBCATEGORY_SLUG = 'espiraladoras';
export const EQUIPOS_OFICINA_PARENT_ID = 'cat-equipos-oficina';

export const OFFICE_SPIRAL_BINDERS_INVENTORY_LABELS = [
  CATEGORY_OFFICE_SPIRAL_BINDERS,
  'Espiraladoras',
  'Espiraladora',
  'Equipos de Oficina, Espiraladoras',
];

/**
 * @param {unknown} category
 */
export function isOfficeSpiralBindersCategory(category) {
  const normalized = String(category ?? '').trim();
  return OFFICE_SPIRAL_BINDERS_INVENTORY_LABELS.includes(normalized);
}
