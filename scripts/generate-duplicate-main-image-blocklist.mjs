/**
 * Detecta imágenes principales idénticas (copiadas entre productos) y genera
 * shared/product-media-duplicate-main-ids.js para filtrarlas en tarjetas.
 *
 * Uso: node scripts/generate-duplicate-main-image-blocklist.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'public', 'products');
const outputPath = path.join(root, 'shared', 'product-media-duplicate-main-ids.js');

const VARIANT_SUFFIX = /-(256|512|768|1024|1280|1920)\.webp$/i;
const GALLERY_SUFFIX = /-\d+\.webp$/i;

function hashFile(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function productIdFromMainFilename(filename) {
  if (!filename.endsWith('.webp')) return null;
  if (VARIANT_SUFFIX.test(filename)) return null;
  if (GALLERY_SUFFIX.test(filename)) return null;
  return filename.replace(/\.webp$/i, '');
}

function main() {
  if (!fs.existsSync(productsDir)) {
    console.warn('No existe public/products; generando blocklist vacía.');
    writeOutput([]);
    return;
  }

  const byHash = new Map();

  for (const filename of fs.readdirSync(productsDir)) {
    const productId = productIdFromMainFilename(filename);
    if (!productId) continue;

    const absolute = path.join(productsDir, filename);
    const hash = hashFile(absolute);
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(productId);
  }

  const blocked = new Set();

  for (const productIds of byHash.values()) {
    if (productIds.length < 2) continue;

    for (const productId of productIds) {
      blocked.add(productId);
    }
  }

  const sorted = [...blocked].sort();
  writeOutput(sorted);

  console.log(
    JSON.stringify(
      {
        duplicateGroups: [...byHash.values()].filter((ids) => ids.length > 1).length,
        blockedProductIds: sorted.length,
        outputPath: path.relative(root, outputPath),
      },
      null,
      2,
    ),
  );
}

function writeOutput(productIds) {
  const body = `/** Generado por scripts/generate-duplicate-main-image-blocklist.mjs — no editar a mano. */
export const DUPLICATE_MAIN_PRODUCT_IDS = new Set(${JSON.stringify(productIds, null, 2)});
`;
  fs.writeFileSync(outputPath, body, 'utf8');
}

main();
