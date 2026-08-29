/**
 * IM 2510 (ya existe), IM 3010/4010/5010 (a pedido) e IM 8000/9000 (precios planilla).
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

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

function zeroStockWarehouses(template) {
  if (!Array.isArray(template?.stock_by_warehouse) || template.stock_by_warehouse.length === 0) {
    return [{ warehouse_id: 'principal', quantity: 0 }];
  }
  return template.stock_by_warehouse.map((row) => ({ ...row, quantity: 0 }));
}

function stockWarehouses(template, stock) {
  if (!Array.isArray(template?.stock_by_warehouse) || template.stock_by_warehouse.length === 0) {
    return [{ warehouse_id: '1931', quantity: stock }];
  }
  return template.stock_by_warehouse.map((row) => ({
    ...row,
    quantity: row.warehouse_id === '1931' ? stock : 0,
  }));
}

function cloneAttr(attr) {
  return { id: randomUUID(), name: attr.name, value: attr.value };
}

/** @param {Record<string, unknown>} template */
function createBnModel(template, config) {
  const {
    id,
    code,
    model,
    name,
    tecnico,
    publicAdd,
    stock,
    speed,
    year,
    adf,
    image_url,
    sortOrderOffset = 0,
  } = config;

  const publicPrice = tecnico + publicAdd;
  const slug = `impresora-multifuncional-nueva-ricoh-${model.toLowerCase().replace(/\s+/g, '-')}-${id}`;

  const baseAttributes = (template?.attributes ?? [])
    .filter((row) =>
      ['Color', 'Formato papel', 'Producción', 'Instalación', 'A3'].includes(String(row.name)),
    )
    .map(cloneAttr);

  let attributes = baseAttributes;
  attributes = upsertAttr(attributes, 'Alimentador (ADF)', adf);
  attributes = upsertAttr(attributes, 'Modelo de equipo', model);
  attributes = upsertAttr(attributes, 'Velocidad', speed);
  attributes = upsertAttr(attributes, 'Año', String(year));

  return {
    id,
    code,
    name,
    description:
      template?.description ||
      'Copiadora, Impresora, Escáner y fax\nConectividad: Wi-Fi, Ethernet, USB\nFormato A3\nRegalo: Envío Gratis',
    currency: 'USD',
    stock,
    category: 'Multifuncionales, Multifuncionales Nuevas',
    brand: 'Ricoh',
    image_url: image_url || template?.image_url,
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order ?? 1020) + sortOrderOffset,
    slug,
    prices: {
      public: publicPrice,
      tecnico,
      mayorista: template?.prices?.mayorista ?? tecnico,
      distribuidor: template?.prices?.distribuidor ?? publicPrice,
    },
    attributes,
    stock_by_warehouse: stock > 0 ? stockWarehouses(template, stock) : zeroStockWarehouses(template),
  };
}

const HIGH_END_UPDATES = [
  {
    id: '97079efe-de43-4619-b3f2-950d323fa773',
    tecnico: 18800,
    publicAdd: 300,
    speed: '70 ppm',
    year: 2025,
    adf: 'Doble Scan',
    model: 'IM 8000 (SPDF)',
  },
  {
    id: 'ffbec10e-aaf3-4a6f-995c-9bcbfb9d39e2',
    tecnico: 24700,
    publicAdd: 300,
    speed: '70 ppm',
    year: 2025,
    adf: 'Doble Scan',
    model: 'IM 9000 (SPDF)',
  },
];

