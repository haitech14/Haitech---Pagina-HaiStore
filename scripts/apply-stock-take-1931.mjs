/**
 * Stock equipos nuevos al 02/07/2026 → almacén 1931 + registro de toma.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeInventory, readInventory, invalidateInventoryReadCache } from '../server/lib/inventory-store.js';
import { normalizeWarehouses, stockFromTotalForWarehouse } from '../server/lib/inventory-warehouses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const WAREHOUSE_1931 = {
  id: '1931',
  name: 'Almacén 1931',
  delivery_time: 'Inmediata',
};

/** TOTAL de la lista STOCK EQUIPOS NUEVOS AL 02/07/2026 */
const STOCK_UPDATES = [
  { key: 'm320', total: 19, match: (n) => /nueva/i.test(n) && /\bM\s*320F?\b/i.test(n) && !/C320/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im550', total: 37, match: (n) => /nueva/i.test(n) && /IM\s*550F?\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im2500', total: 8, match: (n) => /nueva/i.test(n) && /IM\s*2500\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im3000', total: 5, match: (n) => /nueva/i.test(n) && /IM\s*3000\b/i.test(n) && !/C3000/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im5000', total: 2, match: (n) => /nueva/i.test(n) && /IM\s*5000\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im6010', total: 1, match: (n) => /nueva/i.test(n) && /IM\s*6010\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im7000', total: 1, match: (n) => /nueva/i.test(n) && /IM\s*7000\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im430', total: 35, match: (n) => /nueva/i.test(n) && /IM\s*430F?\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'mc320', total: 4, match: (n) => /nueva/i.test(n) && /(?:^|[\s])M\s*C320FW?\b/i.test(n) && !/\bIM\s*C320/i.test(n) && !/seminueva/i.test(n) },
  { key: 'imc320f', total: 0, match: (n) => /nueva/i.test(n) && /\bIM\s*C320F\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'imc2010', total: 4, match: (n) => /nueva/i.test(n) && /IM\s*C2010\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'imc4510', total: 2, match: (n) => /nueva/i.test(n) && /IM\s*C4510\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'im460', total: 19, match: (n) => /nueva/i.test(n) && /IM\s*460F?\b/i.test(n) && !/seminueva/i.test(n) },
  { key: 'mp305', total: 18, match: (n) => /nueva/i.test(n) && /MP\s*305\+/i.test(n) && !/seminueva/i.test(n) },
];

function syncCatalogMirror(products, warehouses) {
  const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
  if (!existsSync(catalogPath)) return;
  copyFileSync(catalogPath, `${catalogPath}.bak-stock-1931-${Date.now()}`);
  const raw = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const byId = new Map(products.map((p) => [p.id, p]));
  const next = (raw.products || []).map((row) => {
    const live = byId.get(row.id);
    if (!live) return row;
    return {
      ...row,
      stock: live.stock,
      stock_by_warehouse: live.stock_by_warehouse,
      updated_at: live.updated_at ?? new Date().toISOString(),
    };
  });
  // Include newly created products present in live but not catalog (e.g. IM 6010)
  for (const live of products) {
    if (next.some((row) => row.id === live.id)) continue;
    if (!STOCK_UPDATES.some((u) => u.match(String(live.name || '')))) continue;
    next.push(live);
  }
  writeFileSync(
    catalogPath,
    `${JSON.stringify({ ...raw, products: next, warehouses }, null, 2)}\n`,
    'utf8',
  );
}

function appendStockTakeRecord(record) {
  const dataDir = path.join(root, 'server/data');
  mkdirSync(dataDir, { recursive: true });
  const filePath = path.join(dataDir, 'inventory-stock-takes.json');
  let payload = { version: 1, takes: [] };
  if (existsSync(filePath)) {
    try {
      payload = JSON.parse(readFileSync(filePath, 'utf8'));
      if (!Array.isArray(payload.takes)) payload.takes = [];
    } catch {
      payload = { version: 1, takes: [] };
    }
  }
  payload.takes.unshift(record);
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

invalidateInventoryReadCache();
const inventory = await readInventory();

const warehouses = normalizeWarehouses([
  ...inventory.warehouses.filter((w) => w.id !== WAREHOUSE_1931.id),
  WAREHOUSE_1931,
]);

// Prefer 1931 as first so UI defaults make sense for these SKUs
const orderedWarehouses = [
  WAREHOUSE_1931,
  ...warehouses.filter((w) => w.id !== WAREHOUSE_1931.id),
];

const lines = [];
const matchedKeys = new Set();
const nextProducts = inventory.products.map((product) => {
  const name = String(product.name || '');
  const rule = STOCK_UPDATES.find((u) => u.match(name));
  if (!rule) return product;

  matchedKeys.add(rule.key);
  const previousStock = Number(product.stock) || 0;
  const stockPatch = stockFromTotalForWarehouse(rule.total, WAREHOUSE_1931.id, orderedWarehouses);
  const updated = {
    ...product,
    ...stockPatch,
    updated_at: new Date().toISOString(),
  };

  lines.push({
    productId: product.id,
    name: product.name,
    code: product.code ?? null,
    previousStock,
    newStock: rule.total,
    delta: rule.total - previousStock,
    warehouseId: WAREHOUSE_1931.id,
    warehouseName: WAREHOUSE_1931.name,
  });

  return updated;
});

const missing = STOCK_UPDATES.map((u) => u.key).filter((k) => !matchedKeys.has(k));

await writeInventory({
  products: nextProducts,
  deletedProductIds: inventory.deletedProductIds,
  warehouses: orderedWarehouses,
});

syncCatalogMirror(nextProducts, orderedWarehouses);

const takeRecord = {
  id: randomUUID(),
  type: 'stock_take',
  title: 'STOCK EQUIPOS NUEVOS AL 02/07/2026',
  source: 'Lista física — totales por equipo',
  warehouseId: WAREHOUSE_1931.id,
  warehouseName: WAREHOUSE_1931.name,
  takenAt: '2026-07-02',
  createdAt: new Date().toISOString(),
  grandTotal: lines.reduce((sum, row) => sum + row.newStock, 0),
  lines,
  missingKeys: missing,
  notes:
    'Toma de inventario de multifuncionales nuevas. Stock consolidado en Almacén 1931 (Av. Petit Thouars 1931).',
};

const takePath = appendStockTakeRecord(takeRecord);

console.log(
  JSON.stringify(
    {
      warehouse: WAREHOUSE_1931,
      updated: lines.length,
      grandTotal: takeRecord.grandTotal,
      missing,
      takeId: takeRecord.id,
      takePath,
      lines: lines.map((l) => ({
        name: l.name,
        previous: l.previousStock,
        next: l.newStock,
        delta: l.delta,
      })),
    },
    null,
    2,
  ),
);
