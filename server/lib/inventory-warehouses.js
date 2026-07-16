import { randomUUID } from 'crypto';

export const DEFAULT_WAREHOUSES = [
  { id: 'principal', name: 'Almacén principal', delivery_time: 'Inmediata' },
];

function normalizeDeliveryTime(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeWarehouses(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return [...DEFAULT_WAREHOUSES];
  }

  const seen = new Set();
  const result = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name) continue;
    const id =
      typeof entry.id === 'string' && entry.id.trim().length > 0
        ? entry.id.trim()
        : randomUUID();
    if (seen.has(id)) continue;
    seen.add(id);
    const delivery_time = normalizeDeliveryTime(entry.delivery_time);
    result.push({
      id,
      name,
      ...(delivery_time != null ? { delivery_time } : {}),
    });
  }

  return result.length > 0 ? result : [...DEFAULT_WAREHOUSES];
}

export function getDefaultWarehouseId(warehouses) {
  const list = normalizeWarehouses(warehouses);
  return list[0]?.id ?? DEFAULT_WAREHOUSES[0].id;
}

/**
 * Normaliza stock por almacén y devuelve total coherente.
 * @returns {{ stock_by_warehouse: { warehouse_id: string, quantity: number }[], stock: number }}
 */
export function normalizeProductStock(stockByWarehouse, legacyStock, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const ids = new Set(list.map((w) => w.id));
  const defaultId = getDefaultWarehouseId(list);
  const legacy = Math.max(0, Math.floor(Number(legacyStock) || 0));

  if (Array.isArray(stockByWarehouse) && stockByWarehouse.length > 0) {
    const quantities = new Map();
    for (const entry of stockByWarehouse) {
      if (!entry || typeof entry !== 'object') continue;
      const warehouse_id =
        typeof entry.warehouse_id === 'string' ? entry.warehouse_id.trim() : '';
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

export function getProductPrimaryWarehouseId(product, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const { stock_by_warehouse } = normalizeProductStock(
    product?.stock_by_warehouse,
    product?.stock ?? 0,
    list,
  );
  const withStock = stock_by_warehouse.find((row) => row.quantity > 0);
  if (withStock) return withStock.warehouse_id;
  return getDefaultWarehouseId(list);
}

export function stockFromTotalForWarehouse(total, warehouseId, warehouses) {
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
export function stockFromTotal(total, warehouses) {
  return stockFromTotalForWarehouse(total, getDefaultWarehouseId(warehouses), warehouses);
}

export function assignProductStockToWarehouse(product, warehouseId, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const { stock } = normalizeProductStock(product?.stock_by_warehouse, product?.stock ?? 0, list);
  return stockFromTotalForWarehouse(stock, warehouseId, list);
}

export function resolveProductWarehouseDeliveryTime(product, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const warehouseId = getProductPrimaryWarehouseId(product, list);
  const warehouse = list.find((entry) => entry.id === warehouseId);
  return normalizeDeliveryTime(warehouse?.delivery_time);
}

export function warehouseNameById(warehouses, warehouseId) {
  const match = normalizeWarehouses(warehouses).find((w) => w.id === warehouseId);
  return match?.name ?? warehouseId;
}
