import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { ensureFullPrices } from '../server/lib/roles.js';
import { deriveProductSlug } from '../shared/product-slug.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '../src/data/inventory-catalog.json');

const EXCHANGE_RATE = (() => {
  try {
    const settings = JSON.parse(
      readFileSync(join(__dirname, '../server/data/company-settings.json'), 'utf8'),
    );
    const rate = Number(settings.usdToPenExchangeRate);
    return rate > 0 ? rate : 3.46;
  } catch {
    return 3.46;
  }
})();

/** Recargo comercial sobre precio público Ricoh (USD). */
const MARKUP_USD = 200;

const CATEGORY = 'Escáneres, Escáneres Nuevos';

/**
 * Precios base en soles (inc. imp.) según listado Ricoh.
 * El precio final suma MARKUP_USD convertido a soles.
 */
const SCANNERS = [
  {
    model: 'Fi-8820',
    code: 'FI-8820',
    id: '1c185cef-a7ee-4c05-8222-b2877cdc049e',
    slug: 'escaner-nuevo-ricoh-fi-8820-copia-db1d38063ed6',
    image: '/products/ricoh-fi-8820.webp',
    publicPen: 34493,
  },
  {
    model: 'Fi-8290',
    code: 'FI-8290',
    id: '03499158-6d76-4021-8c8e-b76d964bd8c2',
    slug: 'escaner-nuevo-ricoh-fi-8270-copia-b76d964bd8c2',
    image: '/products/ricoh-fi-8290.webp',
    publicPen: 11288,
  },
  {
    model: 'Fi-70F',
    code: 'FI-70F',
    id: '4f6b624d-5241-4303-9a62-dec7a47364f6',
    slug: 'escaner-nuevo-ricoh-fi-70f-dec7a47364f6',
    image: '/products/ricoh-fi-70f.webp',
    publicPen: 2037,
  },
  {
    model: 'Fi-7600',
    code: 'FI-7600',
    id: '0c04aced-a45b-493c-9944-0e35caa1b281',
    slug: 'escaner-nuevo-ricoh-fi-7480-copia-0e35caa1b281',
    image: '/products/ricoh-fi-7600.webp',
    publicPen: 18839,
  },
  {
    model: 'Fi-8270',
    code: 'FI-8270',
    id: 'bae35f26-5e4c-471d-9956-f23265f11134',
    slug: 'escaner-nuevo-ricoh-fi-8270-f23265f11134',
    image: '/products/ricoh-fi-8270.webp',
    publicPen: 7956,
  },
  {
    model: 'Fi-8190',
    code: 'FI-8190',
    id: '248a9189-ce2a-4985-ac1d-a5e84609fd9d',
    slug: 'escaner-nuevo-ricoh-fi-8190-a5e84609fd9d',
    image: '/products/ricoh-fi-8190.webp',
    publicPen: 8526,
  },
  {
    model: 'Fi-8040',
    code: 'FI-8040',
    id: 'e0ed6538-555f-4e32-ac42-1ea05f659aec',
    slug: 'escaner-nuevo-ricoh-fi-8040-1ea05f659aec',
    image: '/products/ricoh-fi-8040.webp',
    publicPen: 3149,
  },
  {
    model: 'Fi-800R',
    code: 'FI-800R',
    id: 'dbe29df7-3195-4f26-8f84-2cd9f1504ceb',
    slug: 'escaner-nuevo-ricoh-fi-800r-2cd9f1504ceb',
    image: '/products/ricoh-fi-800r.webp',
    publicPen: 2810,
  },
  {
    model: 'SV600',
    code: 'SV-600',
    id: '3a2ef2e8-c295-416b-90b6-c2ec2e4fd55b',
    slug: 'escaner-nuevo-ricoh-scansnap-sv-600-c2ec2e4fd55b',
    image: '/products/ricoh-scansnap-sv-600.webp',
    publicPen: 4773,
  },
  {
    model: 'FI-8170',
    code: 'FI-8170',
    id: '41125a96-f6ea-4c8a-b76b-95b372236905',
    slug: 'escaner-nuevo-ricoh-fi-8170-95b372236905',
    image: '/products/ricoh-fi-8170.webp',
    publicPen: 5091,
  },
  {
    model: 'FI-8150',
    code: 'FI-8150',
    id: 'b7a08fda-17f7-416f-af3f-6cd60976d91d',
    slug: 'escaner-nuevo-ricoh-fi-8150-6cd60976d91d',
    image: '/products/ricoh-fi-8150.webp',
    publicPen: 4582,
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function markedUpPen(basePen) {
  return Math.round((basePen + MARKUP_USD * EXCHANGE_RATE) * 100) / 100;
}

function buildScannerProduct(row, sortOrder) {
  const salePen = markedUpPen(row.publicPen);
  const publicUsd = penToUsd(salePen);
  const tecnicoUsd = Math.round(publicUsd * 0.9 * 100) / 100;
  const name = `Escáner Nuevo ${row.model}`;

  return normalizeProductInput(
    {
      id: row.id,
      slug: row.slug ?? deriveProductSlug({ id: row.id, name }),
      code: row.code,
      name,
      description: `Escáner Ricoh ${row.model} — equipo nuevo con garantía oficial.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: 'Ricoh',
      image_url: row.image,
      gallery: [row.image],
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: tecnicoUsd,
      }),
      attributes: [
        { id: `attr-modelo-${row.id}`, name: 'Modelo de equipo', value: row.model },
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
            gallery: prev.gallery?.length ? prev.gallery : product.gallery,
            image_url: product.image_url ?? prev.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at ?? product.created_at,
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

function writeCatalog(products) {
  writeFileSync(CATALOG_PATH, `${JSON.stringify({ products }, null, 2)}\n`, 'utf8');
}

async function main() {
  const catalogRaw = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  const catalogProducts = Array.isArray(catalogRaw.products) ? catalogRaw.products : [];

  const maxSort = catalogProducts.reduce(
    (max, product) => Math.max(max, Number(product.sort_order ?? 0)),
    0,
  );

  const imported = SCANNERS.map((scanner, index) =>
    buildScannerProduct(scanner, maxSort + index + 1),
  );

  const { products: mergedCatalog, created, updated } = mergeByCode(catalogProducts, imported);
  const { products: catalogOrdered } = ensureProductSortOrders(mergedCatalog);

  writeCatalog(catalogOrdered);
  console.log(
    `Catálogo (${CATALOG_PATH}): ${created} creados, ${updated} actualizados.`,
  );

  try {
    const inventory = await readInventory();
    const maxInvSort = inventory.products.reduce(
      (max, product) => Math.max(max, Number(product.sort_order ?? 0)),
      0,
    );
    const importedInv = SCANNERS.map((scanner, index) =>
      buildScannerProduct(scanner, maxInvSort + index + 1),
    );
    const { products: mergedInv } = mergeByCode(inventory.products, importedInv);
    const { products: invOrdered } = ensureProductSortOrders(mergedInv);
    await writeInventory({
      products: invOrdered,
      deletedProductIds: inventory.deletedProductIds,
      warehouses: inventory.warehouses,
    });
    console.log('Inventario del servidor sincronizado.');
  } catch (error) {
    console.warn('Inventario del servidor no actualizado:', error?.message ?? error);
  }

  console.log(
    `Recargo aplicado: +$${MARKUP_USD} USD (≈ S/ ${Math.round(MARKUP_USD * EXCHANGE_RATE)}) · TC ${EXCHANGE_RATE}`,
  );
  for (const row of SCANNERS) {
    const salePen = markedUpPen(row.publicPen);
    const publicUsd = penToUsd(salePen);
    console.log(
      `  [${row.code}] Escáner Nuevo ${row.model} — S/ ${salePen.toLocaleString('es-PE')} · $${publicUsd}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
