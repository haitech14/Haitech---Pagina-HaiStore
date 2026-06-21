import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { normalizeProductStock, normalizeWarehouses } from '../server/lib/inventory-warehouses.js';
import {
  findSimilarEquipmentProduct,
  parseEquiposResumenWorkbook,
} from '../server/lib/equipos-resumen-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'resumen_equipos.xlsx');
const BRENA_WAREHOUSE_ID = 'brena';
const BRENA_WAREHOUSE_NAME = 'Almacén Breña';
const DEFAULT_NEW_PRICE_USD = 999;

const filePath = process.argv[2] ?? defaultPath;

function ensureBrenaWarehouse(warehouses) {
  const list = normalizeWarehouses(warehouses);
  if (list.some((warehouse) => warehouse.id === BRENA_WAREHOUSE_ID)) {
    return list;
  }
  return [...list, { id: BRENA_WAREHOUSE_ID, name: BRENA_WAREHOUSE_NAME }];
}

function applyBrenaStock(product, quantity, warehouses) {
  const list = normalizeWarehouses(warehouses);
  const byId = new Map(
    (product.stock_by_warehouse ?? []).map((row) => [row.warehouse_id, Math.max(0, Number(row.quantity) || 0)]),
  );

  byId.set(BRENA_WAREHOUSE_ID, quantity);

  const stock_by_warehouse = list.map((warehouse) => ({
    warehouse_id: warehouse.id,
    quantity: byId.get(warehouse.id) ?? 0,
  }));

  return normalizeProductStock(stock_by_warehouse, product.stock ?? 0, list);
}

function dedupeImportedEquipment(products, warehouses) {
  const byName = new Map();

  for (const product of products) {
    const key = compact(product.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, product);
      continue;
    }

    const keep = scoreDuplicateKeep(existing) >= scoreDuplicateKeep(product) ? existing : product;
    const drop = keep === existing ? product : existing;
    const mergedBrena = Math.max(
      keep.stock_by_warehouse?.find((row) => row.warehouse_id === BRENA_WAREHOUSE_ID)?.quantity ?? 0,
      drop.stock_by_warehouse?.find((row) => row.warehouse_id === BRENA_WAREHOUSE_ID)?.quantity ?? 0,
    );
    const stockPatch = applyBrenaStock(keep, mergedBrena, warehouses);
    byName.set(key, {
      ...keep,
      stock: stockPatch.stock,
      stock_by_warehouse: stockPatch.stock_by_warehouse,
    });
  }

  const keptIds = new Set([...byName.values()].map((product) => product.id));
  return products.filter((product) => keptIds.has(product.id));
}

function compact(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

function cleanupLegacyCanonDuplicates(products) {
  return products.filter((product) => {
    const name = String(product.name ?? '').toUpperCase();
    return !name.includes('CANON IRAC') && !name.includes('CANON IRADXC');
  });
}

function cleanupTypoEquipment(products) {
  return products.filter((product) => !compact(product.name).includes('agepresslite'));
}

function scoreDuplicateKeep(product) {
  let score = 0;
  if (product.image_url) score += 10;
  if (product.description) score += 5;
  if (!String(product.code ?? '').startsWith('EQ-')) score += 3;
  return score;
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'resumen_equipos.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const imported = parseEquiposResumenWorkbook(readFileSync(filePath));
  if (imported.length === 0) {
    console.error('No se encontraron equipos válidos en el Excel.');
    process.exit(1);
  }

  const inventory = await readInventory();
  const warehouses = ensureBrenaWarehouse(inventory.warehouses);
  const productsById = new Map(inventory.products.map((product) => [product.id, product]));

  let created = 0;
  let updated = 0;

  for (const row of imported) {
    const match = findSimilarEquipmentProduct(inventory.products, row.make, row.model);

    if (match) {
      const stockPatch = applyBrenaStock(match, row.quantity, warehouses);
      const next = normalizeProductInput(
        {
          stock: stockPatch.stock,
          stock_by_warehouse: stockPatch.stock_by_warehouse,
          category: row.category,
        },
        match,
        warehouses,
      );
      productsById.set(match.id, next);
      updated += 1;
      console.log(`↻ Actualizado: ${match.name} → stock Breña: ${row.quantity}`);
      continue;
    }

    const stockPatch = applyBrenaStock({ stock: 0, stock_by_warehouse: [] }, row.quantity, warehouses);
    const createdProduct = normalizeProductInput(
      {
        id: randomUUID(),
        code: row.code,
        name: row.name,
        brand: row.brand,
        category: row.category,
        currency: 'USD',
        price: DEFAULT_NEW_PRICE_USD,
        prices: { public: DEFAULT_NEW_PRICE_USD },
        stock: stockPatch.stock,
        stock_by_warehouse: stockPatch.stock_by_warehouse,
        gallery: [],
        image_url: null,
        description: '',
        is_featured: false,
        view_count: 0,
        attributes: [],
        suppliers: [],
        attachments: [],
        bundle_components: [],
      },
      undefined,
      warehouses,
    );

    productsById.set(createdProduct.id, createdProduct);
    created += 1;
    console.log(`+ Nuevo: ${row.name} → stock Breña: ${row.quantity}`);
  }

  const { products } = ensureProductSortOrders(
    cleanupLegacyCanonDuplicates(
      cleanupTypoEquipment(dedupeImportedEquipment([...productsById.values()], warehouses)),
    ),
  );

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses,
  });

  console.log('');
  console.log(`Importación completada: ${created} nuevos, ${updated} actualizados.`);
  console.log(`Almacén agregado/activo: ${BRENA_WAREHOUSE_NAME}`);
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
