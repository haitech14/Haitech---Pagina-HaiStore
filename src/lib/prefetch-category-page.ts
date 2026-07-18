import type { QueryClient } from '@tanstack/react-query';

import {
  buildCategoryCatalogQueryKey,
  fetchCategoryCatalogWithFallback,
  type UseCategoryCatalogParams,
} from '@/hooks/use-category-catalog';
import {
  CATALOG_FORMAT_SECTION_MAX,
  getResponsiveCatalogPageSize,
} from '@/lib/catalog-product-pagination';
import { shouldShowCatalogSpecFilterTabs } from '@/lib/category-catalog-filters';
import { resolveCategoryPageProductLabels } from '@/lib/category-product-labels';
import { resolveCategoryForPage } from '@/lib/store-category-page';
import {
  STORE_CATEGORIES_QUERY_KEY,
  fetchStoreCategoriesTreeWithFallback,
} from '@/lib/store-categories-fetch';
import { buildStaticStoreCategoryTree } from '@/lib/static-store-category-tree';
import {
  ALL_SUBCATEGORIES_QUERY,
  findStoreCategoryBySlug,
} from '@/lib/store-category-display';
import { parseCategoryHref } from '@/lib/category-path';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export { fetchCategoryCatalogWithFallback };

/** Prefetch desde un href de categoría (mega menú, cards home, etc.). */
export function prefetchCategoryFromHref(
  queryClient: QueryClient,
  href: string,
  role = 'public',
): void {
  const parsed = parseCategoryHref(href);
  if (!parsed) return;
  prefetchCategoryPage(queryClient, {
    slug: parsed.slug,
    subSlug:
      parsed.subSlug ??
      (parsed.slug === 'multifuncionales' ? ALL_SUBCATEGORIES_QUERY : null),
    role,
  });
}

export interface PrefetchCategoryPageOptions {
  slug: string;
  subSlug?: string | null;
  role?: string;
}

function buildPrefetchCatalogParams(
  slug: string,
  subSlug: string | null,
  labels: string[],
): UseCategoryCatalogParams {
  const limit = shouldShowCatalogSpecFilterTabs(slug)
    ? CATALOG_FORMAT_SECTION_MAX
    : getResponsiveCatalogPageSize(false, 5);

  return {
    slug,
    subSlug,
    labels,
    sortBy: 'price-asc',
    page: 1,
    limit,
  };
}

function resolveTreeForPrefetch(queryClient: QueryClient): StoreCategoryTreeNode[] {
  const cached = queryClient.getQueryData<StoreCategoryTreeNode[]>([STORE_CATEGORIES_QUERY_KEY]);
  if (cached?.length) return cached;

  const staticTree = buildStaticStoreCategoryTree();
  queryClient.setQueryData([STORE_CATEGORIES_QUERY_KEY], staticTree);
  return staticTree;
}

/**
 * Precarga en background. El loader de ruta debe retornar al instante:
 * cero map del índice ni rebuild del árbol en el path síncrono.
 */
export function prefetchCategoryPage(
  queryClient: QueryClient,
  { slug, subSlug = null, role = 'public' }: PrefetchCategoryPageOptions,
): void {
  // No precargar inventory-index aquí: /categoria es API-first; el índice calienta en idle.

  void queryClient.prefetchQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60 * 10,
  });

  // Trabajo pesado (labels / prefetch de catálogo) fuera del tick del loader.
  queueMicrotask(() => {
    const tree = resolveTreeForPrefetch(queryClient);
    const storeCategory = findStoreCategoryBySlug(tree, slug);
    const category = resolveCategoryForPage(slug, storeCategory);
    if (!category) return;

    const labels = resolveCategoryPageProductLabels(category, storeCategory, subSlug, tree);
    if (labels.length === 0) return;

    const catalogParams = buildPrefetchCatalogParams(slug, subSlug, labels);
    const queryKey = buildCategoryCatalogQueryKey(catalogParams, role, '');

    void queryClient.prefetchQuery({
      queryKey,
      queryFn: () => fetchCategoryCatalogWithFallback(catalogParams, role),
      staleTime: 60_000,
    });
  });
}
