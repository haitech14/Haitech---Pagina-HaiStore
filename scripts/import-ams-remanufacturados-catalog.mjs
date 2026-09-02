/**
 * Catálogo remanufacturado AMS → Almacén San Juan de Lurigancho:
 * - Crea almacén si falta
 * - Crea o actualiza equipos en Multifuncionales Remanufacturadas / Formato Ancho
 * - Voltaje 220V, stock según lista, proveedor AMS (nota interna)
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
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

const AMS_SUPPLIER_NAME = 'AMS';
const AMS_WAREHOUSE = {
  id: 'san-juan-lurigancho',
  name: 'Almacén San Juan de Lurigancho',
  delivery_time: 'Consultar',
};

/** @type {Array<{
 *   code: string;
 *   brand: string;
 *   model: string;
 *   displayModel: string;
 *   qty: number;
 *   kind: 'mfp' | 'plotter';
 *   color: 'Color' | 'B/N';
 *   match: (p: { name?: string; category?: string; code?: string | null }) => boolean;
 * }>} */
const AMS_REMAN_LINES = [
  { code: 'AMS-KM-367', brand: 'Konica Minolta', model: 'bizhub 367', displayModel: 'KONICA MINOLTA bizhub 367', qty: 10, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*367\b/i.test(p.name || '') && !/\bC367\b/i.test(p.name || '') },
  { code: 'AMS-KM-368', brand: 'Konica Minolta', model: 'bizhub 368', displayModel: 'KONICA MINOLTA bizhub 368', qty: 2, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*368\b/i.test(p.name || '') && !/\bC368\b/i.test(p.name || '') },
  { code: 'AMS-KM-458', brand: 'Konica Minolta', model: 'bizhub 458', displayModel: 'KONICA MINOLTA bizhub 458', qty: 1, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*458\b/i.test(p.name || '') && !/\bC458\b/i.test(p.name || '') },
  { code: 'AMS-KM-558', brand: 'Konica Minolta', model: 'bizhub 558', displayModel: 'KONICA MINOLTA bizhub 558', qty: 1, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*558\b/i.test(p.name || '') && !/\bC558\b/i.test(p.name || '') },
  { code: 'AMS-KM-550I', brand: 'Konica Minolta', model: 'bizhub 550i', displayModel: 'KONICA MINOLTA bizhub 550i', qty: 2, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*550\s*i\b/i.test(p.name || '') },
  { code: 'AMS-KM-508', brand: 'Konica Minolta', model: 'bizhub 508', displayModel: 'KONICA MINOLTA bizhub 508', qty: 4, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*508\b/i.test(p.name || '') },
  { code: 'AMS-KM-808', brand: 'Konica Minolta', model: 'bizhub 808', displayModel: 'KONICA MINOLTA bizhub 808', qty: 4, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*808\b/i.test(p.name || '') },
  { code: 'AMS-KM-958', brand: 'Konica Minolta', model: 'bizhub 958', displayModel: 'KONICA MINOLTA bizhub 958', qty: 2, kind: 'mfp', color: 'B/N', match: (p) => /bizhub\s*958\b/i.test(p.name || '') },
  { code: 'AMS-KM-C368', brand: 'Konica Minolta', model: 'bizhub C368', displayModel: 'KONICA MINOLTA bizhub C368', qty: 10, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C368\b/i.test(p.name || '') },
  { code: 'AMS-KM-C454I', brand: 'Konica Minolta', model: 'bizhub C454i', displayModel: 'KONICA MINOLTA bizhub C454i', qty: 10, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C454\s*i\b/i.test(p.name || '') },
  { code: 'AMS-KM-C454', brand: 'Konica Minolta', model: 'bizhub C454', displayModel: 'KONICA MINOLTA bizhub C454', qty: 1, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C454\b/i.test(p.name || '') && !/\bC454\s*i\b/i.test(p.name || '') },
  { code: 'AMS-KM-C458', brand: 'Konica Minolta', model: 'bizhub C458', displayModel: 'KONICA MINOLTA bizhub C458', qty: 7, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C458\b/i.test(p.name || '') },
  { code: 'AMS-KM-C558', brand: 'Konica Minolta', model: 'bizhub C558', displayModel: 'KONICA MINOLTA bizhub C558', qty: 5, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C558\b/i.test(p.name || '') },
  { code: 'AMS-KM-C759', brand: 'Konica Minolta', model: 'bizhub C759', displayModel: 'KONICA MINOLTA bizhub C759', qty: 12, kind: 'mfp', color: 'Color', match: (p) => /bizhub\s*C759\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MPC3404EX', brand: 'Ricoh', model: 'MP C3404ex', displayModel: 'RICOH MP C3404ex', qty: 5, kind: 'mfp', color: 'Color', match: (p) => /MP\s*C3404\s*ex\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MPC5503', brand: 'Ricoh', model: 'MP C5503', displayModel: 'RICOH MP C5503', qty: 1, kind: 'mfp', color: 'Color', match: (p) => /MP\s*C5503\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MPC6503', brand: 'Ricoh', model: 'MP C6503', displayModel: 'RICOH MP C6503', qty: 2, kind: 'mfp', color: 'Color', match: (p) => /MP\s*C6503\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MPC8003', brand: 'Ricoh', model: 'MP C8003', displayModel: 'RICOH MP C8003', qty: 1, kind: 'mfp', color: 'Color', match: (p) => /MP\s*C8003\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MP3555', brand: 'Ricoh', model: 'MP 3555', displayModel: 'RICOH MP 3555', qty: 5, kind: 'mfp', color: 'B/N', match: (p) => /MP\s*3555\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-MP6055', brand: 'Ricoh', model: 'MP 6055', displayModel: 'RICOH MP 6055', qty: 15, kind: 'mfp', color: 'B/N', match: (p) => /MP\s*6055\b/i.test(p.name || '') },
  { code: 'AMS-RICOH-IMC6000', brand: 'Ricoh', model: 'IM C6000', displayModel: 'RICOH IM C6000', qty: 5, kind: 'mfp', color: 'Color', match: (p) => /IM\s*C6000\b/i.test(p.name || '') },
  { code: 'AMS-CANON-DXC3730', brand: 'Canon', model: 'imageRUNNER DX C3730', displayModel: 'CANON imageRUNNER DX C3730', qty: 10, kind: 'mfp', color: 'Color', match: (p) => /DX\s*C3730\b/i.test(p.name || '') },
  { code: 'AMS-CANON-ADV-C5255', brand: 'Canon', model: 'imageRUNNER ADVANCE C5255', displayModel: 'CANON imageRUNNER ADVANCE C5255', qty: 1, kind: 'mfp', color: 'Color', match: (p) => /ADVANCE\s*C5255\b/i.test(p.name || '') || /\bC5255\b/i.test(p.name || '') },
  { code: 'AMS-CANON-ADV-C5560', brand: 'Canon', model: 'imageRUNNER ADVANCE C5560', displayModel: 'CANON imageRUNNER ADVANCE C5560', qty: 10, kind: 'mfp', color: 'Color', match: (p) => /ADVANCE\s*C5560\b/i.test(p.name || '') || /\bC5560\b/i.test(p.name || '') },
  { code: 'AMS-CANON-DXC5760', brand: 'Canon', model: 'imageRUNNER DX C5760', displayModel: 'CANON imageRUNNER DX C5760', qty: 5, kind: 'mfp', color: 'Color', match: (p) => /DX\s*C5760\b/i.test(p.name || '') },
  { code: 'AMS-CANON-ADV-C7570', brand: 'Canon', model: 'imageRUNNER ADVANCE C7570', displayModel: 'CANON imageRUNNER ADVANCE C7570', qty: 3, kind: 'mfp', color: 'Color', match: (p) => /ADVANCE\s*C7570\b/i.test(p.name || '') || /\bC7570\b/i.test(p.name || '') },
  { code: 'AMS-CANON-ADV-C7780', brand: 'Canon', model: 'imageRUNNER ADVANCE C7780', displayModel: 'CANON imageRUNNER ADVANCE C7780', qty: 3, kind: 'mfp', color: 'Color', match: (p) => /ADVANCE\s*C7780\b/i.test(p.name || '') || /\bC7780\b/i.test(p.name || '') },
  { code: 'AMS-HP-T2530', brand: 'HP', model: 'DesignJet T2530', displayModel: 'HP DesignJet T2530', qty: 6, kind: 'plotter', color: 'Color', match: (p) => /\bT2530\b/i.test(p.name || '') },
  { code: 'AMS-HP-2600', brand: 'HP', model: 'DesignJet 2600', displayModel: 'HP DesignJet 2600', qty: 4, kind: 'plotter', color: 'Color', match: (p) => /\b2600\b/i.test(p.name || '') && /designjet|plotter/i.test(p.name || '') },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const VOLTAGE = '220V';
const CATEGORY_MFP = 'Multifuncionales, Multifuncionales Remanufacturadas';
const CATEGORY_PLOTTER = 'Formato Ancho';

function isRemanProduct(p) {
  const name = String(p?.name ?? '');
  const category = String(p?.category ?? '');
  return /\bremanufacturad/i.test(name) || /remanufacturadas|remanufacturados/i.test(category);
}

function categoryFor(kind) {
  return kind === 'plotter' ? CATEGORY_PLOTTER : CATEGORY_MFP;
}

function productNameFor(line) {
  if (line.kind === 'plotter') {
    return `Plotter Remanufacturado ${line.displayModel} ${VOLTAGE}`;
  }
  return `Impresora Multifuncional Remanufacturada ${line.displayModel} ${VOLTAGE}`;
}

function descriptionFor(line) {
  return [
    `Equipo remanufacturado ${line.displayModel}.`,
    `Voltaje: ${VOLTAGE}.`,
    `Proveedor: ${AMS_SUPPLIER_NAME}.`,
    `Almacén: ${AMS_WAREHOUSE.name}.`,
  ].join('\n');
}

function upsertAttr(attributes, name, value) {
  const rows = Array.isArray(attributes) ? [...attributes] : [];
  const idx = rows.findIndex((a) => String(a?.name ?? '').trim() === name);
  const row = {
    id: idx >= 0 && typeof rows[idx].id === 'string' ? rows[idx].id : randomUUID(),
    name,
    value,
  };
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  return rows;
}

function upsertAmsSupplier(product) {
  const suppliers = Array.isArray(product.suppliers) ? [...product.suppliers] : [];
  const idx = suppliers.findIndex(
    (s) => String(s?.name ?? '').trim().toUpperCase() === AMS_SUPPLIER_NAME,
  );
  const row = {
    id: idx >= 0 && typeof suppliers[idx].id === 'string' ? suppliers[idx].id : randomUUID(),
    name: AMS_SUPPLIER_NAME,
    purchase_price_usd: 0,
  };
  if (idx >= 0) suppliers[idx] = row;
  else suppliers.unshift(row);
  return { suppliers, purchase_price_usd: product.purchase_price_usd ?? 0 };
}

function setStockInWarehouse(product, warehouseId, qty, warehouses) {
  const { stock_by_warehouse } = normalizeProductStock(
    product.stock_by_warehouse,
    product.stock,
    warehouses,
  );
  const nextRows = stock_by_warehouse.map((row) =>
    row.warehouse_id === warehouseId ? { ...row, quantity: qty } : row,
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

function createProduct(line, warehouses) {
  const id = randomUUID();
  const name = productNameFor(line);
  const category = categoryFor(line.kind);
  const stockPatch = setStockInWarehouse({ stock: 0, stock_by_warehouse: [] }, AMS_WAREHOUSE.id, line.qty, warehouses);
  const imageUrl =
    line.kind === 'plotter' ? '/categories/formato-ancho.png' : '/categories/multifuncionales.png';

  return {
    id,
    code: line.code,
    name,
    description: descriptionFor(line),
    currency: 'USD',
    category,
    brand: line.brand,
    image_url: imageUrl,
    gallery: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 3100,
    slug: `${slugify(name)}-${id.slice(0, 8)}`,
    status: 'active',
    prices: {
      public: 0,
      tecnico: 0,
      mayorista: 0,
      distribuidor: 0,
    },
    attributes: [
      { id: randomUUID(), name: 'Modelo de equipo', value: line.model },
      { id: randomUUID(), name: 'Voltaje', value: VOLTAGE },
      { id: randomUUID(), name: 'Color', value: line.color },
    ],
    suppliers: [{ id: randomUUID(), name: AMS_SUPPLIER_NAME, purchase_price_usd: 0 }],
    purchase_price_usd: 0,
    ...stockPatch,
  };
}

function syncCatalogMirror(products, warehouses, touchedIds) {
  const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
  const raw = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const next = (raw.products ?? []).map((row) => {
    const live = products.find((p) => p.id === row.id);
    if (!live || !touchedIds.has(row.id)) return row;
    return {
      ...row,
      code: live.code,
      name: live.name,
      description: live.description,
      category: live.category,
      brand: live.brand,
      stock: live.stock,
      stock_by_warehouse: live.stock_by_warehouse,
      attributes: live.attributes,
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
  ...inventory.warehouses.filter((w) => w.id !== AMS_WAREHOUSE.id),
  AMS_WAREHOUSE,
]);

const report = [];
const usedIds = new Set();
let products = [...inventory.products];
const touchedIds = new Set();

for (const line of AMS_REMAN_LINES) {
  let index = products.findIndex(
    (p) => !usedIds.has(p.id) && (p.code === line.code || (isRemanProduct(p) && line.match(p))),
  );
  let created = false;

  if (index < 0) {
    const createdProduct = createProduct(line, warehouses);
    products.push(createdProduct);
    index = products.length - 1;
    created = true;
  }

  const product = products[index];
  usedIds.add(product.id);
  touchedIds.add(product.id);

  const name = productNameFor(line);
  const supplierPatch = upsertAmsSupplier(product);
  const stockPatch = setStockInWarehouse(product, AMS_WAREHOUSE.id, line.qty, warehouses);

  const updated = {
    ...product,
    code: line.code,
    name,
    description: descriptionFor(line),
    category: categoryFor(line.kind),
    brand: line.brand,
    ...supplierPatch,
    attributes: upsertAttr(
      upsertAttr(
        upsertAttr(product.attributes, 'Modelo de equipo', line.model),
        'Voltaje',
        VOLTAGE,
      ),
      'Color',
      line.color,
    ),
    ...stockPatch,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  report.push({
    code: line.code,
    model: line.displayModel,
    status: created ? 'created' : 'updated',
    id: updated.id,
    name: updated.name,
    stock: updated.stock,
    warehouseQty: (updated.stock_by_warehouse || []).find((r) => r.warehouse_id === AMS_WAREHOUSE.id)
      ?.quantity,
    category: updated.category,
    voltage: VOLTAGE,
  });
}

await writeInventory({
  ...inventory,
  products,
  warehouses,
});

const catalogPath = syncCatalogMirror(products, warehouses, touchedIds);

console.log('\n=== Equipos remanufacturados AMS importados ===\n');
for (const row of report.sort((a, b) => a.name.localeCompare(b.name, 'es'))) {
  console.log(
    `${String(row.warehouseQty).padStart(3)} ud | ${row.voltage} | ${row.code} | ${row.name}`,
  );
}
console.log(`\n${report.length} fichas (${report.filter((r) => r.status === 'created').length} nuevas, ${report.filter((r) => r.status === 'updated').length} actualizadas).`);
console.log(`Almacén: ${AMS_WAREHOUSE.name} (${AMS_WAREHOUSE.id})`);
console.log(`Proveedor interno: ${AMS_SUPPLIER_NAME}`);
console.log(`Catálogo sincronizado: ${catalogPath}`);
