import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundle,
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
} from '@/lib/home-catalog-bundle';
import { preloadCatalogIndex } from '@/lib/catalog-featured';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/** Precarga snapshot estático y revalida contra la API en segundo plano (sin bloquear la ruta). */
export async function prefetchHomeCatalog(queryClient: QueryClient) {
  preloadCatalogIndex();

  const queryKey = [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', viewAsRolesQueryKey([])];
  const initial = await fetchHomeCatalogBundleInitial();

  if (initial) {
    queryClient.setQueryData(queryKey, initial);
  }

  void queryClient.prefetchQuery({
    queryKey,
    queryFn: fetchHomeCatalogBundle,
    staleTime: 1000 * 60 * 5,
  });

  return initial;
}
