/**
 * Regenera variantes -256/-512 desde las imágenes base en public/products.
 * Uso: node scripts/regenerate-product-image-variants.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { getPublicProductsDir } from '../server/lib/persist-product-media.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = getPublicProductsDir();
const WEBP_QUALITY = 82;

function isBaseProductImage(name) {
  if (!/\.(webp|png|jpe?g)$/i.test(name)) return false;
  if (/-(256|512|1024)\.(webp|png|jpe?g)$/i.test(name)) return false;
  return true;
}

async function main() {
  const files = fs
    .readdirSync(productsDir)
    .filter(isBaseProductImage)
    .map((name) => path.join(productsDir, name));

  let updated = 0;
  let failed = 0;
  for (const filePath of files) {
    try {
      const parsed = path.parse(filePath);
      const input = await fs.promises.readFile(filePath);

      for (const width of [256, 512, 1024]) {
        const variantPath = path.join(parsed.dir, `${parsed.name}-${width}.webp`);
        await sharp(input)
          .resize(width, width, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(variantPath);
      }

      updated += 1;
      console.log(`✓ ${path.relative(root, filePath)}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`⚠ ${path.relative(root, filePath)}: ${message}`);
    }
  }

  console.log(`\nVariantes regeneradas para ${updated} imagen(es) base.${failed > 0 ? ` Omitidas: ${failed}.` : ''}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
