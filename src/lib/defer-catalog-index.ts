import { preloadCatalogIndex } from '@/lib/catalog-featured';

let started = false;

/** Precarga inmediata (tienda, búsqueda, hover en nav). */
export function preloadCatalogIndexNow(): void {
  if (started) {
    preloadCatalogIndex();
    return;
  }
  started = true;
  preloadCatalogIndex();
}
