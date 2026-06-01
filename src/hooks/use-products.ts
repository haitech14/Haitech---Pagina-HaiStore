import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { inventoryFallback } from '@/data/inventory-fallback';
import { apiFetch } from '@/lib/api';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { ensureFullPrices, mapInventoryForRole } from '@/lib/pricing';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, Product } from '@/types/product';

async function fetchProductsForRole(role: string): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/api/products');
  } catch {
    const migrated = inventoryFallback.map((p) => normalizeInventoryProduct(p));
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
  const rows = await apiFetch<InventoryProduct[]>('/api/products/admin/all');
  return rows.map((row) => normalizeInventoryProduct(row, DEFAULT_WAREHOUSES));
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
    void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
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
    onSuccess: (_data, id) => {
      queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
        current?.filter((product) => product.id !== id),
      );
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        current?.filter((product) => product.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const bulkDeleteProducts = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch<{ ok: boolean; deleted: number }>('/api/products/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: (_data, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
        current?.filter((product) => !idSet.has(product.id)),
      );
      queryClient.setQueryData<Product[]>(['products'], (current) =>
        current?.filter((product) => !idSet.has(product.id)),
      );
      void queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const bulkUpdateProducts = useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: InventoryBulkPatch }) =>
      apiFetch<{ ok: boolean; updated: number }>('/api/products/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ ids, patch }),
      }),
    onSuccess: invalidate,
  });

  const syncCatalog = useMutation({
    mutationFn: (resetDeleted = true) =>
      apiFetch<{ ok: boolean; total: number; fromCatalog: number }>(
        '/api/products/sync-catalog',
        {
          method: 'POST',
          body: JSON.stringify({ resetDeleted }),
        },
      ),
    onSuccess: invalidate,
  });

  const bulkDuplicateProducts = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch<{ ok: boolean; created: number }>('/api/products/bulk/duplicate', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: invalidate,
  });

  const reorderProducts = useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiFetch<{ ok: boolean; total: number }>('/api/products/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: invalidate,
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
    bulkDuplicateProducts,
    reorderProducts,
    syncCatalog,
  };
}
