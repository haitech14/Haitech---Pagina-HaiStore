// Categoría canónica para anilladoras bajo Equipos de Oficina.
export const CATEGORY_OFFICE_RING_BINDERS = 'Equipos de Oficina, Anilladoras';

export const OFFICE_RING_BINDERS_SUBCATEGORY_ID = 'cat-anilladoras';
export const OFFICE_RING_BINDERS_SUBCATEGORY_SLUG = 'anilladoras';
export const EQUIPOS_OFICINA_PARENT_ID = 'cat-equipos-oficina';

export const OFFICE_RING_BINDERS_INVENTORY_LABELS = [
  CATEGORY_OFFICE_RING_BINDERS,
  'Anilladoras',
  'Anilladora',
  'Equipos de Oficina, Anilladoras',
];

/**
 * @param {unknown} category
 */
export function isOfficeRingBindersCategory(category) {
  const normalized = String(category ?? '').trim();
  return OFFICE_RING_BINDERS_INVENTORY_LABELS.includes(normalized);
}
