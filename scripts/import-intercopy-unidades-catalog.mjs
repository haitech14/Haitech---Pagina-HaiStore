import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  INTERCOPY_UNIDADES_CATALOG,
  INTERCOPY_UNIDADES_COLOR_VARIANTS,
} from '../data/seeds/intercopy-unidades-catalog.mjs';
import { SUPPLIER_MICAMERB } from '../server/lib/compatible-toner-excel.js';
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
  CATEGORY_COMPATIBLE_UNITS,
  COMPATIBLE_UNITS_INVENTORY_LABELS,
  COMPATIBLE_UNITS_SUBCATEGORY_ID,
  COMPATIBLE_UNITS_SUBCATEGORY_SLUG,
  REPUESTOS_COMPATIBLES_PARENT_ID,
} from '../shared/compatible-units.js';
import { deriveCompatibleTonerNumericCode } from '../shared/compatible-toner-product-code.js';

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
const BRAND = 'Intercopy';

const SUBCATEGORY = {
  id: COMPATIBLE_UNITS_SUBCATEGORY_ID,
  name: 'Unidades Compatibles',
  slug: COMPATIBLE_UNITS_SUBCATEGORY_SLUG,
  inventoryLabels: COMPATIBLE_UNITS_INVENTORY_LABELS,
};

/** @param {number} r @param {number} g @param {number} b */
function isBlueBorderPixel(r, g, b) {
  return b > 100 && b - r > 30 && b - g > 10 && r < 120;
}

/**
 * @param {Buffer} inputBuffer
 */
async function extractProductPhoto(inputBuffer) {
  const { data, info } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;

  for (let y = 0; y < h; y += 1) {
    let count = 0;
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 3;
      if (isBlueBorderPixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > w * 0.5) {
      top = y;
      break;
    }
  }

  for (let y = h - 1; y >= 0; y -= 1) {
    let count = 0;
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 3;
      if (isBlueBorderPixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > w * 0.5) {
      bottom = y;
      break;
    }
  }

  for (let x = 0; x < w; x += 1) {
    let count = 0;
    for (let y = top; y < bottom; y += 1) {
      const i = (y * w + x) * 3;
      if (isBlueBorderPixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > (bottom - top) * 0.5) {
      left = x;
      break;
    }
  }

  for (let x = w - 1; x >= 0; x -= 1) {
    let count = 0;
    for (let y = top; y < bottom; y += 1) {
      const i = (y * w + x) * 3;
      if (isBlueBorderPixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > (bottom - top) * 0.5) {
      right = x;
      break;
    }
  }

  const pad = 6;
  const crop = {
    left: left + pad,
    top: top + pad,
    width: Math.max(1, right - left - pad * 2),
    height: Math.max(1, bottom - top - pad * 2),
  };

  const minCropDimension = 80;
  if (crop.width < minCropDimension || crop.height < minCropDimension) {
    return sharp(inputBuffer)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer();
  }

  return sharp(inputBuffer)
    .extract(crop)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

/** @param {string} imageId */
function resolveAssetPath(imageId) {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`No se encontró la carpeta de assets: ${assetsDir}`);
  }
  const match = fs
    .readdirSync(assetsDir)
    .find((file) => file.includes(`images_image-${imageId}`));
  if (!match) {
    return null;
  }
  return path.join(assetsDir, match);
}

/**
 * @param {import('../data/seeds/intercopy-unidades-catalog.mjs').INTERCOPY_UNIDADES_CATALOG[number]} entry
 */
async function extractCatalogImage(entry) {
  const sourcePath = resolveAssetPath(entry.imageId);
  if (!sourcePath) {
    return null;
  }
  const meta = await sharp(sourcePath).metadata();

  let cellBuffer;
  if (entry.grid) {
    const { col, row, cols, rows } = entry.grid;
    const cellWidth = Math.floor(meta.width / cols);
    const cellHeight = Math.floor(meta.height / rows);
    cellBuffer = await sharp(sourcePath)
      .extract({
        left: col * cellWidth,
        top: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      })
      .png()
      .toBuffer();
  } else {
    cellBuffer = await fs.promises.readFile(sourcePath);
  }

  return extractProductPhoto(cellBuffer);
}

/**
 * @param {string} productId
 * @param {Buffer} pngBuffer
 */
async function saveProductImage(productId, pngBuffer) {
  fs.mkdirSync(productsDir, { recursive: true });
  const resized = await sharp(pngBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: `/products/${productId}.webp`,
  });
  const basePath = path.join(productsDir, productId);
  const webp = await sharp(watermarked).webp({ quality: 82 }).toBuffer();
  const relative = `/products/${productId}.webp`;
  fs.writeFileSync(`${basePath}.webp`, webp);

  for (const { suffix, width } of [
    { suffix: '-256', width: 256 },
    { suffix: '-512', width: 512 },
  ]) {
    await sharp(watermarked)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(`${basePath}${suffix}.webp`);
  }

  return relative;
}

