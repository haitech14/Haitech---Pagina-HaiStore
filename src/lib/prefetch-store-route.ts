import type { QueryClient } from '@tanstack/react-query';

import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import { prefetchStorePage } from '@/lib/prefetch-store-page';
import { queryClient } from '@/providers';

let storeChunkPrefetched = false;
let storeDataPrefetched = false;

/** Descarga el chunk JS de la tienda antes de navegar. */
export function prefetchStoreRouteChunk(): void {
  if (storeChunkPrefetched) return;
  storeChunkPrefetched = true;
  void import('@/pages/store');
}

/** Precarga chunk, índice de catálogo y datos de productos para /tienda. */
export function prefetchStoreRoute(client: QueryClient = queryClient): void {
  prefetchStoreRouteChunk();
  preloadCatalogIndexNow();

  if (storeDataPrefetched) return;
  storeDataPrefetched = true;

  void prefetchStorePage(client).catch(() => {
    storeDataPrefetched = false;
  });
}

/** Eventos de puntero/teclado para enlaces hacia la tienda. */
export function prefetchStoreRouteFromEvent(): void {
  prefetchStoreRoute();
}
