import { STORE_SHOWCASE_SLUGS } from './public-paths.js';

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
  return '/tienda/multifuncionales';
}

export function categoryCanonicalPath(rootSlug) {
  if (rootSlug === 'multifuncionales') return multifuncionalesCanonicalPath();
  if (rootSlug === 'computadoras-laptop') return '/tienda/laptops';
  if (rootSlug === 'toner-suministros' || rootSlug === 'toner-compatibles') {
    return '/tienda/toner';
  }
  if (rootSlug === 'soluciones-colaboracion') return '/tienda/pantallas-interactivas';
  if (rootSlug === 'equipamiento-videoconferencias') return '/tienda/videoconferencia';
  if (rootSlug === 'software') return '/software';
  if (rootSlug === 'alquiler') return '/servicios?seccion=alquiler';
  if (STORE_SHOWCASE_SLUGS.has(String(rootSlug ?? ''))) return `/tienda/${rootSlug}`;
  return '/tienda';
}
