import type { QueryClient } from '@tanstack/react-query';

import {
  fetchHomeCatalogBundleInitial,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  readStoredHomeCatalogBundle,
  revalidateHomeCatalogBundle,
} from '@/lib/home-catalog-bundle';
import { deferCatalogIndexPreload } from '@/lib/defer-catalog-index';
import {
  fetchStoreCategoriesTreeWithFallback,
  STORE_CATEGORIES_QUERY_KEY,
} from '@/lib/store-categories-fetch';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/**
 * Precarga snapshot/home-bundle sin bloquear el loader de React Router.
 * Siembra sessionStorage al instante; JSON estático + API van en background.
 */
export function prefetchHomeCatalog(queryClient: QueryClient): null {
  // Tras 2ª/3ª oleada: no pelear bandwidth con home-bundle ~56KB.
  deferCatalogIndexPreload(8000);

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

    const prefetchCategories = () => {
      void queryClient.prefetchQuery({
        queryKey: [STORE_CATEGORIES_QUERY_KEY],
        queryFn: fetchStoreCategoriesTreeWithFallback,
        staleTime: 1000 * 60 * 10,
      });
    };

    const revalidate = () => {
      void queryClient.prefetchQuery({
        queryKey,
        queryFn: revalidateHomeCatalogBundle,
        staleTime: 1000 * 60 * 5,
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(prefetchCategories, { timeout: 2800 });
      window.requestIdleCallback(revalidate, { timeout: 3500 });
    } else {
      window.setTimeout(prefetchCategories, 1500);
      window.setTimeout(revalidate, 2000);
    }
  })();

  return null;
}
