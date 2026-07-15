import { useQuery, type QueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { MIN_PRODUCT_SEARCH_LENGTH, filterProductsBySearch } from '@/lib/product-search';
import { toPublicProduct } from '@/lib/pricing';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product, UserRole } from '@/types/product';

interface ProductSearchResponse {
  products: Product[];
  total: number;
}

async function searchProductsFromCatalogIndex(
  query: string,
  categoryFilter: string,
  limit: number,
  role: string,
): Promise<ProductSearchResponse> {
  const rows = getCatalogRows().length > 0 ? getCatalogRows() : await loadCatalogIndex();
  const products = rows.map((row) => toPublicProduct(row, role));
  const matched = filterProductsBySearch(products, query, { categoryFilter });
  return {
    products: matched.slice(0, limit),
    total: matched.length,
  };
}

export async function fetchProductSearch(
  query: string,
  categoryFilter: string,
  limit: number,
  role = 'public',
): Promise<ProductSearchResponse> {
  // Prefer in-memory catalog index for instant autocomplete when already warm.
  if (getCatalogRows().length > 0) {
    return searchProductsFromCatalogIndex(query, categoryFilter, limit, role);
  }

  const params = new URLSearchParams();
  params.set('q', query);
  params.set('limit', String(limit));
  if (categoryFilter && categoryFilter !== 'all') {
    params.set('cat', categoryFilter);
  }
  try {
    return await apiFetch<ProductSearchResponse>(`/api/products/search?${params.toString()}`);
  } catch {
    return searchProductsFromCatalogIndex(query, categoryFilter, limit, role);
  }
}

export function prefetchProductSearch(
  queryClient: QueryClient,
  options: {
    query: string;
    categoryFilter?: string;
    limit?: number;
    role: string;
    viewAsRoles: readonly UserRole[];
  },
) {
  const trimmed = options.query.trim();
  if (trimmed.length < MIN_PRODUCT_SEARCH_LENGTH) return;

  const categoryFilter = options.categoryFilter ?? 'all';
  const limit = options.limit ?? 8;

  return queryClient.prefetchQuery({
    queryKey: [
      'product-search',
      trimmed,
      categoryFilter,
      limit,
      options.role,
      viewAsRolesQueryKey(options.viewAsRoles),
    ],
    queryFn: () => fetchProductSearch(trimmed, categoryFilter, limit, options.role),
    staleTime: 120_000,
  });
}

export function useProductSearch(
  query: string,
  options: { categoryFilter?: string; limit?: number; enabled?: boolean } = {},
) {
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const trimmed = query.trim();
  const categoryFilter = options.categoryFilter ?? 'all';
  const limit = options.limit ?? 8;
  const enabled = (options.enabled ?? true) && trimmed.length >= MIN_PRODUCT_SEARCH_LENGTH;

  return useQuery({
    queryKey: ['product-search', trimmed, categoryFilter, limit, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () => fetchProductSearch(trimmed, categoryFilter, limit, role),
    enabled,
    staleTime: 120_000,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
    select: (result) => {
      const products = Array.isArray(result?.products) ? result.products : [];
      return {
        products: shouldApplyViewAsPriceTransform(viewAsRoles)
          ? applyViewAsPriceToProducts(products, effectiveRole)
          : products,
        total: typeof result?.total === 'number' ? result.total : products.length,
      };
    },
  });
}
