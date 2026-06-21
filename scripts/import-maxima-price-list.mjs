import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseMaximaPriceListWorkbook,
  SUPPLIER_MAXIMA,
} from '../server/lib/maxima-price-list-excel.js';
import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'Lista_Precios_Maxima_SUBIR.xlsx');

const filePath = process.argv[2] ?? defaultPath;

/** Categorías de tienda que deben reconocer etiquetas del inventario Maxima. */
const STORE_CATEGORY_LABEL_TARGETS = [
  { id: 'cat-toner', labels: ['Suministros', 'Toner y suministros', 'Tóner y Suministros'] },
  { id: 'cat-multifuncionales', labels: ['Multifuncionales'] },
  { id: 'cat-impresoras', labels: ['Impresoras'] },
  { id: 'cat-repuestos', labels: ['Repuestos'] },
  { id: 'cat-escaneres', labels: ['Escáneres'] },
  { id: 'cat-camaras', labels: ['Cámaras'] },
];

async function ensureStoreCategoryLabels() {
  const categories = await readStoreCategories();

  for (const target of STORE_CATEGORY_LABEL_TARGETS) {
    const row = categories.find((category) => category.id === target.id);
    if (!row) continue;

    const labels = new Set(row.inventoryLabels ?? []);
    let changed = false;

    for (const label of target.labels) {
      if (!labels.has(label)) {
        labels.add(label);
        changed = true;
      }
    }

    if (changed) {
      await updateStoreCategory(target.id, { inventoryLabels: [...labels] });
      console.log(`• Etiquetas actualizadas en ${row.name}`);
    }
  }

  const generalLabels = [
    'Monitores',
    'Computadoras Laptop',
    'Accesorios',
    'Soluciones de Negocio',
    'Varios',
  ];
  const solutions = categories.find((row) => row.slug === 'soluciones-negocio');
  if (solutions) {
    const labels = new Set(solutions.inventoryLabels ?? []);
    let changed = false;
    for (const label of generalLabels) {
      if (!labels.has(label)) {
        labels.add(label);
        changed = true;
      }
    }
    if (changed) {
      await updateStoreCategory(solutions.id, { inventoryLabels: [...labels] });
      console.log(`• Etiquetas ampliadas en ${solutions.name}.`);
    }
  }
}

function mergeMaximaSuppliers(previous, incoming) {
  const preserved = (previous ?? []).filter(
    (supplier) => String(supplier.name ?? '').trim().toLowerCase() !== SUPPLIER_MAXIMA.toLowerCase(),
  );
  return [...preserved, ...(incoming ?? [])];
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
            stock: product.stock,
            stock_by_warehouse: product.stock_by_warehouse,
            gallery: prev.gallery?.length ? prev.gallery : product.gallery,
            image_url: prev.image_url ?? product.image_url,
            view_count: prev.view_count,
            created_at: prev.created_at,
            suppliers: mergeMaximaSuppliers(prev.suppliers, product.suppliers),
            attributes: product.attributes?.length ? product.attributes : prev.attributes,
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
  const seedCopy = join(seedsDir, 'Lista_Precios_Maxima_SUBIR.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const { sheetName, rowsRead, products: imported, categories } = parseMaximaPriceListWorkbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel Maxima.');
    process.exit(1);
  }

  const withStock = imported.filter((product) => (product.stock ?? 0) > 0).length;
  const sample = imported[0];

  console.log(`Hoja: ${sheetName}`);
  console.log(`Productos importados: ${rowsRead}`);
  console.log(`Con stock > 0: ${withStock}`);
  console.log(`Categorías detectadas: ${categories.join(', ')}`);
  console.log(
    `Ejemplo: ${sample.code} | ${sample.name.slice(0, 48)}… | stock ${sample.stock} | proveedor ${SUPPLIER_MAXIMA}`,
  );

  await ensureStoreCategoryLabels();

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
    `Inventario actualizado: ${actuallyCreated} nuevos, ${actuallyUpdated} actualizados (${created}/${updated} en merge).`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
