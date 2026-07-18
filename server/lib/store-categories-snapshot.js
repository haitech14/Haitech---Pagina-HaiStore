import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { enrichEquipmentStoreSubcategories } from '../../shared/equipment-store-subcategories.js';
import {
  buildStoreCategoriesTreeFromInventory,
  setStoreCategoriesTreeCache,
} from './store-categories-store.js';

const SNAPSHOT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/catalog/store-categories-tree.json',
);

/** Escribe el árbol en vivo para preload/PWA y fallback estático del cliente. */
export async function writeStoreCategoriesTreeSnapshot() {
  const rawTree = await buildStoreCategoriesTreeFromInventory();
  // Persistir hijos de equipo (nuevas/seminuevas/…) para cold load sin enrich cliente.
  const tree = enrichEquipmentStoreSubcategories(rawTree);
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(
    SNAPSHOT_PATH,
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        tree,
      },
      null,
      2,
    ),
  );
  setStoreCategoriesTreeCache(tree);
  return tree;
}
