// Categoría canónica para enmicadoras bajo Equipos de Oficina.
export const CATEGORY_OFFICE_LAMINATORS = 'Equipos de Oficina, Enmicadora';

export const OFFICE_LAMINATORS_SUBCATEGORY_ID = 'cat-enmicadoras';
export const OFFICE_LAMINATORS_SUBCATEGORY_SLUG = 'enmicadoras';
export const EQUIPOS_OFICINA_PARENT_ID = 'cat-equipos-oficina';

export const OFFICE_LAMINATORS_INVENTORY_LABELS = [
  CATEGORY_OFFICE_LAMINATORS,
  'Enmicadoras',
  'Enmicadora',
  'Equipos de Oficina, Enmicadora',
];

/**
 * @param {unknown} category
 */
export function isOfficeLaminatorsCategory(category) {
  const normalized = String(category ?? '').trim();
  return OFFICE_LAMINATORS_INVENTORY_LABELS.includes(normalized);
}
