/**
 * Quita el término "HaiPrint" de nombres, marcas, descripciones, atributos y proveedores.
 * No modifica id, slug ni rutas de imagen.
 *
 * Uso: node scripts/strip-haiprint-from-products.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');

function hasHaiPrint(value) {
  return typeof value === 'string' && /\bhaiprint\b/i.test(value);
}

function stripHaiPrintText(value) {
  if (!hasHaiPrint(value)) return value;
  return value
    .replace(/\bhaiprint\b/gi, ' ')
    .replace(/\s*[-–—·|/]\s*(?=[-–—·|/]|$)/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—·|/]+|[\s\-–—·|/]+$/g, '')
    .trim();
}

function isHaiPrintOnly(value) {
  return hasHaiPrint(value) && value.replace(/\bhaiprint\b/gi, '').trim() === '';
}

function cleanProduct(product) {
  const changes = [];
  const next = { ...product };

  for (const field of ['name', 'description', 'title', 'tagline']) {
    if (typeof next[field] !== 'string') continue;
    const cleaned = stripHaiPrintText(next[field]);
    if (cleaned !== next[field]) {
      next[field] = cleaned;
      changes.push(field);
    }
  }

  if (hasHaiPrint(next.brand)) {
    next.brand = isHaiPrintOnly(next.brand) ? '' : stripHaiPrintText(next.brand);
    changes.push('brand');
  }

  if (Array.isArray(next.attributes)) {
    let attrsChanged = false;
    const attrs = [];
    for (const attr of next.attributes) {
      if (!attr || typeof attr !== 'object') {
        attrs.push(attr);
        continue;
      }
      const cleaned = { ...attr };
      if (hasHaiPrint(cleaned.value)) {
        if (isHaiPrintOnly(cleaned.value)) {
          // Quitar atributo cuyo valor era solo HaiPrint (p. ej. Proveedor).
          attrsChanged = true;
          continue;
        }
        cleaned.value = stripHaiPrintText(cleaned.value);
        attrsChanged = true;
      }
      if (hasHaiPrint(cleaned.name)) {
        cleaned.name = stripHaiPrintText(cleaned.name);
        attrsChanged = true;
      }
      attrs.push(cleaned);
    }
    if (attrsChanged) {
      next.attributes = attrs;
      changes.push('attributes');
    }
  }

  if (Array.isArray(next.suppliers)) {
    let suppliersChanged = false;
    const suppliers = [];
    for (const supplier of next.suppliers) {
      if (!supplier || typeof supplier !== 'object') {
        suppliers.push(supplier);
        continue;
      }
      if (hasHaiPrint(supplier.name)) {
        if (isHaiPrintOnly(supplier.name)) {
          suppliersChanged = true;
          continue;
        }
        suppliers.push({ ...supplier, name: stripHaiPrintText(supplier.name) });
        suppliersChanged = true;
        continue;
      }
      suppliers.push(supplier);
    }
    if (suppliersChanged) {
      next.suppliers = suppliers;
      changes.push('suppliers');
    }
  }

  return { product: next, changes };
}

function updateProductsFile(filePath, label) {
  if (!existsSync(filePath)) {
    console.warn(`[strip-haiprint] No existe ${label}: ${filePath}`);
    return { updated: 0, fieldCounts: {} };
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const products = Array.isArray(raw.products) ? raw.products : [];
  const fieldCounts = {};
  let updated = 0;

  const nextProducts = products.map((product) => {
    const { product: cleaned, changes } = cleanProduct(product);
    if (changes.length === 0) return product;
    updated += 1;
    for (const field of changes) {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    }
    return cleaned;
  });

  const payload = { ...raw, products: nextProducts };
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[strip-haiprint] ${label}: ${updated} productos actualizados`, fieldCounts);
  return { updated, fieldCounts };
}

function remainingHaiPrintInDisplayFields(filePath) {
  if (!existsSync(filePath)) return 0;
  const products = JSON.parse(readFileSync(filePath, 'utf8')).products ?? [];
  return products.filter((p) => {
    const probe = {
      name: p.name,
      brand: p.brand,
      description: p.description,
      title: p.title,
      tagline: p.tagline,
      attributes: p.attributes,
      suppliers: p.suppliers,
    };
    return /\bhaiprint\b/i.test(JSON.stringify(probe));
  }).length;
}

const inventoryPath = getInventoryPath();
const invResult = updateProductsFile(inventoryPath, 'inventory.json');
const catResult = updateProductsFile(catalogPath, 'inventory-catalog.json');

console.log(
  JSON.stringify(
    {
      inventoryUpdated: invResult.updated,
      catalogUpdated: catResult.updated,
      inventoryFields: invResult.fieldCounts,
      catalogFields: catResult.fieldCounts,
      remainingDisplayHitsInventory: remainingHaiPrintInDisplayFields(inventoryPath),
      remainingDisplayHitsCatalog: remainingHaiPrintInDisplayFields(catalogPath),
    },
    null,
    2,
  ),
);
