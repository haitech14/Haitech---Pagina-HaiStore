import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { readStoreCategoriesTree } from './store-categories-store.js';

const SNAPSHOT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/catalog/store-categories-tree.json',
);

/** Escribe el árbol en vivo para preload/PWA y fallback estático del cliente. */
export async function writeStoreCategoriesTreeSnapshot() {
  const tree = await readStoreCategoriesTree();
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
  return tree;
}
