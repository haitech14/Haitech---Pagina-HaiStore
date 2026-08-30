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

const MARKUP_PUBLIC_USD = 50;
const MARKUP_TECNICO_USD = 150;
const CATEGORY = 'Cámaras';

/** Precio público Ricoh en soles (inc. imp.). */
const PUBLIC_PEN = 3452;
/** Precio tachado / referencia en soles. */
const COMPARE_PEN = 7290;

const PRODUCT = {
  id: '8f3c2a1b-6d4e-4f9a-b2c1-ricoh-theta-z1',
  code: 'THETA-Z1',
  name: 'Cámara Theta Z1 Negra',
  brand: 'Ricoh',
  image: '/categories/camaras.png',
  description:
    'Cámara 360° Ricoh Theta Z1 en color negro. Captura esférica de alta calidad con sensor de 1" y pantalla OLED de estado.',
};

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function buildCameraProduct(sortOrder) {
  const basePublicUsd = penToUsd(PUBLIC_PEN);
  const baseTecnicoUsd = Math.round(basePublicUsd * 0.88 * 100) / 100;
  const publicUsd = Math.round((basePublicUsd + MARKUP_PUBLIC_USD) * 100) / 100;
  const tecnicoUsd = Math.round((baseTecnicoUsd + MARKUP_TECNICO_USD) * 100) / 100;
  const compareUsd = penToUsd(COMPARE_PEN);

  return normalizeProductInput(
    {
      id: PRODUCT.id,
      slug: deriveProductSlug({ id: PRODUCT.id, name: `Ricoh ${PRODUCT.name}` }),
      code: PRODUCT.code,
      name: PRODUCT.name.startsWith('Cámara') ? `Ricoh ${PRODUCT.name}` : `Cámara Ricoh ${PRODUCT.name}`,
      description: PRODUCT.description,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: PRODUCT.brand,
      image_url: PRODUCT.image,
      gallery: [PRODUCT.image],
      compare_at_price_usd: compareUsd,
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: tecnicoUsd,
      }),
      attributes: [
        { id: `attr-modelo-${PRODUCT.id}`, name: 'Modelo de equipo', value: 'Theta Z1' },
        { id: `attr-color-${PRODUCT.id}`, name: 'Color', value: 'Negro' },
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

  const imported = [buildCameraProduct(maxSort + 1)];

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
    const importedInv = [buildCameraProduct(maxInvSort + 1)];
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

  const product = imported[0];
  const publicPen = Math.round(product.prices.public * EXCHANGE_RATE);
  const tecnicoPen = Math.round(product.prices.tecnico * EXCHANGE_RATE);
  console.log(`\n[${PRODUCT.code}] ${product.name}`);
  console.log(`  Categoría: ${CATEGORY}`);
  console.log(`  Base Ricoh: S/ ${PUBLIC_PEN.toLocaleString('es-PE')} (ref. S/ ${COMPARE_PEN.toLocaleString('es-PE')})`);
  console.log(
    `  Público: $${product.prices.public} (+$${MARKUP_PUBLIC_USD}) ≈ S/ ${publicPen.toLocaleString('es-PE')}`,
  );
  console.log(
    `  Técnico: $${product.prices.tecnico} (+$${MARKUP_TECNICO_USD} sobre rol técnico base) ≈ S/ ${tecnicoPen.toLocaleString('es-PE')}`,
  );
  console.log(`  TC: ${EXCHANGE_RATE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
