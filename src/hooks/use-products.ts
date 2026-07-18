import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { getCatalogRows, loadCatalogIndex, patchCatalogIndexProductMedia } from '@/lib/catalog-featured';
import {
  getCachedHomeBundleProvisionalProducts,
  loadProvisionalStoreProductsFromStaticBundle,
} from '@/lib/home-catalog-bundle';
import { normalizeInventoryProductForAdminList, mergeInventoryProductPatch } from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES, normalizeWarehouses } from '@/lib/inventory-stock';
import { notifyProductCatalogChanged, upsertAdminInventoryProducts } from '@/lib/invalidate-product-queries';
import { toPublicProduct } from '@/lib/pricing';
import type { SyncCatalogApiResult } from '@/lib/sync-catalog-feedback';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { InventoryBulkPatch } from '@/types/inventory-bulk';
import type { InventoryProduct, InventoryWarehouse, Product } from '@/types/product';

function catalogRowsToPublicProducts(rows: InventoryProduct[], role: string): Product[] {
  return rows.map((row) => toPublicProduct(row, role));
}

function getCachedWarehouses(
  queryClient: ReturnType<typeof useQueryClient>,
): InventoryWarehouse[] {
  const cached = queryClient.getQueryData<InventoryWarehouse[]>(['warehouses']);
  return normalizeWarehouses(cached ?? DEFAULT_WAREHOUSES);
}

async function loadFullCatalogForRole(role: string): Promise<Product[] | null> {
  try {
    await loadCatalogIndex();
    const fromIndex = getCatalogRows();
    if (fromIndex.length > 0) {
      return catalogRowsToPublicProducts(fromIndex, role);
    }
  } catch {
    /* API fallback abajo */
  }
  try {
    return await apiFetch<Product[]>('/api/products', { cache: 'no-store' });
  } catch {
    return null;
  }
}

/**
 * Catálogo de /tienda.
 * Si hay provisional (sessionStorage o home-bundle.json), lo devuelve al instante
 * y completa con inventory-index en background vía queryClient.
 */
export async function fetchProductsForRole(
  role = 'public',
  options?: {
    queryClient?: ReturnType<typeof useQueryClient>;
    queryKey?: readonly unknown[];
  },
): Promise<Product[]> {
  const cached = getCatalogRows();
  if (cached.length > 0) {
    return catalogRowsToPublicProducts(cached, role);
  }

  let provisional = getCachedHomeBundleProvisionalProducts();
  if (provisional.length === 0) {
    provisional = await loadProvisionalStoreProductsFromStaticBundle();
  }

  if (provisional.length > 0 && options?.queryClient && options.queryKey) {
    const { queryClient, queryKey } = options;
    void loadFullCatalogForRole(role).then((full) => {
      if (full && full.length > 0) {
        queryClient.setQueryData(queryKey, full);
      }
    });
    return provisional;
  }

  const full = await loadFullCatalogForRole(role);
  if (full && full.length > 0) return full;
  if (provisional.length > 0) return provisional;
  return apiFetch<Product[]>('/api/products', { cache: 'no-store' });
}

export interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(options?: UseProductsOptions) {
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const queryClient = useQueryClient();
  const enabled = options?.enabled !== false;
  const queryKey = ['products', role, viewAsRolesQueryKey(viewAsRoles)] as const;

  return useQuery({
    queryKey,
    queryFn: () => fetchProductsForRole(role, { queryClient, queryKey }),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => {
      if (previous?.length) return previous;
      const rows = getCatalogRows();
      if (rows.length) return catalogRowsToPublicProducts(rows, role);
      // Primer paint de /tienda mientras baja inventory-index.
      const provisional = getCachedHomeBundleProvisionalProducts();
      return provisional.length > 0 ? provisional : undefined;
    },
    select: (products) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsPriceToProducts(products, effectiveRole)
        : products,
  });
}

