import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
import { buildAbsoluteUrl } from '@/lib/site-url';
import {
  buildCategoryMetaDescription,
  buildCategoryMetaTitle,
  resolveAbsoluteImageUrl,
} from '@/lib/seo';
import type { Category } from '@/data/categories';
import { SITE_ORIGIN } from '@/lib/site-url';

export interface CategorySeoInput {
  category: Category;
  subcategoryName?: string | null;
  subSlug?: string | null;
  heroSubtitle?: string | null;
  /** Ruta fija cuando la vista es `/tienda` (alias de multifuncionales). */
  catalogSlug?: string | undefined;
  isInventorySearch?: boolean;
  searchQuery?: string;
  hasFilterParams?: boolean;
}

function buildCategoryCanonicalPath(category: Category, catalogSlug?: string): string {
  if (catalogSlug === 'multifuncionales') {
    return `/categoria/multifuncionales?sub=${ALL_SUBCATEGORIES_QUERY}`;
  }
  if (category.slug === 'multifuncionales') {
    return `/categoria/${category.slug}?sub=${ALL_SUBCATEGORIES_QUERY}`;
  }
  return `/categoria/${category.slug}`;
}

export function buildCategorySeoConfig(input: CategorySeoInput) {
  const {
    category,
    subcategoryName,
    subSlug,
    heroSubtitle,
    catalogSlug,
    isInventorySearch,
    searchQuery,
    hasFilterParams,
  } = input;

  const canonicalPath = buildCategoryCanonicalPath(category, catalogSlug);
  const canonical = buildAbsoluteUrl(canonicalPath);

  if (isInventorySearch && searchQuery) {
    return {
      title: `Resultados para «${searchQuery}» | Haitech`,
      description: `Productos que coinciden con «${searchQuery}» en el catálogo Haitech.`,
      canonical,
      image: resolveAbsoluteImageUrl(category.image ?? null, SITE_ORIGIN),
      imageAlt: category.name,
      ogType: 'website' as const,
      robots: 'noindex,follow' as const,
    };
  }

  const shouldNoIndex = Boolean(hasFilterParams && !catalogSlug);

  return {
    title: buildCategoryMetaTitle(category, subcategoryName ?? undefined, subSlug ?? undefined),
    description: buildCategoryMetaDescription(
      category,
      subcategoryName ?? undefined,
      heroSubtitle ?? undefined,
      subSlug ?? undefined,
    ),
    canonical,
    image: resolveAbsoluteImageUrl(category.image ?? null, SITE_ORIGIN),
    imageAlt: subcategoryName ?? category.name,
    ogType: 'website' as const,
    robots: shouldNoIndex ? ('noindex,follow' as const) : ('index,follow' as const),
  };
}
