import type { InventoryProduct } from '@/types/product';

import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';

/** Inventario de respaldo cuando el API admin no está disponible. */
export function getInventoryFallback(): InventoryProduct[] {
  return getCatalogRows();
}

export async function loadInventoryFallback(): Promise<InventoryProduct[]> {
  return loadCatalogIndex();
}
