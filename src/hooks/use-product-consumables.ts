import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import { apiFetch } from '@/lib/api';

export function useProductConsumables(productId: string | undefined, enabled = true) {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['product-consumables', productId, role],
    queryFn: () =>
      apiFetch<{ groups: ConsumableGroup[] }>(
        `/api/products/${encodeURIComponent(productId ?? '')}/consumables`,
      ),
    enabled: enabled && Boolean(productId),
    staleTime: 1000 * 60 * 5,
    select: (payload) => payload.groups,
  });
}
