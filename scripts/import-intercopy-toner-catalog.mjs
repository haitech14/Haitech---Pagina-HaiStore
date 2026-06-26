import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  INTERCOPY_COLOR_VARIANTS,
  INTERCOPY_MONOCHROME_SLUGS,
  INTERCOPY_TONER_CATALOG,
} from '../data/seeds/intercopy-toner-catalog.mjs';
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
  TONER_PACK_LABEL,
  TONER_PACK_TYPE_VALUE,
  tonerPackIdFromCode,
} from '../server/lib/product-bundle.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';
import { applyHaitechWatermark } from '../server/lib/image-watermark.js';
import {
  CATEGORY_COMPATIBLE_TONER,
  COMPATIBLE_TONER_SUBCATEGORY_ID,
  COMPATIBLE_TONER_SUBCATEGORY_SLUG,
} from '../shared/compatible-toner.js';
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
const PARENT_CATEGORY_ID = 'cat-toner';
const BRAND = 'Intercopy';
const INTERCOPY_CATEGORY = 'Toner Compatible';
const INTERCOPY_COLOR_ATTR = 'Negro';

const SUBCATEGORY = {
  id: COMPATIBLE_TONER_SUBCATEGORY_ID,
  name: CATEGORY_COMPATIBLE_TONER,
  slug: COMPATIBLE_TONER_SUBCATEGORY_SLUG,
  inventoryLabels: [CATEGORY_COMPATIBLE_TONER],
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
 * @param {import('../data/seeds/intercopy-toner-catalog.mjs').INTERCOPY_TONER_CATALOG[number]} entry
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
  const webp = await sharp(watermarked).webp({ quality: 82 }).toBuffer();
  const relative = `/products/${productId}.webp`;
  fs.writeFileSync(path.join(productsDir, `${productId}.webp`), webp);
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

/** @param {{ tipo: string; title: string; models: string; suffix?: string }} input */
export function buildIntercopyProductName({ tipo, title, models, suffix = '' }) {
  const subtitle = String(models ?? '').trim();
  const heading = String(title ?? '').trim();
  let name =
    tipo === 'Recarga'
      ? `Toner Recarga Intercopy ${heading}`
      : `Toner Cartucho Intercopy ${heading}`;
  if (subtitle) name = `${name} ${subtitle}`;
  if (suffix) name = `${name} + ${suffix}`;
  return name.replace(/\s{2,}/g, ' ').trim();
}

/** @param {{ tipo: string; title: string; models: string }} input */
function buildIntercopyPackName({ tipo, title, models }) {
  const item = buildIntercopyProductName({ tipo, title, models });
  return `${TONER_PACK_LABEL} ${item}`.replace(/\s{2,}/g, ' ').trim();
}

async function ensureTonerCompatiblesSubcategory() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Suministros» (cat-toner).');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Suministros');
  parentLabels.add(CATEGORY_COMPATIBLE_TONER);

  await updateStoreCategory(PARENT_CATEGORY_ID, {
    inventoryLabels: [...parentLabels],
  });

  const existing = categories.find((row) => row.id === SUBCATEGORY.id);
  if (existing) {
    const labels = new Set([...(existing.inventoryLabels ?? []), ...SUBCATEGORY.inventoryLabels]);
    await updateStoreCategory(SUBCATEGORY.id, {
      name: SUBCATEGORY.name,
      slug: SUBCATEGORY.slug,
      parentId: PARENT_CATEGORY_ID,
      inventoryLabels: [...labels],
    });
    return;
  }

  const tonerChildren = categories.filter((row) => row.parentId === PARENT_CATEGORY_ID);
  await createStoreCategory({
    id: SUBCATEGORY.id,
    name: SUBCATEGORY.name,
    slug: SUBCATEGORY.slug,
    parentId: PARENT_CATEGORY_ID,
    sortOrder: tonerChildren.length,
    inventoryLabels: SUBCATEGORY.inventoryLabels,
    image: '/categories/toner-suministros.png',
    tagline: 'Cartuchos y recargas compatibles Intercopy',
  });
}

/**
 * @param {import('../data/seeds/intercopy-toner-catalog.mjs').INTERCOPY_TONER_CATALOG[number]} entry
 */
