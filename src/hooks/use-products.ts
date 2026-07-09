import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { normalizeInventoryProduct, mergeInventoryProductPatch } from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { notifyProductCatalogChanged } from '@/lib/invalidate-product-queries';
import { toPublicProduct } from '@/lib/pricing';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, Product } from '@/types/product';

function catalogRowsToPublicProducts(rows: InventoryProduct[], role: string): Product[] {
  return rows.map((row) => toPublicProduct(row, role));
}

export async function fetchProductsForRole(role = 'public'): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/api/products');
  } catch {
    const rows = getCatalogRows().length > 0 ? getCatalogRows() : await loadCatalogIndex();
    return catalogRowsToPublicProducts(rows, role);
  }
}

export interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(options?: UseProductsOptions) {
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: ['products', role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () => fetchProductsForRole(role),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => {
      if (previous?.length) return previous;
      const rows = getCatalogRows();
      if (!rows.length) return undefined;
      return catalogRowsToPublicProducts(rows, role);
    },
    select: (products) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsPriceToProducts(products, effectiveRole)
        : products,
  });
}

async function fetchAdminInventory(): Promise<InventoryProduct[]> {
  const rows = await apiFetch<InventoryProduct[]>('/api/products/admin/all');
  const normalized: InventoryProduct[] = [];
  for (const row of rows) {
    try {
      normalized.push(normalizeInventoryProduct(row, DEFAULT_WAREHOUSES));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'dato inválido';
      console.warn(`[inventario] producto omitido (${row.id ?? 'sin id'}): ${message}`);
    }
  }
  if (normalized.length === 0 && rows.length > 0) {
    throw new Error('No se pudo normalizar ningún producto del inventario.');
  }
  return normalized;
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

  const notifyCatalogChange = (options?: {
    productId?: string;
    inventoryProduct?: InventoryProduct;
  }) => {
    void notifyProductCatalogChanged(queryClient, options);
  };

  const createProduct = useMutation({
    mutationFn: (payload: Partial<InventoryProduct>) =>
      apiFetch<InventoryProduct>('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (created) => {
      notifyCatalogChange({ productId: created.id, inventoryProduct: created });
    },
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
      notifyCatalogChange({ productId: id, inventoryProduct: updated });
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
      notifyCatalogChange({ productId: id });
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
      notifyCatalogChange();
    },
  });

  const bulkUpdateProducts = useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: InventoryBulkPatch }) =>
      apiFetch<{ ok: boolean; updated: number }>('/api/products/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ ids, patch }),
      }),
    onSuccess: () => notifyCatalogChange(),
  });

  const syncCatalog = useMutation({
    mutationFn: (resetDeleted: boolean = false) =>
      apiFetch<{ ok: boolean; total: number; fromCatalog: number }>(
        '/api/products/sync-catalog',
        {
          method: 'POST',
          body: JSON.stringify({ resetDeleted, importMissing: true }),
        },
      ),
    onSuccess: () => notifyCatalogChange(),
  });

  const bulkDuplicateProducts = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch<{ ok: boolean; created: number }>('/api/products/bulk/duplicate', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => notifyCatalogChange(),
  });

  const reorderProducts = useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiFetch<{ ok: boolean; total: number }>('/api/products/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: () => notifyCatalogChange(),
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
