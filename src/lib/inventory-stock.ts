import type { InventoryWarehouse, InventoryProduct, ProductStockByWarehouse } from '@/types/product';

export const DEFAULT_WAREHOUSES: InventoryWarehouse[] = [
  { id: 'principal', name: 'Almacén principal' },
];

export function normalizeWarehouses(value: unknown): InventoryWarehouse[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [...DEFAULT_WAREHOUSES];
  }

  const seen = new Set<string>();
  const result: InventoryWarehouse[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name) continue;
    const id =
      typeof entry.id === 'string' && entry.id.trim().length > 0
        ? entry.id.trim()
        : crypto.randomUUID();
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({ id, name });
  }

  return result.length > 0 ? result : [...DEFAULT_WAREHOUSES];
}

export function getDefaultWarehouseId(warehouses: InventoryWarehouse[]): string {
  const list = normalizeWarehouses(warehouses);
  return list[0]?.id ?? DEFAULT_WAREHOUSES[0].id;
}

export function normalizeProductStock(
  stockByWarehouse: ProductStockByWarehouse[] | undefined,
  legacyStock: number,
  warehouses: InventoryWarehouse[],
): { stock_by_warehouse: ProductStockByWarehouse[]; stock: number } {
  const list = normalizeWarehouses(warehouses);
  const ids = new Set(list.map((w) => w.id));
  const defaultId = getDefaultWarehouseId(list);
  const legacy = Math.max(0, Math.floor(Number(legacyStock) || 0));

  if (Array.isArray(stockByWarehouse) && stockByWarehouse.length > 0) {
    const quantities = new Map<string, number>();
    for (const entry of stockByWarehouse) {
      const warehouse_id = entry.warehouse_id?.trim() ?? '';
      if (!warehouse_id || !ids.has(warehouse_id)) continue;
      const quantity = Math.max(0, Math.floor(Number(entry.quantity) || 0));
      quantities.set(warehouse_id, (quantities.get(warehouse_id) ?? 0) + quantity);
    }

    if (quantities.size > 0) {
      const stock_by_warehouse = list.map((warehouse) => ({
        warehouse_id: warehouse.id,
        quantity: quantities.get(warehouse.id) ?? 0,
      }));
      const stock = stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0);
      return { stock_by_warehouse, stock };
    }
  }

  const stock_by_warehouse = list.map((warehouse) => ({
    warehouse_id: warehouse.id,
    quantity: warehouse.id === defaultId ? legacy : 0,
  }));

  return { stock_by_warehouse, stock: legacy };
}

export function stockFromTotal(
  total: number,
  warehouses: InventoryWarehouse[],
): { stock_by_warehouse: ProductStockByWarehouse[]; stock: number } {
  const list = normalizeWarehouses(warehouses);
  const defaultId = getDefaultWarehouseId(list);
  const qty = Math.max(0, Math.floor(Number(total) || 0));
  return normalizeProductStock(
    list.map((w) => ({
      warehouse_id: w.id,
      quantity: w.id === defaultId ? qty : 0,
    })),
    qty,
    list,
  );
}

export function applyStockFields(
  product: InventoryProduct,
  warehouses: InventoryWarehouse[],
): InventoryProduct {
  const { stock_by_warehouse, stock } = normalizeProductStock(
    product.stock_by_warehouse,
    product.stock,
    warehouses,
  );
  return { ...product, stock_by_warehouse, stock };
}

export interface StockBreakdownLine {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export function getStockBreakdown(
  product: InventoryProduct,
  warehouses: InventoryWarehouse[],
): StockBreakdownLine[] {
  const list = normalizeWarehouses(warehouses);
  const { stock_by_warehouse } = normalizeProductStock(
    product.stock_by_warehouse,
    product.stock,
    list,
  );
  const byId = new Map(stock_by_warehouse.map((row) => [row.warehouse_id, row.quantity]));

  return list.map((warehouse) => ({
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    quantity: byId.get(warehouse.id) ?? 0,
  }));
}
