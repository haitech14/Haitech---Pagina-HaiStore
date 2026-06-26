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

const CATEGORY = 'Equipamiento para Videoconferencias';

const ASSETS = 'C:/Users/nicol/.cursor/projects/c-Users-nicol-HaiStore/assets';

const SCREENSHOTS = [
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-e177252b-5b67-4d37-bfc4-0d37993de55d.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-a8591c29-a942-427c-8211-ab175e6a1671.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-aca96ab3-b896-4d61-9540-4545e2ea6009.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-35e6280d-2e01-4d84-9b33-87bd334c6c56.png`,
];

/** @type {Array<{ code: string; name: string; brand: string; publicPen: number; shot: number; col: number; cols?: number }>} */
const PRODUCTS = [
  {
    code: 'JABRA-SPEAK2-75',
    name: 'Jabra Speak2 75 MS Teams Link 380a BT USB-C/A',
    brand: 'Jabra',
    publicPen: 1343,
    shot: 0,
    col: 0,
  },
  {
    code: 'JABRA-SPEAK2-55',
    name: 'Jabra Speak2 55 MS Teams BT USB-C/A',
    brand: 'Jabra',
    publicPen: 645,
    shot: 0,
    col: 1,
  },
  {
    code: 'JABRA-PANACAST-20',
    name: 'Jabra PanaCast 20 camara WEB',
    brand: 'Jabra',
    publicPen: 820,
    shot: 0,
    col: 2,
  },
  {
    code: 'NEARITY-V415',
    name: 'V415 4K PTZ Cámara para conferencia Nearity',
    brand: 'Ricoh',
    publicPen: 3573,
    shot: 1,
    col: 0,
  },
  {
    code: 'NEARITY-V410',
    name: 'V410 2K PTZ Cámara para conferencia Nearity',
    brand: 'Ricoh',
    publicPen: 2818,
    shot: 1,
    col: 1,
  },
  {
    code: 'NEARITY-A11',
    name: 'A11 Altavoz para conferencias Nearity',
    brand: 'Ricoh',
    publicPen: 1227,
    shot: 1,
    col: 2,
  },
  {
    code: 'NEARITY-A20',
    name: 'A20 Altavoz para conferencias Nearity',
    brand: 'Ricoh',
    publicPen: 1840,
    shot: 2,
    col: 0,
  },
  {
    code: 'NEARITY-C30R',
    name: 'C30R All in One Cámara para conferencia Nearity',
    brand: 'Ricoh',
    publicPen: 3680,
    shot: 2,
    col: 1,
  },
  {
    code: 'LOGITECH-MEETUP-MOUNT',
    name: 'Soporte de Televisión Logitech para MeetUp',
    brand: 'Logitech',
    publicPen: 491,
    shot: 2,
    col: 2,
  },
  {
    code: 'LG-MONITOR-49-UHD',
    name: 'Monitor LED 49" 24/7 Ultra HD 500nits Profesi',
    brand: 'LG',
    publicPen: 2628,
    shot: 3,
    col: 0,
    cols: 1,
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function slugFromCode(code) {
  return `videoconf-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
  const publicUsd = penToUsd(entry.publicPen);
  const roleUsd = Math.round(publicUsd * 0.9 * 100) / 100;
  const id = slugFromCode(entry.code);
  const name = entry.name;

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name }),
      code: entry.code,
      name,
      description: `${name} — equipamiento para videoconferencias.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: entry.brand,
      image_url: imageUrl,
      gallery: [imageUrl],
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: roleUsd,
        distribuidor: roleUsd,
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
  console.log(`Videoconferencias: ${created} nuevos, ${updated} actualizados.`);
  for (const entry of PRODUCTS) {
    const publicUsd = penToUsd(entry.publicPen);
    const roleUsd = Math.round(publicUsd * 0.9 * 100) / 100;
    console.log(
      `  [${entry.code}] ${entry.name} — público S/ ${entry.publicPen} ($${publicUsd}) · técnico/distribuidor $${roleUsd}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
