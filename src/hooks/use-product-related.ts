import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export function useProductRelated(productId: string | undefined, enabled = true) {
  const { role, viewAsRoles, effectiveRole } = useAuth();

  return useQuery({
    queryKey: ['product-related', productId, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () =>
      apiFetch<{ products: Product[] }>(
        `/api/products/${encodeURIComponent(productId ?? '')}/related?limit=8`,
      ),
    enabled: enabled && Boolean(productId),
    staleTime: 1000 * 60 * 5,
    select: (payload) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsPriceToProducts(payload.products, effectiveRole)
        : payload.products,
  });
}
