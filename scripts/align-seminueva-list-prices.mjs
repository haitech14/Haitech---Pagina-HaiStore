/**
 * Alinea seminuevas a lista física julio 2026:
 * - Técnico = precio lista
 * - Stock según lista
 * - Variantes IM 550 / IM C2000 con código distinto
 * - Crea IM 2500 e IM 4000 seminuevas (A3, imagen del equipo nuevo)
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** @type {{ key: string; id?: string; match?: (p: object) => boolean; tecnico: number; stock: number; name?: string; code?: string }} */
const UPDATES = [
  { key: 'm320', id: '5667a537-2ef8-4b25-b376-a61afe57ebf9', tecnico: 119, stock: 9 },
  { key: 'im430', id: '189620fe-a5e5-4526-a399-8aa6a308bd1d', tecnico: 329, stock: 8 },
  {
    key: 'im550_lp',
    id: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
    tecnico: 369,
    stock: 6,
    name: 'Impresora Multifuncional Seminueva RICOH IM 550F Ligero Punto 220V',
    code: '418460-CP908Y-LP',
  },
  { key: 'im600', id: 'ae1904f7-4a13-4076-802a-4d917a8471aa', tecnico: 439, stock: 5 },
  { key: 'im7000', id: '63c1beb6-9263-4680-87e2-141c72b44fd1', tecnico: 2649, stock: 1 },
  { key: 'sp4510', id: '452b7860-4bc7-4b89-ba43-41e94158686d', tecnico: 119, stock: 10 },
  { key: 'mp402', id: '393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce', tecnico: 139, stock: 11 },
  { key: 'mp501', id: '371c5e40-c823-4db1-b36c-895ae1fb53e1', tecnico: 249, stock: 1 },
  { key: 'mp3055', id: 'ad23e3ac-84c6-4a54-9d84-64bf6990c418', tecnico: 549, stock: 1 },
  { key: 'mp4055', id: 'd3931df1-8564-4e5f-b8eb-b6e9759879a2', tecnico: 649, stock: 1 },
  { key: 'mp5055', id: '46b85626-5927-4442-83ec-104c52e6a5e1', tecnico: 759, stock: 3 },
  { key: 'imc400', id: 'b0811a6f-0f94-4bea-8804-3f7dd0d28a1c', tecnico: 429, stock: 4 },
  { key: 'imc2000', id: 'b06406c6-945c-4107-89f4-c35de3a33544', tecnico: 689, stock: 2 },
  { key: 'imc3000', id: '44413e3b-a3ef-4644-8eed-e550168ae9d8', tecnico: 799, stock: 2 },
  { key: 'imc4500', id: '6490d3d9-bfd0-4a48-82c4-dadca949c8f1', tecnico: 1149, stock: 2 },
  { key: 'mpc2004', id: '2ae814f0-ec1e-41cb-b557-20ebe3a31094', tecnico: 699, stock: 2 },
  { key: 'mpc3004', id: 'ec2eeb41-3af8-4f81-ab78-fa92ec052e04', tecnico: 669, stock: 3 },
  { key: 'mc250', id: '58763abe-b3ad-4d63-8798-d116c1fb1dcb', tecnico: 159, stock: 4 },
  { key: 'mpc307', id: '18d27357-57ca-4059-960e-41521f29c013', tecnico: 319, stock: 1 },
  { key: 'spc840', id: '550c6815-7688-41f8-bb64-c362322d7f9d', tecnico: 379, stock: 8 },
];

