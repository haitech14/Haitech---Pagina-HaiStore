/**
 * Alinea multifuncionales NUEVAS a lista julio 2026:
 * - Técnico = precio lista (si termina en 5 → 9)
 * - Distribuidor = Técnico + 50 (+ 80 si A3); 5→9 también
 * - Stock / Velocidad / Año / formatos A4+A3
 * - Crea IM 6010 si falta
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const UPDATES = [
  {
    key: 'm320',
    match: (n) =>
      /nueva/i.test(n) &&
      /\bM\s*320F?\b/i.test(n) &&
      !/C320/i.test(n) &&
      !/seminueva/i.test(n),
    list: 395,
    stock: 20,
    formats: ['A4'],
    speed: '30 ppm',
    year: 2024,
  },
  {
    key: 'mp305',
    match: (n) => /nueva/i.test(n) && /MP\s*305\+/i.test(n) && !/seminueva/i.test(n),
    list: 889,
    stock: 5,
    formats: ['A4', 'A3'],
    speed: '30 ppm',
    year: 2023,
  },
  {
    key: 'im430',
    match: (n) =>
      (/nueva/i.test(n) || /^impresora multifuncional ricoh im 430f$/i.test(n.trim())) &&
      /IM\s*430F?\b/i.test(n) &&
      !/seminueva/i.test(n),
    list: 919,
    stock: 49,
    formats: ['A4'],
    speed: '40 ppm',
    year: 2024,
  },
  {
    key: 'im460',
    match: (n) => /nueva/i.test(n) && /IM\s*460F?\b/i.test(n) && !/seminueva/i.test(n),
    list: 1049,
    stock: 8,
    formats: ['A4', 'A3'],
    speed: '40 ppm',
    year: 2024,
  },
  {
    key: 'im550',
    match: (n) => /nueva/i.test(n) && /IM\s*550F?\b/i.test(n) && !/seminueva/i.test(n),
    list: 1499,
    stock: 44,
    formats: ['A4'],
    speed: '55 ppm',
    year: 2024,
  },
  {
    key: 'im600f',
    match: (n) =>
      /nueva/i.test(n) && /IM\s*600F?\b/i.test(n) && !/6000/i.test(n) && !/seminueva/i.test(n),
    list: 1869,
    stock: 0,
    formats: ['A4'],
    speed: '60 ppm',
    year: 2024,
  },
  {
    key: 'im2500',
    match: (n) => /nueva/i.test(n) && /IM\s*2500\b/i.test(n) && !/seminueva/i.test(n),
    list: 3695,
    stock: 8,
    formats: ['A3'],
    speed: '25 ppm',
    year: 2022,
  },
  {
    key: 'im3000',
    match: (n) =>
      /nueva/i.test(n) && /IM\s*3000\b/i.test(n) && !/C3000/i.test(n) && !/seminueva/i.test(n),
    list: 4049,
    stock: 2,
    formats: ['A3'],
    speed: '30 ppm',
    year: 2023,
  },
  {
    key: 'im5000',
    match: (n) => /nueva/i.test(n) && /IM\s*5000\b/i.test(n) && !/seminueva/i.test(n),
    list: 6899,
    stock: 2,
    formats: ['A3'],
    speed: '50 ppm',
    year: 2023,
  },
  {
    key: 'im6010',
    match: (n) => /nueva/i.test(n) && /IM\s*6010\b/i.test(n) && !/seminueva/i.test(n),
    list: 8499,
    stock: 2,
    formats: ['A3'],
    speed: '60 ppm',
    year: 2023,
  },
  {
    key: 'im7000',
    match: (n) => /nueva/i.test(n) && /IM\s*7000\b/i.test(n) && !/seminueva/i.test(n),
    list: 11990,
    stock: 1,
    formats: ['A3'],
    speed: '70 ppm',
    year: 2023,
  },
  {
    key: 'mc320fw',
    match: (n) => /nueva/i.test(n) && /M\s*C320FW\b/i.test(n) && !/seminueva/i.test(n),
    list: 899,
    stock: 4,
    formats: ['A4'],
    speed: '30 ppm',
    year: 2025,
  },
  {
    key: 'imc320f',
    match: (n) => /nueva/i.test(n) && /IM\s*C320F\b/i.test(n) && !/seminueva/i.test(n),
    list: 1929,
    stock: 0,
    formats: ['A4'],
    speed: '30 ppm',
    year: 2025,
  },
  {
    key: 'imc2010',
    match: (n) => /nueva/i.test(n) && /IM\s*C2010\b/i.test(n) && !/seminueva/i.test(n),
    list: 4575,
    stock: 4,
    formats: ['A4', 'A3'],
    speed: '20 ppm',
    year: 2024,
  },
  {
    key: 'imc2510',
    match: (n) => /nueva/i.test(n) && /IM\s*C2510\b/i.test(n) && !/seminueva/i.test(n),
    list: 5889,
    stock: 0,
    formats: ['A4', 'A3'],
    speed: '25 ppm',
    year: 2024,
  },
  {
    key: 'imc3010',
    match: (n) => /nueva/i.test(n) && /IM\s*C3010\b/i.test(n) && !/seminueva/i.test(n),
    list: 8949,
    stock: 0,
    formats: ['A4', 'A3'],
    speed: '30 ppm',
    year: 2024,
  },
  {
    key: 'imc4510',
    match: (n) => /nueva/i.test(n) && /IM\s*C4510\b/i.test(n) && !/seminueva/i.test(n),
    list: 11850,
    stock: 2,
    formats: ['A4', 'A3'],
    speed: '45 ppm',
    year: 2024,
  },
  {
    key: 'imc6010',
    match: (n) => /nueva/i.test(n) && /IM\s*C6010\b/i.test(n) && !/seminueva/i.test(n),
    list: 13619,
    stock: 0,
    formats: ['A4', 'A3'],
    speed: '60 ppm',
    year: 2024,
  },
];

function end5to9(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return n;
  return v % 10 === 5 ? v + 4 : v;
}

function calcPrices(list, formats) {
  const tecnico = end5to9(list);
  const hasA3 = formats.includes('A3');
  let distribuidor = tecnico + 50 + (hasA3 ? 80 : 0);
  distribuidor = end5to9(distribuidor);
  return { tecnico, distribuidor };
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

function removeAttrs(attributes, names) {
  const ban = new Set(names.map((n) => n.toLowerCase()));
  return (attributes || []).filter(
    (a) => !ban.has(String(a.name || '').trim().toLowerCase()),
  );
}

function applyFormatAttrs(attributes, formats) {
  let next = removeAttrs(attributes, ['A4', 'A3']);
  const formatoPapel = formats.length === 2 ? 'A4 / A3' : formats[0];
  next = upsertAttr(next, 'Formato papel', formatoPapel);
  for (const f of formats) {
    next = upsertAttr(next, f, 'Sí');
  }
  return next;
}

function patchFeatureBarSpeed(product, speed) {
  if (!Array.isArray(product.storefront_feature_bar)) return product;
  const bar = product.storefront_feature_bar.map((tile) => {
    if (tile?.icon === 'Gauge' || /ppm/i.test(String(tile?.title || ''))) {
      return {
        ...tile,
        title: speed,
        subtitle: tile.subtitle || 'Velocidad de impresión',
      };
    }
    return tile;
  });
  return { ...product, storefront_feature_bar: bar };
}

function applyUpdate(product, rule) {
  const { tecnico, distribuidor } = calcPrices(rule.list, rule.formats);
  let attributes = applyFormatAttrs(product.attributes, rule.formats);
  attributes = upsertAttr(attributes, 'Velocidad', rule.speed);
  attributes = upsertAttr(attributes, 'Año', String(rule.year));
  if (rule.modelLabel) {
    attributes = upsertAttr(attributes, 'Modelo de equipo', rule.modelLabel);
  }

  const prices = {
    ...(product.prices || {}),
    tecnico,
    distribuidor,
  };

  let next = {
    ...product,
    stock: rule.stock,
    prices,
    attributes,
  };

  if (Array.isArray(product.stock_by_warehouse) && product.stock_by_warehouse.length > 0) {
    next.stock_by_warehouse = product.stock_by_warehouse.map((row, index) =>
      index === 0 ? { ...row, quantity: rule.stock } : { ...row, quantity: 0 },
    );
  } else {
    next.stock_by_warehouse = [{ warehouse_id: 'principal', quantity: rule.stock }];
  }

  next = patchFeatureBarSpeed(next, rule.speed);
  return { product: next, tecnico, distribuidor };
}

function createIm6010(template) {
  const id = randomUUID();
  const rule = UPDATES.find((u) => u.key === 'im6010');
  const { tecnico, distribuidor } = calcPrices(rule.list, rule.formats);
  const slug = `impresora-multifuncional-nueva-ricoh-im-6010-${id.slice(0, 12)}`;

  const base = {
    id,
    code: 'IM-6010',
    name: 'Impresora Multifuncional NUEVA RICOH IM 6010',
    description:
      'Copiadora, Impresora, Escáner y fax\nConectividad: Wi-Fi, Ethernet, USB\nARDF / Mueble\nFormato A3\nProducción mensual alta\nRegalo: Envío Gratis',
    currency: 'USD',
    stock: rule.stock,
    category: 'Multifuncionales, Multifuncionales Nuevas',
    brand: 'Ricoh',
    image_url: template?.image_url || '/categories/multifuncionales.png',
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 1000) + 1,
    slug,
    prices: {
      public: Math.round(tecnico * 1.08),
      mayorista: Math.round(tecnico * 0.98),
      tecnico,
      distribuidor,
    },
    attributes: [],
  };

  const { product } = applyUpdate(base, { ...rule, modelLabel: 'IM-6010' });
  return product;
}

function processFile(filePath, { createMissing }) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const products = raw.products || raw;
  const isWrapped = Boolean(raw.products);
  const report = [];
  const matched = new Set();

  const nextProducts = products.map((product) => {
    const name = String(product.name || '');
    const rule = UPDATES.find((u) => u.match(name));
    if (!rule) return product;
    matched.add(rule.key);
    const modelLabel = name.replace(/^.*?RICOH\s+/i, '').trim();
    const { product: updated, tecnico, distribuidor } = applyUpdate(product, {
      ...rule,
      modelLabel,
    });
    report.push({
      key: rule.key,
      name: updated.name,
      tecnico,
      distribuidor,
      stock: updated.stock,
      formats: rule.formats.join('+'),
      speed: rule.speed,
      year: rule.year,
    });
    return updated;
  });

  if (createMissing && !matched.has('im6010')) {
    const template = nextProducts.find((p) => /NUEVA RICOH IM 5000/i.test(p.name));
    const created = createIm6010(template);
    nextProducts.push(created);
    matched.add('im6010');
    report.push({
      key: 'im6010',
      name: created.name,
      tecnico: created.prices.tecnico,
      distribuidor: created.prices.distribuidor,
      stock: created.stock,
      formats: 'A3',
      speed: '60 ppm',
      year: 2023,
      created: true,
    });
  }

  const missing = UPDATES.map((u) => u.key).filter((k) => !matched.has(k));
  const out = isWrapped ? { ...raw, products: nextProducts } : nextProducts;
  copyFileSync(filePath, `${filePath}.bak-lista-nuevo-${Date.now()}`);
  writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return { report, missing, count: nextProducts.length };
}

const serverPath = path.join(root, 'server/data/inventory.json');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');

const serverRes = processFile(serverPath, { createMissing: true });
const catalogRes = processFile(catalogPath, { createMissing: true });

console.log(
  JSON.stringify(
    {
      server: {
        count: serverRes.count,
        missing: serverRes.missing,
        rows: serverRes.report,
      },
      catalog: {
        count: catalogRes.count,
        missing: catalogRes.missing,
        rows: catalogRes.report,
      },
    },
    null,
    2,
  ),
);
