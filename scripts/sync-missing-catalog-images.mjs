/**
 * Genera imágenes locales en public/products/ para productos del catálogo estático
 * que aún no tienen /products/{id}.webp.
 *
 * Fuentes (en orden):
 * 1. CDN producción: https://www.haitech.pe/products/{id}.webp
 * 2. Imagen de modelo (PRODUCT_MODEL_STOCK_IMAGES)
 * 3. Otro producto del catálogo con el mismo modelo (prefiere «Nueva»)
 * 4. Placeholder de categoría (multifuncionales, impresoras, etc.)
 *
 * Uso: node scripts/sync-missing-catalog-images.mjs
 *      node scripts/sync-missing-catalog-images.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { productQualifiesAsSeminuevaEquipment } from '../shared/inventory-product-name.js';
import {
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '../shared/product-stock-images.js';
import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import {
  getPublicProductsDir,
  publicProductMediaPath,
} from '../server/lib/persist-product-media.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const apiBase = process.env.HAITECH_CATALOG_SYNC_URL ?? 'https://www.haitech.pe';
const dryRun = process.argv.includes('--dry-run');

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const CARD_VARIANTS = [
  { suffix: '-256', width: 256 },
  { suffix: '-512', width: 512 },
];

const ACCESSORY_RE =
  /\b(cable|papel|banner|adaptador|caja de dinero|mantenimiento box|termica usb|etiquetas|cartridge|toner|tinta|cartucho|tóner|ribbon|tambor|unidad de imagen)\b/i;

function extractModel(name) {
  const match = String(name ?? '').match(
    /(?:ricoh|canon|savin|kyocera|xerox)\s+(.+?)(?:\s+\d{2,3}v|\s*\(|$)/i,
  );
  if (!match) return '';
  return match[1]
    .replace(/[^a-z0-9+ ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function baseModel(model) {
  return model.replace(/\b(ex|sp|lt|dn|fb)\b/g, '').replace(/\s+/g, ' ').trim();
}

function preferDonorScore(name) {
  const normalized = String(name ?? '').toLowerCase();
  if (/\bnueva\b/.test(normalized) && !/\bseminueva\b/.test(normalized)) return 3;
  if (/\bseminueva\b/.test(normalized)) return 2;
  return 1;
}

function localProductImageExists(productId) {
  return fs.existsSync(path.join(getPublicProductsDir(), `${productId}.webp`));
}

function publicPathExists(publicPath) {
  if (!publicPath?.startsWith('/')) return false;
  const absolute = path.join(root, 'public', publicPath.split('?')[0].replace(/^\//, ''));
  return fs.existsSync(absolute);
}

function absoluteFromPublic(publicPath) {
  return path.join(root, 'public', publicPath.split('?')[0].replace(/^\//, ''));
}

async function remoteExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function readSourceBuffer(source) {
  if (source.kind === 'remote') {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${source.url}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return fs.readFileSync(source.absolute);
}

async function exportProductWebp(input, filePath, sourceLabel) {
  if (dryRun) {
    console.log(`  · generaría ${path.relative(root, filePath)} ← ${sourceLabel}`);
    return filePath;
  }

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

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
    sourceUrl: sourceLabel,
  });

  const output = await sharp(watermarked).webp({ quality: WEBP_QUALITY }).toBuffer();
  await fs.promises.writeFile(filePath, output);

  const parsed = path.parse(filePath);
  for (const { suffix, width } of CARD_VARIANTS) {
    const variantPath = path.join(parsed.dir, `${parsed.name}${suffix}.webp`);
    const variant = await sharp(output)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await fs.promises.writeFile(variantPath, variant);
  }

  return filePath;
}

function buildDonorIndex(products) {
  const donors = [];
  for (const product of products) {
    if (!localProductImageExists(product.id)) continue;
    const model = extractModel(product.name);
    if (!model) continue;
    donors.push({
      product,
      model,
      base: baseModel(model),
      score: preferDonorScore(product.name),
    });
  }
  return donors;
}

function findCatalogDonor(product, donors) {
  const model = extractModel(product.name);
  if (!model) return null;

  const exact = donors
    .filter((donor) => donor.model === model && donor.product.id !== product.id)
    .sort((a, b) => b.score - a.score)[0];
  if (exact) return exact.product;

  const fuzzyBase = baseModel(model);
  if (!fuzzyBase) return null;

  return (
    donors
      .filter((donor) => {
        if (donor.product.id === product.id || !donor.base) return false;
        return (
          donor.base === fuzzyBase ||
          donor.base.startsWith(fuzzyBase) ||
          fuzzyBase.startsWith(donor.base)
        );
      })
      .sort((a, b) => b.score - a.score)[0]?.product ?? null
  );
}

async function resolveImageSource(product, donors) {
  const cdnUrl = `${apiBase}/products/${product.id}.webp`;
  if (await remoteExists(cdnUrl)) {
    return {
      source: { kind: 'remote', url: cdnUrl },
      label: 'cdn:id',
    };
  }

  const modelStock = resolveProductModelStockImage(product);
  if (modelStock?.startsWith('/products/') && publicPathExists(modelStock)) {
    return {
      source: { kind: 'local', absolute: absoluteFromPublic(modelStock) },
      label: `model-stock:${modelStock}`,
    };
  }

  if (modelStock?.startsWith('/products/')) {
    const remote = `${apiBase}${modelStock.split('?')[0]}`;
    if (await remoteExists(remote)) {
      return { source: { kind: 'remote', url: remote }, label: `model-stock:${modelStock}` };
    }
  }

  const donor = findCatalogDonor(product, donors);
  if (donor) {
    return {
      source: {
        kind: 'local',
        absolute: path.join(getPublicProductsDir(), `${donor.id}.webp`),
      },
      label: `catalog:${donor.id}`,
    };
  }

  const categoryStock = resolveProductCategoryStockImage(product);
  if (categoryStock && publicPathExists(categoryStock)) {
    return {
      source: { kind: 'local', absolute: absoluteFromPublic(categoryStock) },
      label: `category:${categoryStock}`,
    };
  }

  return null;
}

function shouldSyncProduct(product) {
  const name = String(product?.name ?? '');
  const category = String(product?.category ?? '');

  if (/^toner|^cartucho|^repuesto|^suministro|^unidad de tambor/i.test(name.trim())) {
    return false;
  }

  const isEquipment =
    /\b(multifuncional|impresora)\b/i.test(name) ||
    productQualifiesAsSeminuevaEquipment(product);

  if (isEquipment) return true;

  if (ACCESSORY_RE.test(name)) return false;
  if (/multifuncionales|impresoras/i.test(category)) return true;

  return false;
}

function buildMediaPaths(productId) {
  const image_url = publicProductMediaPath(productId);
  const stem = image_url.replace(/\.webp$/i, '');
  return {
    image_url,
    gallery: [image_url, `${stem}-256.webp`, `${stem}-512.webp`],
  };
}

function upsertProductMedia(products, productId, media) {
  return products.map((product) =>
    product.id === productId
      ? {
          ...product,
          image_url: media.image_url,
          gallery: media.gallery,
        }
      : product,
  );
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const products = Array.isArray(catalog.products) ? catalog.products : [];
  const donors = buildDonorIndex(products);

  const targets = products.filter(
    (product) => shouldSyncProduct(product) && !localProductImageExists(product.id),
  );

  console.log(
    `${dryRun ? 'Simulación' : 'Sincronizando'} imágenes para ${targets.length} producto(s)…\n`,
  );

  const synced = [];
  const skipped = [];

  for (const product of targets) {
    const resolved = await resolveImageSource(product, donors);
    if (!resolved) {
      skipped.push(product);
      console.warn(`⚠ Sin fuente: ${product.name}`);
      continue;
    }

    const publicPath = publicProductMediaPath(product.id);
    const absolutePath = path.join(getPublicProductsDir(), path.basename(publicPath));
    const buffer = dryRun ? Buffer.alloc(0) : await readSourceBuffer(resolved.source);

    await exportProductWebp(buffer, absolutePath, resolved.label);
    synced.push({
      id: product.id,
      name: product.name,
      source: resolved.label,
      image_url: publicPath,
    });
    console.log(`✓ ${product.name}`);
    console.log(`  ← ${resolved.label}`);
  }

  if (!dryRun && synced.length > 0) {
    let nextProducts = products;
    for (const row of synced) {
      nextProducts = upsertProductMedia(nextProducts, row.id, buildMediaPaths(row.id));
    }
    catalog.products = nextProducts;
    fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

    const inventoryPath = getInventoryPath();
    if (fs.existsSync(inventoryPath)) {
      const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
      let inventoryProducts = Array.isArray(inventory.products) ? inventory.products : [];
      for (const row of synced) {
        inventoryProducts = upsertProductMedia(inventoryProducts, row.id, buildMediaPaths(row.id));
      }
      inventory.products = inventoryProducts;
      fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
    }
  }

  console.log(`\n✓ ${synced.length} imagen(es) ${dryRun ? 'simuladas' : 'generadas'}`);
  if (skipped.length > 0) {
    console.warn(`⚠ ${skipped.length} producto(s) sin fuente`);
  }

  const m320f = synced.find((row) => /m\s*320\s*f/i.test(row.name));
  if (m320f) {
    console.log(`\n✓ M 320F: ${m320f.image_url} (${m320f.source})`);
  } else if (!dryRun) {
    const exists = localProductImageExists('5667a537-2ef8-4b25-b376-a61afe57ebf9');
    console.log(`\nM 320F seminueva local: ${exists ? 'OK' : 'pendiente'}`);
  }
}

main().catch((error) => {
  console.error('\nError:', error.message ?? error);
  process.exit(1);
});
