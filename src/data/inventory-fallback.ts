import type { InventoryProduct } from '@/types/product';

import { getCatalogRows } from '@/lib/catalog-featured';

/** Inventario de respaldo cuando el API admin no está disponible. */
export const inventoryFallback: InventoryProduct[] = getCatalogRows();
