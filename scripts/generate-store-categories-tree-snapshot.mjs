/**
 * Genera public/catalog/store-categories-tree.json para carga instantánea del árbol de categorías.
 */
import 'dotenv/config';
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { buildStoreCategoriesTreeFromInventory } from '../server/lib/store-categories-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../public/catalog/store-categories-tree.json');

async function main() {
  const inventoryPath = getInventoryPath();
  if (!existsSync(inventoryPath)) {
    console.warn(
      `[generate:store-categories-tree] Sin inventario en ${inventoryPath}; snapshot no actualizado.`,
    );
    return;
  }

  const tree = await buildStoreCategoriesTreeFromInventory();
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(
    OUTPUT_PATH,
    JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      tree,
    }),
  );
  console.log(`✓ Árbol de categorías escrito en ${OUTPUT_PATH} (${tree.length} raíces)`);
}

main().catch((error) => {
  console.warn(
    '[generate:store-categories-tree] omitido:',
    error instanceof Error ? error.message : error,
  );
  process.exit(0);
});
