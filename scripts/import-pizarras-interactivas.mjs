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

const CATEGORY = 'Pizarras Interactivas';
const BRAND = 'Ricoh';

const ASSETS = join(
  process.env.USERPROFILE ?? '',
  '.cursor',
  'projects',
  'd-Haitech-Software-HaiStore-Haitech-Pagina-HaiStore',
  'assets',
);

const SCREENSHOTS = [
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_efdaa8a5a4f29c24c24f96732c49ba2a_images_image-8ae12cb7-cda4-4f37-856e-ea5181a1137c.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_efdaa8a5a4f29c24c24f96732c49ba2a_images_image-f999cd40-1cf3-4010-89c6-96e1cda3fb51.png`,
];

const TECNICO_MARKUP_USD = 300;
const PUBLIC_MARKUP_USD = 200;

/** @type {Array<{ code: string; name: string; listPen: number; screen: string; shot: number; col: number; cols?: number }>} */
const PRODUCTS = [
  {
    code: 'A6510',
    name: 'Pizarra Interactiva Nueva Ricoh A6510 65" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    listPen: 8854,
    screen: '65"',
    shot: 0,
    col: 0,
    cols: 2,
  },
  {
    code: 'A8610',
    name: 'Pizarra Interactiva Nueva Ricoh A8610 86" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    listPen: 13920,
    screen: '86"',
    shot: 0,
    col: 1,
    cols: 2,
  },
  {
    code: 'A7510',
    name: 'Pizarra Interactiva Nueva Ricoh A7510 75" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    listPen: 10904,
    screen: '75"',
    shot: 1,
    col: 0,
    cols: 1,
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function buildRolePricesFromListPen(listPen) {
  const listUsd = penToUsd(listPen);
  const tecnicoUsd = Math.round((listUsd + TECNICO_MARKUP_USD) * 100) / 100;
  const publicUsd = Math.round((tecnicoUsd + PUBLIC_MARKUP_USD) * 100) / 100;
  return { listUsd, tecnicoUsd, publicUsd };
}

function slugFromCode(code) {
  return `pizarra-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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

async function saveProductImage(productId, shot, col, cols = 3) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const source = SCREENSHOTS[shot];
  const base = sanitizeProductId(productId);
  const outPath = join(PRODUCTS_DIR, `${base}.webp`);
  const buffer = await cropCardImage(source, col, cols);
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
  const { listUsd, tecnicoUsd, publicUsd } = buildRolePricesFromListPen(entry.listPen);
  const id = slugFromCode(entry.code);
  const name = entry.name;

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name }),
      code: entry.code,
      name,
      description: `${name} — equipo Ricoh para salas de reunión y colaboración.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: BRAND,
      image_url: imageUrl,
      gallery: [imageUrl],
      purchase_price_usd: listUsd,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: tecnicoUsd,
      }),
      attributes: [
        { name: 'Modelo de equipo', value: entry.code },
        { name: 'Pantalla', value: entry.screen },
        { name: 'Resolución', value: '4K' },
        { name: 'Sistema operativo', value: 'Android 13' },
      ],
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
    const imageUrl = await saveProductImage(productId, entry.shot, entry.col, entry.cols ?? 3);
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
  console.log(`Pizarras interactivas: ${created} nuevos, ${updated} actualizados.`);
  for (const entry of PRODUCTS) {
    const { listUsd, tecnicoUsd, publicUsd } = buildRolePricesFromListPen(entry.listPen);
    console.log(
      `  [${entry.code}] lista S/ ${entry.listPen} ($${listUsd}) · técnico $${tecnicoUsd} · público $${publicUsd}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
