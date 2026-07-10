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
import { parseLpTonerWebWorkbook } from '../server/lib/lp-toner-web-excel.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'public', 'LP Toner Web.xlsx');

const filePath = process.argv[2] ?? defaultPath;

const PARENT_CATEGORY_ID = 'cat-toner';
const SUBCATEGORIES = [
  {
    id: 'cat-toner-general',
    name: 'Toner Original',
    slug: 'toner',
    inventoryLabels: ['Toner Original', 'Toner'],
  },
  {
    id: 'cat-toner-suministros',
    name: 'Suministros',
    slug: 'suministros',
    inventoryLabels: ['Suministros'],
  },
];

/**
 * @param {string} value
 */
function normKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * @param {string} value
 */
function compactKey(value) {
  return normKey(value).replace(/[^a-z0-9]+/g, '');
}

/**
 * @param {{ code?: string; name?: string; category?: string }} product
 */
function nameMatchKey(product) {
  return compactKey(`${product.category ?? ''}|${product.name ?? ''}`);
}

/**
 * Busca producto existente por código; si no hay, por nombre+categoría o id ricoh-*.
 * @param {Map<string, any>} byCode
 * @param {Map<string, any>} byName
 * @param {any[]} existing
 * @param {any} incoming
 */
function findExisting(byCode, byName, existing, incoming) {
  const codeKey = normKey(incoming.code);
  if (codeKey && byCode.has(codeKey)) {
    return { prev: byCode.get(codeKey), match: 'code' };
  }

  const nameKey = nameMatchKey(incoming);
  if (nameKey && byName.has(nameKey)) {
    return { prev: byName.get(nameKey), match: 'name' };
  }

  const codeCompact = compactKey(incoming.code);
  if (codeCompact.length >= 5) {
    for (const product of existing) {
      const idCompact = compactKey(product.id ?? '');
      if (
        idCompact === codeCompact ||
        idCompact === `ricoh${codeCompact}` ||
        idCompact.endsWith(`-${codeCompact}`)
      ) {
        const catPrev = normKey(product.category);
        if (catPrev.includes('toner') || catPrev.includes('suministro')) {
          return { prev: product, match: 'fuzzy-id' };
        }
      }
    }
  }

  return { prev: null, match: null };
}

async function ensureTonerSubcategories() {
  let categories = await readStoreCategories();
  const parent = categories.find((row) => row.id === PARENT_CATEGORY_ID);
  if (!parent) {
    throw new Error('No se encontró la categoría padre «Suministros» (cat-toner).');
  }

  const parentLabels = new Set(parent.inventoryLabels ?? []);
  parentLabels.add('Suministros');
  parentLabels.add('Toner y suministros');
  parentLabels.add('Tóner y Suministros');

  const parentIndex = categories.findIndex((row) => row.id === PARENT_CATEGORY_ID);
  categories[parentIndex] = {
    ...parent,
    inventoryLabels: [...parentLabels],
  };

  for (const [index, spec] of SUBCATEGORIES.entries()) {
    const existing = categories.find((row) => row.id === spec.id);
    if (existing) {
      const labels = new Set([...(existing.inventoryLabels ?? []), ...spec.inventoryLabels]);
      await updateStoreCategory(spec.id, {
        name: spec.name,
        slug: spec.slug,
        parentId: PARENT_CATEGORY_ID,
        sortOrder: index,
        inventoryLabels: [...labels],
      });
      continue;
    }

    const duplicateSlug = categories.find((row) => row.slug === spec.slug && row.id !== spec.id);
    if (duplicateSlug) {
      const labels = new Set([...(duplicateSlug.inventoryLabels ?? []), ...spec.inventoryLabels]);
      await updateStoreCategory(duplicateSlug.id, {
        parentId: PARENT_CATEGORY_ID,
        sortOrder: index,
        inventoryLabels: [...labels],
      });
      continue;
    }

    await createStoreCategory({
      id: spec.id,
      name: spec.name,
      slug: spec.slug,
      parentId: PARENT_CATEGORY_ID,
      sortOrder: index,
      inventoryLabels: spec.inventoryLabels,
      image: '/categories/toner-suministros.png',
      tagline:
        spec.id === 'cat-toner-general'
          ? 'Tóner y cartuchos originales Ricoh'
          : 'Grapas, kits y suministros Ricoh',
    });
  }

  categories = await readStoreCategories();
  return categories;
}

