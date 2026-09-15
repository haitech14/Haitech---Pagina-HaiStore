/**
 * Alinea seminuevos a lista comercial (precio técnico + stock ITM).
 * Variantes: ficha sin detalle = base; filas con nota = variantes.
 * Escribe inventario local y upserta las fichas tocadas en Supabase.
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

import { migrateInventoryProduct } from '../server/lib/inventory-store.js';
import { buildSupabaseProductRow } from '../server/lib/product-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const CAT_MF = 'Multifuncionales, Multifuncionales Seminuevas';
const CAT_LASER = 'Impresoras Laser Seminuevas';
const CAT_PLOT = 'Formato Ancho, Formato Ancho Seminuevos';
const CAT_ACC = 'Accesorios, Accesorios Seminuevos';
const CAT_PC = 'Computadoras y Laptop, Computadoras Seminuevas';
const CAT_LAPTOP = 'Computadoras y Laptop, Laptops Seminuevas';
const CAT_MONITOR = 'Computadoras y Laptop, Monitores';

const NEW_IDS = {
  im550Std: 'a550f001-7c3e-4a91-8b12-1d2e3f4a5501',
  im430Std: 'a430f001-7c3e-4a91-8b12-1d2e3f4a4301',
  mp305Sn: 'a3050001-7c3e-4a91-8b12-1d2e3f4a0305',
  cw2200Sn: 'a0c22000-7c3e-4a91-8b12-1d2e3f4a2200',
  muebleMp501: 'a0acc501-7c3e-4a91-8b12-1d2e3f4a0501',
  muebleIm550: 'a0acc550-7c3e-4a91-8b12-1d2e3f4a0550',
  cassIm550: 'a0acc552-7c3e-4a91-8b12-1d2e3f4a0c55',
  monitorDell: 'a0d0e185-7c3e-4a91-8b12-1d2e3f4a0d18',
};

/** @type {{ id: string; tecnico: number; stock: number; name?: string; category?: string; variantNote?: string; voltage?: string; modelLabel?: string }[]} */
const UPDATES = [
  { id: '452b7860-4bc7-4b89-ba43-41e94158686d', tecnico: 119, stock: 8, category: CAT_MF },
  { id: '393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce', tecnico: 139, stock: 10, category: CAT_MF },
  { id: '371c5e40-c823-4db1-b36c-895ae1fb53e1', tecnico: 259, stock: 1, category: CAT_MF },
  {
    id: '189620fe-a5e5-4526-a399-8aa6a308bd1d',
    tecnico: 329,
    stock: 6,
    category: CAT_MF,
    variantNote: 'U. Imagen nueva P502',
    voltage: '220V',
    modelLabel: 'IM 430F',
  },
  {
    id: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
    tecnico: 349,
    stock: 20,
    category: CAT_MF,
    variantNote: 'Ligero Punto',
    voltage: '220V',
    modelLabel: 'IM 550F',
  },
  {
    id: 'a4be1850-48ac-40fd-8962-14c00bec5e59',
    tecnico: 349,
    stock: 0,
    category: CAT_MF,
    variantNote: 'Ligero Punto',
    voltage: '110V',
    modelLabel: 'IM 550F',
  },
  {
    id: '9a955212-f712-4a2e-acf7-f03b059f7c98',
    tecnico: 469,
    stock: 15,
    category: CAT_MF,
    variantNote: 'Cilindro y cuchilla nueva',
    voltage: '220V',
    modelLabel: 'IM 550F',
  },
  {
    id: '1f34bfe4-95be-45c4-be3e-37a740fee9b9',
    tecnico: 469,
    stock: 0,
    category: CAT_MF,
    variantNote: 'Cilindro y cuchilla nueva',
    voltage: '110V',
    modelLabel: 'IM 550F',
  },
  {
    id: 'fd51b686-5191-4fa0-8d41-9f13527467cd',
    tecnico: 399,
    stock: 10,
    category: CAT_MF,
    voltage: '220V',
    modelLabel: 'IM 600F',
  },
  {
    id: 'ae1904f7-4a13-4076-802a-4d917a8471aa',
    tecnico: 399,
    stock: 0,
    category: CAT_MF,
    voltage: '110V',
    modelLabel: 'IM 600F',
  },
  { id: 'e392ea82-ebec-461f-8361-a81359bace28', tecnico: 679, stock: 1, category: CAT_MF },
  { id: '9b94a5c0-f07d-42d6-bf0a-0a08afb7812c', tecnico: 479, stock: 2, category: CAT_MF },
  { id: 'ad23e3ac-84c6-4a54-9d84-64bf6990c418', tecnico: 499, stock: 1, category: CAT_MF },
  { id: 'd3931df1-8564-4e5f-b8eb-b6e9759879a2', tecnico: 599, stock: 1, category: CAT_MF },
  { id: '46b85626-5927-4442-83ec-104c52e6a5e1', tecnico: 759, stock: 2, category: CAT_MF },
  { id: 'ee249761-a942-4397-8170-ee156acd06cf', tecnico: 759, stock: 0, category: CAT_MF },
  { id: 'bdf63599-9741-4b7b-9168-77d49b29def3', tecnico: 2150, stock: 3, category: CAT_MF },
  { id: '63c1beb6-9263-4680-87e2-141c72b44fd1', tecnico: 2499, stock: 2, category: CAT_MF },
  {
    id: '4950b07c-50aa-4884-9e40-e7c9cd1362cb',
    tecnico: 369,
    stock: 1,
    category: CAT_MF,
    voltage: '220V',
    modelLabel: 'IM C300F',
  },
  { id: '03b408ff-0b06-4ec5-90ed-94dcb40fd67c', tecnico: 369, stock: 0, category: CAT_MF, modelLabel: 'IM C300F' },
  {
    id: 'b0811a6f-0f94-4bea-8804-3f7dd0d28a1c',
    tecnico: 389,
    stock: 21,
    category: CAT_MF,
    voltage: '120V',
    modelLabel: 'IM C400F',
  },
  {
    id: 'a853cd99-17e7-445a-a6b2-4f527753db6f',
    tecnico: 389,
    stock: 0,
    category: CAT_MF,
    voltage: '220V',
    modelLabel: 'IM C400F',
  },
  { id: 'dd5efa36-73f6-4241-b2ad-6e74ef058733', tecnico: 389, stock: 0, category: CAT_MF, modelLabel: 'IM C400F' },
  {
    id: 'b06406c6-945c-4107-89f4-c35de3a33544',
    tecnico: 599,
    stock: 2,
    category: CAT_MF,
    variantNote: 'Estándar',
    modelLabel: 'IM C2000',
  },
  { id: '7613294c-20ec-4576-8cef-3eaf75ba5fee', tecnico: 599, stock: 0, category: CAT_MF, modelLabel: 'IM C2000' },
  {
    id: '9e77a73a-753a-4e28-859b-68fe7cba5e0e',
    tecnico: 599,
    stock: 0,
    category: CAT_MF,
    variantNote: 'Cilindro, cuchilla, rodillo carga',
    modelLabel: 'IM C2000',
  },
  {
    id: 'dbd6ad0b-ee55-4fae-82e8-83009bd88e94',
    tecnico: 599,
    stock: 0,
    category: CAT_MF,
    variantNote: 'Cilindro, cuchilla, rodillo carga',
    modelLabel: 'IM C2000',
  },
  { id: 'c54ea344-0162-42eb-96be-333014d14186', tecnico: 649, stock: 1, category: CAT_MF, modelLabel: 'IM C2500' },
  { id: '44413e3b-a3ef-4644-8eed-e550168ae9d8', tecnico: 739, stock: 9, category: CAT_MF },
  { id: '647c7762-732c-427d-9e66-34670efb5b93', tecnico: 889, stock: 1, category: CAT_MF, modelLabel: 'IM C3500' },
  {
    id: '6490d3d9-bfd0-4a48-82c4-dadca949c8f1',
    tecnico: 999,
    stock: 7,
    category: CAT_MF,
    voltage: '120V',
    modelLabel: 'IM C4500',
  },
  { id: 'caf19a37-c3e7-4d5c-b3da-91aef5a5cd15', tecnico: 999, stock: 0, category: CAT_MF, modelLabel: 'IM C4500' },
  {
    id: '45207219-5a92-4c59-b95a-7e5fe66c4a2d',
    tecnico: 679,
    stock: 1,
    category: CAT_MF,
    variantNote: 'Cilindro Mg, cuchilla, 3 rod. carga',
    modelLabel: 'MP C2504',
  },
  { id: 'ec2eeb41-3af8-4f81-ab78-fa92ec052e04', tecnico: 599, stock: 1, category: CAT_MF },
  { id: '5c0405f3-d580-49de-97cf-17b4e4a70fac', tecnico: 639, stock: 1, category: CAT_MF },
  { id: 'fed039b4-21e2-48cd-8946-7348d470dc60', tecnico: 119, stock: 5, category: CAT_MF },
  { id: '85a313f0-5b40-4325-979f-6d7a2c7d28e9', tecnico: 2490, stock: 1, category: CAT_MF },
  { id: '29176ea7-f14a-4347-b0ed-babb9dac9b3b', tecnico: 59, stock: 18, category: CAT_LASER },
  {
    id: 'dd031da8-d2cd-4219-b582-c97514e144c9',
    tecnico: 132,
    stock: 1,
    category: CAT_LASER,
    variantNote: 'Ligero Punto',
  },
  { id: 'cecd6a34-d452-430c-9c24-9abe58a6c696', tecnico: 189, stock: 2, category: CAT_LASER },
  { id: 'f6b89497-893b-4747-9530-e3b5fa42c74c', tecnico: 99, stock: 2, category: CAT_LASER },
  { id: '550c6815-7688-41f8-bb64-c362322d7f9d', tecnico: 359, stock: 2, category: CAT_LASER },
  {
    id: 'a194ae64-5b89-4522-b15f-0cfe4a94b921',
    tecnico: 189,
    stock: 2,
    category: CAT_LAPTOP,
    name: 'Laptop Seminueva DELL Core i5 6ta (teclado nuevo)',
  },
  {
    id: '553d4bd3-9412-4206-91e8-ad0034eb714d',
    tecnico: 129,
    stock: 40,
    category: CAT_PC,
    name: 'Computadora Seminueva PC Optiplex i5 7040 8GB 6ta 1T (USB 6)',
  },
  {
    id: '2262cc21-57d8-4f06-afb0-f5f6e766d1e1',
    tecnico: 165,
    stock: 10,
    category: CAT_PC,
    name: 'Computadora Seminueva PC Optiplex Micro i5 3070 8GB 9na 500GB (1T USB 6)',
  },
];

