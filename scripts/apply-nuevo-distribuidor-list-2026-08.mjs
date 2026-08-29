/**
 * Lista distribuidor agosto 2026 — equipos nuevos:
 * - técnico = precio lista (último dígito 5 → 9)
 * - público = técnico + markup por modelo (5 → 9)
 * - stock según lista (PP → 0)
 * - IM 6010: ARDF principal + variante interna SPDF
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** @type {Array<{ id: string; tecnico: number; publicAdd: number; stock: number; variante?: string; variant_product_ids?: string[] }>} */
const UPDATES = [
  { id: 'bfb264b8-70dc-4ad4-9686-2df02df8c75e', tecnico: 395, publicAdd: 120, stock: 19 },
  { id: 'ab878d89-61e0-4e51-a941-03455e1da407', tecnico: 889, publicAdd: 180, stock: 5 },
  { id: 'ricoh-im-430f', tecnico: 899, publicAdd: 180, stock: 45 },
  { id: '71289ec2-dbca-4780-b319-eb3d259fadb5', tecnico: 999, publicAdd: 250, stock: 5 },
  { id: '328f41ef-d935-4807-85d0-e1db5bdf73fb', tecnico: 1499, publicAdd: 250, stock: 37 },
  { id: 'b32a43a1-09e4-49f6-8950-3639c9534700', tecnico: 1869, publicAdd: 250, stock: 0 },
  { id: '196857c6-738b-4162-90aa-50dee575bcd8', tecnico: 3549, publicAdd: 250, stock: 6 },
  { id: 'ricoh-im-2510', tecnico: 3549, publicAdd: 250, stock: 5 },
  { id: '0aea108a-acd2-4ddd-af29-b2265097813c', tecnico: 3999, publicAdd: 250, stock: 2 },
  { id: 'c0ad567a-6ad7-4857-a087-fd574a903a04', tecnico: 6899, publicAdd: 250, stock: 1 },
  {
    id: '2177d10d-b23c-4383-aa33-2eb3393de4e0',
    tecnico: 8499,
    publicAdd: 250,
    stock: 1,
    variante: 'ARDF',
    variant_product_ids: ['7459b432-72a0-420a-8bff-015a0072f5ac'],
  },
  {
    id: '7459b432-72a0-420a-8bff-015a0072f5ac',
    tecnico: 8499,
    publicAdd: 250,
    stock: 1,
    variante: 'SPDF',
  },
  { id: 'c44519d7-f600-43e5-8c08-b51f56d88b03', tecnico: 11990, publicAdd: 250, stock: 1 },
  { id: 'cb1e47b2-d784-4bef-ae18-d4dae08723e4', tecnico: 899, publicAdd: 150, stock: 4 },
  { id: '481dbc77-436b-464d-b76f-930f7d79f4ff', tecnico: 1929, publicAdd: 150, stock: 0 },
  { id: '9c65bcbd-3a13-41dd-81b1-95cb3256a7c1', tecnico: 4575, publicAdd: 250, stock: 3 },
  { id: '21e2cbd5-f6e7-4b44-93db-ca736ea8727b', tecnico: 5889, publicAdd: 250, stock: 0 },
  { id: '15ee65ab-6565-44c4-974e-ff5ba68b0c26', tecnico: 8949, publicAdd: 250, stock: 0 },
  { id: 'a9c74a93-3a15-42da-a9cf-33d59e2b1019', tecnico: 11850, publicAdd: 250, stock: 2 },
  { id: 'e1bffdf0-3515-468e-859a-990d1cb12561', tecnico: 13619, publicAdd: 250, stock: 0 },
];

const byId = new Map(UPDATES.map((row) => [row.id, row]));

/** Si el precio termina en 5, sube el último dígito a 9 (395 → 399). */
function end5to9(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return n;
  return v % 10 === 5 ? v + 4 : v;
}

