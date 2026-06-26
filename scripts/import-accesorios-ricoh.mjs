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

const CATEGORY = 'Accesorios';
const BRAND = 'Ricoh';

const ASSETS = 'C:/Users/nicol/.cursor/projects/c-Users-nicol-HaiStore/assets';

const SCREENSHOTS = [
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-add0f27f-71ad-4e11-9944-2f90700b9e5b.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-9ff0d3cf-47a3-47b0-8c25-5fb4cae45b08.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-8ff12895-f0ca-4849-bb08-16a6e582b7e3.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-bb87b2fb-e996-4233-b555-aaa79dceaf9b.png`,
  `${ASSETS}/c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-71a833a2-faa9-423e-a087-0231b872d8a9.png`,
];

/** @type {Array<{ code: string; name: string; publicPen: number; shot: number; col: number; cols?: number; mergeCode?: string }>} */
const ACCESSORIES = [
  { code: 'GAB-IM370-460', name: 'Gabinete alto IM 370-460', publicPen: 199, shot: 0, col: 0 },
  { code: 'ARDF-DF3110', name: 'Bandeja ARDF DF3110', publicPen: 3990, shot: 0, col: 1, mergeCode: '418373' },
  { code: 'ESTAB-2.5KVA', name: 'Estabilizador 2.5 KVA', publicPen: 2078, shot: 0, col: 2 },
  { code: 'ESTAB-1.5KVA', name: 'Estabilizador 1.5 KVA', publicPen: 1546, shot: 1, col: 0 },
  {
    code: 'GAB-IM2010-6010',
    name: 'Gabinete para IM 2010/2510/3010/4510/6010',
    publicPen: 750,
    shot: 1,
    col: 1,
  },
  {
    code: 'GAB-IMC2010-6010',
    name: 'Gabinete para IM C2010/2510/3010/4510/6010',
    publicPen: 806,
    shot: 1,
    col: 2,
  },
  { code: 'DRUM-M400', name: 'Unidad de Tambor M 400', publicPen: 225, shot: 2, col: 0 },
  { code: 'GAB-TIPO-F', name: 'Gabinete Tipo F', publicPen: 726, shot: 2, col: 1 },
  { code: 'GAB-TIPO-U-739', name: 'Gabinete Alto tipo U', publicPen: 739, shot: 2, col: 2 },
  { code: 'GAB-TIPO-Q-670', name: 'Gabinete Alto tipo Q', publicPen: 670, shot: 3, col: 0 },
  { code: 'GAB-TIPO-Q-1049', name: 'Gabinete Alto tipo Q', publicPen: 1049, shot: 3, col: 1 },
  {
    code: 'PB1160',
    name: 'Unidad de Recarga de Papel PB1160',
    publicPen: 1831,
    shot: 3,
    col: 2,
    mergeCode: '418475',
  },
  { code: 'GAB-TIPO-U-830', name: 'Gabinete Alto tipo U', publicPen: 830, shot: 4, col: 0, cols: 2 },
  {
    code: 'PB1100LE',
    name: 'Unidad de Recarga de Papel PB1100LE',
    publicPen: 1171,
    shot: 4,
    col: 1,
    cols: 2,
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
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

function slugFromCode(code) {
  return `accesorio-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

async function saveProductImage(productId, shot, col, cols = 3) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  const source = SCREENSHOTS[shot];
  const base = sanitizeProductId(productId);
  const outPath = join(PRODUCTS_DIR, `${base}.webp`);
  const buffer = await cropCardImage(source, col, cols);
  await sharp(buffer).webp({ quality: 82 }).toFile(outPath);
  return `/products/${base}.webp`;
}

function withNuevoSuffix(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed || /\bnuevo\b$/i.test(trimmed)) return trimmed;
  return `${trimmed} Nuevo`;
}

function buildAccessoryProduct(entry, imageUrl, sortOrder, productId) {
  const publicUsd = penToUsd(entry.publicPen);
  const tecnicoUsd = Math.round(publicUsd * 0.9 * 100) / 100;
  const id = productId ?? slugFromCode(entry.code);
  const name = withNuevoSuffix(entry.name);

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name }),
      code: entry.code,
      name,
      description: `${name} — accesorio Ricoh original.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: BRAND,
      image_url: imageUrl,
      gallery: [imageUrl],
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

function findDuplicateWarnings(existing, incoming) {
  const warnings = [];
  const nameCounts = new Map();

  for (const entry of ACCESSORIES) {
    nameCounts.set(entry.name, (nameCounts.get(entry.name) ?? 0) + 1);
  }

  for (const [name, count] of nameCounts) {
    if (count > 1) {
      const variants = ACCESSORIES.filter((item) => item.name === name).map(
        (item) => `${item.code} (S/ ${item.publicPen})`,
      );
      warnings.push(`Nombre duplicado en el lote: «${name}» → ${variants.join(', ')}`);
    }
  }

  for (const entry of ACCESSORIES) {
    if (!entry.mergeCode) continue;
    const prev = existing.find(
      (product) => String(product.code ?? '').trim().toUpperCase() === entry.mergeCode.toUpperCase(),
    );
    if (prev) {
      warnings.push(
        `Posible duplicado con inventario: «${entry.name}» (${entry.code}) coincide con «${prev.name}» [${prev.code}] en categoría «${prev.category}». Se actualizará código ${entry.mergeCode} a Accesorios con el nuevo precio.`,
      );
    }
  }

  return warnings;
}

async function main() {
  const inventory = await readInventory();
  const warnings = findDuplicateWarnings(inventory.products, ACCESSORIES);
  const baseSort =
    Math.max(0, ...inventory.products.map((product) => Number(product.sort_order) || 0)) + 1;

  const incoming = [];
  for (let index = 0; index < ACCESSORIES.length; index += 1) {
    const entry = ACCESSORIES[index];
    const existing = entry.mergeCode
      ? inventory.products.find(
          (item) => String(item.code ?? '').toUpperCase() === entry.mergeCode.toUpperCase(),
        )
      : undefined;
    const productId = existing?.id ?? slugFromCode(entry.code);
    const imageUrl = await saveProductImage(productId, entry.shot, entry.col, entry.cols ?? 3);
    const product = buildAccessoryProduct(
      { ...entry, code: entry.mergeCode ?? entry.code },
      imageUrl,
      baseSort + index,
      productId,
    );
    if (existing) {
      product.id = existing.id;
      product.slug = existing.slug ?? product.slug;
      product.created_at = existing.created_at;
    }
    incoming.push(product);
  }

  const { products, created, updated } = mergeByCode(inventory.products, incoming);
  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Tipo de cambio USD→PEN: ${EXCHANGE_RATE}`);
  console.log(`Accesorios importados: ${created} nuevos, ${updated} actualizados.`);
  console.log('Productos:');
  for (const entry of ACCESSORIES) {
    const publicUsd = penToUsd(entry.publicPen);
    const tecnicoUsd = Math.round(publicUsd * 0.9 * 100) / 100;
    console.log(
      `  [${entry.mergeCode ?? entry.code}] ${entry.name} — público S/ ${entry.publicPen} ($${publicUsd}) · técnico $${tecnicoUsd}`,
    );
  }

  if (warnings.length > 0) {
    console.log('\n⚠ Duplicados / revisar:');
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
