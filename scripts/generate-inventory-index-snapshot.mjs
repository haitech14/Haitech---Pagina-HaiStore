/**
 * Genera public/catalog/inventory-index.json (catálogo slim para el cliente).
 * Fuente: inventario del servidor (misma base que /api/products); respaldo en inventory-catalog.json.
 * Uso: node scripts/generate-inventory-index-snapshot.mjs
 */
import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory } from '../server/lib/inventory-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
const outputPath = path.join(root, 'public', 'catalog', 'inventory-index.json');

const SLIM_FIELDS = [
  'id',
  'slug',
  'name',
  'code',
  'description',
  'price',
  'prices',
  'currency',
  'image_url',
  'gallery',
  'stock',
  'category',
  'brand',
  'attributes',
  'sort_order',
  'created_at',
  'compare_at_price_usd',
  'is_new',
  'view_count',
  'is_featured',
];

function slimProduct(raw) {
  const row = {};
  for (const field of SLIM_FIELDS) {
    if (raw[field] !== undefined) row[field] = raw[field];
  }
  return row;
}

async function loadSourceProducts() {
  const inventoryPath = getInventoryPath();
  if (existsSync(inventoryPath)) {
    const inventory = await readInventory();
    return { products: inventory.products ?? [], source: inventoryPath };
  }

  if (existsSync(catalogPath)) {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    return { products: catalog.products ?? [], source: catalogPath };
  }

  return null;
}

async function main() {
  const loaded = await loadSourceProducts();
  if (!loaded) {
    console.warn('[generate:inventory-index] Sin inventario ni catálogo estático; omitido.');
    return;
  }

  const products = loaded.products.map(slimProduct);

  mkdirSync(path.dirname(outputPath), { recursive: true });
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    products,
  };
  writeFileSync(outputPath, `${JSON.stringify(payload)}\n`, 'utf8');
  console.log(
    `✓ Índice de inventario escrito en ${outputPath} (${products.length} productos desde ${loaded.source})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
