import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export const PRODUCTS_BY_IDS_QUERY_KEY = 'products-by-ids';

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({ ids: ids.join(',') });
  const payload = await apiFetch<{ products: Product[] }>(`/api/products/by-ids?${params}`);
  return payload.products;
}

export function useProductsByIds(ids: string[], enabled = true) {
  const { role, viewAsRole, effectiveRole } = useAuth();
  const stableIds = [...ids].sort().join(',');

  return useQuery({
    queryKey: [PRODUCTS_BY_IDS_QUERY_KEY, stableIds, role, viewAsRole],
    queryFn: () => fetchProductsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 1000 * 60 * 5,
    select: (products) =>
      viewAsRole ? applyViewAsPriceToProducts(products, effectiveRole) : products,
  });
}
