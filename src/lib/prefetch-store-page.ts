import type { QueryClient } from '@tanstack/react-query';

import { fetchProductsForRole } from '@/hooks/use-products';
import { loadCatalogIndex, preloadCatalogIndex } from '@/lib/catalog-featured';
import { viewAsRolesQueryKey } from '@/lib/view-as-role';

/** Precarga índice estático y catálogo completo para /tienda. */
export async function prefetchStorePage(queryClient: QueryClient, role = 'public') {
  preloadCatalogIndex();

  const queryKey = ['products', role, viewAsRolesQueryKey([])];

  try {
    const rows = await loadCatalogIndex();
    if (rows.length > 0) {
      const { toPublicProduct } = await import('@/lib/pricing');
      queryClient.setQueryData(
        queryKey,
        rows.map((row) => toPublicProduct(row, role)),
      );
    }
  } catch {
    /* API o snapshot en segundo plano */
  }

  return queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchProductsForRole(role),
    staleTime: 1000 * 60 * 5,
  });
}
