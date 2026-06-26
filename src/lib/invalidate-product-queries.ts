import type { QueryClient } from '@tanstack/react-query';

import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { toPublicProduct } from '@/lib/pricing';
import { deriveProductSlug } from '@/lib/product-slug';
import {
  applyViewAsPriceToProduct,
  shouldApplyViewAsPriceTransform,
} from '@/lib/view-as-role';
import type { UserRole } from '@/lib/roles';
import type { InventoryProduct, Product } from '@/types/product';

export const PRODUCT_UPDATED_CHANNEL = 'haistore-product-updated';

export function matchesProductIdOrSlug(product: InventoryProduct, lookup: string): boolean {
  const normalized = lookup.trim().toLowerCase();
  if (!normalized) return false;
  if (product.id.toLowerCase() === normalized) return true;
  if (product.slug?.toLowerCase() === normalized) return true;
  return deriveProductSlug(product).toLowerCase() === normalized;
}

function normalizeInventoryRow(row: InventoryProduct): InventoryProduct | null {
  try {
    return normalizeInventoryProduct(row, DEFAULT_WAREHOUSES);
  } catch {
    return null;
  }
}

/** Optimistic update for open product detail queries before refetch completes. */
export function patchProductDetailCacheFromInventory(
  queryClient: QueryClient,
  inventoryProduct: InventoryProduct,
): void {
  const normalized = normalizeInventoryRow(inventoryProduct);
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

    let publicProduct = toPublicProduct(normalized, role);
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
      let publicProduct = toPublicProduct(normalized, role);
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
  const inventoryProduct = options?.inventoryProduct
    ? normalizeInventoryRow(options.inventoryProduct)
    : null;

  if (inventoryProduct) {
    patchProductDetailCacheFromInventory(queryClient, inventoryProduct);
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
    queryClient.invalidateQueries({ queryKey: ['admin-inventory'], ...invalidateOpts }),
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
