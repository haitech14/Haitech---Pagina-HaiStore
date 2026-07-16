import { randomId } from '@/lib/random-id';
import type { InventoryWarehouse, InventoryProduct, ProductStockByWarehouse } from '@/types/product';

export const DEFAULT_WAREHOUSES: InventoryWarehouse[] = [
  { id: 'principal', name: 'Almacén principal', delivery_time: 'Inmediata' },
];

function normalizeDeliveryTime(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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
        : randomId();
    if (seen.has(id)) continue;
    seen.add(id);
    const delivery_time = normalizeDeliveryTime(
      (entry as { delivery_time?: unknown }).delivery_time,
    );
    result.push({
      id,
      name,
      ...(delivery_time != null ? { delivery_time } : {}),
    });
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

/** Almacén donde vive el stock del producto (el que tiene qty > 0, o el default). */
export function getProductPrimaryWarehouseId(
  product: Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'>,
  warehouses: InventoryWarehouse[],
): string {
  const list = normalizeWarehouses(warehouses);
  const { stock_by_warehouse } = normalizeProductStock(
    product.stock_by_warehouse,
    product.stock,
    list,
  );
  const withStock = stock_by_warehouse.find((row) => row.quantity > 0);
  if (withStock) return withStock.warehouse_id;
  return getDefaultWarehouseId(list);
}

/**
 * Asigna todo el stock a un almacén concreto (edición rápida del total
 * o cambio de almacén sin qty por ubicación).
 */
export function stockFromTotalForWarehouse(
  total: number,
  warehouseId: string,
  warehouses: InventoryWarehouse[],
): { stock_by_warehouse: ProductStockByWarehouse[]; stock: number } {
  const list = normalizeWarehouses(warehouses);
  const defaultId = getDefaultWarehouseId(list);
  const targetId = list.some((w) => w.id === warehouseId) ? warehouseId : defaultId;
  const qty = Math.max(0, Math.floor(Number(total) || 0));
  return normalizeProductStock(
    list.map((w) => ({
      warehouse_id: w.id,
      quantity: w.id === targetId ? qty : 0,
    })),
    qty,
    list,
  );
}

/** Asigna todo el stock al almacén por defecto (edición rápida del total). */
export function stockFromTotal(
  total: number,
  warehouses: InventoryWarehouse[],
): { stock_by_warehouse: ProductStockByWarehouse[]; stock: number } {
  return stockFromTotalForWarehouse(total, getDefaultWarehouseId(warehouses), warehouses);
}

/** Mueve el stock total del producto a otro almacén. */
export function assignProductStockToWarehouse(
  product: Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'>,
  warehouseId: string,
  warehouses: InventoryWarehouse[],
): { stock_by_warehouse: ProductStockByWarehouse[]; stock: number } {
  const list = normalizeWarehouses(warehouses);
  const { stock } = normalizeProductStock(product.stock_by_warehouse, product.stock, list);
  return stockFromTotalForWarehouse(stock, warehouseId, list);
}

/** Tiempo de entrega del almacén donde está el stock (si está registrado). */
export function resolveProductWarehouseDeliveryTime(
  product: Pick<InventoryProduct, 'stock' | 'stock_by_warehouse'>,
  warehouses: InventoryWarehouse[],
): string | null {
  const list = normalizeWarehouses(warehouses);
  const warehouseId = getProductPrimaryWarehouseId(product, list);
  const warehouse = list.find((entry) => entry.id === warehouseId);
  return normalizeDeliveryTime(warehouse?.delivery_time);
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
  deliveryTime?: string | null;
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
    ...(warehouse.delivery_time != null ? { deliveryTime: warehouse.delivery_time } : {}),
  }));
}