async function assignProductImages(products, pngBuffer, dryRun) {
  for (const product of products) {
    const productId = String(product.id);
    product.image_url = dryRun
      ? `/products/${productId}.webp`
      : await saveProductImage(productId, pngBuffer);
    product.gallery = [];
  }
}

/**
 * @param {{ title: string; models: string; suffix?: string }} input
 */
export function buildUnidadCompatibleProductName({ title, models, suffix = '' }) {
  const heading = String(title ?? '').trim();
  const subtitle = String(models ?? '').trim();
  let name = `Unidad de imagen Compatible ${heading}`;
  if (subtitle) name = `${name} ${subtitle}`;
  if (suffix) name = `${name} ${suffix}`;
  return name.replace(/\s{2,}/g, ' ').trim();
}

/**
 * @param {import('../data/seeds/intercopy-unidades-catalog.mjs').INTERCOPY_UNIDADES_CATALOG[number]} entry
 */
function needsFourColors(entry) {
  if (entry.monochrome) return false;
  const haystack = `${entry.title ?? ''} ${entry.models ?? ''}`;
  if (/\bMP\s+C/i.test(haystack)) return true;
  if (/\b(BH\s*C|BHC|BZ\s*C|IR\s*C)\s*\d/i.test(haystack)) return true;
  if (/\bCMYK\b/i.test(haystack)) return true;
  return false;
}

async function ensureUnidadesCompatiblesSubcategory() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === REPUESTOS_COMPATIBLES_PARENT_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Repuestos Compatibles».');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Repuestos Compatibles');
  parentLabels.add('Repuesto Compatible');
  parentLabels.add('Repuestos, Repuestos Compatibles');
  for (const label of SUBCATEGORY.inventoryLabels) {
    parentLabels.add(label);
  }

  await updateStoreCategory(REPUESTOS_COMPATIBLES_PARENT_ID, {
    inventoryLabels: [...parentLabels],
  });

  const existing = categories.find((row) => row.id === SUBCATEGORY.id);
  if (existing) {
    const labels = new Set([...(existing.inventoryLabels ?? []), ...SUBCATEGORY.inventoryLabels]);
    await updateStoreCategory(SUBCATEGORY.id, {
      name: SUBCATEGORY.name,
      slug: SUBCATEGORY.slug,
      parentId: REPUESTOS_COMPATIBLES_PARENT_ID,
      inventoryLabels: [...labels],
    });
    return;
  }

  const siblings = categories.filter((row) => row.parentId === REPUESTOS_COMPATIBLES_PARENT_ID);
  await createStoreCategory({
    id: SUBCATEGORY.id,
    name: SUBCATEGORY.name,
    slug: SUBCATEGORY.slug,
    parentId: REPUESTOS_COMPATIBLES_PARENT_ID,
    sortOrder: siblings.length,
    inventoryLabels: SUBCATEGORY.inventoryLabels,
    image: '/categories/repuestos.png',
    tagline: 'Unidades de imagen compatibles MICAMERB',
  });
}

/**
 * @param {import('../data/seeds/intercopy-unidades-catalog.mjs').INTERCOPY_UNIDADES_CATALOG[number]} entry
 */
function buildColorProducts(entry) {
  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];

  for (const color of INTERCOPY_UNIDADES_COLOR_VARIANTS) {
    const id = `intercopy-ui-${entry.slug}-${color.code.toLowerCase()}`;
    const code = deriveCompatibleTonerNumericCode(id);
    const name = buildUnidadCompatibleProductName({
      title: entry.title,
      models: entry.models,
      suffix: color.suffix,
    });

    products.push(
      normalizeProductInput({
        id,
        code,
        name,
        description: name,
        brand: BRAND,
        category: CATEGORY_COMPATIBLE_UNITS,
        currency: 'USD',
        stock: 0,
        image_url: null,
        gallery: [],
        prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
        purchase_price_usd: 0,
        attributes: normalizeAttributes([
          { name: 'Tipo', value: 'Unidad de imagen' },
          { name: 'Modelo de equipo', value: entry.models },
          { name: 'Marca compatible', value: entry.compatibleBrand },
          { name: 'Color', value: color.attribute },
          { name: 'Proveedor', value: BRAND },
        ]),
        suppliers: [{ name: SUPPLIER_MICAMERB, purchase_price_usd: 0 }],
        bundle_components: [],
      }),
    );
  }

  return products;
}

