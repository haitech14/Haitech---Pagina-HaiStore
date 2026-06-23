import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export const PRODUCTS_BY_IDS_QUERY_KEY = 'products-by-ids';

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({ ids: ids.join(',') });
  const payload = await apiFetch<{ products: Product[] }>(`/api/products/by-ids?${params}`);
  return payload.products;
}

export function useProductsByIds(ids: string[], enabled = true) {
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const stableIds = [...ids].sort().join(',');

  return useQuery({
    queryKey: [PRODUCTS_BY_IDS_QUERY_KEY, stableIds, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () => fetchProductsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 1000 * 60 * 5,
    select: (products) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsPriceToProducts(products, effectiveRole)
        : products,
  });
}
