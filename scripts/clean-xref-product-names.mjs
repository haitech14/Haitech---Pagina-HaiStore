/**
 * Limpia nombres con [XREF TO CODIGO]: mueve el código a `code` con « / »,
 * quita EXP y deduplica PCDU/PCU. Persiste en inventory.json (+ catálogo si existe).
 *
 * Uso: node scripts/clean-xref-product-names.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { resolveXrefProductFields } from '../shared/inventory-product-name.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = [
  path.join(ROOT, 'server', 'data', 'inventory.json'),
  path.join(ROOT, 'src', 'data', 'inventory-catalog.json'),
  path.join(ROOT, 'public', 'catalog', 'inventory-index.json'),
];

function loadProducts(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (Array.isArray(raw)) return { kind: 'array', data: raw, products: raw };
  if (Array.isArray(raw?.products)) return { kind: 'object', data: raw, products: raw.products };
  return null;
}

function saveProducts(filePath, loaded) {
  if (loaded.kind === 'array') {
    fs.writeFileSync(filePath, `${JSON.stringify(loaded.products, null, 2)}\n`, 'utf8');
    return;
  }
  fs.writeFileSync(
    filePath,
    `${JSON.stringify({ ...loaded.data, products: loaded.products }, null, 2)}\n`,
    'utf8',
  );
}

function cleanProduct(product) {
  const beforeName = String(product.name ?? '');
  const beforeCode = String(product.code ?? '');
  if (
    !/\[xref\s+to\s+/i.test(beforeName) &&
    !/:EXP\b/i.test(beforeName) &&
    !(/\bPCDU\b/i.test(beforeName) && (beforeName.match(/\bPCDU\b/gi) || []).length > 1) &&
    !(/\bPCU\b/i.test(beforeName) && (beforeName.match(/\bPCU\b/gi) || []).length > 1)
  ) {
    return { product, changed: false };
  }

  const resolved = resolveXrefProductFields({
    name: beforeName,
    code: beforeCode,
  });

  const next = {
    ...product,
    name: resolved.name || product.name,
    ...(resolved.code ? { code: resolved.code } : {}),
  };

  const changed =
    String(next.name) !== beforeName || String(next.code ?? '') !== beforeCode;
  return { product: next, changed };
}

let totalChanged = 0;

for (const filePath of PATHS) {
  const loaded = loadProducts(filePath);
  if (!loaded) {
    console.log(`skip (missing): ${path.relative(ROOT, filePath)}`);
    continue;
  }

  let changed = 0;
  loaded.products = loaded.products.map((product) => {
    const result = cleanProduct(product);
    if (result.changed) changed += 1;
    return result.product;
  });

  if (changed > 0) {
    const bak = `${filePath}.bak-xref-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`;
    fs.copyFileSync(filePath, bak);
    saveProducts(filePath, loaded);
    console.log(`updated ${changed} in ${path.relative(ROOT, filePath)} (bak: ${path.basename(bak)})`);
    totalChanged += changed;
  } else {
    console.log(`no changes: ${path.relative(ROOT, filePath)}`);
  }
}

console.log(`done. products cleaned across files: ${totalChanged}`);
