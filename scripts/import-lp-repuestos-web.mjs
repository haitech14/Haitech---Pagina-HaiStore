import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { shouldBumpSalePricesByMargin } from '../server/lib/lp-price-bump.js';
import { parseLpRepuestosWebWorkbook } from '../server/lib/lp-repuestos-web-excel.js';
import { parseLpTonerWebWorkbook } from '../server/lib/lp-toner-web-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRepuestos = join(
  'C:',
  'Users',
  'nicol',
  'OneDrive',
  'Escritorio',
  'LP Repuestos Web.xlsx',
);
const publicRepuestos = join(__dirname, '..', 'public', 'LP Repuestos Web.xlsx');
const defaultTonerPath = join(__dirname, '..', 'public', 'LP Toner Web.xlsx');

const argvPaths = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const filePath =
  argvPaths[0] ?? (existsSync(desktopRepuestos) ? desktopRepuestos : publicRepuestos);
const tonerPath = argvPaths[1] ?? defaultTonerPath;
const skipTonerAdjust = process.argv.includes('--skip-toner-adjust');

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
 * @param {any[]} existing
 * @param {any[]} incoming
 */
function mergeByCode(existing, incoming) {
  const byCode = new Map(
    existing
      .map((product) => [normKey(product.code), product])
      .filter(([key]) => key),
  );
  /** @type {Map<string, any>} */
  const byId = new Map(existing.map((product) => [String(product.id), product]));

  let created = 0;
  let updated = 0;
  /** @type {string[]} */
  const nameSamples = [];

  for (const product of incoming) {
    const codeKey = normKey(product.code);
    const prev = codeKey ? byCode.get(codeKey) : null;

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
      if (codeKey) byCode.set(codeKey, next);
      updated += 1;
      if (nameSamples.length < 6) nameSamples.push(`${next.code} → ${next.name}`);
    } else {
      byId.set(String(product.id), product);
      if (codeKey) byCode.set(codeKey, product);
      created += 1;
      if (nameSamples.length < 6) nameSamples.push(`${product.code} → ${product.name}`);
    }
  }

  return {
    products: [...byId.values()],
    created,
    updated,
    nameSamples,
  };
}

/**
 * Cuenta filas Excel con margen público−canal en [$10,$60] (códigos únicos).
 * @param {Buffer} buffer
 * @param {{ sheetName?: string; publicoCol: number; canalCol: number; codeCol: number }} opts
 */
function countExcelMarginBumps(buffer, opts) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = opts.sheetName ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return 0;
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const seen = new Set();
  let bumped = 0;
  for (const row of rows) {
    const code = normKey(row?.[opts.codeCol]);
    if (!code || code === 'codigo') continue;
    if (seen.has(code)) continue;
    seen.add(code);
    const publico = Number(row?.[opts.publicoCol]) || 0;
    const canal = Number(row?.[opts.canalCol]) || 0;
    if (shouldBumpSalePricesByMargin(publico, canal)) bumped += 1;
  }
  return bumped;
}

/**
 * Part A: re-aplica LP Toner Web (proveedor + bump + redondeo).
 * @param {any} inventory
 */
