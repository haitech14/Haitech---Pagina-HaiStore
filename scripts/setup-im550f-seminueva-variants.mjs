/**
 * IM 550F seminueva: renombra C/L.P. → Ligero Punto, crea variantes 110V,
 * vincula variant_product_ids (precio y stock independientes por ficha).
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const LP_220_ID = '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2';
const CIL_220_ID = '9a955212-f712-4a2e-acf7-f03b059f7c98';
const DUPLICATE_CIL_ID = 'f5fee99e-a999-439f-9575-e412734ba225';

/** @type {{ code: string; id?: string; name: string; variantNote: string; voltage: string; tecnico: number; stock: number; templateId: string }} */
const VARIANT_SPECS = [
  {
    code: '418460-CP908Y-LP',
    id: LP_220_ID,
    name: 'Impresora Multifuncional Seminueva RICOH IM 550F Ligero Punto 220V',
    variantNote: 'Ligero Punto',
    voltage: '220V',
    tecnico: 369,
    stock: 106,
    templateId: LP_220_ID,
  },
  {
    code: '418460-CP908Y-LP-110V',
    name: 'Impresora Multifuncional Seminueva RICOH IM 550F Ligero Punto 110V',
    variantNote: 'Ligero Punto',
    voltage: '110V',
    tecnico: 369,
    stock: 0,
    templateId: LP_220_ID,
  },
  {
    code: '418460-CP908Y-CPCIL',
    id: CIL_220_ID,
    name: 'Impresora Multifuncional Seminueva RICOH IM 550F Cilindro y cuchilla nueva 220V',
    variantNote: 'Cilindro y cuchilla nueva',
    voltage: '220V',
    tecnico: 490,
    stock: 3,
    templateId: LP_220_ID,
  },
  {
    code: '418460-CP908Y-CPCIL-110V',
    name: 'Impresora Multifuncional Seminueva RICOH IM 550F Cilindro y cuchilla nueva 110V',
    variantNote: 'Cilindro y cuchilla nueva',
    voltage: '110V',
    tecnico: 490,
    stock: 0,
    templateId: LP_220_ID,
  },
];

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

function scalePrices(prices, newTecnico) {
  const oldT = Number(prices?.tecnico) || newTecnico;
  if (!oldT || oldT === newTecnico) {
    return {
      tecnico: newTecnico,
      mayorista: Math.max(0, Math.round(newTecnico * 0.92)),
      distribuidor: Math.round(newTecnico * 1.07),
      public: Math.round(newTecnico * 3.09),
    };
  }
  const ratio = newTecnico / oldT;
  return {
    tecnico: newTecnico,
    mayorista: Math.round(Number(prices.mayorista ?? oldT) * ratio),
    distribuidor: Math.round(Number(prices.distribuidor ?? oldT) * ratio),
    public: Math.round(Number(prices.public ?? oldT) * ratio),
  };
}

function applyVariantAttrs(product, spec) {
  let attributes = Array.isArray(product.attributes) ? [...product.attributes] : [];
  attributes = upsertAttr(attributes, 'Variante', spec.variantNote);
  attributes = upsertAttr(attributes, 'Voltaje', spec.voltage);
  attributes = upsertAttr(attributes, 'Modelo de equipo', 'IM 550F');
  return attributes;
}

function applyStock(product, stock, preferOperativo) {
  const warehouses = Array.isArray(product.stock_by_warehouse)
    ? product.stock_by_warehouse.map((row) => ({ ...row }))
    : [];
  const hasOperativo = warehouses.some((row) => row.warehouse_id === 'operativo');
  if (warehouses.length === 0) {
    return {
      stock,
      stock_by_warehouse: [
        {
          warehouse_id: preferOperativo ? 'operativo' : '1931',
          quantity: stock,
        },
      ],
    };
  }
  if (hasOperativo && preferOperativo) {
    const next = warehouses.map((row) => ({
      ...row,
      quantity: row.warehouse_id === 'operativo' ? stock : 0,
    }));
    return { stock, stock_by_warehouse: next };
  }
  const next = warehouses.map((row, index) => ({
    ...row,
    quantity: index === 0 ? stock : 0,
  }));
  return { stock, stock_by_warehouse: next };
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
  const prices = scalePrices(template?.prices, spec.tecnico);
  const preferOperativo = spec.code.includes('-LP');
  const stockFields = applyStock({ stock_by_warehouse: template?.stock_by_warehouse }, spec.stock, preferOperativo);

  return {
    id,
    code: spec.code,
    name: spec.name,
    description: template?.description || spec.name,
    currency: 'USD',
    ...stockFields,
    category: 'Multifuncionales, Multifuncionales Seminuevas',
    brand: 'Ricoh',
    image_url: template?.image_url || '/categories/multifuncionales.png',
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 1008) + 1,
    slug: buildSlug(spec.name, id),
    prices,
    attributes: applyVariantAttrs(template, spec),
    purchase_price_usd: template?.purchase_price_usd ?? 0,
    suppliers: template?.suppliers ? [...template.suppliers] : [],
  };
}

