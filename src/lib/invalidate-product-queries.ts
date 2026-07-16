import type { QueryClient } from '@tanstack/react-query';

import {
  mergeInventoryProductPatch,
  normalizeInventoryProduct,
  normalizeInventoryProductForAdminList,
} from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES, normalizeWarehouses } from '@/lib/inventory-stock';
import { toPublicProduct } from '@/lib/pricing';
import { deriveProductSlug } from '@/lib/product-slug';
import {
  applyViewAsPriceToProduct,
  shouldApplyViewAsPriceTransform,
} from '@/lib/view-as-role';
import type { UserRole } from '@/lib/roles';
import type { InventoryProduct, InventoryWarehouse, Product } from '@/types/product';

export const PRODUCT_UPDATED_CHANNEL = 'haistore-product-updated';

function getCachedWarehouses(queryClient: QueryClient): InventoryWarehouse[] {
  const cached = queryClient.getQueryData<InventoryWarehouse[]>(['warehouses']);
  return normalizeWarehouses(cached ?? DEFAULT_WAREHOUSES);
}

export function matchesProductIdOrSlug(product: InventoryProduct, lookup: string): boolean {
  const normalized = lookup.trim().toLowerCase();
  if (!normalized) return false;
  if (product.id.toLowerCase() === normalized) return true;
  if (product.slug?.toLowerCase() === normalized) return true;
  return deriveProductSlug(product).toLowerCase() === normalized;
}

function normalizeInventoryRow(
  row: InventoryProduct,
  warehouses: InventoryWarehouse[] = DEFAULT_WAREHOUSES,
): InventoryProduct | null {
  try {
    return normalizeInventoryProduct(row, warehouses);
  } catch {
    return null;
  }
}

function normalizeAdminInventoryRow(
  row: InventoryProduct,
  warehouses: InventoryWarehouse[] = DEFAULT_WAREHOUSES,
): InventoryProduct | null {
  try {
    return normalizeInventoryProductForAdminList(row, warehouses);
  } catch {
    return null;
  }
}

/**
 * Inserta o fusiona filas en la caché admin-inventory.
 * Usar tras create / duplicate / update cuando la UI debe verse al instante.
 */
export function upsertAdminInventoryProducts(
  queryClient: QueryClient,
  rows: InventoryProduct[],
  options?: { prepend?: boolean },
): void {
  if (rows.length === 0) return;
  const warehouses = getCachedWarehouses(queryClient);
  const normalized = rows
    .map((row) => normalizeAdminInventoryRow(row, warehouses))
    .filter((row): row is InventoryProduct => row != null);
  if (normalized.length === 0) return;

  const prepend = options?.prepend !== false;

  queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) => {
    if (!current) return normalized;

    let next = [...current];
    for (const row of normalized) {
      const index = next.findIndex((product) => product.id === row.id);
      if (index >= 0) {
        try {
          next[index] = mergeInventoryProductPatch(next[index]!, row, warehouses);
        } catch {
          next[index] = row;
        }
        continue;
      }
      next = prepend ? [row, ...next] : [...next, row];
    }
    return next;
  });
}

/** Optimistic update for open product detail queries before refetch completes. */
export function patchProductDetailCacheFromInventory(
  queryClient: QueryClient,
  inventoryProduct: InventoryProduct,
): void {
  const warehouses = getCachedWarehouses(queryClient);
  const normalized = normalizeInventoryRow(inventoryProduct, warehouses);
  if (!normalized) return;

  for (const [queryKey] of queryClient.getQueriesData<Product | null>({ queryKey: ['product'] })) {
    if (!Array.isArray(queryKey) || queryKey.length < 3) continue;
    const lookupId = String(queryKey[1] ?? '');
    if (!matchesProductIdOrSlug(normalized, lookupId)) continue;

    const role = String(queryKey[2] ?? 'public');
    const viewAsKey = String(queryKey[3] ?? '');
    const viewAsRoles = viewAsKey
      ? (viewAsKey.split(',').filter(Boolean) as UserRole[])
      : [];

    let publicProduct = toPublicProduct(normalized, role, warehouses);
    if (shouldApplyViewAsPriceTransform(viewAsRoles) && viewAsRoles[0]) {
      publicProduct = applyViewAsPriceToProduct(publicProduct, viewAsRoles[0]);
    }

    queryClient.setQueryData(queryKey, publicProduct);
  }

  for (const [queryKey, current] of queryClient.getQueriesData<Product[]>({ queryKey: ['products'] })) {
    if (!Array.isArray(queryKey) || !current) continue;

    const role = String(queryKey[1] ?? 'public');
    const viewAsKey = String(queryKey[2] ?? '');
    const viewAsRoles = viewAsKey
      ? (viewAsKey.split(',').filter(Boolean) as UserRole[])
      : [];

    const updatedList = current.map((product) => {
      if (
        !matchesProductIdOrSlug(normalized, product.id) &&
        product.slug !== normalized.slug
      ) {
        return product;
      }
      let publicProduct = toPublicProduct(normalized, role, warehouses);
      if (shouldApplyViewAsPriceTransform(viewAsRoles) && viewAsRoles[0]) {
        publicProduct = applyViewAsPriceToProduct(publicProduct, viewAsRoles[0]);
      }
      return publicProduct;
    });

    queryClient.setQueryData(queryKey, updatedList);
  }
}

