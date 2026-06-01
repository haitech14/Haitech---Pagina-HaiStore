import type { InventoryProduct } from '@/types/product';

import catalog from '@/data/inventory-catalog.json';

/** Inventario de respaldo cuando el API admin no está disponible. */
export const inventoryFallback = catalog.products as InventoryProduct[];
