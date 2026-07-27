import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  applyLpTonerV4PriceFloors,
  formatListProductCode,
  parseLpTonerV4Workbook,
} from '../server/lib/lp-toner-v4-excel.js';
import { tonerProductIdFromCode } from '../server/lib/toner-products-excel.js';
import {
  createStoreCategory,
  readStoreCategories,
  updateStoreCategory,
} from '../server/lib/store-categories-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '..', 'LP Toner v4.xlsx');

const argvPaths = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const filePath = argvPaths[0] ?? defaultPath;
const skipCategories = process.argv.includes('--skip-categories');

const PARENT_CATEGORY_ID = 'cat-toner';
const SUBCATEGORIES = [
  {
    id: 'cat-toner-general',
    name: 'Toner Original',
    slug: 'toner',
    inventoryLabels: ['Toner Original', 'Toner', 'Toner Originales', 'Toner, Toner Originales'],
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
 * @param {Array<{ id?: string; name?: string; purchase_price_usd?: number }> | undefined} prevSuppliers
 * @param {Array<{ id?: string; name?: string; purchase_price_usd?: number }> | undefined} incomingSuppliers
 */
function mergeSuppliers(prevSuppliers, incomingSuppliers) {
  const prev = Array.isArray(prevSuppliers) ? prevSuppliers : [];
  const incoming = Array.isArray(incomingSuppliers) ? incomingSuppliers : [];
  /** @type {Array<{ id?: string; name: string; purchase_price_usd: number }>} */
  const next = [];

  for (const row of incoming) {
    const name = String(row?.name ?? '').trim();
    if (!name) continue;
    const match = prev.find((prevRow) => {
      const prevName = String(prevRow?.name ?? '');
      if (/ricoh/i.test(name) && /ricoh/i.test(prevName)) return true;
      if (/ross/i.test(name) && /ross/i.test(prevName)) return true;
      return normKey(prevName) === normKey(name);
    });
    next.push({
      ...(match?.id ? { id: match.id } : {}),
      name,
      purchase_price_usd: Math.max(0, Number(row.purchase_price_usd) || 0),
    });
  }

  for (const row of prev) {
    const name = String(row?.name ?? '').trim();
    if (!name) continue;
    if (/ricoh|ross/i.test(name)) continue;
    if (next.some((item) => item.id && item.id === row.id)) continue;
    next.push({
      id: row.id,
      name,
      purchase_price_usd: Math.max(0, Number(row.purchase_price_usd) || 0),
    });
  }

  return next;
}

/**
 * @param {any} incoming
 * @param {Map<string, any>} byId
 */
function resolveIncomingProductId(incoming, byId) {
  const preferredId = String(incoming.id ?? '').trim();
  const codeKey = normKey(incoming.code);
  if (!preferredId) {
    return compactKey(incoming.code) || `product-${Date.now()}`;
  }

  const existing = byId.get(preferredId);
  if (!existing) return preferredId;
  if (normKey(existing.code) === codeKey) return preferredId;

  const altId = `ricoh-${compactKey(incoming.code)}`;
  if (!byId.has(altId)) return altId;

  return `${altId}-${codeKey.slice(-4)}`;
}

/**
 * @param {Map<string, any>} byCode
 * @param {Map<string, any>} byId
 * @param {any[]} existing
 * @param {any} incoming
 */
function findExisting(byCode, byId, existing, incoming) {
  const listCode = formatListProductCode(incoming.code);
  const codeKey = normKey(listCode);

  if (codeKey && byCode.has(codeKey)) {
    return { prev: byCode.get(codeKey), match: 'code' };
  }

  for (const product of existing) {
    const prevCode = normKey(product.code);
    if (prevCode === codeKey) {
      return { prev: product, match: 'code-normalized' };
    }
    if (
      codeKey &&
      (prevCode.startsWith(`${codeKey} /`) ||
        prevCode.startsWith(`${codeKey}/`) ||
        prevCode.startsWith(`${codeKey} / `))
    ) {
      return { prev: product, match: 'code-xref' };
    }
  }

  const preferredId = tonerProductIdFromCode(listCode);
  if (preferredId && byId.has(preferredId)) {
    const prev = byId.get(preferredId);
    if (prev && normKey(prev.code) !== codeKey) {
      return { prev, match: 'id' };
    }
  }

  return { prev: null, match: null };
}

/**
 * @param {any} product
 */
function resolvePurchasePrice(product) {
  const ricoh = (product.suppliers ?? []).find((row) => /ricoh/i.test(String(row?.name ?? '')));
  return Math.max(
    0,
    Number(ricoh?.purchase_price_usd ?? product.purchase_price_usd) || 0,
  );
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
  parentLabels.add('Toner Originales');

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
}

/**
 * @param {any} prev
 * @param {any} incoming
 */
function mergeIncomingProduct(prev, incoming) {
  const listCode = formatListProductCode(incoming.code);
  const suppliers = mergeSuppliers(prev.suppliers, incoming.suppliers);
  const purchasePrice = resolvePurchasePrice({ ...incoming, suppliers });
  const previousPublic = Math.max(0, Number(prev?.prices?.public) || 0);
  const prices = applyLpTonerV4PriceFloors(incoming.prices ?? {}, purchasePrice, {
    previousPublic,
  });

  return normalizeProductInput(
    {
      ...incoming,
      id: prev.id,
      code: listCode,
      name: String(prev.name ?? incoming.name ?? '').trim(),
      description: prev.description ?? incoming.description,
      sort_order: prev.sort_order,
      stock: prev.stock,
      stock_by_warehouse: prev.stock_by_warehouse,
      gallery: prev.gallery?.length ? prev.gallery : incoming.gallery,
      image_url: prev.image_url ?? incoming.image_url,
      view_count: prev.view_count,
      created_at: prev.created_at,
      slug: prev.slug,
      prices,
      suppliers,
      purchase_price_usd: purchasePrice,
      attributes: incoming.attributes?.length ? incoming.attributes : prev.attributes,
    },
    prev,
  );
}

/**
 * @param {any[]} existing
 * @param {any[]} incoming
 */
function mergeProducts(existing, incoming) {
  const byCode = new Map(
    existing.map((product) => [normKey(formatListProductCode(product.code)), product]).filter(
      ([key]) => key,
    ),
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
  let publicKeptHigher = 0;
  let codesFixed = 0;
  /** @type {Array<{ code: string; match: string; name: string; category: string; publicPrice: number }>} */
  const updatedSamples = [];

  for (const product of incoming) {
    const listCode = formatListProductCode(product.code);
    const normalizedIncoming = {
      ...product,
      code: listCode,
    };
    const { prev, match } = findExisting(byCode, byId, existing, normalizedIncoming);

    if (prev) {
      const prevPublic = Math.max(0, Number(prev?.prices?.public) || 0);
      const incomingPublic = Math.max(0, Number(normalizedIncoming?.prices?.public) || 0);
      if (prevPublic > incomingPublic) publicKeptHigher += 1;
      if (normKey(prev.code) !== normKey(listCode)) codesFixed += 1;

      const next = mergeIncomingProduct(prev, normalizedIncoming);
      byId.set(String(prev.id), next);
      const codeKey = normKey(listCode);
      if (codeKey) byCode.set(codeKey, next);
      byName.set(nameMatchKey(next), next);
      updated += 1;
      if (updatedSamples.length < 10) {
        updatedSamples.push({
          code: String(next.code),
          match: match ?? 'code',
          name: next.name,
          category: String(next.category ?? ''),
          publicPrice: next.prices?.public ?? 0,
        });
      }
    } else {
      const purchasePrice = resolvePurchasePrice(normalizedIncoming);
      const productId = resolveIncomingProductId(normalizedIncoming, byId);
      const next = normalizeProductInput({
        ...normalizedIncoming,
        id: productId,
        code: listCode,
        prices: applyLpTonerV4PriceFloors(normalizedIncoming.prices ?? {}, purchasePrice),
        purchase_price_usd: purchasePrice,
      });
      byId.set(String(next.id), next);
      const codeKey = normKey(listCode);
      if (codeKey) byCode.set(codeKey, next);
      byName.set(nameMatchKey(next), next);
      created += 1;
    }
  }

  return {
    products: [...byId.values()],
    created,
    updated,
    publicKeptHigher,
    codesFixed,
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
  const seedCopy = join(seedsDir, 'LP-Toner-v4.xlsx');
  if (filePath !== seedCopy) {
    copyFileSync(filePath, seedCopy);
    console.log(`Copia guardada en ${seedCopy}`);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const { products: imported, skipped, duplicateCodesMerged, concatenatedModels } =
    parseLpTonerV4Workbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron productos válidos en el Excel.');
    process.exit(1);
  }

  const byCategory = imported.reduce((acc, product) => {
    const key = product.category ?? 'Sin categoría';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  console.log(`Productos en Excel (únicos por código): ${imported.length}`);
  console.log('Por categoría:', byCategory);
  if (duplicateCodesMerged.length) {
    console.log(`Códigos duplicados consolidados: ${duplicateCodesMerged.length}`);
    for (const row of duplicateCodesMerged) {
      console.log(`  · ${row.code} → modelos ${row.modelo}`);
    }
  }
  if (skipped.length) {
    console.log(`Filas omitidas: ${skipped.length}`);
    for (const row of skipped.slice(0, 10)) {
      console.log(`  · fila ${row.row}: ${row.reason}`);
    }
  }

  try {
    if (!skipCategories) {
      await ensureTonerSubcategories();
      console.log('Subcategorías de toner listas bajo Suministros.');
    }
  } catch (error) {
    console.warn(
      'Aviso: no se pudieron asegurar subcategorías. Se continúa con el inventario.',
      error instanceof Error ? error.message : error,
    );
  }

  const inventory = await readInventory();
  const {
    products: mergedProducts,
    created,
    updated,
    publicKeptHigher,
    codesFixed,
    updatedSamples,
  } = mergeProducts(inventory.products, imported);

  const { products } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  const reportPath = join(__dirname, '..', 'data', 'lp-toner-v4-import-report.json');
  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: {
          imported: imported.length,
          created,
          updated,
          codesFixed,
          publicKeptHigher,
          concatenatedModelsCount: concatenatedModels.length,
        },
        concatenatedModels,
        duplicateCodesMerged,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`Inventario actualizado: ${created} creados, ${updated} actualizados.`);
  console.log(`Códigos corregidos al valor de la lista: ${codesFixed}`);
  console.log(`Precio público conservado (más alto que Sugerido): ${publicKeptHigher}`);
  console.log(`Total en inventario: ${products.length} productos.`);
  console.log(`\nProductos con modelos concatenados (${concatenatedModels.length}):`);
  for (const row of concatenatedModels) {
    console.log(`  · ${row.code} → ${row.modelo}`);
  }
  console.log(`\nReporte: ${reportPath}`);

  if (updatedSamples.length) {
    console.log('\nActualizados (muestra):');
    for (const sample of updatedSamples) {
      console.log(
        `  · [${sample.match}] ${sample.code} | ${sample.category} | ${sample.name} | USD ${sample.publicPrice}`,
      );
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