/** @type {{ key: string; templateId: string; exists?: (products: object[]) => boolean; product: object }} */
const CREATE = [
  {
    key: 'im550_cil',
    templateId: '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
    exists: (products) =>
      products.some(
        (p) =>
          /seminueva/i.test(p.name || '') &&
          /IM\s*550/i.test(p.name || '') &&
          /cilindro|cuchilla/i.test(p.name || ''),
      ),
    product: {
      code: '418460-CP908Y-CPCIL',
      name: 'Impresora Multifuncional Seminueva RICOH IM 550F Cilindro y cuchilla nueva 220V',
      tecnico: 490,
      stock: 3,
      modelLabel: 'IM 550F',
      variantNote: 'Cilindro y cuchilla nueva',
      formats: ['A4'],
    },
  },
  {
    key: 'imc2000_cil',
    templateId: 'b06406c6-945c-4107-89f4-c35de3a33544',
    exists: (products) =>
      products.some(
        (p) =>
          /seminueva/i.test(p.name || '') &&
          /IM\s*C2000/i.test(p.name || '') &&
          /cilindro|rod/i.test(p.name || ''),
      ),
    product: {
      code: '418276-CPCIL-ROD',
      name: 'Impresora Multifuncional Seminueva RICOH IM C2000 (cilindro, cuchilla, rod. carga) 220V',
      tecnico: 719,
      stock: 2,
      modelLabel: 'IM C2000',
      variantNote: 'Cilindro, cuchilla, rodillo carga',
      formats: ['A3'],
    },
  },
  {
    key: 'im2500_sn',
    templateId: '196857c6-738b-4162-90aa-50dee575bcd8',
    exists: (products) =>
      products.some((p) => /seminueva/i.test(p.name || '') && /\bIM\s*2500\b/i.test(p.name || '')),
    product: {
      code: 'SEMI-IM2500-220V',
      name: 'Impresora Multifuncional Seminueva RICOH IM 2500 220V',
      tecnico: 679,
      stock: 1,
      modelLabel: 'IM 2500',
      formats: ['A3'],
      speed: '25 ppm',
      year: 2022,
    },
  },
  {
    key: 'im4000_sn',
    templateId: '40c36a2a-794e-41aa-b075-d855c218bf6f',
    exists: (products) =>
      products.some((p) => /seminueva/i.test(p.name || '') && /\bIM\s*4000\b/i.test(p.name || '')),
    product: {
      code: 'SEMI-IM4000-120V',
      name: 'Impresora Multifuncional Seminueva RICOH IM 4000 (120V) 220V',
      tecnico: 1100,
      stock: 1,
      modelLabel: 'IM 4000',
      formats: ['A3'],
      speed: '40 ppm',
      year: 2023,
    },
  },
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

function applyFormatAttrs(attributes, formats) {
  const next = Array.isArray(attributes) ? [...attributes] : [];
  const formatoPapel = formats.length === 2 ? 'A4 / A3' : formats[0];
  return upsertAttr(upsertAttr(next, 'Formato papel', formatoPapel), formats[0], 'Sí');
}

function applyStock(product, stock) {
  let next = { ...product, stock };
  if (Array.isArray(product.stock_by_warehouse) && product.stock_by_warehouse.length > 0) {
    next.stock_by_warehouse = product.stock_by_warehouse.map((row, index) =>
      index === 0 ? { ...row, quantity: stock } : { ...row, quantity: 0 },
    );
  } else {
    next.stock_by_warehouse = [{ warehouse_id: '1931', quantity: stock }];
  }
  return next;
}

function applyRule(product, rule) {
  const prices = scalePrices(product.prices, rule.tecnico);
  let next = {
    ...product,
    prices,
    ...(rule.name ? { name: rule.name } : {}),
    ...(rule.code ? { code: rule.code } : {}),
  };
  if (rule.variantNote) {
    next.attributes = upsertAttr(product.attributes, 'Variante', rule.variantNote);
  }
  next = applyStock(next, rule.stock);
  return next;
}

function buildSeminuevaFromTemplate(template, spec) {
  const id = randomUUID();
  const slugBase = spec.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  const slug = `${slugBase}-${id.slice(0, 12)}`;
  const tecnico = spec.tecnico;
  const prices = scalePrices(template?.prices, tecnico);

  let attributes = applyFormatAttrs(template?.attributes, spec.formats || ['A3']);
  const templateColor = template?.attributes?.find((a) => a.name === 'Color')?.value;
  const isColorModel = /IM\s*C|M\s*C|MP\s*C|SP\s*C/i.test(spec.name);
  attributes = upsertAttr(attributes, 'Color', templateColor || (isColorModel ? 'Color' : 'B/N'));
  if (spec.modelLabel) attributes = upsertAttr(attributes, 'Modelo de equipo', spec.modelLabel);
  if (spec.variantNote) attributes = upsertAttr(attributes, 'Variante', spec.variantNote);
  if (spec.speed) attributes = upsertAttr(attributes, 'Velocidad', spec.speed);
  if (spec.year) attributes = upsertAttr(attributes, 'Año', String(spec.year));
  if ((spec.formats || []).includes('A3')) attributes = upsertAttr(attributes, 'A3', 'Sí');

  const imageFromTemplate = template?.image_url || '/categories/multifuncionales.png';
  const galleryFromTemplate = Array.isArray(template?.gallery) ? [...template.gallery] : [imageFromTemplate];

  let product = {
    id,
    code: spec.code,
    name: spec.name,
    description: template?.description || spec.name,
    currency: 'USD',
    stock: spec.stock,
    category: 'Multifuncionales, Multifuncionales Seminuevas',
    brand: 'Ricoh',
    image_url: imageFromTemplate,
    gallery: galleryFromTemplate,
    created_at: new Date().toISOString(),
    sort_order: (template?.sort_order || 1100) + 1,
    slug,
    prices,
    attributes,
  };
  product = applyStock(product, spec.stock);
  return product;
}

function processFile(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const products = raw.products || raw;
  const isWrapped = Boolean(raw.products);
  const report = [];
  const byId = new Map(products.map((p) => [p.id, p]));

  let nextProducts = products.map((product) => {
    const rule = UPDATES.find((u) => u.id === product.id || u.match?.(product));
    if (!rule) return product;
    const updated = applyRule(product, rule);
    report.push({
      key: rule.key,
      action: 'update',
      id: product.id,
      name: updated.name,
      code: updated.code,
      tecnico: updated.prices.tecnico,
      stock: updated.stock,
    });
    return updated;
  });

  for (const spec of CREATE) {
    const existingIdx = nextProducts.findIndex((p) => {
      if (spec.product.code && p.code === spec.product.code) return true;
      return spec.exists([p]);
    });

    if (existingIdx >= 0) {
      const updated = applyRule(
        buildSeminuevaFromTemplate(byId.get(spec.templateId), {
          ...spec.product,
          // preserve id/slug/created_at from existing row
        }),
        spec.product,
      );
      const prev = nextProducts[existingIdx];
      nextProducts[existingIdx] = {
        ...updated,
        id: prev.id,
        slug: prev.slug || updated.slug,
        created_at: prev.created_at || updated.created_at,
        code: spec.product.code,
        name: spec.product.name,
      };
      report.push({
        key: spec.key,
        action: 'update-existing',
        id: prev.id,
        name: spec.product.name,
        code: spec.product.code,
        tecnico: spec.product.tecnico,
        stock: spec.product.stock,
      });
      continue;
    }

    const template = byId.get(spec.templateId);
    if (!template) {
      report.push({ key: spec.key, action: 'skip-no-template', templateId: spec.templateId });
      continue;
    }
    const created = buildSeminuevaFromTemplate(template, spec.product);
    nextProducts.push(created);
    report.push({
      key: spec.key,
      action: 'create',
      id: created.id,
      name: created.name,
      code: created.code,
      tecnico: created.prices.tecnico,
      stock: created.stock,
    });
  }

  const out = isWrapped ? { ...raw, products: nextProducts } : nextProducts;
  copyFileSync(filePath, `${filePath}.bak-lista-seminueva-${Date.now()}`);
  writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return { report, count: nextProducts.length };
}

const serverPath = path.join(root, 'server/data/inventory.json');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');

const serverRes = processFile(serverPath);
const catalogRes = processFile(catalogPath);

console.log(JSON.stringify({ server: serverRes, catalog: catalogRes }, null, 2));