/**
 * @param {import('../data/seeds/intercopy-unidades-catalog.mjs').INTERCOPY_UNIDADES_CATALOG[number]} entry
 */
function buildMonochromeProduct(entry) {
  const id = `intercopy-ui-${entry.slug}`;
  const code = deriveCompatibleTonerNumericCode(id);
  const name = buildUnidadCompatibleProductName({
    title: entry.title,
    models: entry.models,
  });

  return normalizeProductInput({
    id,
    code,
    name,
    description: name,
    brand: BRAND,
    category: CATEGORY_COMPATIBLE_UNITS,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes([
      { name: 'Tipo', value: 'Unidad de imagen' },
      { name: 'Modelo de equipo', value: entry.models },
      { name: 'Marca compatible', value: entry.compatibleBrand },
      { name: 'Color', value: 'Negro' },
      { name: 'Proveedor', value: BRAND },
    ]),
    suppliers: [{ name: SUPPLIER_MICAMERB, purchase_price_usd: 0 }],
    bundle_components: [],
  });
}

function syncCatalogJson(products, removeIds = []) {
  const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const byId = new Map((catalog.products ?? []).map((product) => [String(product.id), product]));

  for (const id of removeIds) {
    byId.delete(String(id));
  }

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
  await ensureUnidadesCompatiblesSubcategory();

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const imported = [];
  const imageCache = new Map();

  for (const entry of INTERCOPY_UNIDADES_CATALOG) {
    const cacheKey = `${entry.imageId}:${entry.grid ? `${entry.grid.col},${entry.grid.row}` : 'single'}`;
    if (!imageCache.has(cacheKey)) {
      const png = await extractCatalogImage(entry);
      if (!png) {
        console.warn(`⚠ ${entry.slug}: imagen no encontrada (${entry.imageId}), se omite.`);
        continue;
      }
      imageCache.set(cacheKey, png);
    }

    const png = imageCache.get(cacheKey);
    const group = needsFourColors(entry)
      ? buildColorProducts(entry)
      : [buildMonochromeProduct(entry)];

    await assignProductImages(group, png, dryRun);
    imported.push(...group);

    const mode = needsFourColors(entry) ? '4 colores' : 'monocromático';
    console.log(`✓ ${entry.slug} → ${mode} (${group[0]?.image_url})`);
  }

  if (dryRun) {
    console.log(`\n(dry-run) ${imported.length} productos listos, sin escribir inventario.`);
    return;
  }

  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  const byId = new Map(inventory.products.map((product) => [String(product.id), product]));
  const deletedProductIds = new Set(inventory.deletedProductIds ?? []);

  for (const entry of INTERCOPY_UNIDADES_CATALOG.filter((row) => needsFourColors(row))) {
    const staleId = `intercopy-ui-${entry.slug}`;
    if (byId.has(staleId)) {
      byId.delete(staleId);
      deletedProductIds.add(staleId);
    }
  }

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
    deletedProductIds: [...deletedProductIds],
    warehouses,
  });

  const staleMonoIds = INTERCOPY_UNIDADES_CATALOG.filter((entry) => needsFourColors(entry)).map(
    (entry) => `intercopy-ui-${entry.slug}`,
  );

  syncCatalogJson(
    imported.map((product) => sorted.find((row) => String(row.id) === String(product.id)) ?? product),
    staleMonoIds,
  );

  const colorRefs = INTERCOPY_UNIDADES_CATALOG.filter((entry) => needsFourColors(entry)).length;
  const monoRefs = INTERCOPY_UNIDADES_CATALOG.length - colorRefs;

  console.log(`\nImportación unidades compatibles completada: ${created} nuevos, ${updated} actualizados.`);
  console.log(
    `Total productos importados: ${imported.length} (${monoRefs} referencias monocromáticas + ${colorRefs} referencias CMYK × 4).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