const VARIANT_GROUPS = [
  [
    NEW_IDS.im550Std,
    '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
    'a4be1850-48ac-40fd-8962-14c00bec5e59',
    '9a955212-f712-4a2e-acf7-f03b059f7c98',
    '1f34bfe4-95be-45c4-be3e-37a740fee9b9',
  ],
  [NEW_IDS.im430Std, '189620fe-a5e5-4526-a399-8aa6a308bd1d'],
  ['fd51b686-5191-4fa0-8d41-9f13527467cd', 'ae1904f7-4a13-4076-802a-4d917a8471aa'],
  ['4950b07c-50aa-4884-9e40-e7c9cd1362cb', '03b408ff-0b06-4ec5-90ed-94dcb40fd67c'],
  [
    'b0811a6f-0f94-4bea-8804-3f7dd0d28a1c',
    'a853cd99-17e7-445a-a6b2-4f527753db6f',
    'dd5efa36-73f6-4241-b2ad-6e74ef058733',
  ],
  [
    'b06406c6-945c-4107-89f4-c35de3a33544',
    '7613294c-20ec-4576-8cef-3eaf75ba5fee',
    '9e77a73a-753a-4e28-859b-68fe7cba5e0e',
    'dbd6ad0b-ee55-4fae-82e8-83009bd88e94',
  ],
  ['6490d3d9-bfd0-4a48-82c4-dadca949c8f1', 'caf19a37-c3e7-4d5c-b3da-91aef5a5cd15'],
  ['46b85626-5927-4442-83ec-104c52e6a5e1', 'ee249761-a942-4397-8170-ee156acd06cf'],
];

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

