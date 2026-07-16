import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundleForDisplay,
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  revalidateHomeCatalogBundle,
} from '@/lib/home-catalog-bundle';
import { deferCatalogIndexPreload } from '@/lib/defer-catalog-index';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/**
 * Precarga snapshot estático y revalida contra la API en segundo plano.
 * No dispara inventory-index (~1.3 MB) ni prefetch de tienda en cold start de home;
 * el índice se carga en idle (o al ir a /tienda / hover nav).
 */
export async function prefetchHomeCatalog(queryClient: QueryClient) {
  deferCatalogIndexPreload(8000);

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
