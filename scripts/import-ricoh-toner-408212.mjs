import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { RICOH_TONER_408212 } from '../data/seeds/ricoh-toner-408212-catalog.mjs';
import { normalizeAttributes } from '../server/lib/inventory-attributes.js';
import {
  ensureProductSortOrders,
  migrateInventoryProduct,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import { ensureFullPrices } from '../server/lib/roles.js';
import {
  roundSalePriceToNinety,
  SUPPLIER_RICOH_PERU,
} from '../server/lib/toner-products-excel.js';
import { deriveProductSlug } from '../shared/product-slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const assetsDir = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor',
  'projects',
  'c-Users-nicol-HaiStore',
  'assets',
);
const productsDir = path.join(root, 'public', 'products');

/** Tipo de cambio venta USD → PEN (coherente con SEO / tienda pública). */
const USD_TO_PEN_SALE = 3.7;

/** @param {string} token */
function resolveAssetPath(token) {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`No se encontró la carpeta de assets: ${assetsDir}`);
  }
  const match = fs.readdirSync(assetsDir).find((file) => file.includes(token));
  return match ? path.join(assetsDir, match) : null;
}

/** @param {string} sourcePath */
async function loadFullImage(sourcePath) {
  const inputBuffer = fs.readFileSync(sourcePath);
  return sharp(inputBuffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

/**
 * @param {string} imageBase
 * @param {string} [suffix]
 * @param {Buffer} pngBuffer
 */
async function saveProductImage(imageBase, suffix, pngBuffer) {
  fs.mkdirSync(productsDir, { recursive: true });
  const fileName = suffix ? `${imageBase}-${suffix}` : imageBase;
  const resized = await sharp(pngBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: `/products/${fileName}.webp`,
  });
  const basePath = path.join(productsDir, fileName);
  const webp = await sharp(watermarked).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(`${basePath}.webp`, webp);

  for (const { extraSuffix, width } of [
    { extraSuffix: '-256', width: 256 },
    { extraSuffix: '-512', width: 512 },
  ]) {
    if (!suffix) {
      await sharp(watermarked)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(`${basePath}${extraSuffix}.webp`);
    }
  }

  return `/products/${fileName}.webp`;
}

function buildDescription(entry) {
  return [entry.descriptionIntro, ...entry.descriptionSpecs].join('\n');
}

function buildPrices(publicPen) {
  const publicUsd = roundSalePriceToNinety(publicPen / USD_TO_PEN_SALE);
  const ratio = (tier) => roundSalePriceToNinety(publicUsd * tier);
  return ensureFullPrices({
    public: publicUsd,
    tecnico: ratio(0.843),
    mayorista: ratio(0.807),
    distribuidor: ratio(0.746),
    vip: ratio(0.699),
  });
}

function buildProduct(entry) {
  const imageBase = `toner-${entry.code}`;
  const prices = buildPrices(entry.publicPen);
  const purchasePrice = roundSalePriceToNinety(prices.public * 0.64);

  return normalizeProductInput({
    id: entry.id,
    slug: deriveProductSlug({ id: entry.id, name: entry.name }),
    code: entry.code,
    name: entry.name,
    description: buildDescription(entry),
    brand: entry.brand,
    category: entry.category,
    currency: 'USD',
    stock: entry.stock,
    image_url: null,
    gallery: [],
    prices,
    purchase_price_usd: purchasePrice,
    attributes: normalizeAttributes(entry.attributes),
    suppliers: [{ name: SUPPLIER_RICOH_PERU, purchase_price_usd: purchasePrice }],
    bundle_components: [],
  });
}

function syncCatalogJson(product) {
  const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const byId = new Map((catalog.products ?? []).map((row) => [String(row.id), row]));
  const existing = byId.get(String(product.id));
  byId.set(String(product.id), {
    ...(existing ?? {}),
    ...product,
    slug: product.slug ?? existing?.slug,
  });
  catalog.products = [...byId.values()];
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

async function assignImages(entry, dryRun) {
  const imageBase = `toner-${entry.code}`;
  const heroPath = resolveAssetPath(entry.heroAssetToken);
  if (!heroPath) {
    throw new Error(`Imagen principal no encontrada (${entry.heroAssetToken})`);
  }

  if (dryRun) {
    const gallery = [
      `/products/${imageBase}.webp`,
      ...entry.galleryAssetTokens.map((_, index) => `/products/${imageBase}-${index + 2}.webp`),
    ];
    return { image_url: gallery[0], gallery };
  }

  const heroPng = await loadFullImage(heroPath);
  const imageUrl = await saveProductImage(imageBase, '', heroPng);
  const gallery = [imageUrl];

  let galleryIndex = 2;
  for (const token of entry.galleryAssetTokens) {
    const assetPath = resolveAssetPath(token);
    if (!assetPath) {
      console.warn(`⚠ Galería omitida, asset no encontrado: ${token}`);
      continue;
    }
    const png = await loadFullImage(assetPath);
    gallery.push(await saveProductImage(imageBase, String(galleryIndex), png));
    galleryIndex += 1;
  }

  return { image_url: imageUrl, gallery };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const entry = RICOH_TONER_408212;
  const product = buildProduct(entry);
  const images = await assignImages(entry, dryRun);
  product.image_url = images.image_url;
  product.gallery = images.gallery;

  console.log(`✓ ${entry.code} → ${product.name}`);
  console.log(`  Precio público: USD ${product.prices.public} (S/ ${(product.prices.public * USD_TO_PEN_SALE).toFixed(2)} ref.)`);
  console.log(`  Imagen principal: ${product.image_url}`);
  console.log(`  Galería (${product.gallery.length}): ${product.gallery.join(', ')}`);

  if (dryRun) {
    console.log('\n(dry-run) Producto listo, sin escribir inventario.');
    return;
  }

  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  const byId = new Map(inventory.products.map((row) => [String(row.id), row]));
  const prev = byId.get(String(product.id));
  const merged = migrateInventoryProduct(
    normalizeProductInput(
      prev
        ? {
            ...product,
            image_url: product.image_url ?? prev.image_url,
            gallery: product.gallery?.length ? product.gallery : prev.gallery,
            sort_order: prev.sort_order,
            stock: prev.stock,
            stock_by_warehouse: prev.stock_by_warehouse,
            view_count: prev.view_count,
            created_at: prev.created_at,
          }
        : product,
      prev ?? undefined,
      warehouses,
    ),
    warehouses,
  );

  byId.set(String(merged.id), merged);
  const { products: sorted } = ensureProductSortOrders([...byId.values()]);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds ?? [],
    warehouses,
  });

  const saved = sorted.find((row) => String(row.id) === String(product.id)) ?? merged;
  syncCatalogJson(saved);

  console.log(`\nImportación completada: ${prev ? 'actualizado' : 'creado'} (${saved.id}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
