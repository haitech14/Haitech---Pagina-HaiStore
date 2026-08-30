/**
 * Corrige productos con imagen de otro modelo y asigna fotos faltantes en equipos visibles.
 *
 * Uso: node scripts/fix-borrowed-product-images.mjs
 *      node scripts/fix-borrowed-product-images.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import { getPublicProductsDir } from '../server/lib/persist-product-media.js';
import { publicProductMediaPath } from '../shared/product-stock-images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const dryRun = process.argv.includes('--dry-run');

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const CARD_VARIANTS = [
  { suffix: '-256', width: 256 },
  { suffix: '-512', width: 512 },
];

/** @type {Array<{ id: string; image_url: string; copyFrom?: string; note?: string }>} */
const FIXES = [
  {
    id: 'ricoh-im-2510',
    image_url: '/products/ricoh-im-2510.webp',
    note: 'Antes: IM 2500 (196857c6)',
  },
  {
    id: 'ricoh-im-3010',
    image_url: '/products/ricoh-im-3010.webp',
    note: 'Antes: IM 3000 (0aea108a)',
  },
  {
    id: 'ricoh-im-4010',
    image_url: '/products/ricoh-im-4010.webp',
    note: 'Antes: IM 4000 SPDF (40c36a2a)',
  },
  {
    id: 'ricoh-im-5010',
    image_url: '/products/ricoh-im-5010.webp',
    note: 'Antes: IM 5000 SPDF (c0ad567a)',
  },
  {
    id: '2177d10d-b23c-4383-aa33-2eb3393de4e0',
    image_url: '/products/ricoh-im-6010-spdf.webp',
    note: 'Antes: IM 5000 seminueva (8e90c732)',
  },
  {
    id: 'ricoh-mp-301-sn',
    image_url: '/products/b-n-ricoh-mp-301.webp',
    copyFrom: '/products/b-n-ricoh-mp-301.webp',
    note: 'Antes: MP 402 (393e6e4b)',
  },
  {
    id: 'ricoh-mp-cw2201-sn',
    image_url: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    copyFrom: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    note: 'Copia propia desde plotter CW2200 (misma familia)',
  },
  {
    id: 'a853cd99-17e7-445a-a6b2-4f527753db6f',
    image_url: '/products/ricoh-im-c400f-220v.webp',
    note: 'Sin imagen; IM C400F 220V',
  },
  {
    id: 'dbd6ad0b-ee55-4fae-82e8-83009bd88e94',
    image_url: '/products/ricoh-im-c2000-cilindro-cuchilla-rod-carga-220v.webp',
    note: 'Antes: IM C2000 base (b06406c6)',
  },
];

function publicToAbsolute(publicPath) {
  return path.join(root, 'public', publicPath.split('?')[0].replace(/^\//, ''));
}

function withCacheBust(url) {
  const [base, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  params.set('v', String(Date.now()));
  return `${base}?${params.toString()}`;
}

async function exportOwnedCopy(productId, sourceAbsolute, sourceLabel) {
  const targetPath = path.join(getPublicProductsDir(), `${productId}.webp`);
  if (dryRun) {
    console.log(`  · copiaría ${path.relative(root, targetPath)} ← ${sourceLabel}`);
    return publicProductMediaPath(productId);
  }

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

  const input = fs.readFileSync(sourceAbsolute);
  const rotated = await sharp(input).rotate().toBuffer();
  let trimmed = rotated;
  try {
    trimmed = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
  } catch {
    trimmed = rotated;
  }

  const resized = await sharp(trimmed)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: `/products/${productId}.webp`,
  });

  const output = await sharp(watermarked).webp({ quality: WEBP_QUALITY }).toBuffer();
  await fs.promises.writeFile(targetPath, output);

  const parsed = path.parse(targetPath);
  for (const { suffix, width } of CARD_VARIANTS) {
    const variantPath = path.join(parsed.dir, `${parsed.name}${suffix}.webp`);
    const variant = await sharp(output)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await fs.promises.writeFile(variantPath, variant);
  }

  return publicProductMediaPath(productId);
}

function upsertProduct(products, fix, imageUrl) {
  const versioned = withCacheBust(imageUrl);
  return products.map((product) =>
    product.id === fix.id
      ? {
          ...product,
          image_url: versioned,
          gallery: Array.isArray(product.gallery)
            ? product.gallery.filter((url) => pathnameOf(url) !== pathnameOf(imageUrl))
            : [],
          updated_at: new Date().toISOString(),
        }
      : product,
  );
}

function pathnameOf(url) {
  return String(url ?? '').split('?')[0];
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  let products = Array.isArray(catalog.products) ? catalog.products : [];

  console.log(`${dryRun ? 'Simulación' : 'Aplicando'} ${FIXES.length} corrección(es)…\n`);

  for (const fix of FIXES) {
    const product = products.find((row) => row.id === fix.id);
    if (!product) {
      console.warn(`⚠ Producto no encontrado: ${fix.id}`);
      continue;
    }

    let imageUrl = fix.image_url;
    const sourceAbsolute = publicToAbsolute(fix.copyFrom ?? fix.image_url);
    if (!fs.existsSync(sourceAbsolute)) {
      console.warn(`⚠ Archivo fuente no existe: ${fix.image_url} (${fix.id})`);
      continue;
    }

    if (fix.copyFrom) {
      imageUrl = await exportOwnedCopy(fix.id, sourceAbsolute, fix.copyFrom);
    } else if (!fs.existsSync(path.join(getPublicProductsDir(), path.basename(pathnameOf(imageUrl))))) {
      console.warn(`⚠ Imagen destino no existe en disco: ${imageUrl} (${fix.id})`);
      continue;
    }

    const before = product.image_url ?? '(null)';
    products = upsertProduct(products, fix, imageUrl);
    console.log(`✓ ${product.name}`);
    console.log(`  ${before}`);
    console.log(`  → ${withCacheBust(imageUrl)}`);
    if (fix.note) console.log(`  (${fix.note})`);
  }

  if (!dryRun) {
    catalog.products = products;
    fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
    console.log(`\n✓ Catálogo actualizado: ${path.relative(root, catalogPath)}`);
  } else {
    console.log('\n(dry-run: no se escribió el catálogo)');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
