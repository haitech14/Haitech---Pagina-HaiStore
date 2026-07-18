/**
 * Genera public/catalog/inventory-index.json (catálogo slim para el cliente).
 * Fuente: inventario del servidor (misma base que /api/products); respaldo en inventory-catalog.json.
 * Uso: node scripts/generate-inventory-index-snapshot.mjs
 */
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory } from '../server/lib/inventory-store.js';
import { writeInventoryIndexSnapshot } from '../server/lib/inventory-index-snapshot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');

async function loadSourceProducts() {
  const inventoryPath = getInventoryPath();
  const catalogProducts = existsSync(catalogPath)
    ? (JSON.parse(readFileSync(catalogPath, 'utf8')).products ?? [])
    : [];

  if (existsSync(inventoryPath)) {
    const inventory = await readInventory();
    const inventoryProducts = inventory.products ?? [];

    // Si el inventario local quedó truncado (p. ej. seed demo), usar el catálogo maestro.
    const inventoryLooksTruncated =
      catalogProducts.length > 0 &&
      inventoryProducts.length > 0 &&
      inventoryProducts.length < Math.min(100, catalogProducts.length * 0.25);

    if (inventoryLooksTruncated) {
      console.warn(
        `[generate:inventory-index] Inventario truncado (${inventoryProducts.length} vs catálogo ${catalogProducts.length}); usando catálogo maestro.`,
      );
      return { products: catalogProducts, source: catalogPath };
    }

    return { products: inventoryProducts, source: inventoryPath };
  }

  if (catalogProducts.length > 0) {
    return { products: catalogProducts, source: catalogPath };
  }

  return null;
}

async function main() {
  const loaded = await loadSourceProducts();
  if (!loaded) {
    console.warn('[generate:inventory-index] Sin inventario ni catálogo estático; omitido.');
    return;
  }

  const { filePath, productCount } = await writeInventoryIndexSnapshot(loaded.products);
  console.log(
    `✓ Índice de inventario escrito en ${filePath} (${productCount} productos desde ${loaded.source})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
