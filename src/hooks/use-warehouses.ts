import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { DEFAULT_WAREHOUSES, normalizeWarehouses } from '@/lib/inventory-stock';
import type { InventoryWarehouse } from '@/types/product';

async function fetchWarehouses(): Promise<InventoryWarehouse[]> {
  try {
    const rows = await apiFetch<InventoryWarehouse[]>('/api/warehouses');
    return normalizeWarehouses(rows);
  } catch {
    return [...DEFAULT_WAREHOUSES];
  }
}

export function useWarehouses() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    enabled: isAdmin,
    staleTime: 1000 * 60,
  });
}
