import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  OFFICE_4B_ENMICADORAS_CATALOG,
  buildEnmicadoraProductName,
  extractEnmicadoraModel,
} from '../data/seeds/4b-office-enmicadoras-catalog.mjs';
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
  CATEGORY_OFFICE_LAMINATORS,
  EQUIPOS_OFICINA_PARENT_ID,
  OFFICE_LAMINATORS_INVENTORY_LABELS,
  OFFICE_LAMINATORS_SUBCATEGORY_ID,
  OFFICE_LAMINATORS_SUBCATEGORY_SLUG,
} from '../shared/office-laminators.js';
import { deriveProductSlug } from '../shared/product-slug.js';
import { writeEnmicadorasExcel } from './export-4b-office-enmicadoras-excel.mjs';

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

/**
 * @param {string} sourcePath
 * @param {'product' | 'specs'} kind
 * @param {'left' | 'right'} productSide
 */
async function cropSheetSide(sourcePath, kind, productSide = 'right') {
  const inputBuffer = fs.readFileSync(sourcePath);
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const split = Math.floor(width * 0.44);

  const productOnLeft = productSide === 'left';
  const wantProduct = kind === 'product';
  const useLeft = productOnLeft ? wantProduct : !wantProduct;

  if (useLeft) {
    return sharp(inputBuffer)
      .extract({ left: 0, top: 0, width: split, height })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer();
  }

  return sharp(inputBuffer)
    .extract({ left: split, top: 0, width: width - split, height })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

/** @param {string} productId @param {Buffer} pngBuffer @param {string} suffix */
async function saveProductImage(productId, pngBuffer, suffix = '') {
  fs.mkdirSync(productsDir, { recursive: true });
  const fileName = suffix ? `${productId}${suffix}` : productId;
  const resized = await sharp(pngBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: `/products/${fileName}.webp`,
  });
  const webp = await sharp(watermarked).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(path.join(productsDir, `${fileName}.webp`), webp);
  return `/products/${fileName}.webp`;
}

/**
 * @param {import('../data/seeds/4b-office-enmicadoras-catalog.mjs').OFFICE_4B_ENMICADORAS_CATALOG[number]} entry
 * @param {string} productId
 * @param {boolean} dryRun
 */
async function assignProductImages(entry, productId, dryRun) {
  const productPath = resolveAssetPath(entry.productImageId);
  if (!productPath) {
    throw new Error(`Imagen no encontrada: ${entry.productImageId}`);
  }

  const productSide = entry.productSide === 'left' ? 'left' : 'right';
  const productPng = await cropSheetSide(productPath, 'product', productSide);
  const specsPng = await cropSheetSide(productPath, 'specs', productSide);

  if (dryRun) {
    return {
      image_url: `/products/${productId}.webp`,
      gallery: [`/products/${productId}-descripcion.webp`],
    };
  }

  return {
    image_url: await saveProductImage(productId, productPng),
    gallery: [await saveProductImage(productId, specsPng, '-descripcion')],
  };
}

async function ensureEnmicadorasSubcategory() {
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
  for (const label of OFFICE_LAMINATORS_INVENTORY_LABELS) {
    parentLabels.add(label);
  }

  await updateStoreCategory(EQUIPOS_OFICINA_PARENT_ID, {
    inventoryLabels: [...parentLabels],
  });

  const existing = categories.find((row) => row.id === OFFICE_LAMINATORS_SUBCATEGORY_ID);
  if (existing) {
    const labels = new Set([
      ...(existing.inventoryLabels ?? []),
      ...OFFICE_LAMINATORS_INVENTORY_LABELS,
    ]);
    await updateStoreCategory(OFFICE_LAMINATORS_SUBCATEGORY_ID, {
      name: 'Enmicadora',
      slug: OFFICE_LAMINATORS_SUBCATEGORY_SLUG,
      parentId: EQUIPOS_OFICINA_PARENT_ID,
      inventoryLabels: [...labels],
    });
    return;
  }

  const siblings = categories.filter((row) => row.parentId === EQUIPOS_OFICINA_PARENT_ID);
  await createStoreCategory({
    id: OFFICE_LAMINATORS_SUBCATEGORY_ID,
    name: 'Enmicadora',
    slug: OFFICE_LAMINATORS_SUBCATEGORY_SLUG,
    parentId: EQUIPOS_OFICINA_PARENT_ID,
    sortOrder: siblings.length,
    inventoryLabels: OFFICE_LAMINATORS_INVENTORY_LABELS,
    image: '/categories/repuestos.png',
    tagline: 'Enmicadoras 4B Office para laminado',
  });
}

/**
 * @param {import('../data/seeds/4b-office-enmicadoras-catalog.mjs').OFFICE_4B_ENMICADORAS_CATALOG[number]} entry
 * @param {{ image_url: string; gallery: string[] }} media
 */
function buildLaminatorProduct(entry, media) {
  const id = `4b-em-${entry.slug}`;
  const name = buildEnmicadoraProductName({
    code: entry.code,
    specValue: entry.specValue,
    format: entry.format,
  });
  const model = extractEnmicadoraModel(entry.code);

  return normalizeProductInput({
    id,
    slug: deriveProductSlug({ id, name }),
    code: entry.code,
    name,
    description: entry.shortDescription,
    brand: entry.brand,
    category: CATEGORY_OFFICE_LAMINATORS,
    currency: 'USD',
    stock: 0,
    image_url: media.image_url,
    gallery: media.gallery,
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes([
      { name: 'Tipo', value: 'Enmicadora' },
      { name: 'Modelo', value: model },
      { name: 'Ancho de laminado', value: entry.specValue },
      { name: 'Formato', value: entry.format },
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
  await ensureEnmicadorasSubcategory();

  const imported = [];

  for (const entry of OFFICE_4B_ENMICADORAS_CATALOG) {
    const id = `4b-em-${entry.slug}`;
    const media = await assignProductImages(entry, id, dryRun);
    const product = buildLaminatorProduct(entry, media);
    imported.push(product);
    console.log(`✓ ${entry.slug} → ${product.name}`);
  }

  const excelPath = writeEnmicadorasExcel(imported);
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

  console.log(`\nImportación enmicadoras: ${created} nuevos, ${updated} actualizados.`);
  console.log(`Total productos importados: ${imported.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
