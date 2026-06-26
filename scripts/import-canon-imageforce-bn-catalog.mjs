import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { CANON_IMAGEFORCE_BN_CATALOG } from '../data/seeds/canon-imageforce-bn-catalog.mjs';
import { normalizeAttributes } from '../server/lib/inventory-attributes.js';
import {
  ensureProductSortOrders,
  migrateInventoryProduct,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  buildCanonImageForceBnDescription,
  buildCanonImageForceBnName,
  CANON_BRAND,
  CATEGORY_CANON_MF_NUEVAS,
} from '../server/lib/canon-imageforce-bn.js';
import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
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

/** @param {string} imageId */
function resolveAssetPath(imageId) {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`No se encontró la carpeta de assets: ${assetsDir}`);
  }
  const match = fs
    .readdirSync(assetsDir)
    .find((file) => file.includes(`images_image-${imageId}`));
  return match ? path.join(assetsDir, match) : null;
}

/** @param {import('../data/seeds/canon-imageforce-bn-catalog.mjs').CANON_IMAGEFORCE_BN_CATALOG[number]} entry */
async function extractCatalogImage(entry) {
  const sourcePath = resolveAssetPath(entry.imageId);
  if (!sourcePath) return null;

  const inputBuffer = fs.readFileSync(sourcePath);

  return sharp(inputBuffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

/** @param {string} productId @param {Buffer} pngBuffer */
async function saveProductImage(productId, pngBuffer) {
  fs.mkdirSync(productsDir, { recursive: true });
  const resized = await sharp(pngBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: `/products/${productId}.webp`,
  });
  const webp = await sharp(watermarked).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(path.join(productsDir, `${productId}.webp`), webp);
  return `/products/${productId}.webp`;
}

/** @param {import('../data/seeds/canon-imageforce-bn-catalog.mjs').CANON_IMAGEFORCE_BN_CATALOG[number]} entry */
function buildProduct(entry) {
  const id = `canon-${entry.slug}`;
  const name = buildCanonImageForceBnName({ model: entry.model });
  const description = buildCanonImageForceBnDescription(entry);

  /** @type {{ name: string; value: string }[]} */
  const attributes = [
    { name: 'Color', value: 'B/N' },
    { name: 'Modelo', value: entry.model },
    { name: 'Tecnología', value: 'Láser' },
    { name: 'Velocidad', value: entry.specs.speed },
    { name: 'Producción/Rendimiento', value: entry.specs.rendimiento },
    { name: 'Memoria', value: entry.specs.memory },
    { name: 'Almacenamiento', value: entry.specs.storage },
    { name: 'ADF', value: entry.specs.adf },
    { name: 'Capacidad bandeja', value: entry.specs.paper },
    { name: 'Velocidad escáner', value: entry.specs.scanSpeed },
  ];

  return normalizeProductInput({
    id,
    slug: deriveProductSlug({ id, name, slug: entry.slug }),
    code: entry.model,
    name,
    description,
    brand: CANON_BRAND,
    category: CATEGORY_CANON_MF_NUEVAS,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes(attributes),
    suppliers: [],
    bundle_components: [],
  });
}

function syncCatalogJson(products) {
  const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const byId = new Map((catalog.products ?? []).map((product) => [String(product.id), product]));

  for (const product of products) {
    const existing = byId.get(String(product.id));
    byId.set(String(product.id), {
      ...(existing ?? {}),
      ...product,
      slug: product.slug ?? existing?.slug,
    });
  }

  catalog.products = [...byId.values()];
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const imported = [];

  const imageCache = new Map();

  for (const entry of CANON_IMAGEFORCE_BN_CATALOG) {
    let png = imageCache.get(entry.imageId);
    if (!png) {
      png = await extractCatalogImage(entry);
      if (png) imageCache.set(entry.imageId, png);
    }
    if (!png) {
      console.warn(`⚠ ${entry.slug}: imagen no encontrada (${entry.imageId}), se omite.`);
      continue;
    }

    const product = buildProduct(entry);
    if (!dryRun) {
      product.image_url = await saveProductImage(String(product.id), png);
    } else {
      product.image_url = `/products/${product.id}.webp`;
    }
    product.gallery = [];
    imported.push(product);
    console.log(`✓ ${entry.slug} → ${product.name}`);
  }

  if (dryRun) {
    console.log(`\n(dry-run) ${imported.length} productos listos, sin escribir inventario.`);
    return;
  }

  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  const byId = new Map(inventory.products.map((product) => [String(product.id), product]));

  let created = 0;
  let updated = 0;

  for (const product of imported) {
    const prev = byId.get(String(product.id));
    const merged = migrateInventoryProduct(
      normalizeProductInput(
        prev
          ? {
              ...product,
              image_url: product.image_url ?? prev.image_url,
              gallery: product.gallery?.length ? product.gallery : prev.gallery,
              name: product.name,
              description: product.description,
              code: product.code,
              sort_order: prev.sort_order,
              stock: prev.stock,
              stock_by_warehouse: prev.stock_by_warehouse,
              prices: prev.prices?.public ? prev.prices : product.prices,
              purchase_price_usd: prev.purchase_price_usd || product.purchase_price_usd,
              view_count: prev.view_count,
              created_at: prev.created_at,
            }
          : product,
        prev ?? undefined,
        warehouses,
      ),
      warehouses,
    );

    if (prev) updated += 1;
    else created += 1;
    byId.set(String(merged.id), merged);
  }

  const products = [...byId.values()];
  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds ?? [],
    warehouses,
  });

  syncCatalogJson(
    imported.map((product) => sorted.find((row) => String(row.id) === String(product.id)) ?? product),
  );

  console.log(`\nImportación Canon ImageForce B/N completada: ${created} nuevos, ${updated} actualizados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
