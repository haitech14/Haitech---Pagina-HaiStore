/**
 * Lista LAMB OFFICE SRL → Almacén Chiclayo:
 * - Crea almacén si falta
 * - Asigna COD-PART, Precio Compra, proveedor LAMB OFFICE SRL
 * - Categoría Nuevas (impresora / multifuncional / formato ancho)
 * - Suma +1 ud. en Chiclayo (la lista no trae cantidades)
 * - Crea productos faltantes (IM C300F, PRO C5300S, IM CW2200)
 */
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  invalidateInventoryReadCache,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  normalizeProductStock,
  normalizeWarehouses,
} from '../server/lib/inventory-warehouses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SUPPLIER_NAME = 'LAMB OFFICE SRL';
const WAREHOUSE = {
  id: 'chiclayo',
  name: 'Almacén Chiclayo',
  delivery_time: 'Consultar',
};
const QTY_ADD = 1;

/** @type {Array<{
 *   part: string;
 *   model: string;
 *   purchaseUsd: number;
 *   kind: 'printer' | 'mfp' | 'plotter' | 'production';
 *   match: (p: { name?: string; code?: string | null }) => boolean;
 *   createIfMissing?: boolean;
 *   createName?: string;
 *   createCategory?: string;
 * }>} */
const LINES = [
  {
    part: '418495',
    model: 'P 502',
    purchaseUsd: 658.39,
    kind: 'printer',
    match: (p) =>
      isNueva(p.name) &&
      /P\s*502\b/i.test(p.name || '') &&
      !/\(copia\)/i.test(p.name || ''),
  },
  {
    part: '418471',
    model: 'P 800',
    purchaseUsd: 940.56,
    kind: 'printer',
    match: (p) => isNueva(p.name) && /P\s*800\b/i.test(p.name || ''),
  },
  {
    part: '418491',
    model: 'IM 430F',
    purchaseUsd: 1127.18,
    kind: 'mfp',
    match: (p) =>
      isNueva(p.name) &&
      /IM\s*430F?\b/i.test(p.name || '') &&
      !/\(copia\)/i.test(p.name || ''),
  },
  {
    part: '423509',
    model: 'IM 460F',
    purchaseUsd: 1315.76,
    kind: 'mfp',
    match: (p) => isNueva(p.name) && /IM\s*460F?\b/i.test(p.name || ''),
  },
  {
    part: '418460',
    model: 'IM 550F',
    purchaseUsd: 1844.32,
    kind: 'mfp',
    match: (p) => isNueva(p.name) && /IM\s*550F?\b/i.test(p.name || ''),
  },
  {
    part: '418464',
    model: 'IM 600F',
    purchaseUsd: 2161.24,
    kind: 'mfp',
    match: (p) =>
      isNueva(p.name) &&
      /IM\s*600F?\b/i.test(p.name || '') &&
      !/IM\s*6000\b/i.test(p.name || ''),
  },
  {
    part: '418843',
    model: 'IM 2500',
    purchaseUsd: 4148.08,
    kind: 'mfp',
    match: (p) =>
      isNueva(p.name) &&
      /IM\s*2500\b/i.test(p.name || '') &&
      !/\(copia\)/i.test(p.name || '') &&
      !/toner|roller|belt|repuesto/i.test(p.name || ''),
  },
  {
    part: '418846',
    model: 'IM 4000 SPDF',
    purchaseUsd: 7741.82,
    kind: 'mfp',
    match: (p) => isNueva(p.name) && /IM\s*4000\b/i.test(p.name || ''),
  },
  {
    part: '418847',
    model: 'IM 5000 SPDF',
    purchaseUsd: 8588.43,
    kind: 'mfp',
    match: (p) => isNueva(p.name) && /IM\s*5000\b/i.test(p.name || ''),
  },
  {
    part: '423796',
    model: 'IM 6010 SPDF',
    purchaseUsd: 9203.93,
    kind: 'mfp',
    match: (p) =>
      isNueva(p.name) &&
      /IM\s*6010\b/i.test(p.name || '') &&
      !/C6010/i.test(p.name || ''),
  },
  {
    part: '423693',
    model: 'IM C401F',
    purchaseUsd: 2690.0,
    kind: 'mfp',
    match: (p) => isNueva(p.name) && /IM\s*C401F?\b/i.test(p.name || ''),
  },
  {
    part: '418573',
    model: 'IM C300F',
    purchaseUsd: 2241.54,
    kind: 'mfp',
    createIfMissing: true,
    createName: 'Impresora Multifuncional Nueva RICOH IM C300F',
    createCategory: 'Multifuncionales, Multifuncionales Nuevas',
    match: (p) => isNueva(p.name) && /IM\s*C300F\b/i.test(p.name || ''),
  },
  {
    part: '419346',
    model: 'IM C2010',
    purchaseUsd: 5284.13,
    kind: 'mfp',
    match: (p) =>
      isNueva(p.name) &&
      /IM\s*C2010\b/i.test(p.name || '') &&
      !/\(copia\)/i.test(p.name || ''),
  },
  {
    part: '409392',
    model: 'PRO C5300S',
    purchaseUsd: 31182.0,
    kind: 'production',
    createIfMissing: true,
    createName: 'Equipo de Producción Laser Color Nueva RICOH PRO C5300S',
    createCategory: 'Multifuncionales, Multifuncionales Nuevas',
    match: (p) =>
      isNueva(p.name) &&
      /PRO\s*C5300S?\b/i.test(p.name || '') &&
      !/toner|kit|blade|filter|roller|drum|developer|repuesto/i.test(p.name || ''),
  },
  {
    part: '418972',
    model: 'IM CW2200',
    purchaseUsd: 14951.0,
    kind: 'plotter',
    createIfMissing: true,
    createName: 'Plotter Multifuncional Laser Color Nuevo RICOH IM CW2200',
    createCategory: 'Formato Ancho',
    match: (p) =>
      /nuevo|nueva/i.test(p.name || '') &&
      !/seminuevo|seminueva/i.test(p.name || '') &&
      (/IM[-\s]?CW[-\s]?2200/i.test(p.name || '') || /MP\s*CW2200/i.test(p.name || '')) &&
      !/toner|head|ink|maintenance|unit/i.test(p.name || ''),
  },
];

