import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import {
  buildBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
  buildCategoryMetaDescription,
  buildCategoryMetaTitle,
  resolveAbsoluteImageUrl,
} from '@/lib/seo';
import type { Category } from '@/data/categories';

export interface CategorySeoInput {
  category: Category;
  subcategoryName?: string | null;
  subSlug?: string | null;
  heroSubtitle?: string | null;
  /** Slug de categoría cuando se fuerza catálogo (no aplica a `/tienda` completa). */
  catalogSlug?: string | undefined;
  isInventorySearch?: boolean;
  searchQuery?: string;
  hasFilterParams?: boolean;
  topProducts?: Array<{ name: string; url: string }>;
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
    topProducts = [],
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
  const collectionLd = buildCategoryCollectionJsonLd(
    {
      slug: category.slug,
      name: subcategoryName?.trim() || category.name,
      tagline: heroSubtitle?.trim() || category.tagline,
    },
    SITE_ORIGIN,
    topProducts,
  );

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: 'Inicio', href: '/' },
    { label: category.name, href: `/categoria/${category.slug}` },
  ];
  if (subcategoryName?.trim() && subSlug && subSlug !== 'all' && subSlug !== ALL_SUBCATEGORIES_QUERY) {
    breadcrumbs.push({ label: subcategoryName.trim(), href: canonicalPath });
  }
  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbs, SITE_ORIGIN);
  const jsonLd = breadcrumbLd ? [...collectionLd, breadcrumbLd] : collectionLd;

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
    jsonLd,
  };
}
