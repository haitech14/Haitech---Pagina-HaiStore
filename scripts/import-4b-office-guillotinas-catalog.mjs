import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  OFFICE_4B_GUILLOTINAS_CATALOG,
  buildGuillotinaProductName,
  extractGuillotinaModel,
} from '../data/seeds/4b-office-guillotinas-catalog.mjs';
import { normalizeAttributes } from '../server/lib/inventory-attributes.js';
import {
  ensureProductSortOrders,
  migrateInventoryProduct,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';
import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import {
  CATEGORY_OFFICE_GUILLOTINES,
  EQUIPOS_OFICINA_PARENT_ID,
  OFFICE_GUILLOTINES_INVENTORY_LABELS,
  OFFICE_GUILLOTINES_SUBCATEGORY_ID,
  OFFICE_GUILLOTINES_SUBCATEGORY_SLUG,
} from '../shared/office-guillotines.js';
import { deriveProductSlug } from '../shared/product-slug.js';
import { writeGuillotinasExcel } from './export-4b-office-guillotinas-excel.mjs';

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
  const match = fs.readdirSync(assetsDir).find((file) => file.includes(`images_image-${imageId}`));
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

/**
 * @param {import('../data/seeds/4b-office-guillotinas-catalog.mjs').OFFICE_4B_GUILLOTINAS_CATALOG[number]} entry
 * @param {string} productId
 * @param {boolean} dryRun
 */
async function assignProductImages(entry, productId, dryRun) {
  const productPath = resolveAssetPath(entry.productImageId);
  if (!productPath) {
    throw new Error(`Imagen no encontrada: ${entry.productImageId}`);
  }

  if (dryRun) {
    return { image_url: `/products/${productId}.webp`, gallery: [] };
  }

  const png = await loadFullImage(productPath);
  return {
    image_url: await saveProductImage(productId, png),
    gallery: [],
  };
}

async function ensureGuillotinasSubcategory() {
  let categories = await readStoreCategories();
  let parent = categories.find((row) => row.id === EQUIPOS_OFICINA_PARENT_ID);

  if (!parent) {
    await createStoreCategory({
      id: EQUIPOS_OFICINA_PARENT_ID,
      name: 'Equipos de Oficina',
      slug: 'equipos-de-oficina',
      parentId: null,
      sortOrder: categories.filter((row) => !row.parentId).length,
      inventoryLabels: ['Equipos de Oficina'],
      image: '/categories/repuestos.png',
      tagline: 'Equipamiento para oficina y encuadernación',
    });
    categories = await readStoreCategories();
    parent = categories.find((row) => row.id === EQUIPOS_OFICINA_PARENT_ID);
  }

  const parentLabels = new Set(parent?.inventoryLabels ?? ['Equipos de Oficina']);
  parentLabels.add('Equipos de Oficina');
  for (const label of OFFICE_GUILLOTINES_INVENTORY_LABELS) {
    parentLabels.add(label);
  }

  await updateStoreCategory(EQUIPOS_OFICINA_PARENT_ID, {
    inventoryLabels: [...parentLabels],
  });

  const existing = categories.find((row) => row.id === OFFICE_GUILLOTINES_SUBCATEGORY_ID);
  if (existing) {
    const labels = new Set([
      ...(existing.inventoryLabels ?? []),
      ...OFFICE_GUILLOTINES_INVENTORY_LABELS,
    ]);
    await updateStoreCategory(OFFICE_GUILLOTINES_SUBCATEGORY_ID, {
      name: 'Guillotina',
      slug: OFFICE_GUILLOTINES_SUBCATEGORY_SLUG,
      parentId: EQUIPOS_OFICINA_PARENT_ID,
      inventoryLabels: [...labels],
    });
    return;
  }

  const siblings = categories.filter((row) => row.parentId === EQUIPOS_OFICINA_PARENT_ID);
  await createStoreCategory({
    id: OFFICE_GUILLOTINES_SUBCATEGORY_ID,
    name: 'Guillotina',
    slug: OFFICE_GUILLOTINES_SUBCATEGORY_SLUG,
    parentId: EQUIPOS_OFICINA_PARENT_ID,
    sortOrder: siblings.length,
    inventoryLabels: OFFICE_GUILLOTINES_INVENTORY_LABELS,
    image: '/categories/repuestos.png',
    tagline: 'Guillotinas 4B Office para corte de papel',
  });
}

/**
 * @param {import('../data/seeds/4b-office-guillotinas-catalog.mjs').OFFICE_4B_GUILLOTINAS_CATALOG[number]} entry
 * @param {{ image_url: string; gallery: string[] }} media
 */
function buildGuillotineProduct(entry, media) {
  const id = `4b-gu-${entry.slug}`;
  const name = buildGuillotinaProductName({
    model: entry.model,
    format: entry.format,
  });
  const systemModel = extractGuillotinaModel(entry.code);

  return normalizeProductInput({
    id,
    slug: deriveProductSlug({ id, name }),
    code: entry.code,
    name,
    description: entry.shortDescription,
    brand: entry.brand,
    category: CATEGORY_OFFICE_GUILLOTINES,
    currency: 'USD',
    stock: 0,
    image_url: media.image_url,
    gallery: media.gallery,
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes([
      { name: 'Tipo', value: 'Guillotina' },
      { name: 'Modelo', value: systemModel },
      { name: 'Formato', value: entry.format },
      { name: 'Color', value: entry.color },
      { name: 'Cajón', value: entry.cajon },
    ]),
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
  await ensureGuillotinasSubcategory();

  const imported = [];

  for (const entry of OFFICE_4B_GUILLOTINAS_CATALOG) {
    const id = `4b-gu-${entry.slug}`;
    const media = await assignProductImages(entry, id, dryRun);
    const product = buildGuillotineProduct(entry, media);
    imported.push(product);
    console.log(`✓ ${entry.slug} → ${product.name}`);
  }

  const excelPath = writeGuillotinasExcel(imported);
  console.log(`\nExcel: ${excelPath}`);

  if (dryRun) {
    console.log(`(dry-run) ${imported.length} productos listos, sin escribir inventario.`);
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

  const { products: sorted } = ensureProductSortOrders([...byId.values()]);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds ?? [],
    warehouses,
  });

  syncCatalogJson(
    imported.map((product) => sorted.find((row) => String(row.id) === String(product.id)) ?? product),
  );

  console.log(`\nImportación guillotinas: ${created} nuevos, ${updated} actualizados.`);
  console.log(`Total productos importados: ${imported.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
