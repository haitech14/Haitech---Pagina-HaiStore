import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readCompanySettings } from '../server/lib/company-settings-store.js';
import { parseIaiconTonerWorkbook, CATEGORY_IAICON_TONER } from '../server/lib/iaicon-toner-excel.js';
import {
  IAICON_TONER_SUBCATEGORY_ID,
  IAICON_TONER_SUBCATEGORY_SLUG,
} from '../shared/iaicon-toner.js';
import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'LP-iAicon.xlsx');
const LINCE_WAREHOUSE_ID = 'lince';
const LINCE_WAREHOUSE_NAME = 'Almacén Lince';
const PARENT_CATEGORY_ID = 'cat-toner';

const filePath = process.argv[2] ?? defaultPath;

const SUBCATEGORY = {
  id: IAICON_TONER_SUBCATEGORY_ID,
  name: 'Toner Compatible',
  slug: IAICON_TONER_SUBCATEGORY_SLUG,
  inventoryLabels: [CATEGORY_IAICON_TONER, 'Toner Compatible', 'Toner Compatibles'],
};

function ensureLinceWarehouse(warehouses) {
  const list = normalizeWarehouses(warehouses);
  if (list.some((warehouse) => warehouse.id === LINCE_WAREHOUSE_ID)) {
    return list;
  }
  return [...list, { id: LINCE_WAREHOUSE_ID, name: LINCE_WAREHOUSE_NAME }];
}

function applyLinceWarehouse(product, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const byId = new Map(
    (product.stock_by_warehouse ?? []).map((row) => [
      row.warehouse_id,
      Math.max(0, Number(row.quantity) || 0),
    ]),
  );

  if (!byId.has(LINCE_WAREHOUSE_ID)) {
    byId.set(LINCE_WAREHOUSE_ID, 0);
  }

  const stock_by_warehouse = list.map((warehouse) => ({
    warehouse_id: warehouse.id,
    quantity: byId.get(warehouse.id) ?? 0,
  }));

  const stock = stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0);
  return { stock, stock_by_warehouse };
}

async function ensureIaiconTonerSubcategory() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Toner» (cat-toner).');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Toner');
  parentLabels.add('Tóner');
  parentLabels.add(CATEGORY_IAICON_TONER);

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

  const tonerChildren = categories.filter((row) => row.parentId === PARENT_CATEGORY_ID);
  await createStoreCategory({
    id: SUBCATEGORY.id,
    name: SUBCATEGORY.name,
    slug: SUBCATEGORY.slug,
    parentId: PARENT_CATEGORY_ID,
    sortOrder: tonerChildren.length,
    inventoryLabels: SUBCATEGORY.inventoryLabels,
    image: '/categories/toner-suministros.png',
    tagline: 'Cartuchos compatibles iAicon',
  });

  return readStoreCategories();
}

function mergeByCode(existing, incoming, warehouses) {
  const byCode = new Map(
    existing.map((product) => [String(product.code ?? '').trim().toLowerCase(), product]),
  );

  let created = 0;
  let updated = 0;

  for (const product of incoming) {
    const key = String(product.code ?? '').trim().toLowerCase();
    const prev = byCode.get(key);
    const stockPatch = applyLinceWarehouse(prev ?? product, warehouses);

    if (prev) {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            id: prev.id,
            sort_order: prev.sort_order,
            stock: stockPatch.stock,
            stock_by_warehouse: stockPatch.stock_by_warehouse,
            gallery: prev.gallery?.length ? prev.gallery : product.gallery,
            image_url: prev.image_url ?? product.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at,
          },
          prev,
          warehouses,
        ),
      );
      updated += 1;
    } else {
      byCode.set(
        key,
        normalizeProductInput(
          {
            ...product,
            ...stockPatch,
          },
          undefined,
          warehouses,
        ),
      );
      created += 1;
    }
  }

  return {
    products: [...byCode.values()],
    created,
    updated,
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'LP-iAicon.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  const settings = await readCompanySettings();
  const purchaseRate =
    Number(settings.usdToPenPurchaseExchangeRate) ||
    Number(settings.usdToPenExchangeRate) ||
    3.7;

  console.log(`Leyendo ${filePath}…`);
  console.log(`Tipo de cambio compra (PEN→USD): ${purchaseRate}`);

  const imported = parseIaiconTonerWorkbook(readFileSync(filePath), { purchaseRate });
  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  console.log(`Productos en Excel: ${imported.length}`);

  await ensureIaiconTonerSubcategory();
  console.log(`Subcategoría «${SUBCATEGORY.name}» lista bajo Toner.`);

  const inventory = await readInventory();
  const warehouses = ensureLinceWarehouse(inventory.warehouses);
  const codesBefore = new Set(
    inventory.products.map((product) => String(product.code ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const { products: mergedProducts, created, updated } = mergeByCode(
    inventory.products,
    imported,
    warehouses,
  );
  const actuallyCreated = imported.filter(
    (product) => !codesBefore.has(String(product.code ?? '').trim().toLowerCase()),
  ).length;
  const actuallyUpdated = imported.length - actuallyCreated;

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses,
  });

  console.log('');
  console.log(
    `Importación completada: ${actuallyCreated} nuevos, ${actuallyUpdated} actualizados (${created}/${updated} en merge).`,
  );
  console.log(`Categoría: ${CATEGORY_IAICON_TONER}`);
  console.log(`Almacén activo: ${LINCE_WAREHOUSE_NAME}`);
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