function upsertAttr(attributes, name, value) {
  const next = Array.isArray(attributes) ? [...attributes] : [];
  const idx = next.findIndex(
    (a) => String(a.name || '').trim().toLowerCase() === name.toLowerCase(),
  );
  const row = {
    id: idx >= 0 ? next[idx].id : randomUUID(),
    name,
    value: String(value),
  };
  if (idx >= 0) next[idx] = { ...next[idx], ...row };
  else next.push(row);
  return next;
}

function syncStockByWarehouse(product, stock) {
  if (!Array.isArray(product.stock_by_warehouse) || product.stock_by_warehouse.length === 0) {
    return [{ warehouse_id: 'principal', quantity: stock }];
  }

  const rows = product.stock_by_warehouse.map((row) => ({ ...row, quantity: 0 }));
  if (stock <= 0) return rows;

  const prevIdx = product.stock_by_warehouse.findIndex((row) => Number(row.quantity) > 0);
  const principalIdx = rows.findIndex((row) => row.warehouse_id === 'principal');
  const targetIdx = prevIdx >= 0 ? prevIdx : principalIdx >= 0 ? principalIdx : 0;
  rows[targetIdx] = { ...rows[targetIdx], quantity: stock };
  return rows;
}

function patchProduct(product) {
  const rule = byId.get(product.id);
  if (!rule) return product;

  const tecnico = end5to9(rule.tecnico);
  const publicPrice = end5to9(tecnico + rule.publicAdd);
  let attributes = product.attributes;
  if (rule.variante) {
    attributes = upsertAttr(attributes, 'Variante', rule.variante);
  }

  const next = {
    ...product,
    stock: rule.stock,
    stock_by_warehouse: syncStockByWarehouse(product, rule.stock),
    attributes,
    prices: {
      ...(product.prices || {}),
      tecnico,
      public: publicPrice,
    },
  };

  if (rule.variant_product_ids) {
    next.variant_product_ids = rule.variant_product_ids;
  }

  if (product.id === '2177d10d-b23c-4383-aa33-2eb3393de4e0') {
    next.name = 'Impresora Multifuncional NUEVA RICOH IM 6010 (ARDF)';
    next.description =
      'Copiadora, Impresora, Escáner y fax\nConectividad: Wi-Fi, Ethernet, USB\nARDF / Mueble\nFormato A3\nProducción mensual alta\nRegalo: Envío Gratis';
    next.attributes = upsertAttr(next.attributes, 'Alimentador (ADF)', 'ARDF');
  }

  if (product.id === '7459b432-72a0-420a-8bff-015a0072f5ac') {
    next.description =
      'Copiadora, Impresora, Escáner y fax\nConectividad: Wi-Fi, Ethernet, USB\nSPDF — Alimentador doble scan / Mueble\nFormato A3\nProducción mensual alta\nRegalo: Envío Gratis';
    next.attributes = upsertAttr(next.attributes, 'Alimentador (ADF)', 'Doble Scan');
  }

  return next;
}

function cloneAttr(attr) {
  return {
    id: randomUUID(),
    name: attr.name,
    value: attr.value,
  };
}