function linkVariants(products, ids) {
  const idSet = new Set(ids);
  return products.map((product) => {
    if (!idSet.has(product.id)) return product;
    const siblings = ids.filter((id) => id !== product.id);
    return { ...product, variant_product_ids: siblings };
  });
}

function processFile(filePath, catalogByCode) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const isWrapped = Boolean(raw.products);
  let products = [...(raw.products || raw)];
  const report = [];

  products = products.filter((product) => product.id !== DUPLICATE_CIL_ID);

  const byId = new Map(products.map((p) => [p.id, p]));
  const byCode = new Map(products.map((p) => [String(p.code || '').trim(), p]).filter(([c]) => c));
  const template = byId.get(LP_220_ID);
  if (!template) {
    throw new Error(`Plantilla IM 550F no encontrada (${LP_220_ID}) en ${filePath}`);
  }

  const resolvedIds = [];

  for (const spec of VARIANT_SPECS) {
    let product =
      (spec.id ? byId.get(spec.id) : undefined) ||
      byCode.get(spec.code) ||
      products.find((p) => String(p.code || '').trim() === spec.code);

    if (!product) {
      const catalogMatch = catalogByCode?.get(spec.code);
      product = catalogMatch
        ? { ...createFromTemplate(template, spec), id: catalogMatch.id, slug: catalogMatch.slug }
        : createFromTemplate(template, spec);
      products.push(product);
      byId.set(product.id, product);
      byCode.set(spec.code, product);
      report.push({ action: 'create', code: spec.code, id: product.id, name: spec.name });
    } else {
      const preferOperativo = spec.code.includes('-LP');
      const stockFields = applyStock(product, spec.stock, preferOperativo);
      product = {
        ...product,
        code: spec.code,
        name: spec.name,
        prices: scalePrices(product.prices, spec.tecnico),
        ...stockFields,
        attributes: applyVariantAttrs(product, spec),
        slug: product.slug || buildSlug(spec.name, product.id),
      };
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx >= 0) products[idx] = product;
      byId.set(product.id, product);
      byCode.set(spec.code, product);
      report.push({ action: 'update', code: spec.code, id: product.id, name: spec.name });
    }

    resolvedIds.push(product.id);
  }

  products = linkVariants(products, resolvedIds);

  if (isWrapped) {
    writeFileSync(filePath, `${JSON.stringify({ ...raw, products }, null, 2)}\n`, 'utf8');
  } else {
    writeFileSync(filePath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
  }

  return { filePath, report, ids: resolvedIds };
}

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const catalogRaw = JSON.parse(readFileSync(catalogPath, 'utf8'));
const catalogProducts = catalogRaw.products || catalogRaw;
const catalogByCode = new Map(
  VARIANT_SPECS.map((spec) => spec.code)
    .map((code) => {
      const product = catalogProducts.find((p) => String(p.code || '').trim() === code);
      return product ? /** @type {const} */ ([code, product]) : null;
    })
    .filter(Boolean),
);

const targets = [
  catalogPath,
  path.join(root, 'server/data/inventory.json'),
];

for (const filePath of targets) {
  const result = processFile(filePath, catalogByCode);
  console.log(`\n${filePath}`);
  for (const row of result.report) {
    console.log(`  ${row.action} ${row.code} → ${row.name}`);
  }
  console.log(`  variant_product_ids: ${result.ids.length} fichas vinculadas`);
}
