import { preloadCatalogIndex } from '@/lib/catalog-featured';

let deferred = false;

/** Precarga inventory-index cuando el navegador está ocioso (no en ruta crítica de la home). */
export function deferCatalogIndexPreload(delayMs = 3000): void {
  if (deferred) return;
  deferred = true;

  const run = () => {
    preloadCatalogIndex();
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: delayMs });
    return;
  }

  window.setTimeout(run, delayMs);
}

/** Precarga inmediata (tienda, búsqueda, hover en nav). */
export function preloadCatalogIndexNow(): void {
  deferred = true;
  preloadCatalogIndex();
}
