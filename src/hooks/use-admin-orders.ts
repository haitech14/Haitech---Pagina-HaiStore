import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type { StoreOrder } from '@/types/store';

async function fetchAdminOrders(limit = 200): Promise<StoreOrder[]> {
  try {
    const payload = await apiFetch<{ orders: StoreOrder[] }>(
      `/api/orders/admin/all?limit=${limit}`,
    );
    return payload.orders;
  } catch {
    return [];
  }
}

export function useAdminOrdersList(limit = 200) {
  return useQuery({
    queryKey: ['admin-orders-list', limit],
    queryFn: () => fetchAdminOrders(limit),
    staleTime: 1000 * 30,
  });
}
