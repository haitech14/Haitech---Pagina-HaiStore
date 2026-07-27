/**
 * Toma física EQUIPOS USADOS AL 04/05/26 — categoría seminuevos.
 * 110V ≡ 120V (lista física usa «120V»; fichas HaiStore usan «110V»).
 * Ubicaciones: partes-scrap, operativo, santa-catalina, otros-estados.
 */
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeInventory, readInventory, invalidateInventoryReadCache } from '../server/lib/inventory-store.js';
import { normalizeWarehouses, normalizeProductStock } from '../server/lib/inventory-warehouses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const LOCATION_IDS = ['operativo', 'santa-catalina', 'partes-scrap', 'otros-estados', '1931', 'principal'];

const SEMINUEVA_WAREHOUSES = [
  { id: 'operativo', name: 'Operativo', delivery_time: 'Inmediata' },
  { id: 'santa-catalina', name: 'Santa Catalina', delivery_time: 'Inmediata' },
  { id: 'partes-scrap', name: 'Partes / Scrap', delivery_time: 'Consultar' },
  { id: 'otros-estados', name: 'Otros estados', delivery_time: 'Consultar' },
  { id: '1931', name: 'Almacén 1931', delivery_time: 'Inmediata' },
  { id: 'principal', name: 'Almacén principal', delivery_time: 'Inmediata' },
];

/** @typedef {{ id?: string; code?: string; match?: (p: object) => boolean; voltage?: '110'|'220'; total: number; partes?: number; operativo?: number; santaCatalina?: number; zero?: boolean }} StockRule */

