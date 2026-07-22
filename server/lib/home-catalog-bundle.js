import { readInventory } from './inventory-store.js';
import { getHomeApiCache } from './home-api-cache.js';
import { buildHomeFeaturedFromProducts } from './home-featured-products.js';
import { buildHomeCatalogSectionsFromProducts } from './home-catalog-sections.js';
import { HOME_HIGHLIGHTED_ROW_SIZE } from '../../shared/home-highlighted-products.js';

/** Secciones precalculadas para toda la landing (una sola lectura de inventario). */
export const HOME_BUNDLE_SECTION_IDS = [
  'multifuncionales',
  'impresoras',
  'impresoras-termicas',
  'escaneres',
  'toner-suministros',
  'repuestos',
];

const DEFAULT_FEATURED_LIMIT = HOME_HIGHLIGHTED_ROW_SIZE;
const DEFAULT_SECTIONS_LIMIT = 10;

async function buildHomeCatalogBundleUncached({
  role = 'public',
  featuredLimit = DEFAULT_FEATURED_LIMIT,
  sectionsLimit = DEFAULT_SECTIONS_LIMIT,
  sectionIds = HOME_BUNDLE_SECTION_IDS,
  featuredCategorySlug = 'multifuncionales',
} = {}) {
  const { products } = await readInventory();

  const featured = buildHomeFeaturedFromProducts(products, role, {
    categorySlug: featuredCategorySlug,
    limit: featuredLimit,
  });

  const { sections } = buildHomeCatalogSectionsFromProducts(
    products,
    role,
    sectionIds,
    sectionsLimit,
  );

  return { featured, sections };
}

/**
 * Destacados + todas las secciones de la home en una respuesta (una lectura de inventario).
 */
export async function listHomeCatalogBundle(options = {}) {
  const {
    role = 'public',
    featuredLimit = DEFAULT_FEATURED_LIMIT,
    sectionsLimit = DEFAULT_SECTIONS_LIMIT,
    sectionIds = HOME_BUNDLE_SECTION_IDS,
    featuredCategorySlug = 'multifuncionales',
  } = options;

  const safeFeaturedLimit = Math.min(Math.max(Number(featuredLimit) || DEFAULT_FEATURED_LIMIT, 1), 12);
  const safeSectionsLimit = Math.min(Math.max(Number(sectionsLimit) || DEFAULT_SECTIONS_LIMIT, 1), 24);
  const requestedSections = sectionIds.filter((id) => typeof id === 'string' && id.length > 0);
  const cacheKey = `bundle:${role}:${featuredCategorySlug}:${safeFeaturedLimit}:${safeSectionsLimit}:${requestedSections.join(',')}`;

  return getHomeApiCache(cacheKey, () =>
    buildHomeCatalogBundleUncached({
      role,
      featuredLimit: safeFeaturedLimit,
      sectionsLimit: safeSectionsLimit,
      sectionIds: requestedSections,
      featuredCategorySlug,
    }),
  );
}
