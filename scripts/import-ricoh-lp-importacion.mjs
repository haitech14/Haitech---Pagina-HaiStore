import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  CATEGORY_ACCESORIOS,
  CATEGORY_MAINFRAME,
  CATEGORY_REPUESTOS_ORIGINAL,
  CATEGORY_TONER_ORIGINAL,
  mergeAlternativeRolePrices,
  mergeAlternativeSuppliers,
  parseRicohLpImportacionWorkbook,
} from '../server/lib/ricoh-lp-importacion-excel.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'data', 'seeds', 'LP-RICOH-Importacion.xlsx');
const filePath = process.argv[2] ?? defaultPath;

function isMainframeProduct(product) {
  const category = String(product.category ?? '');
  return category.includes('Multifuncional');
}

function mergeAttributesPreservingExisting(existing = [], incoming = []) {
  const byName = new Map(
    existing.map((attribute) => [String(attribute.name ?? '').trim(), attribute]),
  );

  for (const attribute of incoming) {
    const name = String(attribute.name ?? '').trim();
    if (!name) continue;
    if (name === 'Instalación' || name === 'Nota' || !byName.has(name)) {
      byName.set(name, attribute);
    }
  }

  return [...byName.values()];
}

function mergeImportedProduct(prev, incoming) {
  if (isMainframeProduct(prev) || isMainframeProduct(incoming)) {
    const installationAttr = (incoming.attributes ?? []).find(
      (attribute) => attribute.name === 'Instalación',
    );

    return normalizeProductInput(
      {
        code: incoming.code ?? prev.code,
        attributes: mergeAttributesPreservingExisting(prev.attributes, incoming.attributes),
        prices: mergeAlternativeRolePrices(prev.prices ?? {}, incoming.prices ?? {}),
        suppliers: mergeAlternativeSuppliers(prev.suppliers, incoming.suppliers),
        purchase_price_usd:
          Number(prev.purchase_price_usd) > 0
            ? prev.purchase_price_usd
            : incoming.purchase_price_usd,
      },
      prev,
    );
  }

  return normalizeProductInput(
    {
      code: incoming.code ?? prev.code,
      name: prev.name || incoming.name,
      description: prev.description || incoming.description,
      category: prev.category || incoming.category,
      brand: prev.brand || incoming.brand,
      attributes: mergeAttributesPreservingExisting(prev.attributes, incoming.attributes),
      prices: mergeAlternativeRolePrices(prev.prices ?? {}, incoming.prices ?? {}),
      suppliers: mergeAlternativeSuppliers(prev.suppliers, incoming.suppliers),
      purchase_price_usd:
        Number(prev.purchase_price_usd) > 0
          ? prev.purchase_price_usd
          : incoming.purchase_price_usd,
      stock: prev.stock,
      stock_by_warehouse: prev.stock_by_warehouse,
      gallery: prev.gallery?.length ? prev.gallery : incoming.gallery,
      image_url: prev.image_url ?? incoming.image_url,
      view_count: prev.view_count,
      created_at: prev.created_at,
      sort_order: prev.sort_order,
    },
    prev,
  );
}

async function ensureImportCategories() {
  const categories = await readStoreCategories();

  const specs = [
    {
      parentId: 'cat-multifuncionales',
      id: 'daf4fb05-a317-475f-9c6a-523a0e0734b9',
      name: 'Multifuncionales Nuevas',
      slug: 'multifuncionales-nuevas',
      inventoryLabels: ['Multifuncionales Nuevas', CATEGORY_MAINFRAME],
    },
    {
      parentId: 'cat-toner',
      id: 'cat-toner-general',
      name: 'Toner Original',
      slug: 'toner',
      inventoryLabels: ['Toner Original', 'Toner', CATEGORY_TONER_ORIGINAL],
    },
    {
      parentId: 'cat-toner',
      id: 'cat-toner-accesorios',
      name: 'Accesorios',
      slug: 'accesorios-toner',
      inventoryLabels: [CATEGORY_ACCESORIOS],
    },
    {
      parentId: 'cat-repuestos',
      id: 'cat-repuestos-originales',
      name: 'Repuestos Originales',
      slug: 'repuestos-originales',
      inventoryLabels: ['Repuestos Originales', CATEGORY_REPUESTOS_ORIGINAL],
    },
  ];

  for (const spec of specs) {
    const parent = categories.find((row) => row.id === spec.parentId);
    if (!parent) continue;

    const parentLabels = new Set(parent.inventoryLabels ?? []);
    for (const label of spec.inventoryLabels) parentLabels.add(label);
    await updateStoreCategory(spec.parentId, { inventoryLabels: [...parentLabels] });

    const existing = categories.find((row) => row.id === spec.id);
    if (existing) {
      const labels = new Set([...(existing.inventoryLabels ?? []), ...spec.inventoryLabels]);
      await updateStoreCategory(spec.id, {
        name: spec.name,
        slug: spec.slug,
        parentId: spec.parentId,
        inventoryLabels: [...labels],
      });
      continue;
    }

    const children = categories.filter((row) => row.parentId === spec.parentId);
    await createStoreCategory({
      id: spec.id,
      name: spec.name,
      slug: spec.slug,
      parentId: spec.parentId,
      sortOrder: children.length,
      inventoryLabels: spec.inventoryLabels,
      image:
        spec.id === 'cat-toner-accesorios'
          ? '/categories/accesorios-impresoras.png'
          : '/categories/toner-suministros.png',
      tagline: spec.name,
    });
  }
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
      byCode.set(key, mergeImportedProduct(prev, product));
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
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'LP-RICOH-Importacion.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const imported = parseRicohLpImportacionWorkbook(readFileSync(filePath));
  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  const byCategory = imported.reduce((acc, product) => {
    const key = product.category ?? 'Sin categoría';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Productos generados: ${imported.length}`);
  console.log('Por categoría:', byCategory);

  await ensureImportCategories();

  const inventory = await readInventory();
  const codesBefore = new Set(
    inventory.products.map((product) => String(product.code ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const { products: mergedProducts, created, updated } = mergeByCode(inventory.products, imported);
  const actuallyCreated = imported.filter(
    (product) => !codesBefore.has(String(product.code ?? '').trim().toLowerCase()),
  ).length;
  const actuallyUpdated = imported.length - actuallyCreated;

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log('');
  console.log(
    `Importación completada: ${actuallyCreated} nuevos, ${actuallyUpdated} actualizados (${created}/${updated} en merge).`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);

  const sampleMainframe = imported.find((product) => product.category === CATEGORY_MAINFRAME);
  if (sampleMainframe) {
    const installation = (sampleMainframe.attributes ?? []).find(
      (attribute) => attribute.name === 'Instalación',
    );
    console.log('');
    console.log('Ejemplo mainframe:', sampleMainframe.code, '→', sampleMainframe.name);
    if (installation?.value) {
      console.log('Instalación:\n', installation.value.split('\n').slice(0, 4).join('\n'));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