export async function invalidateProductQueries(
  queryClient: QueryClient,
  options?: { productId?: string; inventoryProduct?: InventoryProduct },
): Promise<void> {
  const warehouses = getCachedWarehouses(queryClient);
  const inventoryProduct = options?.inventoryProduct
    ? normalizeInventoryRow(options.inventoryProduct, warehouses)
    : null;

  if (inventoryProduct) {
    patchProductDetailCacheFromInventory(queryClient, inventoryProduct);
    queryClient.setQueryData<InventoryProduct[]>(['admin-inventory'], (current) => {
      if (!current) return current;
      const index = current.findIndex((product) => product.id === inventoryProduct.id);
      if (index === -1) return [inventoryProduct, ...current];
      return current.map((product) => {
        if (product.id !== inventoryProduct.id) return product;
        try {
          return mergeInventoryProductPatch(product, inventoryProduct, warehouses);
        } catch {
          return { ...product, ...inventoryProduct };
        }
      });
    });
  }

  const productPredicate =
    inventoryProduct && options?.productId
      ? (query: { queryKey: readonly unknown[] }) => {
          if (query.queryKey[0] !== 'product') return false;
          const lookup = query.queryKey[1];
          return typeof lookup === 'string' && matchesProductIdOrSlug(inventoryProduct, lookup);
        }
      : undefined;

  const invalidateOpts = { refetchType: 'active' as const };

  if (productPredicate) {
    await queryClient.invalidateQueries({ predicate: productPredicate, ...invalidateOpts });
  } else {
    await queryClient.invalidateQueries({ queryKey: ['product'], ...invalidateOpts });
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['products'], ...invalidateOpts }),
    queryClient.invalidateQueries({ queryKey: ['products-by-ids'], ...invalidateOpts }),
    queryClient.invalidateQueries({ queryKey: ['product-search'], ...invalidateOpts }),
    queryClient.invalidateQueries({ queryKey: ['catalog-search'], ...invalidateOpts }),
    // No invalidar admin-inventory si el PATCH ya fusionó el row en caché (o hay
    // productId concreto): un refetch completo congela la tabla y puede pisar
    // el valor optimista con datos viejos del broadcast en la misma pestaña.
    ...(inventoryProduct || options?.productId
      ? []
      : [queryClient.invalidateQueries({ queryKey: ['admin-inventory'], ...invalidateOpts })]),
    queryClient.invalidateQueries({ queryKey: ['category-catalog'], ...invalidateOpts }),
    queryClient.invalidateQueries({ queryKey: ['warehouses'], ...invalidateOpts }),
  ]);
}

export function broadcastProductUpdated(productId: string): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const channel = new BroadcastChannel(PRODUCT_UPDATED_CHANNEL);
    channel.postMessage({ productId });
    channel.close();
  } catch {
    // BroadcastChannel unavailable
  }
}

export async function notifyProductCatalogChanged(
  queryClient: QueryClient,
  options?: { productId?: string; inventoryProduct?: InventoryProduct },
): Promise<void> {
  if (options?.productId) {
    broadcastProductUpdated(options.productId);
  }
  await invalidateProductQueries(queryClient, options);
}