/**
 * @param {any[]} existing
 * @param {any[]} incoming
 */
function mergeProducts(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [normKey(product.code), product]).filter(([key]) => key),
  );
  const byName = new Map();
  for (const product of existing) {
    const key = nameMatchKey(product);
    if (key && !byName.has(key)) byName.set(key, product);
  }

  /** @type {Map<string, any>} */
  const byId = new Map(existing.map((product) => [String(product.id), product]));

  let created = 0;
  let updated = 0;
  /** @type {Array<{ code: string; match: string; name: string }>} */
  const updatedSamples = [];

  for (const product of incoming) {
    const { prev, match } = findExisting(byCode, byName, existing, product);

    if (prev) {
      const next = normalizeProductInput(
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
          slug: prev.slug,
        },
        prev,
      );
      byId.set(String(prev.id), next);
      const codeKey = normKey(next.code);
      if (codeKey) byCode.set(codeKey, next);
      byName.set(nameMatchKey(next), next);
      updated += 1;
      if (updatedSamples.length < 8) {
        updatedSamples.push({ code: String(next.code), match: match ?? 'code', name: next.name });
      }
    } else {
      byId.set(String(product.id), product);
      const codeKey = normKey(product.code);
      if (codeKey) byCode.set(codeKey, product);
      byName.set(nameMatchKey(product), product);
      created += 1;
    }
  }

  return {
    products: [...byId.values()],
    created,
    updated,
    updatedSamples,
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'LP-Toner-Web.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const { products: imported, skipped } = parseLpTonerWebWorkbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  const byCategory = imported.reduce((acc, product) => {
    const key = product.category ?? 'Sin categoría';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  console.log(`Productos en Excel: ${imported.length}`);
  console.log('Por categoría:', byCategory);
  if (skipped.length) {
    console.log(`Filas omitidas: ${skipped.length}`);
    for (const row of skipped.slice(0, 20)) {
      console.log(`  · fila ${row.row}: ${row.reason}`);
    }
  }

  try {
    await ensureTonerSubcategories();
    console.log('Subcategorías «Toner Original» y «Suministros» listas bajo Suministros.');
  } catch (error) {
    console.warn(
      'Aviso: no se pudieron asegurar subcategorías (OneDrive/lock). Se continúa con el inventario.',
      error instanceof Error ? error.message : error,
    );
  }

  const inventory = await readInventory();
  const { products: mergedProducts, created, updated, updatedSamples } = mergeProducts(
    inventory.products,
    imported,
  );

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Inventario actualizado: ${created} creados, ${updated} actualizados.`);
  console.log(`Total en inventario: ${products.length} productos.`);

  const printSample = imported.find((p) => /Toner Original RICOH/i.test(p.name));
  if (printSample) {
    console.log('Ejemplo Print Cartridge →', printSample.code, '→', printSample.name);
  }
  const cmykSample = imported.find((p) => String(p.name).includes(' / ') && /Cyan|Negro|Magenta|Amarillo/.test(p.name));
  if (cmykSample) {
    console.log('Ejemplo grupo CMYK →', cmykSample.code, '→', cmykSample.name);
  }
  if (updatedSamples.length) {
    console.log('Actualizados (muestra):');
    for (const sample of updatedSamples) {
      console.log(`  · [${sample.match}] ${sample.code} → ${sample.name}`);
    }
  }

  // Evita que handles de OneDrive/store-categories dejen el proceso colgado.
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
