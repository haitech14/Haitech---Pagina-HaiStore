import type { QueryClient } from '@tanstack/react-query';

import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import {
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  collectProvisionalStoreProductsFromBundle,
  getCachedHomeBundleProvisionalProducts,
  loadProvisionalStoreProductsFromStaticBundle,
  type HomeCatalogBundleResponse,
} from '@/lib/home-catalog-bundle';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

async function seedProductsQueryFromRows(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  role: string,
  rows: ReturnType<typeof getCatalogRows>,
): Promise<boolean> {
  if (rows.length === 0) return false;
  const { toPublicProduct } = await import('@/lib/pricing');
  queryClient.setQueryData(
    queryKey,
    rows.map((row) => toPublicProduct(row, role)),
  );
  return true;
}

function seedProvisionalProducts(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  products: Product[],
): boolean {
  if (products.length === 0) return false;
  const existing = queryClient.getQueryData<Product[]>(queryKey);
  if (existing && existing.length > 0) return false;
  // updatedAt: 0 → stale; el índice completo sustituye en background.
  queryClient.setQueryData(queryKey, products, { updatedAt: 0 });
  return true;
}

function seedProvisionalFromMemory(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): boolean {
  const fromCache = getCachedHomeBundleProvisionalProducts();
  if (seedProvisionalProducts(queryClient, queryKey, fromCache)) return true;

  const bundleKey = [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', viewAsRolesQueryKey([])];
  const bundle = queryClient.getQueryData<HomeCatalogBundleResponse>(bundleKey);
  if (!bundle) return false;

  return seedProvisionalProducts(
    queryClient,
    queryKey,
    collectProvisionalStoreProductsFromBundle(bundle),
  );
}

/**
 * Precarga índice estático y siembra el catálogo de /tienda.
 * Siembra provisional de inmediato (memoria o home-bundle.json); el índice sustituye en background.
 */
export async function prefetchStorePage(queryClient: QueryClient, role = 'public') {
  const queryKey = ['products', role, viewAsRolesQueryKey([])];

  if (await seedProductsQueryFromRows(queryClient, queryKey, role, getCatalogRows())) {
    return;
  }

  seedProvisionalFromMemory(queryClient, queryKey);

  // Deep-link frío: ~57KB antes del 1.3MB.
  if (!queryClient.getQueryData<Product[]>(queryKey)?.length) {
    try {
      const fromStatic = await loadProvisionalStoreProductsFromStaticBundle();
      seedProvisionalProducts(queryClient, queryKey, fromStatic);
    } catch {
      /* useProducts reintentará */
    }
  }

  // Índice completo fuera del camino crítico (tras paint / idle).
  const scheduleIndex =
    typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function'
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 2500 })
      : (cb: () => void) => {
          window.setTimeout(cb, 800);
        };

  scheduleIndex(() => {
    preloadCatalogIndexNow();
    void loadCatalogIndex()
      .then(async () => {
        await seedProductsQueryFromRows(queryClient, queryKey, role, getCatalogRows());
      })
      .catch(() => {
        /* Sin índice: useProducts usa provisional / API */
      });
  });
}
