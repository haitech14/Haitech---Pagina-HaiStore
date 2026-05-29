import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { inventoryFallback } from '@/data/inventory-fallback';
import { apiFetch } from '@/lib/api';
import { ensureFullPrices, mapInventoryForRole } from '@/lib/pricing';
import type { InventoryProduct, Product } from '@/types/product';

async function fetchProductsForRole(role: string): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/api/products');
  } catch {
    const migrated = inventoryFallback.map((p) => ({
      ...p,
      prices: ensureFullPrices(p.prices),
    }));
    return mapInventoryForRole(migrated, role);
  }
}

export function useProducts() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['products', role],
    queryFn: () => fetchProductsForRole(role),
    staleTime: 1000 * 30,
  });
}

async function fetchAdminInventory(): Promise<InventoryProduct[]> {
  return apiFetch<InventoryProduct[]>('/api/products/admin/all');
}

export function useAdminInventory() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-inventory'],
    queryFn: fetchAdminInventory,
    enabled: isAdmin,
  });
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    void queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const createProduct = useMutation({
    mutationFn: (payload: Partial<InventoryProduct>) =>
      apiFetch<InventoryProduct>('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InventoryProduct> }) =>
      apiFetch<InventoryProduct>(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createProduct, updateProduct, deleteProduct };
}
