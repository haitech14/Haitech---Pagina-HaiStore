import type { QueryClient } from '@tanstack/react-query';

import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import {
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  collectProvisionalStoreProductsFromBundle,
  getCachedHomeBundleProvisionalProducts,
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

function seedProvisionalFromHomeBundle(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): boolean {
  const existing = queryClient.getQueryData<Product[]>(queryKey);
  if (existing && existing.length > 0) return false;

  const fromCache = getCachedHomeBundleProvisionalProducts();
  if (fromCache.length > 0) {
    // updatedAt: 0 → stale; useProducts/queryFn sigue cargando el índice completo.
    queryClient.setQueryData(queryKey, fromCache, { updatedAt: 0 });
    return true;
  }

  const bundleKey = [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', viewAsRolesQueryKey([])];
  const bundle = queryClient.getQueryData<HomeCatalogBundleResponse>(bundleKey);
  if (!bundle) return false;

  const provisional = collectProvisionalStoreProductsFromBundle(bundle);
  if (provisional.length === 0) return false;

  queryClient.setQueryData(queryKey, provisional, { updatedAt: 0 });
  return true;
}

/**
 * Precarga índice estático y siembra el catálogo de /tienda.
 * Siembra provisional de inmediato; el índice completo sustituye en background.
 */
export async function prefetchStorePage(queryClient: QueryClient, role = 'public') {
  preloadCatalogIndexNow();

  const queryKey = ['products', role, viewAsRolesQueryKey([])];

  if (await seedProductsQueryFromRows(queryClient, queryKey, role, getCatalogRows())) {
    return;
  }

  seedProvisionalFromHomeBundle(queryClient, queryKey);

  // No await en el camino crítico: el loader/hover no debe esperar 1.3MB.
  void loadCatalogIndex()
    .then(async () => {
      await seedProductsQueryFromRows(queryClient, queryKey, role, getCatalogRows());
    })
    .catch(() => {
      // Sin índice: useProducts intenta API al montar (provisional queda stale).
    });
}
