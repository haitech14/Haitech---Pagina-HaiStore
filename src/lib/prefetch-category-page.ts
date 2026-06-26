import type { QueryClient } from '@tanstack/react-query';

import {
  buildCategoryCatalogQueryKey,
  type UseCategoryCatalogParams,
} from '@/hooks/use-category-catalog';
import { getResponsiveCatalogPageSize } from '@/lib/catalog-product-pagination';
import { findCategoryBySlug, resolveCategoryPageProductLabels } from '@/lib/category-product-labels';
import { queryCategoryCatalogClient, queryCategoryCatalogClientAsync } from '@/lib/category-catalog-client';
import {
  STORE_CATEGORIES_QUERY_KEY,
  fetchStoreCategoriesTreeWithFallback,
} from '@/lib/store-categories-fetch';
import { buildStaticStoreCategoryTree } from '@/lib/static-store-category-tree';
import { findStoreCategoryBySlug } from '@/lib/store-category-display';
import { apiFetch } from '@/lib/api';
import type { CategoryCatalogResponse } from '@/hooks/use-category-catalog';

async function fetchCategoryCatalog(params: UseCategoryCatalogParams): Promise<CategoryCatalogResponse> {
  const query = new URLSearchParams();
  query.set('slug', params.slug);
  if (params.subSlug) query.set('sub', params.subSlug);
  if (params.labels.length > 0) {
    query.set('labels', params.labels.join('|'));
  }
  if (params.sortBy) query.set('sort', params.sortBy);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 30));
  return apiFetch<CategoryCatalogResponse>(`/api/products/by-category?${query}`);
}

async function fetchCategoryCatalogWithFallback(
  params: UseCategoryCatalogParams,
  role: string,
): Promise<CategoryCatalogResponse> {
  try {
    return await fetchCategoryCatalog(params);
  } catch {
    return queryCategoryCatalogClientAsync(params, role);
  }
}

export interface PrefetchCategoryPageOptions {
  slug: string;
  subSlug?: string | null;
  role?: string;
}

/** Precarga árbol de categorías y primera página del catálogo (hover en nav / loader de ruta). */
export async function prefetchCategoryPage(
  queryClient: QueryClient,
  { slug, subSlug = null, role = 'public' }: PrefetchCategoryPageOptions,
) {
  const category = findCategoryBySlug(slug);
  if (!category) return;

  const staticTree = buildStaticStoreCategoryTree();
  queryClient.setQueryData([STORE_CATEGORIES_QUERY_KEY], staticTree);

  void queryClient.prefetchQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60,
  });

  const storeCategory = findStoreCategoryBySlug(staticTree, slug);
  const labels = resolveCategoryPageProductLabels(category, storeCategory, subSlug, staticTree);
  if (labels.length === 0) return;

  const limit = getResponsiveCatalogPageSize(false, 5);
  const catalogParams: UseCategoryCatalogParams = {
    slug,
    subSlug,
    labels,
    sortBy: 'price-asc',
    page: 1,
    limit,
  };

  const queryKey = buildCategoryCatalogQueryKey(catalogParams, role, '');
  const clientFallback = queryCategoryCatalogClient(catalogParams, role);
  queryClient.setQueryData(queryKey, clientFallback);

  return queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchCategoryCatalogWithFallback(catalogParams, role),
    staleTime: 60_000,
  });
}
