/** Valor canónico de `?sub=` para ver todas las subcategorías. */
export const ALL_SUBCATEGORIES_QUERY = 'todas';

/** Alias legado que Google todavía tiene en sitemap e indexación. */
export const LEGACY_ALL_SUBCATEGORIES_QUERY = 'all';

export function isAllSubcategoriesParam(value) {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  return raw === ALL_SUBCATEGORIES_QUERY || raw === LEGACY_ALL_SUBCATEGORIES_QUERY;
}

export function multifuncionalesCanonicalPath() {
  return `/categoria/multifuncionales?sub=${ALL_SUBCATEGORIES_QUERY}`;
}

export function categoryCanonicalPath(rootSlug) {
  if (rootSlug === 'multifuncionales') return multifuncionalesCanonicalPath();
  return `/categoria/${rootSlug}`;
}
