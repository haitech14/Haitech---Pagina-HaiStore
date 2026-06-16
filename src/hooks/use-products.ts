import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { normalizeInventoryProduct, mergeInventoryProductPatch } from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, Product } from '@/types/product';

async function fetchProductsForRole(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/products');
}

export function useProducts() {
  const { role, viewAsRole, effectiveRole } = useAuth();

  return useQuery({
    queryKey: ['products', role, viewAsRole],
    queryFn: fetchProductsForRole,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5,
    select: (products) =>
      viewAsRole ? applyViewAsPriceToProducts(products, effectiveRole) : products,
  });
}

async function fetchAdminInventory(): Promise<InventoryProduct[]> {
  const rows = await apiFetch<InventoryProduct[]>('/api/products/admin/all');
  return rows.map((row) => {
    try {
      return normalizeInventoryProduct(row, DEFAULT_WAREHOUSES);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'dato inválido';
      throw new Error(`Inventario con formato inválido (${row.id ?? 'sin id'}): ${message}`);
    }
  });
}

export function useAdminInventory() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-inventory'],
    queryFn: fetchAdminInventory,
    enabled: isAdmin,
    staleTime: 60_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Sesión') || message.includes('permisos')) return false;
      return failureCount < 1;
    },
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
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      const previousInventory = queryClient.getQueryData<InventoryProduct[]>(['admin-inventory']);

      queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
        current?.map((product) => {
          if (product.id !== id) return product;
          try {
            return mergeInventoryProductPatch(product, payload, DEFAULT_WAREHOUSES);
          } catch {
            return { ...product, ...payload };
          }
        }),
      );

      return { previousInventory };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(['admin-inventory'], context.previousInventory);
      }
    },
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
        current?.map((product) => {
          if (product.id !== id) return product;
          try {
            return mergeInventoryProductPatch(product, updated, DEFAULT_WAREHOUSES);
          } catch {
            return updated;
          }
        }),
      );
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
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
    mutationFn: (resetDeleted: boolean = false) =>
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
