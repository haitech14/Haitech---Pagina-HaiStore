import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { MIN_PRODUCT_SEARCH_LENGTH } from '@/lib/product-search';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

interface ProductSearchResponse {
  products: Product[];
  total: number;
}

async function fetchProductSearch(
  query: string,
  categoryFilter: string,
  limit: number,
): Promise<ProductSearchResponse> {
  const params = new URLSearchParams();
  params.set('q', query);
  params.set('limit', String(limit));
  if (categoryFilter && categoryFilter !== 'all') {
    params.set('cat', categoryFilter);
  }
  return apiFetch<ProductSearchResponse>(`/api/products/search?${params.toString()}`);
}

export function useProductSearch(
  query: string,
  options: { categoryFilter?: string; limit?: number; enabled?: boolean } = {},
) {
  const { role, viewAsRole, effectiveRole } = useAuth();
  const trimmed = query.trim();
  const categoryFilter = options.categoryFilter ?? 'all';
  const limit = options.limit ?? 8;
  const enabled = (options.enabled ?? true) && trimmed.length >= MIN_PRODUCT_SEARCH_LENGTH;

  return useQuery({
    queryKey: ['product-search', trimmed, categoryFilter, limit, role, viewAsRole],
    queryFn: () => fetchProductSearch(trimmed, categoryFilter, limit),
    enabled,
    staleTime: 30_000,
    gcTime: 1000 * 60 * 5,
    select: (result) => ({
      products: viewAsRole
        ? applyViewAsPriceToProducts(result.products, effectiveRole)
        : result.products,
      total: result.total,
    }),
  });
}
