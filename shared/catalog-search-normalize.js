/** Normaliza texto para comparación en búsqueda (ignora guiones, barras y acentos). */
export function normalizeCatalogSearchText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[/\\\u2010-\u2015\u2212-]/g, '');
}
