import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundleForDisplay,
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  revalidateHomeCatalogBundle,
} from '@/lib/home-catalog-bundle';
import { deferCatalogIndexPreload } from '@/lib/defer-catalog-index';
import { prefetchStoreRoute } from '@/lib/prefetch-store-route';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/** Precarga snapshot estático y revalida contra la API en segundo plano (sin bloquear la ruta). */
export async function prefetchHomeCatalog(queryClient: QueryClient) {
  deferCatalogIndexPreload(1200);
  prefetchStoreRoute(queryClient);

  const queryKey = [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', viewAsRolesQueryKey([])];
  const initial = await fetchHomeCatalogBundleInitial();

  if (initial) {
    queryClient.setQueryData(queryKey, initial);
  }

  void queryClient.prefetchQuery({
    queryKey,
    queryFn: revalidateHomeCatalogBundle,
    staleTime: 1000 * 60 * 5,
  });

  return initial ?? (await fetchHomeCatalogBundleForDisplay());
}
