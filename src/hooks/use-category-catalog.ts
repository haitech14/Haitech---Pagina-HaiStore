import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { Product } from '@/types/product';
import type { CategorySortValue } from '@/components/category/category-catalog-toolbar';
import type { ProductCondition } from '@/lib/product-condition';

export const CATEGORY_CATALOG_QUERY_KEY = 'category-catalog';

export interface CategoryCatalogFacets {
  attributes: { key: string; label: string; count: number }[];
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
  labels: string[];
  condition?: ProductCondition | null;
  inStockOnly?: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
  attributeKeys?: string[];
  productionKey?: string | null;
  search?: string;
  sortBy?: CategorySortValue;
  page?: number;
  limit?: number;
}

async function fetchCategoryCatalog(params: UseCategoryCatalogParams): Promise<CategoryCatalogResponse> {
  const query = new URLSearchParams();
  query.set('slug', params.slug);
  if (params.labels.length > 0) {
    query.set('labels', params.labels.join(','));
  }
  if (params.condition) query.set('condition', params.condition);
  if (params.inStockOnly) query.set('inStock', '1');
  if (params.priceMin != null) query.set('priceMin', String(params.priceMin));
  if (params.priceMax != null) query.set('priceMax', String(params.priceMax));
  if (params.attributeKeys?.length) query.set('attrs', params.attributeKeys.join('|'));
  if (params.productionKey) query.set('production', params.productionKey);
  if (params.search?.trim()) query.set('q', params.search.trim());
  if (params.sortBy) query.set('sort', params.sortBy);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 30));

  return apiFetch<CategoryCatalogResponse>(`/api/products/by-category?${query}`);
}

export function useCategoryCatalog(params: UseCategoryCatalogParams) {
  const { role, viewAsRole, effectiveRole } = useAuth();
  const enabled = params.enabled !== false && params.labels.length > 0 && Boolean(params.slug);

  return useQuery({
    queryKey: [
      CATEGORY_CATALOG_QUERY_KEY,
      params.slug,
      params.labels.join(','),
      params.condition,
      params.inStockOnly,
      params.priceMin,
      params.priceMax,
      params.attributeKeys?.join('|'),
      params.productionKey,
      params.search,
      params.sortBy,
      params.page,
      params.limit,
      role,
      viewAsRole,
    ],
    queryFn: () => fetchCategoryCatalog(params),
    enabled,
    staleTime: 60_000,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    select: (payload) =>
      viewAsRole
        ? {
            ...payload,
            products: applyViewAsPriceToProducts(payload.products, effectiveRole),
          }
        : payload,
  });
}