function isNueva(name) {
  const n = String(name || '');
  return /nueva|nuevo/i.test(n) && !/seminueva|seminuevo/i.test(n);
}

function categoryFor(kind, current) {
  if (kind === 'printer') return 'Impresoras, Impresoras Láser Nuevas';
  if (kind === 'plotter') return 'Formato Ancho';
  if (typeof current === 'string' && /multifuncionales\s*,\s*multifuncionales nuevas/i.test(current)) {
    return current;
  }
  if (typeof current === 'string' && /multifuncionales nuevas/i.test(current)) {
    return 'Multifuncionales, Multifuncionales Nuevas';
  }
  return 'Multifuncionales, Multifuncionales Nuevas';
}

function upsertLambSupplier(product, purchaseUsd) {
  const suppliers = Array.isArray(product.suppliers) ? [...product.suppliers] : [];
  const idx = suppliers.findIndex(
    (s) => String(s?.name || '').trim().toUpperCase() === SUPPLIER_NAME,
  );
  const row = {
    id: idx >= 0 && typeof suppliers[idx].id === 'string' ? suppliers[idx].id : randomUUID(),
    name: SUPPLIER_NAME,
    purchase_price_usd: purchaseUsd,
  };
  if (idx >= 0) suppliers[idx] = row;
  else suppliers.unshift(row);

  // Precio Compra = lista LAMB: otros proveedores conservan nombre pero sin precio
  // para que el mínimo de compra no pise el valor de esta lista.
  return {
    suppliers: suppliers.map((s) =>
      String(s?.name || '').trim().toUpperCase() === SUPPLIER_NAME
        ? row
        : { ...s, purchase_price_usd: 0 },
    ),
    purchase_price_usd: purchaseUsd,
  };
}

function addQtyToWarehouse(product, warehouseId, qty, warehouses) {
  const { stock_by_warehouse } = normalizeProductStock(
    product.stock_by_warehouse,
    product.stock,
    warehouses,
  );
  const nextRows = stock_by_warehouse.map((row) =>
    row.warehouse_id === warehouseId
      ? { ...row, quantity: row.quantity + qty }
      : row,
  );
  if (!nextRows.some((row) => row.warehouse_id === warehouseId)) {
    nextRows.push({ warehouse_id: warehouseId, quantity: qty });
  }
  return normalizeProductStock(nextRows, 0, warehouses);
}

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}

