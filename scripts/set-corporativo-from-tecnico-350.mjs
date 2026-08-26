/**
 * Precio corporativo (public) = precio técnico + $350
 * Seminuevas: IM C2000, MP C2004, IM C3000, MP C3004
 *
 * node scripts/set-corporativo-from-tecnico-350.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readInventory, writeInventory, migrateInventoryProduct } from '../server/lib/inventory-store.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
const DELTA = 350;

function matches(name) {
  const n = String(name || '');
  if (!/seminueva/i.test(n)) return false;
  if (/toner|tambor|cartucho|unidad de imagen/i.test(n)) return false;
  if (/\bIM\s*C2000\b/i.test(n)) return true;
  if (/\bMP\s*C2004\b/i.test(n)) return true;
  if (/\bIM\s*C3000\b/i.test(n)) return true;
  if (/\bMP\s*C3004\b/i.test(n) && !/EX/i.test(n)) return true;
  return false;
}

function applyCorpFromTec(product) {
  if (!matches(product.name)) return null;
  const prices = { ...(product.prices || {}) };
  const tecnico = Number(prices.tecnico);
  if (!Number.isFinite(tecnico) || tecnico <= 0) return null;
  const nextPublic = Math.round(tecnico + DELTA);
  if (Number(prices.public) === nextPublic) return null;
  prices.public = nextPublic;
  return {
    ...product,
    prices,
    ...(product.price != null ? { price: nextPublic } : {}),
  };
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
let catalogUpdated = 0;
catalog.products = catalog.products.map((product) => {
  const next = applyCorpFromTec(product);
  if (!next) return product;
  catalogUpdated += 1;
  console.log(
    `[catalog] ${product.name.slice(0, 58)} | tec ${product.prices.tecnico} → corp ${next.prices.public} (era ${product.prices.public})`,
  );
  return next;
});
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

const inventory = await readInventory();
let inventoryUpdated = 0;
const products = inventory.products.map((product) => {
  const next = applyCorpFromTec(product);
  if (!next) return product;
  inventoryUpdated += 1;
  console.log(
    `[inventory] ${product.name.slice(0, 58)} | tec ${product.prices.tecnico} → corp ${next.prices.public}`,
  );
  return migrateInventoryProduct(next, inventory.warehouses);
});
await writeInventory({
  products,
  deletedProductIds: inventory.deletedProductIds ?? [],
  warehouses: inventory.warehouses,
});

console.log(`\nListo: catalog ${catalogUpdated}, inventory ${inventoryUpdated}`);
