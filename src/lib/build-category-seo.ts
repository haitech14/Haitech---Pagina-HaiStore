import { categoryCanonicalPath, isAllSubcategoriesParam } from '../../shared/seo/category-query.js';
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

function buildCategoryCanonicalPath(
  category: Category,
  catalogSlug?: string,
  subSlug?: string | null,
): string {
  if (subSlug && !isAllSubcategoriesParam(subSlug)) {
    return `/categoria/${category.slug}?sub=${encodeURIComponent(subSlug)}`;
  }
  if (catalogSlug === 'multifuncionales' || category.slug === 'multifuncionales') {
    return categoryCanonicalPath('multifuncionales');
  }
  if (catalogSlug) return `/tienda/${catalogSlug}`;
  return categoryCanonicalPath(category.slug);
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
    topProducts = [],
  } = input;

  const canonicalPath = buildCategoryCanonicalPath(category, catalogSlug, subSlug);
  const canonical = buildAbsoluteUrl(canonicalPath);

  if (isInventorySearch && searchQuery) {
    const categoryCanonical = buildAbsoluteUrl(
      buildCategoryCanonicalPath(category, catalogSlug, null),
    );
    return {
      title: `Resultados para «${searchQuery}» | Haitech`,
      description: `Productos que coinciden con «${searchQuery}» en el catálogo Haitech.`,
      canonical: categoryCanonical,
      image: resolveAbsoluteImageUrl(category.image ?? null, SITE_ORIGIN),
      imageAlt: category.name,
      ogType: 'website' as const,
      robots: 'index,follow' as const,
    };
  }

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
    { label: category.name, href: categoryCanonicalPath(category.slug) },
  ];
  if (subcategoryName?.trim() && subSlug && !isAllSubcategoriesParam(subSlug)) {
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
    robots: 'index,follow' as const,
    jsonLd,
  };
}