function adjustLpTonerProducts(inventory) {
  if (!existsSync(tonerPath)) {
    console.warn(`Part A omitida: no se encontró ${tonerPath}`);
    return {
      inventory,
      tonerCodes: 0,
      providerSet: 0,
      bumped: 0,
      updated: 0,
      created: 0,
    };
  }

  const buffer = readFileSync(tonerPath);
  const { products: imported, skipped } = parseLpTonerWebWorkbook(buffer);
  const { products: merged, created, updated } = mergeByCode(inventory.products, imported);

  const providerSet = imported.filter((product) =>
    /ricoh del per[uú]/i.test(String(product.suppliers?.[0]?.name ?? '')),
  ).length;
  const bumped = countExcelMarginBumps(buffer, {
    publicoCol: 4,
    canalCol: 7,
    codeCol: 1,
  });

  if (skipped.length) {
    console.log(`Toner filas omitidas: ${skipped.length}`);
  }

  return {
    inventory: { ...inventory, products: merged },
    tonerCodes: imported.length,
    providerSet,
    bumped,
    updated,
    created,
  };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });
  const seedCopy = join(seedsDir, 'LP-Repuestos-Web.xlsx');
  try {
    if (filePath !== seedCopy) {
      copyFileSync(filePath, seedCopy);
      console.log(`Copia guardada en ${seedCopy}`);
    }
  } catch (error) {
    console.warn(
      'Aviso: no se pudo copiar a data/seeds (OneDrive/lock). Se continúa.',
      error instanceof Error ? error.message : error,
    );
  }

  let inventory = await readInventory();

  /** @type {{ tonerCodes: number; providerSet: number; bumped: number; updated: number; created: number }} */
  let tonerStats = { tonerCodes: 0, providerSet: 0, bumped: 0, updated: 0, created: 0 };

  if (!skipTonerAdjust) {
    console.log(`\n=== Part A: ajuste LP Toner Web (${tonerPath}) ===`);
    const adjusted = adjustLpTonerProducts(inventory);
    inventory = adjusted.inventory;
    tonerStats = {
      tonerCodes: adjusted.tonerCodes,
      providerSet: adjusted.providerSet,
      bumped: adjusted.bumped,
      updated: adjusted.updated,
      created: adjusted.created,
    };
    console.log(
      `Toner: ${tonerStats.updated} actualizados, ${tonerStats.created} creados; proveedor «Ricoh del Perú» en ${tonerStats.providerSet}; bump +$12 en ${tonerStats.bumped} códigos (margen $10–$60).`,
    );
  }

  console.log(`\n=== Part B: import LP Repuestos Web (${filePath}) ===`);
  const buffer = readFileSync(filePath);
  const { products: imported, skipped, sheetName, translationHits } =
    parseLpRepuestosWebWorkbook(buffer);

  if (imported.length === 0) {
    console.error('No se encontraron repuestos válidos en el Excel.');
    process.exit(1);
  }

  console.log(`Hoja usada: ${JSON.stringify(sheetName)}`);
  console.log(`Productos únicos (por código): ${imported.length}`);
  console.log(`Filas con traducción resuelta: ${translationHits}`);
  if (skipped.length) {
    console.log(`Filas omitidas: ${skipped.length}`);
    for (const row of skipped.slice(0, 15)) {
      console.log(`  · fila ${row.row}: ${row.reason}`);
    }
  }

  const { products: mergedProducts, created, updated, nameSamples } = mergeByCode(
    inventory.products,
    imported,
  );
  const { products } = ensureProductSortOrders(mergedProducts);

  try {
    await writeInventory({
      products,
      deletedProductIds: inventory.deletedProductIds,
      warehouses: inventory.warehouses,
    });
  } catch (error) {
    console.error('Error escribiendo inventario (posible bloqueo OneDrive):', error);
    process.exit(1);
  }

  const repuestosBumped = countExcelMarginBumps(buffer, {
    sheetName,
    publicoCol: 4,
    canalCol: 7,
    codeCol: 1,
  });

  console.log(`\nRepuestos: ${created} creados, ${updated} actualizados.`);
  console.log(`Total en inventario: ${products.length} productos.`);
  console.log('Ejemplos de nombre:');
  for (const sample of nameSamples) {
    console.log(`  · ${sample}`);
  }

  console.log(`\n=== Resumen ===`);
  console.log(
    `Part A toner — códigos: ${tonerStats.tonerCodes}, proveedor set: ${tonerStats.providerSet}, bump +$12: ${tonerStats.bumped}, updated: ${tonerStats.updated}, created: ${tonerStats.created}`,
  );
  console.log(
    `Part B repuestos — created: ${created}, updated: ${updated}, bump +$12 (códigos únicos): ${repuestosBumped}`,
  );
  console.log(`\nRe-ejecutar:`);
  console.log(`  node scripts/import-lp-repuestos-web.mjs`);
  console.log(`  node scripts/import-lp-repuestos-web.mjs --skip-toner-adjust`);
  console.log(`  node scripts/import-lp-toner-web.mjs`);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
