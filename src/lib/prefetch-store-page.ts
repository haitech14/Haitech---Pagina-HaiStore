import type { QueryClient } from '@tanstack/react-query';

import { fetchProductsForRole } from '@/hooks/use-products';
import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/** Precarga índice estático y catálogo completo para /tienda. */
export async function prefetchStorePage(queryClient: QueryClient, role = 'public') {
  preloadCatalogIndexNow();

  const queryKey = ['products', role, viewAsRolesQueryKey([])];

  const cachedRows = getCatalogRows();
  if (cachedRows.length > 0) {
    const { toPublicProduct } = await import('@/lib/pricing');
    queryClient.setQueryData(
      queryKey,
      cachedRows.map((row) => toPublicProduct(row, role)),
    );
  }

  void loadCatalogIndex()
    .then(async (rows) => {
      if (rows.length === 0) return;
      const { toPublicProduct } = await import('@/lib/pricing');
      queryClient.setQueryData(
        queryKey,
        rows.map((row) => toPublicProduct(row, role)),
      );
    })
    .catch(() => {
      /* API en segundo plano */
    });

  return queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchProductsForRole(role),
    staleTime: 1000 * 60 * 5,
  });
}