function buildColorProducts(entry) {
  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const singles = [];

  for (const color of INTERCOPY_COLOR_VARIANTS) {
    const id = `intercopy-${entry.slug}-${color.code.toLowerCase()}`;
    const code = deriveCompatibleTonerNumericCode(id);
    const name = buildIntercopyProductName({
      tipo: entry.tipo,
      title: entry.title,
      models: entry.models,
      suffix: color.suffix,
    });

    singles.push(
      normalizeProductInput({
        id,
        code,
        name,
        description: name,
        brand: BRAND,
        category: CATEGORY_COMPATIBLE_TONER,
        currency: 'USD',
        stock: 0,
        image_url: null,
        gallery: [],
        prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
        purchase_price_usd: 0,
        attributes: normalizeAttributes([
          { name: 'Tipo', value: entry.tipo },
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

  const packId = tonerPackIdFromCode(`${entry.slug}-pack04`);
  const packCode = deriveCompatibleTonerNumericCode(packId);
  const packName = buildIntercopyPackName(entry);
  const pack = normalizeProductInput({
    id: packId,
    code: packCode,
    name: packName,
    description: packName,
    brand: BRAND,
    category: INTERCOPY_CATEGORY,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes([
      { name: 'Tipo', value: TONER_PACK_TYPE_VALUE },
      { name: 'Modelo de equipo', value: entry.models },
      { name: 'Marca compatible', value: entry.compatibleBrand },
      { name: 'Color', value: 'Color' },
      { name: 'Contenido', value: 'Cyan + Magenta + Amarillo + Negro' },
      { name: 'Proveedor', value: BRAND },
    ]),
    suppliers: [{ name: SUPPLIER_MICAMERB, purchase_price_usd: 0 }],
    bundle_components: singles.map((product) => ({
      product_id: String(product.id),
      quantity: 1,
    })),
  });

  return { singles, pack };
}

/**
 * @param {import('../data/seeds/intercopy-toner-catalog.mjs').INTERCOPY_TONER_CATALOG[number]} entry
 */
function buildMonochromeProduct(entry) {
  const id = `intercopy-${entry.slug}`;
  const code = deriveCompatibleTonerNumericCode(id);
  const name = buildIntercopyProductName({
    tipo: entry.tipo,
    title: entry.title,
    models: entry.models,
  });

  return normalizeProductInput({
    id,
    code,
    name,
    description: name,
    brand: BRAND,
    category: INTERCOPY_CATEGORY,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 },
    purchase_price_usd: 0,
    attributes: normalizeAttributes([
      { name: 'Tipo', value: entry.tipo },
      { name: 'Modelo de equipo', value: entry.models },
      { name: 'Marca compatible', value: entry.compatibleBrand },
      { name: 'Color', value: INTERCOPY_COLOR_ATTR },
      { name: 'Proveedor', value: BRAND },
    ]),
    suppliers: [{ name: SUPPLIER_MICAMERB, purchase_price_usd: 0 }],
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
  const monoOnly = process.argv.includes('--mono-only');
  await ensureTonerCompatiblesSubcategory();

  const catalogEntries = monoOnly
    ? INTERCOPY_TONER_CATALOG.filter((entry) => entry.monochrome)
    : INTERCOPY_TONER_CATALOG;

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const imported = [];
  const imageCache = new Map();

  for (const entry of catalogEntries) {
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

    if (entry.monochrome) {
      const product = buildMonochromeProduct(entry);
      await assignProductImages([product], png, dryRun);
      imported.push(product);
      console.log(`✓ ${entry.slug} → monocromático (${product.image_url})`);
      continue;
    }

    const { singles, pack } = buildColorProducts(entry);
    const group = [...singles, pack];
    await assignProductImages(group, png, dryRun);
    imported.push(...group);
    console.log(`✓ ${entry.slug} → 4 colores + pack (${group[0]?.image_url})`);
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

  const monoCount = catalogEntries.filter((entry) => entry.monochrome).length;
  const colorCount = catalogEntries.length - monoCount;

  console.log(`\nImportación Intercopy completada: ${created} nuevos, ${updated} actualizados.`);
  console.log(
    `Total productos importados: ${imported.length} (${monoCount} monocromáticos + ${colorCount} referencias CMYK × 5).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
