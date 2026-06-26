import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { queryCategoryCatalogClient, queryCategoryCatalogClientAsync } from '@/lib/category-catalog-client';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product } from '@/types/product';
import type { CategorySortValue } from '@/components/category/category-catalog-toolbar';
import type { ProductCondition } from '@/lib/product-condition';

export const CATEGORY_CATALOG_QUERY_KEY = 'category-catalog';

export interface CategoryCatalogFacets {
  attributes: { key: string; label: string; count: number }[];
  brands: { key: string; label: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface CategoryCatalogResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  facets: CategoryCatalogFacets;
}

export interface UseCategoryCatalogParams {
  enabled?: boolean;
  slug: string;
  subSlug?: string | null;
  labels: string[];
  condition?: ProductCondition | null;
  inStockOnly?: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
  brandKeys?: string[];
  attributeKeys?: string[];
  productionKey?: string | null;
  speedKeys?: string[];
  search?: string;
  sortBy?: CategorySortValue;
  page?: number;
  limit?: number;
}

export function buildCategoryCatalogQueryKey(
  params: UseCategoryCatalogParams,
  role: string,
  viewAsKey: string,
) {
  const trimmedLabels = params.labels;
  return [
    CATEGORY_CATALOG_QUERY_KEY,
    params.slug,
    params.subSlug,
    trimmedLabels.join('|'),
    params.condition,
    params.inStockOnly,
    params.priceMin,
    params.priceMax,
    params.brandKeys?.join('|'),
    params.attributeKeys?.join('|'),
    params.productionKey,
    params.speedKeys?.join('|'),
    params.search,
    params.sortBy,
    params.page,
    params.limit,
    role,
    viewAsKey,
  ] as const;
}

async function fetchCategoryCatalog(params: UseCategoryCatalogParams): Promise<CategoryCatalogResponse> {
  const query = new URLSearchParams();
  query.set('slug', params.slug);
  if (params.subSlug) query.set('sub', params.subSlug);
  if (params.labels.length > 0) {
    query.set('labels', params.labels.join('|'));
  }
  if (params.condition) query.set('condition', params.condition);
  if (params.inStockOnly) query.set('inStock', '1');
  if (params.priceMin != null) query.set('priceMin', String(params.priceMin));
  if (params.priceMax != null) query.set('priceMax', String(params.priceMax));
  if (params.brandKeys?.length) query.set('brands', params.brandKeys.join('|'));
  if (params.attributeKeys?.length) query.set('attrs', params.attributeKeys.join('|'));
  if (params.productionKey) query.set('production', params.productionKey);
  if (params.speedKeys?.length) query.set('speed', params.speedKeys.join('|'));
  if (params.search?.trim()) query.set('q', params.search.trim());
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

export function useCategoryCatalog(params: UseCategoryCatalogParams) {
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const trimmedLabels = params.labels;
  const enabled = params.enabled !== false && trimmedLabels.length > 0 && Boolean(params.slug);

  return useQuery({
    queryKey: buildCategoryCatalogQueryKey(params, role, viewAsRolesQueryKey(viewAsRoles)),
    queryFn: () => fetchCategoryCatalogWithFallback(params, role),
    enabled,
    staleTime: 60_000,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
    placeholderData: (previousData, previousQuery) => {
      if (!enabled) return undefined;
      const viewAsKey = viewAsRolesQueryKey(viewAsRoles);
      const currentKey = buildCategoryCatalogQueryKey(params, role, viewAsKey);
      if (previousData && previousQuery) {
        const previousKey = previousQuery.queryKey as ReturnType<typeof buildCategoryCatalogQueryKey>;
        const sameFilter =
          previousKey.slice(0, 14).join('\0') === currentKey.slice(0, 14).join('\0') &&
          previousKey.slice(16).join('\0') === currentKey.slice(16).join('\0');
        if (sameFilter) return previousData;
      }
      return queryCategoryCatalogClient(params, role);
    },
    select: (payload) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? {
            ...payload,
            products: applyViewAsPriceToProducts(payload.products, effectiveRole),
          }
        : payload,
  });
}