function upsertAttr(attributes, name, value) {
  const next = Array.isArray(attributes) ? [...attributes] : [];
  const idx = next.findIndex((a) => String(a.name || '').trim().toLowerCase() === name.toLowerCase());
  const row = {
    id: idx >= 0 ? next[idx].id : randomUUID(),
    name,
    value: String(value),
  };
  if (idx >= 0) next[idx] = { ...next[idx], ...row };
  else next.push(row);
  return next;
}

function applyStock(product, stock) {
  const warehouses = Array.isArray(product.stock_by_warehouse)
    ? product.stock_by_warehouse.map((row) => ({ ...row }))
    : [];
  if (warehouses.length === 0) {
    return {
      stock,
      stock_by_warehouse: [{ warehouse_id: 'operativo', quantity: stock }],
    };
  }
  const hasOperativo = warehouses.some((row) => row.warehouse_id === 'operativo');
  const next = warehouses.map((row, index) => {
    if (hasOperativo) {
      return { ...row, quantity: row.warehouse_id === 'operativo' ? stock : 0 };
    }
    return { ...row, quantity: index === 0 ? stock : 0 };
  });
  return { stock, stock_by_warehouse: next };
}

function buildSlug(name, id) {
  const slugBase = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${slugBase}-${id.slice(0, 12)}`;
}

function createFromTemplate(template, spec) {
  const prices = scalePrices(template?.prices, spec.tecnico);
  const stockFields = applyStock({ stock_by_warehouse: template?.stock_by_warehouse }, spec.stock);
  let attributes = Array.isArray(template?.attributes) ? [...template.attributes] : [];
  if (spec.variantNote) attributes = upsertAttr(attributes, 'Variante', spec.variantNote);
  if (spec.voltage) attributes = upsertAttr(attributes, 'Voltaje', spec.voltage);
  if (spec.modelLabel) attributes = upsertAttr(attributes, 'Modelo de equipo', spec.modelLabel);
  if (spec.color) attributes = upsertAttr(attributes, 'Color', spec.color);
  if (spec.paper) attributes = upsertAttr(attributes, 'Formato papel', spec.paper);

  return {
    ...template,
    id: spec.id,
    code: spec.code,
    name: spec.name,
    description: spec.description || spec.name,
    ...stockFields,
    category: spec.category,
    brand: spec.brand || template?.brand || 'Ricoh',
    image_url: spec.image || template?.image_url || null,
    gallery: Array.isArray(template?.gallery) ? [...template.gallery] : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 1200) + 1,
    slug: buildSlug(spec.name, spec.id),
    prices,
    attributes,
    variant_product_ids: [],
    status: 'activa',
    is_featured: false,
  };
}

function applyUpdate(product, rule) {
  let attributes = Array.isArray(product.attributes) ? [...product.attributes] : [];
  if (rule.variantNote) attributes = upsertAttr(attributes, 'Variante', rule.variantNote);
  if (rule.voltage) attributes = upsertAttr(attributes, 'Voltaje', rule.voltage);
  if (rule.modelLabel) attributes = upsertAttr(attributes, 'Modelo de equipo', rule.modelLabel);
  return {
    ...product,
    ...(rule.name ? { name: rule.name } : {}),
    ...(rule.category ? { category: rule.category } : {}),
    prices: scalePrices(product.prices, rule.tecnico),
    ...applyStock(product, rule.stock),
    attributes,
    updated_at: new Date().toISOString(),
    status: product.status === 'inactiva' ? 'activa' : product.status || 'activa',
  };
}

function linkVariants(products, groups) {
  const byId = new Map(products.map((p) => [p.id, p]));
  for (const ids of groups) {
    const existing = ids.filter((id) => byId.has(id));
    if (existing.length < 2) continue;
    for (const id of existing) {
      byId.get(id).variant_product_ids = existing.filter((other) => other !== id);
    }
  }
  return products.map((p) => byId.get(p.id) ?? p);
}

function processFile(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const isWrapped = Boolean(raw.products);
  let products = [...(raw.products || raw)];
  const byId = new Map(products.map((p) => [p.id, p]));
  const report = [];

  const creates = [
    {
      id: NEW_IDS.im550Std,
      templateId: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
      code: '418460-CP908Y-STD',
      name: 'Impresora Multifuncional Seminueva RICOH IM 550F 220V',
      tecnico: 379,
      stock: 45,
      category: CAT_MF,
      variantNote: 'Estándar',
      voltage: '220V',
      modelLabel: 'IM 550F',
    },
    {
      id: NEW_IDS.im430Std,
      templateId: '189620fe-a5e5-4526-a399-8aa6a308bd1d',
      code: '423509-STD',
      name: 'Impresora Multifuncional Seminueva RICOH IM 430F 220V',
      tecnico: 229,
      stock: 12,
      category: CAT_MF,
      variantNote: 'Estándar',
      voltage: '220V',
      modelLabel: 'IM 430F',
    },
    {
      id: NEW_IDS.mp305Sn,
      templateId: 'ab878d89-61e0-4e51-a941-03455e1da407',
      code: 'SEMI-MP305PLUS',
      name: 'Impresora Multifuncional B/N Seminueva RICOH MP 305+',
      tecnico: 179,
      stock: 1,
      category: CAT_MF,
      modelLabel: 'MP 305+',
      color: 'B/N',
      paper: 'A3',
    },
    {
      id: NEW_IDS.cw2200Sn,
      templateId: '4f977d63-4903-4b1d-aff0-b2a39e7242d8',
      code: 'SEMI-MP-CW2200-120V',
      name: 'Plotter Seminuevo RICOH MP CW2200 120V',
      tecnico: 2999,
      stock: 1,
      category: CAT_PLOT,
      voltage: '120V',
      modelLabel: 'MP CW2200',
      paper: 'Ancho',
      color: 'Color',
      image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    },
    {
      id: NEW_IDS.muebleMp501,
      templateId: '371c5e40-c823-4db1-b36c-895ae1fb53e1',
      code: 'MUEBLE-MP501-SN',
      name: 'Mueble Seminuevo MP 501 (gris) y melamina',
      tecnico: 20,
      stock: 5,
      category: CAT_ACC,
      modelLabel: 'MP 501',
      brand: 'Ricoh',
    },
    {
      id: NEW_IDS.muebleIm550,
      templateId: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
      code: 'MUEBLE-IM550-SN',
      name: 'Mueble Seminuevo IM 550',
      tecnico: 25,
      stock: 15,
      category: CAT_ACC,
      modelLabel: 'IM 550F',
    },
    {
      id: NEW_IDS.cassIm550,
      templateId: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
      code: 'CASS-IM550-SN',
      name: '2da Casetera Seminueva IM 550',
      tecnico: 15,
      stock: 21,
      category: CAT_ACC,
      modelLabel: 'IM 550F',
    },
    {
      id: NEW_IDS.monitorDell,
      templateId: '553d4bd3-9412-4206-91e8-ad0034eb714d',
      code: 'MON-DELL-185-SN',
      name: 'Monitor Seminuevo DELL 18.5',
      tecnico: 39,
      stock: 38,
      category: CAT_MONITOR,
      brand: 'DELL',
      image: '/categories/monitores.png',
    },
  ];

  for (const spec of creates) {
    const existingIdx = products.findIndex((p) => p.id === spec.id || p.code === spec.code);
    const template = byId.get(spec.templateId);
    if (!template && existingIdx < 0) {
      report.push({ action: 'skip-no-template', id: spec.id, name: spec.name });
      continue;
    }
    const created = createFromTemplate(template || products[existingIdx], spec);
    if (existingIdx >= 0) {
      const prev = products[existingIdx];
      products[existingIdx] = {
        ...created,
        id: prev.id,
        slug: prev.slug || created.slug,
        created_at: prev.created_at || created.created_at,
      };
      report.push({ action: 'update-create', id: prev.id, name: spec.name, tecnico: spec.tecnico, stock: spec.stock });
    } else {
      products.push(created);
      byId.set(created.id, created);
      report.push({ action: 'create', id: created.id, name: spec.name, tecnico: spec.tecnico, stock: spec.stock });
    }
  }

  products = products.map((product) => {
    const rule = UPDATES.find((u) => u.id === product.id);
    if (!rule) return product;
    const updated = applyUpdate(product, rule);
    report.push({
      action: 'update',
      id: product.id,
      name: updated.name,
      tecnico: updated.prices.tecnico,
      stock: updated.stock,
    });
    return updated;
  });

  products = linkVariants(products, VARIANT_GROUPS);

  const out = isWrapped ? { ...raw, products } : products;
  writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return { report, products, count: products.length };
}

function touchedIds() {
  return new Set([
    ...UPDATES.map((u) => u.id),
    ...Object.values(NEW_IDS),
    ...VARIANT_GROUPS.flat(),
  ]);
}

async function upsertSupabase(products) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.warn('Supabase: faltan credenciales, se omite upsert remoto.');
    return;
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const ids = touchedIds();
  const rows = products
    .filter((p) => ids.has(p.id))
    .map((p) => buildSupabaseProductRow(migrateInventoryProduct(p)));

  const probe = await supabase.from('products').select('id').limit(1);
  if (probe.error) {
    console.warn(`Supabase products no disponible (${probe.error.message}). Inventario local sí quedó actualizado.`);
    return;
  }

  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(`Supabase upsert: ${error.message}`);
  }
  console.log(`Supabase: ${rows.length} fichas upsertadas.`);
}

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const serverPath = path.join(root, 'server/data/inventory.json');

const catalogRes = processFile(catalogPath);
const serverRes = existsSync(serverPath) ? processFile(serverPath) : { report: [], products: [] };

console.log(`catalog: ${catalogRes.report.length} operaciones, ${catalogRes.count} productos`);
console.log(`server:  ${serverRes.report.length} operaciones`);
for (const row of catalogRes.report) {
  console.log(`  ${row.action} ${row.id?.slice(0, 8)} ${row.name ?? ''} t=${row.tecnico ?? ''} s=${row.stock ?? ''}`);
}

await upsertSupabase(catalogRes.products);