function createIm2510(template) {
  const id = 'ricoh-im-2510';
  const tecnico = end5to9(3549);
  const publicPrice = end5to9(tecnico + 250);
  const slug = 'impresora-multifuncional-nueva-ricoh-im-2510-ricoh-im-2510';

  const baseAttributes = (template?.attributes ?? [])
    .filter((row) =>
      ['Color', 'Formato papel', 'Producción', 'Instalación', 'A3'].includes(String(row.name)),
    )
    .map(cloneAttr);

  let attributes = baseAttributes;
  attributes = upsertAttr(attributes, 'Alimentador (ADF)', 'ARDF');
  attributes = upsertAttr(attributes, 'Modelo de equipo', 'IM 2510');
  attributes = upsertAttr(attributes, 'Velocidad', '25 ppm');
  attributes = upsertAttr(attributes, 'Año', '2025');

  return {
    id,
    code: 'IM-2510',
    name: 'Impresora Multifuncional Nueva RICOH IM 2510',
    description:
      'Copiadora, Impresora, Escáner y fax\nConectividad: Wi-Fi, Ethernet, USB\nARDF / Mueble\nFormato A3\nProducción mensual media\nRegalo: Envío Gratis',
    currency: 'USD',
    stock: 5,
    category: 'Multifuncionales, Multifuncionales Nuevas',
    brand: 'Ricoh',
    image_url:
      template?.image_url ||
      '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp?v=1784092875242',
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order ?? 1019) - 1,
    slug,
    prices: {
      public: publicPrice,
      tecnico,
      mayorista: template?.prices?.mayorista ?? 3599,
      distribuidor: template?.prices?.distribuidor ?? 3649,
    },
    attributes,
    stock_by_warehouse: [
      { warehouse_id: 'operativo', quantity: 0 },
      { warehouse_id: 'santa-catalina', quantity: 0 },
      { warehouse_id: 'partes-scrap', quantity: 0 },
      { warehouse_id: 'otros-estados', quantity: 0 },
      { warehouse_id: '1931', quantity: 5 },
      { warehouse_id: 'principal', quantity: 0 },
    ],
  };
}

function ensureIm2510(products) {
  const exists = products.some(
    (product) =>
      /nueva/i.test(product.name || '') &&
      /\bIM\s*2510\b/i.test(product.name || '') &&
      !/C2510|3510|toner/i.test(product.name || ''),
  );
  if (exists) return { products, created: null };

  const template = products.find((product) => product.id === '196857c6-738b-4162-90aa-50dee575bcd8');
  const created = patchProduct(createIm2510(template));
  const im2500Idx = products.findIndex((product) => product.id === '196857c6-738b-4162-90aa-50dee575bcd8');
  const next = [...products];
  if (im2500Idx >= 0) next.splice(im2500Idx + 1, 0, created);
  else next.push(created);
  return { products: next, created };
}

function processFile(filePath) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return { skipped: true, reason: 'file missing or invalid' };
  }

  const isWrapped = Boolean(raw.products);
  let products = raw.products || raw;
  const report = [];
  const { products: withIm2510, created: im2510Created } = ensureIm2510(products);
  products = withIm2510;
  if (im2510Created) {
    report.push({
      id: im2510Created.id,
      name: im2510Created.name,
      before: null,
      after: {
        stock: im2510Created.stock,
        tecnico: im2510Created.prices?.tecnico,
        public: im2510Created.prices?.public,
        created: true,
      },
    });
  }

  const nextProducts = products.map((product) => {
    const rule = byId.get(product.id);
    if (!rule) return product;
    const before = {
      stock: product.stock,
      tecnico: product.prices?.tecnico,
      public: product.prices?.public,
    };
    const updated = patchProduct(product);
    report.push({
      id: product.id,
      name: updated.name,
      before,
      after: {
        stock: updated.stock,
        tecnico: updated.prices?.tecnico,
        public: updated.prices?.public,
        variante: rule.variante,
        variant_product_ids: updated.variant_product_ids,
      },
    });
    return updated;
  });

  const missing = UPDATES.filter((row) => !report.some((r) => r.id === row.id)).map((r) => r.id);
  const out = isWrapped ? { ...raw, products: nextProducts } : nextProducts;
  copyFileSync(filePath, `${filePath}.bak-distrib-2026-08-${Date.now()}`);
  writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return { report, missing, count: nextProducts.length };
}

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const serverPath = path.join(root, 'server/data/inventory.json');

const catalogRes = processFile(catalogPath);
let serverRes = { skipped: true };
try {
  serverRes = processFile(serverPath);
} catch {
  serverRes = { skipped: true, reason: 'server inventory not found' };
}

console.log(JSON.stringify({ catalog: catalogRes, server: serverRes }, null, 2));
