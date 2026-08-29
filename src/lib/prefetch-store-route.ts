import type { QueryClient } from '@tanstack/react-query';

import { INVENTORY_INDEX_URL } from '@/lib/catalog-featured';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import { prefetchStorePage } from '@/lib/prefetch-store-page';
import {
  fetchStoreCategoriesTreeWithFallback,
  STORE_CATEGORIES_QUERY_KEY,
} from '@/lib/store-categories-fetch';
import { queryClient } from '@/providers';

let storeChunkPrefetched = false;
let storeDataPrefetched = false;
let inventoryIndexPreloadLinked = false;

/** Hint al navegador para bajar el índice de catálogo cuanto antes. */
function ensureInventoryIndexPreloadLink(): void {
  if (typeof document === 'undefined' || inventoryIndexPreloadLinked) return;
  inventoryIndexPreloadLinked = true;
  if (document.querySelector(`link[rel="preload"][href="${INVENTORY_INDEX_URL}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.href = INVENTORY_INDEX_URL;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/** Descarga el chunk JS de la tienda antes de navegar. */
export function prefetchStoreRouteChunk(): void {
  if (storeChunkPrefetched) return;
  storeChunkPrefetched = true;
  void import('@/pages/store');
}

/** Precarga chunk, índice de catálogo, árbol de categorías y datos de productos para /tienda. */
export function prefetchStoreRoute(client: QueryClient = queryClient): void {
  prefetchStoreRouteChunk();
  ensureInventoryIndexPreloadLink();
  preloadCatalogIndexNow();

  void client.prefetchQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60 * 10,
  });

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
