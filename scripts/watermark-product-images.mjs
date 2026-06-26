/**
 * Aplica la marca de agua HAITECH a imágenes existentes en public/products.
 * Uso: node scripts/watermark-product-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import { getPublicProductsDir } from '../server/lib/persist-product-media.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = getPublicProductsDir();

async function watermarkFile(filePath) {
  const input = await fs.promises.readFile(filePath);
  const output = await applyHaitechWatermark(input, { sourceUrl: '/products/x.webp' });
  if (output.equals(input)) return false;

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') {
    await sharp(output).webp({ quality: 82 }).toFile(filePath);
    return true;
  }
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    await fs.promises.writeFile(filePath, output);
    return true;
  }
  return false;
}

async function main() {
  if (!fs.existsSync(productsDir)) {
    console.log('Sin carpeta public/products.');
    return;
  }

  const files = fs
    .readdirSync(productsDir)
    .filter((name) => {
      if (!/\.(webp|png|jpe?g)$/i.test(name)) return false;
      // Variantes responsive ya heredan la marca de la imagen base.
      if (/-(256|512)\.(webp|png|jpe?g)$/i.test(name)) return false;
      return true;
    })
    .map((name) => path.join(productsDir, name));

  let updated = 0;
  for (const filePath of files) {
    try {
      if (await watermarkFile(filePath)) {
        updated += 1;
        console.log(`✓ ${path.relative(root, filePath)}`);
      }
    } catch (error) {
      console.warn(`⚠ ${path.basename(filePath)}:`, error?.message ?? error);
    }
  }

  console.log(`\nListo: ${updated} de ${files.length} imágenes actualizadas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
