import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useSaveWarehouses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouses: InventoryWarehouse[]) => {
      const normalized = normalizeWarehouses(warehouses);
      return apiFetch<InventoryWarehouse[]>('/api/warehouses', {
        method: 'PUT',
        body: JSON.stringify({ warehouses: normalized }),
      });
    },
    onSuccess: (saved) => {
      const normalized = normalizeWarehouses(saved);
      queryClient.setQueryData<InventoryWarehouse[]>(['warehouses'], normalized);
      // Los productos recalculan stock_by_warehouse / entrega con la lista nueva.
      void queryClient.invalidateQueries({
        queryKey: ['admin-inventory'],
        refetchType: 'active',
      });
    },
  });
}
