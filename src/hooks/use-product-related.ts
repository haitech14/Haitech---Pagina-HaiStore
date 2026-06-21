import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export function useProductRelated(productId: string | undefined, enabled = true) {
  const { role, viewAsRole, effectiveRole } = useAuth();

  return useQuery({
    queryKey: ['product-related', productId, role, viewAsRole],
    queryFn: () =>
      apiFetch<{ products: Product[] }>(
        `/api/products/${encodeURIComponent(productId ?? '')}/related?limit=8`,
      ),
    enabled: enabled && Boolean(productId),
    staleTime: 1000 * 60 * 5,
    select: (payload) =>
      viewAsRole
        ? applyViewAsPriceToProducts(payload.products, effectiveRole)
        : payload.products,
  });
}