/** @type {StockRule[]} — lista física 04/05/26 (hoja 1 + seminuevos hoja 2) */
const STOCK_RULES = [
  { id: '189620fe-a5e5-4526-a399-8aa6a308bd1d', voltage: '220', total: 63, partes: 8, operativo: 15 },
  { id: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2', voltage: '220', total: 106 },
  { id: 'a4be1850-48ac-40fd-8962-14c00bec5e59', voltage: '110', total: 0, zero: true },
  { id: '9a955212-f712-4a2e-acf7-f03b059f7c98', voltage: '220', total: 0, zero: true },
  { id: '1f34bfe4-95be-45c4-be3e-37a740fee9b9', voltage: '110', total: 0, zero: true },
  { id: 'ae1904f7-4a13-4076-802a-4d917a8471aa', voltage: '110', total: 15 },
  {
    code: 'SEMI-IM600F-220V',
    match: (p) => /seminueva/i.test(p.name || '') && /IM\s*600F/i.test(p.name || '') && /220\s*V/i.test(p.name || ''),
    voltage: '220',
    total: 27,
    partes: 14,
    operativo: 7,
  },
  { id: 'b06406c6-945c-4107-89f4-c35de3a33544', voltage: '220', total: 4, operativo: 2 },
  {
    code: 'SEMI-IMC2000-110V',
    match: (p) =>
      /seminueva/i.test(p.name || '') &&
      /IM\s*C2000/i.test(p.name || '') &&
      !/cilindro|rod/i.test(p.name || '') &&
      /110\s*V/i.test(p.name || ''),
    voltage: '110',
    total: 1,
  },
  { id: 'dbd6ad0b-ee55-4fae-82e8-83009bd88e94', voltage: '220', total: 0, zero: true },
  { id: '9e77a73a-753a-4e28-859b-68fe7cba5e0e', voltage: '220', total: 0, zero: true },
  { id: 'c54ea344-0162-42eb-96be-333014d14186', voltage: '110', total: 2, partes: 1 },
  { id: '44413e3b-a3ef-4644-8eed-e550168ae9d8', voltage: '220', total: 15, partes: 4, santaCatalina: 4 },
  { id: 'dd5efa36-73f6-4241-b2ad-6e74ef058733', voltage: '220', total: 0, zero: true },
  { id: 'b0811a6f-0f94-4bea-8804-3f7dd0d28a1c', voltage: '220', total: 1 },
  { id: 'a853cd99-17e7-445a-a6b2-4f527753db6f', voltage: '220', total: 0, zero: true },
  { id: '53969acd-7aa0-4aee-840d-73f3bcd5cbe1', voltage: '220', total: 21, partes: 3, operativo: 1, santaCatalina: 1 },
  { id: '393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce', voltage: '220', total: 32, santaCatalina: 22 },
  { id: 'ad23e3ac-84c6-4a54-9d84-64bf6990c418', voltage: '220', total: 3, partes: 2, santaCatalina: 1 },
  {
    code: 'SEMI-MP5055-110V',
    match: (p) => /seminueva/i.test(p.name || '') && /MP\s*5055/i.test(p.name || '') && /110\s*V/i.test(p.name || ''),
    voltage: '110',
    total: 10,
  },
  { id: '46b85626-5927-4442-83ec-104c52e6a5e1', voltage: '220', total: 0, zero: true },
  { id: '4acb10f2-20db-4df4-a0f0-c87daa90636c', voltage: '220', total: 1 },
  { id: '58763abe-b3ad-4d63-8798-d116c1fb1dcb', voltage: '220', total: 3 },
  { id: '9b94a5c0-f07d-42d6-bf0a-0a08afb7812c', voltage: '220', total: 4 },
  { id: '82333527-b02f-4696-bd6a-f4c317c5675a', voltage: '220', total: 1, operativo: 1 },
  { id: '452b7860-4bc7-4b89-ba43-41e94158686d', voltage: '220', total: 72 },
  { id: '550c6815-7688-41f8-bb64-c362322d7f9d', voltage: '110', total: 9 },
  { id: 'dd031da8-d2cd-4219-b582-c97514e144c9', voltage: '220', total: 12 },
  { id: '371c5e40-c823-4db1-b36c-895ae1fb53e1', voltage: '220', total: 0, zero: true },
  { match: (p) => /seminueva/i.test(p.name || '') && /\bIM\s*2500\b/i.test(p.name || ''), voltage: '220', total: 0, zero: true },
  { id: '6490d3d9-bfd0-4a48-82c4-dadca949c8f1', voltage: '220', total: 0, zero: true },
  { id: 'caf19a37-c3e7-4d5c-b3da-91aef5a5cd15', voltage: '110', total: 0, zero: true },
  { id: 'dfcc1b1c-100a-4cb4-80b1-c1e24e1d991a', voltage: '110', total: 0, zero: true },
  { id: 'ec2eeb41-3af8-4f81-ab78-fa92ec052e04', voltage: '220', total: 2 },
  { id: '5faaa575-c210-4a85-af9a-4d1c526bda46', voltage: '110', total: 0, zero: true },
];

/** @type {{ code: string; templateId: string; name: string; voltage: '110'|'220'; modelLabel: string; variantNote?: string }[]} */
const CREATE_PRODUCTS = [
  {
    code: 'SEMI-IM600F-220V',
    templateId: 'ae1904f7-4a13-4076-802a-4d917a8471aa',
    name: 'Impresora Multifuncional Seminueva RICOH IM 600F 220V',
    voltage: '220',
    modelLabel: 'IM 600F',
  },
  {
    code: 'SEMI-IMC2000-110V',
    templateId: 'b06406c6-945c-4107-89f4-c35de3a33544',
    name: 'Impresora Multifuncional Seminueva RICOH IM C2000 110V',
    voltage: '110',
    modelLabel: 'IM C2000',
  },
  {
    code: 'SEMI-MP5055-110V',
    templateId: '46b85626-5927-4442-83ec-104c52e6a5e1',
    name: 'Impresora Multifuncional Seminueva RICOH MP 5055 110V',
    voltage: '110',
    modelLabel: 'MP 5055',
  },
];

function upsertAttr(attributes, name, value) {
  const next = Array.isArray(attributes) ? [...attributes] : [];
  const idx = next.findIndex((a) => String(a.name || '').trim().toLowerCase() === name.toLowerCase());
  const row = { id: idx >= 0 ? next[idx].id : randomUUID(), name, value: String(value) };
  if (idx >= 0) next[idx] = { ...next[idx], ...row };
  else next.push(row);
  return next;
}

function voltageLabel(v) {
  return v === '110' ? '110V' : '220V';
}

function buildStockByLocation(rule, warehouses) {
  const total = Math.max(0, Math.floor(Number(rule.total) || 0));
  let partes = Math.max(0, Math.floor(Number(rule.partes) || 0));
  let operativo = Math.max(0, Math.floor(Number(rule.operativo) || 0));
  let santa = Math.max(0, Math.floor(Number(rule.santaCatalina) || 0));
  let assigned = partes + operativo + santa;
  if (assigned > total && assigned > 0) {
    const scale = total / assigned;
    partes = Math.floor(partes * scale);
    operativo = Math.floor(operativo * scale);
    santa = Math.floor(santa * scale);
    assigned = partes + operativo + santa;
  }
  const otros = Math.max(0, total - assigned);
  const rows = [
    { warehouse_id: 'operativo', quantity: operativo },
    { warehouse_id: 'santa-catalina', quantity: santa },
    { warehouse_id: 'partes-scrap', quantity: partes },
    { warehouse_id: 'otros-estados', quantity: otros },
    { warehouse_id: '1931', quantity: 0 },
    { warehouse_id: 'principal', quantity: 0 },
  ];
  return normalizeProductStock(rows, total, warehouses);
}

function buildSlug(name, id) {
  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${slugBase}-${id.slice(0, 12)}`;
}

function createFromTemplate(template, spec) {
  const id = randomUUID();
  return {
    id,
    code: spec.code,
    name: spec.name,
    description: template?.description || spec.name,
    currency: 'USD',
    stock: 0,
    stock_by_warehouse: LOCATION_IDS.map((warehouse_id) => ({ warehouse_id, quantity: 0 })),
    category: template?.category || 'Multifuncionales, Multifuncionales Seminuevas',
    brand: template?.brand || 'Ricoh',
    image_url: template?.image_url || '/categories/multifuncionales.png',
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 1100) + 2,
    slug: buildSlug(spec.name, id),
    prices: template?.prices ? { ...template.prices } : { tecnico: 0, mayorista: 0, distribuidor: 0, public: 0 },
    attributes: upsertAttr(
      upsertAttr(template?.attributes, 'Modelo de equipo', spec.modelLabel),
      'Voltaje',
      voltageLabel(spec.voltage),
    ),
    purchase_price_usd: template?.purchase_price_usd ?? 0,
    suppliers: template?.suppliers ? [...template.suppliers] : [],
  };
}

function isSeminueva(product) {
  const cat = String(product.category || '').toLowerCase();
  return cat.includes('seminuevas') || /seminueva/i.test(String(product.name || ''));
}

function productVoltage(product) {
  const attr = product.attributes?.find((a) => /^voltaje$/i.test(String(a.name || '').trim()))?.value;
  if (attr) {
    const n = String(attr).replace(/\s/g, '');
    if (/110|120/i.test(n)) return '110';
    if (/220/i.test(n)) return '220';
  }
  const name = String(product.name || '');
  if (/\b110\s*V|\b120\s*V/i.test(name)) return '110';
  if (/\b220\s*V/i.test(name)) return '220';
  return '220';
}

function ruleMatches(product, rule) {
  if (rule.id && product.id === rule.id) return true;
  if (rule.code && String(product.code || '').trim() === rule.code) return true;
  if (rule.match?.(product)) return true;
  return false;
}

function ensureProducts(products) {
  const byCode = new Map(products.map((p) => [String(p.code || '').trim(), p]).filter(([c]) => c));
  const byId = new Map(products.map((p) => [p.id, p]));
  let next = [...products];
  for (const spec of CREATE_PRODUCTS) {
    if (byCode.has(spec.code)) continue;
    const template = byId.get(spec.templateId);
    if (!template) {
      console.warn('Plantilla no encontrada:', spec.templateId);
      continue;
    }
    const created = createFromTemplate(template, spec);
    next.push(created);
    byCode.set(spec.code, created);
    byId.set(created.id, created);
    console.log('  + creado', spec.code, created.id);
  }
  return next;
}

function applyRules(products, warehouses) {
  const report = [];
  const applied = new Set();
  let next = products.map((product) => {
    if (!isSeminueva(product)) return product;
    const rules = STOCK_RULES.filter((rule) => ruleMatches(product, rule));
    if (rules.length === 0) return product;
    const rule = rules.find((r) => r.voltage === productVoltage(product)) ?? rules[0];
    if (!rule) return product;

    applied.add(product.id);
    const stockPatch =
      rule.zero && rule.total === 0
        ? buildStockByLocation({ total: 0 }, warehouses)
        : buildStockByLocation(rule, warehouses);

    const updated = {
      ...product,
      ...stockPatch,
      attributes: upsertAttr(product.attributes, 'Voltaje', voltageLabel(rule.voltage ?? productVoltage(product))),
      updated_at: new Date().toISOString(),
    };
    report.push({
      name: updated.name,
      code: updated.code,
      voltage: voltageLabel(rule.voltage ?? productVoltage(product)),
      stock: updated.stock,
      warehouses: updated.stock_by_warehouse?.filter((r) => r.quantity > 0),
    });
    return updated;
  });
  return { next, report };
}

function syncCatalog(products, warehouses) {
  const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
  if (!existsSync(catalogPath)) return;
  copyFileSync(catalogPath, `${catalogPath}.bak-seminuevos-040526-${Date.now()}`);
  const raw = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const byId = new Map(products.map((p) => [p.id, p]));
  const catalogIds = new Set((raw.products || []).map((p) => p.id));
  let nextProducts = (raw.products || []).map((row) => {
    const live = byId.get(row.id);
    if (!live) return row;
    return {
      ...row,
      stock: live.stock,
      stock_by_warehouse: live.stock_by_warehouse,
      attributes: live.attributes,
      variant_product_ids: live.variant_product_ids,
      updated_at: live.updated_at,
      ...(live.name ? { name: live.name } : {}),
    };
  });
  for (const live of products) {
    if (catalogIds.has(live.id)) continue;
    if (!isSeminueva(live)) continue;
    nextProducts.push(live);
  }
  writeFileSync(
    catalogPath,
    `${JSON.stringify({ ...raw, products: nextProducts, warehouses }, null, 2)}\n`,
    'utf8',
  );
}

function mergeWarehouses(existing) {
  const base = normalizeWarehouses(existing);
  const ids = new Set(base.map((w) => w.id));
  const merged = [...base];
  for (const w of SEMINUEVA_WAREHOUSES) {
    if (!ids.has(w.id)) merged.push(w);
  }
  return merged;
}

function linkVariantGroup(products, ids) {
  const idSet = new Set(ids);
  return products.map((product) => {
    if (!idSet.has(product.id)) return product;
    return { ...product, variant_product_ids: ids.filter((id) => id !== product.id) };
  });
}

const VOLTAGE_VARIANT_GROUPS = [
  ['ae1904f7-4a13-4076-802a-4d917a8471aa', 'fd51b686-5191-4fa0-8d41-9f13527467cd'],
  ['b06406c6-945c-4107-89f4-c35de3a33544', '7613294c-20ec-4576-8cef-3eaf75ba5fee'],
  ['46b85626-5927-4442-83ec-104c52e6a5e1', 'ee249761-a942-4397-8170-ee156acd06cf'],
  [
    '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
    'a4be1850-48ac-40fd-8962-14c00bec5e59',
    '9a955212-f712-4a2e-acf7-f03b059f7c98',
    '1f34bfe4-95be-45c4-be3e-37a740fee9b9',
  ],
  ['9e77a73a-753a-4e28-859b-68fe7cba5e0e', 'c54ea344-0162-42eb-96be-333014d14186'],
  ['ec2eeb41-3af8-4f81-ab78-fa92ec052e04', '5faaa575-c210-4a85-af9a-4d1c526bda46'],
];

function renameIm600110v(products) {
  return products.map((product) => {
    if (product.id !== 'ae1904f7-4a13-4076-802a-4d917a8471aa') return product;
    const name = 'Impresora Multifuncional Seminueva RICOH IM 600F 110V';
    return {
      ...product,
      name,
      attributes: upsertAttr(product.attributes, 'Voltaje', '110V'),
    };
  });
}

invalidateInventoryReadCache();
const inventory = await readInventory();
const warehouses = mergeWarehouses(inventory.warehouses);

let products = ensureProducts(inventory.products);
const { next, report } = applyRules(products, warehouses);
products = next;
for (const group of VOLTAGE_VARIANT_GROUPS) {
  const resolved = group.filter((id) => products.some((p) => p.id === id));
  if (resolved.length >= 2) products = linkVariantGroup(products, resolved);
}
products = renameIm600110v(products);

await writeInventory({ ...inventory, products, warehouses });
syncCatalog(products, warehouses);

console.log('\n=== Stock seminuevos 04/05/26 aplicado ===\n');
for (const row of report.sort((a, b) => a.name.localeCompare(b.name, 'es'))) {
  const wh = (row.warehouses || []).map((w) => `${w.warehouse_id}:${w.quantity}`).join(', ');
  console.log(`${row.voltage.padEnd(5)} | stock ${String(row.stock).padStart(3)} | ${row.code ?? '—'} | ${row.name}`);
  if (wh) console.log(`         ${wh}`);
}
console.log(`\n${report.length} fichas actualizadas.`);
