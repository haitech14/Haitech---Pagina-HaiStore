import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readCompanySettings } from '../server/lib/company-settings-store.js';
import { parseProcessedPriceListWorkbook } from '../server/lib/processed-price-list-excel.js';
import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'Lista_Precios_Procesada.xlsx');

const filePath = process.argv[2] ?? defaultPath;
const PARENT_CATEGORY_ID = 'cat-toner';

const SUBCATEGORY = {
  id: 'cat-toner-compatibles',
  name: 'Toner Compatibles',
  slug: 'toner-compatibles',
  inventoryLabels: ['Toner Compatibles'],
};

async function ensureTonerCompatiblesSubcategory() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Toner y Suministros» (cat-toner).');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Toner y suministros');
  parentLabels.add('Tóner y Suministros');
  parentLabels.add('Toner Compatibles');

  const parentIndex = categories.findIndex((row) => row.id === PARENT_CATEGORY_ID);
  categories[parentIndex] = {
    ...parent,
    inventoryLabels: [...parentLabels],
  };
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
    return readStoreCategories();
  }

  const duplicateSlug = categories.find(
    (row) => row.slug === SUBCATEGORY.slug && row.id !== SUBCATEGORY.id,
  );
  if (duplicateSlug) {
    const labels = new Set([...(duplicateSlug.inventoryLabels ?? []), ...SUBCATEGORY.inventoryLabels]);
    await updateStoreCategory(duplicateSlug.id, {
      name: SUBCATEGORY.name,
      parentId: PARENT_CATEGORY_ID,
      inventoryLabels: [...labels],
    });
    return readStoreCategories();
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
    tagline: 'Cartuchos y recargas compatibles Ricoh',
  });

  return readStoreCategories();
}

function mergeByCode(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [String(product.code ?? '').trim().toLowerCase(), product]),
  );

  let created = 0;
  let updated = 0;

  for (const product of incoming) {
    const key = String(product.code ?? '').trim().toLowerCase();
    const prev = byCode.get(key);

    if (prev) {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            id: prev.id,
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

  return {
    products: [...byCode.values()],
    created,
    updated,
    touchedIds: incoming.map((product) => product.id),
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'Lista_Precios_Procesada.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  const settings = await readCompanySettings();
  const saleRate = settings.usdToPenExchangeRate;
  const purchaseRate = settings.usdToPenPurchaseExchangeRate;

  console.log(`Leyendo ${filePath}…`);
  console.log(`Tipo de cambio venta: ${saleRate} | compra: ${purchaseRate}`);

  const buffer = readFileSync(filePath);
  const { rowsRead, products: imported } = parseProcessedPriceListWorkbook(buffer, {
    saleRate,
    purchaseRate,
  });

  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  const uiProducts = imported.filter((product) =>
    product.name.toLowerCase().startsWith('unidad de imagen'),
  ).length;
  const sample = imported.find((product) => product.code.includes('MPC-2003-2503-2011-CYAN'));

  console.log(`Filas válidas leídas: ${rowsRead}`);
  console.log(`Productos generados: ${imported.length} (${uiProducts} unidades de imagen)`);

  if (sample) {
    const distPen = Math.round(sample.prices.distribuidor * saleRate);
    const mayPen = Math.round(sample.prices.mayorista * saleRate);
    console.log(
      `Verificación MPC 2003 Cyan: Dist S/ ${distPen}, May S/ ${mayPen} (esperado May = Dist - 10)`,
    );
  }

  await ensureTonerCompatiblesSubcategory();
  console.log('Subcategoría «Toner Compatibles» lista bajo Toner y Suministros.');

  const inventory = await readInventory();
  const codesBefore = new Set(
    inventory.products.map((product) => String(product.code ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const { products: mergedProducts, created, updated, touchedIds } = mergeByCode(
    inventory.products,
    imported,
  );
  const actuallyCreated = imported.filter(
    (product) => !codesBefore.has(String(product.code ?? '').trim().toLowerCase()),
  ).length;
  const actuallyUpdated = imported.length - actuallyCreated;

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory(
    {
      products,
      deletedProductIds: inventory.deletedProductIds,
      warehouses: inventory.warehouses,
    },
    { syncProductIds: touchedIds },
  );

  console.log(
    `Inventario actualizado: ${actuallyCreated} nuevos, ${actuallyUpdated} actualizados por código (${created}/${updated} en merge).`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
