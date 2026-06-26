import { readFileSync } from 'node:fs';
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

const CATEGORY = 'Escáneres, Escáneres Nuevos';
const IMAGE_URL = '/categories/escaneres.png';

/** Precios públicos en soles (inc. imp.) según listado Ricoh. */
const SCANNERS = [
  { model: 'Fi-8820', publicPen: 34493 },
  { model: 'Fi-8290', publicPen: 11288 },
  { model: 'Fi-70F', publicPen: 2037 },
  { model: 'FI-7700', publicPen: 35319 },
  { model: 'Fi-7600', publicPen: 18839 },
  { model: 'Fi-8270', publicPen: 7956 },
  { model: 'Fi-8190', publicPen: 8526 },
  { model: 'Fi-8040', publicPen: 3149 },
  { model: 'Fi-800r', publicPen: 2810 },
  { model: 'SV600', publicPen: 4773 },
  { model: 'FI-8170', publicPen: 5091 },
  { model: 'FI-8150', publicPen: 4582 },
];

function penToUsd(pen) {
  return Math.round((pen / EXCHANGE_RATE) * 100) / 100;
}

function buildScannerProduct({ model, publicPen }, sortOrder) {
  const publicUsd = penToUsd(publicPen);
  const tecnicoUsd = Math.round(publicUsd * 0.9 * 100) / 100;
  const code = model.toUpperCase();
  const name = `Escáner Nuevo ${model}`;
  const id = `ricoh-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return normalizeProductInput(
    {
      id,
      slug: deriveProductSlug({ id, name }),
      code,
      name,
      description: `Escáner Ricoh ${model} — equipo nuevo con garantía oficial.`,
      currency: 'USD',
      stock: 0,
      category: CATEGORY,
      brand: 'Ricoh',
      image_url: IMAGE_URL,
      gallery: [IMAGE_URL],
      purchase_price_usd: Math.round(publicUsd * 0.72 * 100) / 100,
      created_at: new Date().toISOString(),
      sort_order: sortOrder,
      prices: ensureFullPrices({
        public: publicUsd,
        tecnico: tecnicoUsd,
      }),
      attributes: [
        { id: `attr-modelo-${id}`, name: 'Modelo de equipo', value: model },
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
            sort_order: prev.sort_order,
            stock: prev.stock,
            stock_by_warehouse: prev.stock_by_warehouse,
            gallery: prev.gallery?.length ? prev.gallery : product.gallery,
            image_url: prev.image_url ?? product.image_url,
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
  const maxSort = inventory.products.reduce(
    (max, product) => Math.max(max, Number(product.sort_order ?? 0)),
    0,
  );

  const imported = SCANNERS.map((scanner, index) =>
    buildScannerProduct(scanner, maxSort + index + 1),
  );

  const { products: mergedProducts, created, updated } = mergeByCode(
    inventory.products,
    imported,
  );
  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(
    `Escáneres nuevos: ${created} creados, ${updated} actualizados (tipo de cambio ${EXCHANGE_RATE}).`,
  );
  for (const product of imported) {
    console.log(
      `  [${product.code}] ${product.name} — público $${product.prices.public} / técnico $${product.prices.tecnico}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
