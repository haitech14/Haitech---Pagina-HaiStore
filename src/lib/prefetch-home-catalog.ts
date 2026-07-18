import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  readStoredHomeCatalogBundle,
  revalidateHomeCatalogBundle,
} from '@/lib/home-catalog-bundle';
import {
  fetchStoreCategoriesTreeWithFallback,
  STORE_CATEGORIES_QUERY_KEY,
} from '@/lib/store-categories-fetch';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/**
 * Precarga snapshot/home-bundle sin bloquear el loader de React Router.
 * Siembra sessionStorage al instante; JSON estático + API van en background.
 * No calienta inventory-index (1.3MB): búsqueda /tienda lo cargan bajo demanda.
 */
export function prefetchHomeCatalog(queryClient: QueryClient): null {
  void queryClient.prefetchQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60 * 10,
  });

  const queryKey = [HOME_CATALOG_BUNDLE_QUERY_KEY, 'public', viewAsRolesQueryKey([])];

  // Seed síncrono: pinta de inmediato si ya hubo visita en la pestaña.
  const cached = readStoredHomeCatalogBundle();
  if (cached) {
    queryClient.setQueryData(queryKey, cached);
  }

  void (async () => {
    try {
      const initial = await fetchHomeCatalogBundleInitial();
      if (initial) {
        queryClient.setQueryData(queryKey, initial);
      }
    } catch {
      /* useHomeCatalogBundle reintentará al montar */
    }

    void queryClient.prefetchQuery({
      queryKey,
      queryFn: revalidateHomeCatalogBundle,
      staleTime: 1000 * 60 * 5,
    });
  })();

  return null;
}
