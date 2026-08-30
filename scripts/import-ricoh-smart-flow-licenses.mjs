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
    return rate > 0 ? rate : 3.42;
  } catch {
    return 3.42;
  }
})();

const MARKUP_USD = 150;
const CATEGORY = 'Software';
const IMAGE_URL = '/categories/soluciones-negocio.png';

/** Licencias Ricoh Smart Flow / DocuWare Cloud. Precios base en soles (inc. imp.). */
const LICENSES = [
  {
    id: 'b2e4f6a8-1c3d-4e5f-9a0b-smart-flow-15',
    code: 'SMART-FLOW-15',
    name: 'Ricoh Smart Flow 15 — DocuWare Cloud 15',
    shortName: 'Smart Flow 15',
    docuWareName: 'DocuWare Cloud 15',
    publicPen: 5554,
    description:
      'Licencia Ricoh Smart Flow 15 (DocuWare Cloud 15). Gestión documental en la nube con flujos de trabajo digitales.',
  },
  {
    id: 'c3f5a7b9-2d4e-5f6a-0b1c-smart-flow-4',
    code: 'SMART-FLOW-4',
    name: 'Ricoh Smart Flow 4 — DocuWare Cloud 4',
    shortName: 'Smart Flow 4',
    docuWareName: 'DocuWare Cloud 4',
    publicPen: 1959,
    description:
      'Licencia Ricoh Smart Flow 4 (DocuWare Cloud 4). Plataforma de gestión documental para equipos pequeños y medianos.',
  },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function buildLicenseProduct(row, sortOrder) {
  const basePublicUsd = penToUsd(row.publicPen);
  const publicUsd = Math.round((basePublicUsd + MARKUP_USD) * 100) / 100;

  return normalizeProductInput(
    {
      id: row.id,
      slug: deriveProductSlug({ id: row.id, name: row.name }),
      code: row.code,
      name: row.name,
      description: row.description,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: 'Ricoh',
      image_url: IMAGE_URL,
      gallery: [IMAGE_URL],
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({ public: publicUsd }),
      attributes: [
        { id: `attr-producto-${row.id}`, name: 'Producto', value: row.shortName },
        { id: `attr-docuware-${row.id}`, name: 'Plataforma', value: row.docuWareName },
        { id: `attr-tipo-${row.id}`, name: 'Tipo', value: 'Licencia' },
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

  const imported = LICENSES.map((license, index) => buildLicenseProduct(license, maxSort + index + 1));

  const { products: mergedCatalog, created, updated } = mergeByCode(catalogProducts, imported);
  const { products: catalogOrdered } = ensureProductSortOrders(mergedCatalog);

  writeCatalog(catalogOrdered);
  console.log(`Catálogo: ${created} creados, ${updated} actualizados.`);

  try {
    const inventory = await readInventory();
    const maxInvSort = inventory.products.reduce(
      (max, product) => Math.max(max, Number(product.sort_order ?? 0)),
      0,
    );
    const importedInv = LICENSES.map((license, index) =>
      buildLicenseProduct(license, maxInvSort + index + 1),
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

  console.log(`\nRecargo: +$${MARKUP_USD} USD por licencia · TC ${EXCHANGE_RATE}`);
  for (const row of LICENSES) {
    const publicUsd = penToUsd(row.publicPen) + MARKUP_USD;
    const publicPen = Math.round(publicUsd * EXCHANGE_RATE);
    console.log(
      `  [${row.code}] ${row.name} — base S/ ${row.publicPen.toLocaleString('es-PE')} → S/ ${publicPen.toLocaleString('es-PE')} ($${Math.round(publicUsd * 100) / 100})`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