const NEW_MODELS = [
  {
    id: 'ricoh-im-3010',
    code: 'IM-3010',
    model: 'IM 3010',
    name: 'Impresora Multifuncional Nueva RICOH IM 3010',
    tecnico: 3999,
    publicAdd: 250,
    stock: 0,
    speed: '30 ppm',
    year: 2025,
    adf: 'ARDF',
    templateId: '0aea108a-acd2-4ddd-af29-b2265097813c',
    image_url: '/products/0aea108a-acd2-4ddd-af29-b2265097813c.webp?v=1784112813940',
    sortOrderOffset: 1,
  },
  {
    id: 'ricoh-im-4010',
    code: 'IM-4010',
    model: 'IM 4010',
    name: 'Impresora Multifuncional Nueva RICOH IM 4010',
    tecnico: 6399,
    publicAdd: 250,
    stock: 0,
    speed: '40 ppm',
    year: 2025,
    adf: 'ARDF',
    templateId: '40c36a2a-794e-41aa-b075-d855c218bf6f',
    image_url: '/products/40c36a2a-794e-41aa-b075-d855c218bf6f.webp?v=1784092931416',
    sortOrderOffset: 2,
  },
  {
    id: 'ricoh-im-5010',
    code: 'IM-5010',
    model: 'IM 5010',
    name: 'Impresora Multifuncional Nueva RICOH IM 5010',
    tecnico: 6899,
    publicAdd: 250,
    stock: 0,
    speed: '50 ppm',
    year: 2025,
    adf: 'ARDF',
    templateId: 'c0ad567a-6ad7-4857-a087-fd574a903a04',
    image_url: '/products/c0ad567a-6ad7-4857-a087-fd574a903a04.webp?v=1784093077030',
    sortOrderOffset: 3,
  },
];

function processFile(filePath) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return { skipped: true, reason: 'missing' };
  }

  const isWrapped = Boolean(raw.products);
  const products = raw.products || raw;
  const byId = new Map(products.map((p) => [p.id, p]));
  const report = [];

  for (const rule of HIGH_END_UPDATES) {
    const product = byId.get(rule.id);
    if (!product) {
      report.push({ id: rule.id, status: 'missing' });
      continue;
    }
    let attributes = upsertAttr(product.attributes, 'Velocidad', rule.speed);
    attributes = upsertAttr(attributes, 'Año', String(rule.year));
    attributes = upsertAttr(attributes, 'Alimentador (ADF)', rule.adf);
    attributes = upsertAttr(attributes, 'Modelo de equipo', rule.model);
    const updated = {
      ...product,
      stock: 0,
      stock_by_warehouse: zeroStockWarehouses(product),
      attributes,
      prices: {
        ...(product.prices || {}),
        tecnico: rule.tecnico,
        public: rule.tecnico + rule.publicAdd,
      },
    };
    byId.set(rule.id, updated);
    report.push({
      id: rule.id,
      name: updated.name,
      tecnico: rule.tecnico,
      public: rule.tecnico + rule.publicAdd,
      speed: rule.speed,
      year: rule.year,
    });
  }

  for (const spec of NEW_MODELS) {
    if (byId.has(spec.id)) {
      report.push({ id: spec.id, status: 'exists' });
      continue;
    }
    const template = byId.get(spec.templateId);
    const created = createBnModel(template, spec);
    created.name = spec.name;
    byId.set(spec.id, created);
    report.push({ id: spec.id, name: created.name, created: true, stock: 0, tecnico: spec.tecnico });
  }

  const im2510 = byId.get('ricoh-im-2510');
  if (im2510) {
    byId.set('ricoh-im-2510', {
      ...im2510,
      stock: 5,
      stock_by_warehouse: stockWarehouses(im2510, 5),
      prices: {
        ...(im2510.prices || {}),
        tecnico: 3549,
        public: 3799,
      },
    });
    report.push({ id: 'ricoh-im-2510', stock: 5, tecnico: 3549, public: 3799 });
  }

  const nextProducts = products.map((p) => byId.get(p.id) ?? p);
  for (const spec of NEW_MODELS) {
    if (!products.some((p) => p.id === spec.id) && byId.has(spec.id)) {
      const im2510Idx = nextProducts.findIndex((p) => p.id === 'ricoh-im-2510');
      const insertAt = im2510Idx >= 0 ? im2510Idx + 1 : nextProducts.length;
      nextProducts.splice(insertAt, 0, byId.get(spec.id));
    }
  }

  const out = isWrapped ? { ...raw, products: nextProducts } : nextProducts;
  copyFileSync(filePath, `${filePath}.bak-im-a3-bn-${Date.now()}`);
  writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return { report, count: nextProducts.length };
}

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const serverPath = path.join(root, 'server/data/inventory.json');

console.log('catalog:', JSON.stringify(processFile(catalogPath), null, 2));
try {
  console.log('server:', JSON.stringify(processFile(serverPath), null, 2));
} catch (err) {
  console.log('server skipped:', err.message);
}
