import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { ensureFullPrices } from '../server/lib/roles.js';
import { deriveProductSlug } from '../shared/product-slug.js';
import { sanitizeProductId } from '../shared/product-stock-images.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRODUCTS_DIR = join(ROOT, 'public', 'products');

const EXCHANGE_RATE = (() => {
  try {
    const settings = JSON.parse(
      readFileSync(join(ROOT, 'server/data/company-settings.json'), 'utf8'),
    );
    const rate = Number(settings.usdToPenExchangeRate);
    return rate > 0 ? rate : 3.46;
  } catch {
    return 3.46;
  }
})();

const CATEGORY = 'Laptops';
const ASSETS = 'C:/Users/nicol/.cursor/projects/c-Users-nicol-HaiStore/assets';

const SCREENSHOTS = [
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-e18bc8fc-1d92-42b6-b5da-6034119c1ad9.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-be129cc7-451e-48c1-8a8d-9ea94737c3eb.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-486d2562-7c2c-423f-9da8-f62314a9c822.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-c298009d-cd9e-45df-ba47-368005cffe34.png`,
];

/** @type {Array<{ code: string; brand: string; rawName: string; listedPen: number; shot: number; col: number }>} */
const PRODUCTS = [
  {
    code: 'LENOVO-TP-T16-G3',
    brand: 'Lenovo',
    rawName: 'Laptop LENOVO TP T16 NB G3 ULT5 125U IA 16GB 512GB 16" W11P',
    listedPen: 4872,
    shot: 0,
    col: 0,
  },
  {
    code: 'APPLE-MBP16-M4PRO-512',
    brand: 'Apple',
    rawName: 'MacBook Pro 16" M4 Pro 24GB 512GB Plata',
    listedPen: 14515,
    shot: 0,
    col: 1,
  },
  {
    code: 'APPLE-MBP14-M4PRO-512',
    brand: 'Apple',
    rawName: 'MacBook Pro 14" M4 Pro 24GB/512GB Plata',
    listedPen: 11657,
    shot: 0,
    col: 2,
  },
  {
    code: 'APPLE-MBA13-M4-256',
    brand: 'Apple',
    rawName: 'MacBook Air 13" M4 16GB 256GB Azul Celeste',
    listedPen: 5829,
    shot: 1,
    col: 0,
  },
  {
    code: 'APPLE-MBA13-M2-256',
    brand: 'Apple',
    rawName: 'MacBook Air M2 13" 16GB 256GB Medianoche',
    listedPen: 4050,
    shot: 1,
    col: 1,
  },
  {
    code: 'APPLE-IPAD-WIFI-128-BLUE',
    brand: 'Apple',
    rawName: 'iPad Wi-Fi 128GB - Blue',
    listedPen: 1638,
    shot: 1,
    col: 2,
  },
  {
    code: 'APPLE-IPAD-WIFI-128-SILVER',
    brand: 'Apple',
    rawName: 'iPad Wi-Fi 128GB - Silver',
    listedPen: 1638,
    shot: 2,
    col: 0,
  },
  {
    code: 'DELL-PRECISION-3490-U7',
    brand: 'Dell',
    rawName: 'DELL Precision 3490 Ultra 7 155H',
    listedPen: 7362,
    shot: 2,
    col: 1,
  },
  {
    code: 'LENOVO-M70Q-G5-I5',
    brand: 'Lenovo',
    rawName: 'M70q GEN 5 I5',
    listedPen: 2536,
    shot: 2,
    col: 2,
  },
  {
    code: 'DELL-LATITUDE-3440-I5',
    brand: 'Dell',
    rawName: 'Dell Latitude 3440 i5-1335U 13ª Gen',
    listedPen: 3312,
    shot: 3,
    col: 0,
  },
  {
    code: 'HP-PROBOOK-450-G10',
    brand: 'HP',
    rawName: 'HP ProBook 450 G10 i5-1335U 16GB SSD 512GB',
    listedPen: 3490,
    shot: 3,
    col: 1,
  },
  {
    code: 'DELL-OPTIPLEX-7010-MICRO',
    brand: 'Dell',
    rawName: 'PC Oficina - OptiPlex 7010 Micro i7-13700T 16GB',
    listedPen: 3405,
    shot: 3,
    col: 2,
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function pricesFromListedPen(listedPen) {
  const publicPen = Math.round(listedPen * 1.05 * 100) / 100;
  const tecnicoPen = Math.round(publicPen * 0.95 * 100) / 100;
  return {
    publicPen,
    tecnicoPen,
    publicUsd: penToUsd(publicPen),
    tecnicoUsd: penToUsd(tecnicoPen),
  };
}

function displayName(brand, rawName) {
  const clean = rawName.replace(/\s*-\s*Tienda Ricoh\s*$/i, '').trim();
  if (brand.toLowerCase() === 'apple') return clean;
  if (/^laptop nueva\b/i.test(clean)) return clean;
  const withoutLeadingLaptop = clean.replace(/^laptop\s+/i, '').trim();
  return `Laptop Nueva ${withoutLeadingLaptop}`;
}

function slugFromCode(code) {
  return `laptop-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

async function cropCardImage(sourcePath, colIndex, colsCount = 3) {
  const meta = await sharp(sourcePath).metadata();
  const totalW = meta.width ?? 0;
  const totalH = meta.height ?? 0;
  const colW = Math.floor(totalW / colsCount);
  const left = colIndex * colW + Math.floor(colW * 0.06);
  const width = Math.floor(colW * 0.88);
  const top = Math.floor(totalH * 0.03);
  const height = Math.floor(totalH * 0.54);

  return sharp(sourcePath)
    .extract({ left, top, width, height })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function saveProductImage(productId, shot, col) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const source = SCREENSHOTS[shot];
  const base = sanitizeProductId(productId);
  const outPath = join(PRODUCTS_DIR, `${base}.webp`);
  const buffer = await cropCardImage(source, col, 3);
  await sharp(buffer).webp({ quality: 82 }).toFile(outPath);

  for (const [suffix, width] of [
    ['-256', 256],
    ['-512', 512],
  ]) {
    await sharp(outPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(PRODUCTS_DIR, `${base}${suffix}.webp`));
  }

  return `/products/${base}.webp`;
}

function buildProduct(entry, imageUrl, sortOrder) {
  const name = displayName(entry.brand, entry.rawName);
  const { publicUsd, tecnicoUsd } = pricesFromListedPen(entry.listedPen);
  const id = slugFromCode(entry.code);

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name }),
      code: entry.code,
      name,
      description: `${name} — equipo nuevo disponible en HaiStore.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: entry.brand,
      image_url: imageUrl,
      gallery: [imageUrl],
      is_new: true,
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: tecnicoUsd,
      }),
      attributes: [],
    },
    undefined,
  );
}

function mergeByCode(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [String(product.code ?? '').trim().toUpperCase(), product]),
  );

  let created = 0;
  let updated = 0;

  for (const product of incoming) {
    const key = String(product.code ?? '').trim().toUpperCase();
    const prev = byCode.get(key);

    if (prev) {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            id: prev.id,
            slug: prev.slug ?? product.slug,
            sort_order: prev.sort_order ?? product.sort_order,
            stock: prev.stock,
            stock_by_warehouse: prev.stock_by_warehouse,
            gallery: product.gallery?.length ? product.gallery : prev.gallery,
            image_url: product.image_url || prev.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at,
          },
          prev,
        ),
      );
      updated += 1;
    } else {
      byCode.set(key, product);
      created += 1;
    }
  }

  return { products: [...byCode.values()], created, updated };
}

async function main() {
  const inventory = await readInventory();
  const baseSort =
    Math.max(0, ...inventory.products.map((product) => Number(product.sort_order) || 0)) + 1;

  const incoming = [];
  for (let index = 0; index < PRODUCTS.length; index += 1) {
    const entry = PRODUCTS[index];
    const productId = slugFromCode(entry.code);
    const imageUrl = await saveProductImage(productId, entry.shot, entry.col);
    incoming.push(buildProduct(entry, imageUrl, baseSort + index));
  }

  const { products, created, updated } = mergeByCode(inventory.products, incoming);
  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Tipo de cambio USD→PEN: ${EXCHANGE_RATE}`);
  console.log(`Laptops: ${created} nuevos, ${updated} actualizados.`);
  for (const entry of PRODUCTS) {
    const name = displayName(entry.brand, entry.rawName);
    const { publicPen, tecnicoPen, publicUsd, tecnicoUsd } = pricesFromListedPen(entry.listedPen);
    console.log(
      `  [${entry.code}] ${name}\n` +
        `    listado S/ ${entry.listedPen} → público S/ ${publicPen} ($${publicUsd}) · técnico S/ ${tecnicoPen} ($${tecnicoUsd})`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