function createMissingProduct(line, template, warehouses) {
  const id = randomUUID();
  const name = line.createName || `Equipo Nuevo RICOH ${line.model}`;
  const category = line.createCategory || categoryFor(line.kind);
  const stockPatch = addQtyToWarehouse(
    { stock: 0, stock_by_warehouse: [] },
    WAREHOUSE.id,
    QTY_ADD,
    warehouses,
  );
  const purchase = upsertLambSupplier({}, line.purchaseUsd);
  const listHint = Math.round(line.purchaseUsd * 1.15);
  const tecnico = Math.round(listHint / 10) * 10 - 1;

  return {
    id,
    code: line.part,
    name,
    description:
      template?.description ||
      `Equipo nuevo RICOH ${line.model}\nProveedor: ${SUPPLIER_NAME}\nAlmacén: ${WAREHOUSE.name}`,
    currency: 'USD',
    category,
    brand: 'Ricoh',
    image_url: template?.image_url || '/categories/multifuncionales.png',
    gallery: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 2000) + 1,
    slug: `${slugify(name)}-${id.slice(0, 8)}`,
    status: 'active',
    prices: {
      public: Math.round(tecnico * 1.08),
      tecnico,
      mayorista: Math.round(tecnico * 0.98),
      distribuidor: tecnico + 50,
    },
    attributes: [
      {
        id: randomUUID(),
        name: 'Modelo de equipo',
        value: line.model,
      },
    ],
    ...stockPatch,
    ...purchase,
  };
}

function syncCatalogMirror(products, warehouses) {
  const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
  if (!existsSync(catalogPath)) return null;
  copyFileSync(catalogPath, `${catalogPath}.bak-lamb-chiclayo-${Date.now()}`);
  const raw = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const byId = new Map(products.map((p) => [p.id, p]));
  const touchedIds = new Set(
    products
      .filter((p) => LINES.some((line) => line.part === String(p.code || '')))
      .map((p) => p.id),
  );

  const next = (raw.products || []).map((row) => {
    const live = byId.get(row.id);
    if (!live || !touchedIds.has(row.id)) return row;
    return {
      ...row,
      code: live.code,
      category: live.category,
      stock: live.stock,
      stock_by_warehouse: live.stock_by_warehouse,
      purchase_price_usd: live.purchase_price_usd,
      suppliers: live.suppliers,
      updated_at: live.updated_at,
    };
  });

  for (const live of products) {
    if (!touchedIds.has(live.id)) continue;
    if (next.some((row) => row.id === live.id)) continue;
    next.push(live);
  }

  writeFileSync(
    catalogPath,
    `${JSON.stringify({ ...raw, products: next, warehouses }, null, 2)}\n`,
    'utf8',
  );
  return catalogPath;
}

invalidateInventoryReadCache();
const inventory = await readInventory();

const warehouses = normalizeWarehouses([
  ...inventory.warehouses.filter((w) => w.id !== WAREHOUSE.id),
  WAREHOUSE,
]);

const report = [];
const usedIds = new Set();
let products = [...inventory.products];

for (const line of LINES) {
  let index = products.findIndex((p) => !usedIds.has(p.id) && line.match(p));
  let created = false;

  if (index < 0 && line.createIfMissing) {
    const template =
      products.find((p) => /IM\s*550F/i.test(p.name || '') && isNueva(p.name)) ||
      products.find((p) => /multifuncional/i.test(p.category || '') && isNueva(p.name));
    const createdProduct = createMissingProduct(line, template, warehouses);
    products.push(createdProduct);
    index = products.length - 1;
    created = true;
  }

  if (index < 0) {
    report.push({
      part: line.part,
      model: line.model,
      status: 'missing',
      error: 'No se encontró producto Nueva coincidente',
    });
    continue;
  }

  const product = products[index];
  usedIds.add(product.id);

  const previousStock = Number(product.stock) || 0;
  const previousCode = product.code ?? null;
  const purchase = upsertLambSupplier(product, line.purchaseUsd);
  const stockPatch = created
    ? {
        stock: product.stock,
        stock_by_warehouse: product.stock_by_warehouse,
      }
    : addQtyToWarehouse(product, WAREHOUSE.id, QTY_ADD, warehouses);

  const updated = {
    ...product,
    code: line.part,
    category: categoryFor(line.kind, product.category),
    ...purchase,
    ...stockPatch,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  report.push({
    part: line.part,
    model: line.model,
    status: created ? 'created' : 'updated',
    id: updated.id,
    name: updated.name,
    previousCode,
    previousStock,
    stock: updated.stock,
    chiclayoQty: (updated.stock_by_warehouse || []).find((r) => r.warehouse_id === WAREHOUSE.id)
      ?.quantity,
    purchaseUsd: updated.purchase_price_usd,
    category: updated.category,
  });
}

await writeInventory({
  ...inventory,
  products,
  warehouses,
});

const catalogPath = syncCatalogMirror(products, warehouses);

console.log(
  JSON.stringify(
    {
      warehouse: WAREHOUSE,
      supplier: SUPPLIER_NAME,
      qtyAddedPerLine: QTY_ADD,
      catalogSynced: Boolean(catalogPath),
      summary: {
        updated: report.filter((r) => r.status === 'updated').length,
        created: report.filter((r) => r.status === 'created').length,
        missing: report.filter((r) => r.status === 'missing').length,
      },
      report,
    },
    null,
    2,
  ),
);