async function fetchAdminInventory(
  warehouses: InventoryWarehouse[] = DEFAULT_WAREHOUSES,
): Promise<InventoryProduct[]> {
  const rows = await apiFetch<InventoryProduct[]>('/api/products/admin/all');
  const warehouseList = normalizeWarehouses(warehouses);
  const normalized: InventoryProduct[] = [];
  for (const row of rows) {
    try {
      normalized.push(normalizeInventoryProductForAdminList(row, warehouseList));
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

/** Producto completo (adjuntos, descripción) para el diálogo de edición. */
export async function fetchAdminInventoryProductById(id: string): Promise<InventoryProduct> {
  return apiFetch<InventoryProduct>(`/api/products/admin/${encodeURIComponent(id)}`);
}

export function useAdminInventory() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => fetchAdminInventory(getCachedWarehouses(queryClient)),
    enabled: isAdmin,
    staleTime: 60_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
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
    onSuccess: async (created) => {
      upsertAdminInventoryProducts(queryClient, [created], { prepend: true });
      // Cancelar GET en vuelo para que un snapshot pre-write no gane la carrera.
      await queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      await queryClient.invalidateQueries({
        queryKey: ['admin-inventory'],
        refetchType: 'active',
      });
      upsertAdminInventoryProducts(queryClient, [created], { prepend: true });
      notifyCatalogChange({ productId: created.id, inventoryProduct: created });
      // Re-merge tras notify (otros listeners pueden haber disparado refetch).
      upsertAdminInventoryProducts(queryClient, [created], { prepend: true });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InventoryProduct> }) =>
      apiFetch<InventoryProduct>(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onMutate: async ({ id, payload }) => {
      // No await: cancelar sin bloquear el hilo mantiene el editor responsive.
      void queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      const previousInventory = queryClient.getQueryData<InventoryProduct[]>(['admin-inventory']);
      const warehouses = getCachedWarehouses(queryClient);

      // No pintamos data: URLs en caché: son pesadas y hacen parecer “guardado” antes
      // de que el servidor persista /products/...-256.webp.
      const hasInlineDataMedia =
        (typeof payload.image_url === 'string' && payload.image_url.startsWith('data:')) ||
        (Array.isArray(payload.gallery) &&
          payload.gallery.some(
            (url) => typeof url === 'string' && url.startsWith('data:'),
          ));

      if (!hasInlineDataMedia) {
        queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
          current?.map((product) => {
            if (product.id !== id) return product;
            try {
              return mergeInventoryProductPatch(product, payload, warehouses);
            } catch {
              return { ...product, ...payload };
            }
          }),
        );
      }

      return { previousInventory };
    },
    onError: (_error, { id }, context) => {
      const previousInventory = context?.previousInventory;
      if (!previousInventory) return;
      // No restaurar un snapshot viejo si otra mutación ya avanzó la caché.
      queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) => {
        if (!current) return previousInventory;
        const previousRow = previousInventory.find((product) => product.id === id);
        if (!previousRow) return current;
        return current.map((product) => (product.id === id ? previousRow : product));
      });
    },
    onSuccess: (updated, { id }) => {
      // Upsert inmediato — el badge de stock debe verse sin Sync/F5.
      upsertAdminInventoryProducts(queryClient, [updated], { prepend: false });
      patchCatalogIndexProductMedia(updated);
      notifyCatalogChange({ productId: id, inventoryProduct: updated });
      // Re-merge tras notify (listeners / broadcast pueden disparar otro refetch).
      upsertAdminInventoryProducts(queryClient, [updated], { prepend: false });
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
      apiFetch<{ ok: boolean; updated: number; products?: InventoryProduct[] }>(
        '/api/products/bulk',
        {
          method: 'PATCH',
          body: JSON.stringify({ ids, patch }),
        },
      ),
    onMutate: async ({ ids, patch }) => {
      void queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      const previousInventory = queryClient.getQueryData<InventoryProduct[]>(['admin-inventory']);
      const idSet = new Set(ids);

      if (typeof patch.image_url === 'string' && patch.image_url.trim()) {
        const imageUrl = patch.image_url.trim();
        queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
          current?.map((product) => {
            if (!idSet.has(product.id)) return product;
            try {
              return mergeInventoryProductPatch(
                product,
                { image_url: imageUrl, gallery: product.gallery ?? [] },
                DEFAULT_WAREHOUSES,
              );
            } catch {
              return { ...product, image_url: imageUrl };
            }
          }),
        );
      }

      return { previousInventory };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(['admin-inventory'], context.previousInventory);
      }
    },
    onSuccess: (data, { ids, patch }) => {
      const saved = Array.isArray(data.products) ? data.products : [];
      const patchImageUrl =
        typeof patch.image_url === 'string' && patch.image_url.trim()
          ? patch.image_url.trim()
          : null;

      const ensureImageUrl = (
        merged: InventoryProduct,
        fromServer: InventoryProduct | undefined,
      ): InventoryProduct => {
        if (merged.image_url?.trim()) return merged;
        const serverUrl = fromServer?.image_url?.trim();
        if (serverUrl) return { ...merged, image_url: serverUrl };
        if (patchImageUrl) return { ...merged, image_url: patchImageUrl };
        return merged;
      };

      if (saved.length > 0) {
        const byId = new Map(saved.map((product) => [product.id, product]));
        queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
          current?.map((product) => {
            const next = byId.get(product.id);
            if (!next) return product;
            try {
              return ensureImageUrl(
                mergeInventoryProductPatch(product, next, DEFAULT_WAREHOUSES),
                next,
              );
            } catch {
              return ensureImageUrl({ ...product, ...next }, next);
            }
          }),
        );
        for (const product of saved) {
          patchCatalogIndexProductMedia(product);
        }
      } else if (patchImageUrl) {
        const idSet = new Set(ids);
        queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) =>
          current?.map((product) => {
            if (!idSet.has(product.id)) return product;
            try {
              return ensureImageUrl(
                mergeInventoryProductPatch(
                  product,
                  { image_url: patchImageUrl, gallery: product.gallery ?? [] },
                  DEFAULT_WAREHOUSES,
                ),
                undefined,
              );
            } catch {
              return { ...product, image_url: patchImageUrl };
            }
          }),
        );
      }

      const imageOnlyPatch =
        Boolean(patchImageUrl) && Object.keys(patch).every((key) => key === 'image_url');

      // Imagen: confiar en el payload del PATCH (con /products/…?v=) y no refetch
      // inmediato (evita carrera + parpadeo a placeholder).
      if (!imageOnlyPatch) {
        void queryClient.invalidateQueries({
          queryKey: ['admin-inventory'],
          refetchType: 'active',
        });
      }
      const primary = saved[0];
      if (primary) {
        notifyCatalogChange({ productId: primary.id, inventoryProduct: primary });
      } else {
        notifyCatalogChange({ productId: ids[0] });
      }
    },
  });

  const syncCatalog = useMutation({
    mutationFn: (resetDeleted: boolean = false) =>
      apiFetch<SyncCatalogApiResult>('/api/products/sync-catalog', {
        method: 'POST',
        body: JSON.stringify({ resetDeleted, importMissing: true }),
      }),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      await queryClient.invalidateQueries({
        queryKey: ['admin-inventory'],
        refetchType: 'active',
      });
      notifyCatalogChange();
    },
  });

  const bulkDuplicateProducts = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch<{ ok: boolean; created: number; products?: InventoryProduct[] }>(
        '/api/products/bulk/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ ids }),
        },
      ),
    onSuccess: async (result) => {
      const created = Array.isArray(result.products) ? result.products : [];
      // 1) Upsert inmediato — el toast no basta; la tabla debe ver las filas ya.
      if (created.length > 0) {
        upsertAdminInventoryProducts(queryClient, created, { prepend: true });
      }
      // 2) Cancelar GET pre-write + refetch (el servidor puede aún devolver lista vieja).
      await queryClient.cancelQueries({ queryKey: ['admin-inventory'] });
      await queryClient.invalidateQueries({
        queryKey: ['admin-inventory'],
        refetchType: 'active',
      });
      // 3) Re-merge tras el refetch: si el GET trajo snapshot sin la copia, la reinsertamos.
      if (created.length > 0) {
        upsertAdminInventoryProducts(queryClient, created, { prepend: true });
      }
      // Con productId + inventoryProduct NO se vuelve a invalidar admin-inventory
      // (evitaría otro refetch que otra vez pisaría el upsert).
      const first = created[0];
      if (first) {
        notifyCatalogChange({ productId: first.id, inventoryProduct: first });
        // Fusionar TODAS las copias (notify solo lleva la primera) y sobrevivir a
        // cualquier listener que dispare otro refetch.
        upsertAdminInventoryProducts(queryClient, created, { prepend: true });
      } else {
        // Sin filas en la respuesta no hay upsert posible: invalidate completo.
        notifyCatalogChange();
      }
    },
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
