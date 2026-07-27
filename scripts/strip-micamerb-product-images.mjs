/**
 * Quita image_url y gallery de productos cuyo proveedor es MICAMERB.
 * Actualiza inventario vivo (server/data/inventory.json) y catálogo estático.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { invalidateInventoryReadCache, readInventory, writeInventory } from '../server/lib/inventory-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SUPPLIER_MICAMERB = 'MICAMERB';

function hasMicamerbSupplier(product) {
  const suppliers = Array.isArray(product?.suppliers) ? product.suppliers : [];
  return suppliers.some(
    (row) => String(row?.name ?? '').trim().toUpperCase() === SUPPLIER_MICAMERB,
  );
}

function stripProductImages(product) {
  const hadImage = Boolean(product.image_url) || (Array.isArray(product.gallery) && product.gallery.length > 0);
  if (!hadImage) return { product, changed: false, removed: null };

  const removed = {
    image_url: product.image_url ?? null,
    gallery: Array.isArray(product.gallery) ? [...product.gallery] : [],
  };

  return {
    product: {
      ...product,
      image_url: null,
      gallery: [],
      updated_at: new Date().toISOString(),
    },
    changed: true,
    removed,
  };
}

function processProducts(products) {
  const report = [];
  const next = products.map((product) => {
    if (!hasMicamerbSupplier(product)) return product;
    const { product: updated, changed, removed } = stripProductImages(product);
    if (changed) {
      report.push({
        id: product.id,
        code: product.code ?? null,
        name: product.name,
        removedImage: removed?.image_url ?? null,
        removedGalleryCount: removed?.gallery?.length ?? 0,
      });
    }
    return updated;
  });
  return { next, report };
}

function processJsonFile(filePath) {
  if (!existsSync(filePath)) return { report: [], next: null, raw: null };
  copyFileSync(filePath, `${filePath}.bak-strip-micamerb-${Date.now()}`);
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const isWrapped = Boolean(raw.products);
  const products = raw.products || raw;
  const { next, report } = processProducts(products);
  if (isWrapped) {
    writeFileSync(filePath, `${JSON.stringify({ ...raw, products: next }, null, 2)}\n`, 'utf8');
  } else {
    writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  }
  return { report, next, raw: isWrapped ? { ...raw, products: next } : next };
}

invalidateInventoryReadCache();

const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const catalogResult = processJsonFile(catalogPath);

let liveReport = [];
try {
  const inventory = await readInventory();
  const { next, report } = processProducts(inventory.products);
  liveReport = report;
  await writeInventory({ ...inventory, products: next });
} catch (error) {
  console.warn('writeInventory falló, actualizando archivo local:', error?.message ?? error);
  const localPath = path.join(root, 'server/data/inventory.json');
  const localResult = processJsonFile(localPath);
  liveReport = localResult.report;
}

const allReports = new Map();
for (const row of [...catalogResult.report, ...liveReport]) {
  allReports.set(row.id, row);
}

console.log(`\n=== Imágenes eliminadas (proveedor ${SUPPLIER_MICAMERB}) ===\n`);
console.log(`Catálogo estático: ${catalogResult.report.length} producto(s)`);
console.log(`Inventario vivo:   ${liveReport.length} producto(s)`);
console.log('');

for (const row of [...allReports.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))) {
  console.log(`${row.code ?? row.id} | ${row.name}`);
  if (row.removedImage) console.log(`  - ${row.removedImage}`);
  if (row.removedGalleryCount > 0) console.log(`  - gallery: ${row.removedGalleryCount} foto(s)`);
}

console.log(`\nTotal único: ${allReports.size} producto(s) sin imagen.`);
