/**
 * Marca equipos de la lista LAMB con (SPDF) como variante SPDF:
 * - nombre con (SPDF)
 * - Modelo de equipo: "IM XXXX SPDF"
 * - Alimentador (ADF): Doble Scan
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SPDF_LINES = [
  { part: '418846', modelBase: 'IM 4000', modelLabel: 'IM 4000 SPDF' },
  { part: '418847', modelBase: 'IM 5000', modelLabel: 'IM 5000 SPDF' },
  { part: '423796', modelBase: 'IM 6010', modelLabel: 'IM 6010 SPDF' },
];

const ADF_ATTR = 'Alimentador (ADF)';
const MODEL_ATTR = 'Modelo de equipo';

function upsertAttr(attributes, name, value) {
  const list = Array.isArray(attributes) ? [...attributes] : [];
  const idx = list.findIndex(
    (a) => String(a?.name || '').trim().toLowerCase() === name.toLowerCase(),
  );
  const row = {
    id: idx >= 0 && typeof list[idx].id === 'string' ? list[idx].id : randomUUID(),
    name,
    value,
  };
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  return list;
}

function withSpdfInName(name, modelBase) {
  const n = String(name || '').replace(/\s+/g, ' ').trim();
  if (/\(\s*SPDF\s*\)/i.test(n)) return n;
  const cleaned = n.replace(/\s*\(?\s*SPDF\s*\)?/gi, '').replace(/\s+/g, ' ').trim();
  const re = new RegExp(`(${modelBase.replace(/\s+/g, '\\s*')})\\b`, 'i');
  if (re.test(cleaned)) {
    return cleaned.replace(re, '$1 (SPDF)');
  }
  return `${cleaned} (SPDF)`;
}

invalidateInventoryReadCache();
const inventory = await readInventory();
const report = [];

const products = inventory.products.map((product) => {
  const line = SPDF_LINES.find((l) => String(product.code || '') === l.part);
  if (!line) return product;

  let attributes = upsertAttr(product.attributes, MODEL_ATTR, line.modelLabel);
  attributes = upsertAttr(attributes, ADF_ATTR, 'Doble Scan');
  const name = withSpdfInName(product.name, line.modelBase);

  const updated = {
    ...product,
    name,
    attributes,
    updated_at: new Date().toISOString(),
  };
  report.push({
    part: line.part,
    previousName: product.name,
    name: updated.name,
    model: line.modelLabel,
    adf: 'Doble Scan',
  });
  return updated;
});

await writeInventory({ ...inventory, products });

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
if (existsSync(catalogPath)) {
  copyFileSync(catalogPath, `${catalogPath}.bak-spdf-${Date.now()}`);
  const raw = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const byId = new Map(products.map((p) => [p.id, p]));
  const next = (raw.products || []).map((row) => {
    const live = byId.get(row.id);
    if (!live || !SPDF_LINES.some((l) => l.part === String(live.code || ''))) return row;
    return {
      ...row,
      name: live.name,
      attributes: live.attributes,
      updated_at: live.updated_at,
    };
  });
  writeFileSync(
    catalogPath,
    `${JSON.stringify({ ...raw, products: next, warehouses: inventory.warehouses }, null, 2)}\n`,
    'utf8',
  );
}

console.log(JSON.stringify({ updated: report.length, report }, null, 2));
