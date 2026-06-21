import 'dotenv/config';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

import {
  buildDeltronLpProduct,
  isDeltronMerchandisingOrServiceProduct,
  parseDeltronLpPdf,
  parseDeltronLpText,
  SUPPLIER_DELTRON,
} from '../server/lib/deltron-lp-pdf.js';
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
const defaultPdfPath = 'C:\\Users\\nicol\\Downloads\\LP Deltron.pdf';
const seedPdfPath = join(__dirname, '..', 'data', 'seeds', 'LP Deltron.pdf');
const defaultRawPath = join(__dirname, '..', 'data', 'seeds', 'deltron-pdf-raw.txt');

const filePath = process.argv.find((arg) => !arg.startsWith('-') && arg.endsWith('.pdf')) ?? seedPdfPath;
const useRawText = process.argv.includes('--raw');

/** Etiquetas de inventario que deben reconocer categorías de tienda. */
const STORE_CATEGORY_LABEL_TARGETS = [
  { id: 'cat-toner', labels: ['Toner, Toner Original', 'Toner, Suministros'] },
  { id: 'cat-multifuncionales', labels: ['Multifuncionales'] },
  { id: 'cat-impresoras', labels: ['Impresoras'] },
  { id: 'cat-repuestos', labels: ['Repuestos, Repuestos Originales'] },
  { id: 'cat-escaneres', labels: ['Escáneres'] },
  { id: 'cat-camaras', labels: ['Cámaras'] },
  { id: 'cat-monitores', labels: ['Monitores'] },
  { id: 'cat-computadoras-laptop', labels: ['Computadoras y Laptop'] },
  { id: 'cat-accesorios', labels: ['Accesorios'] },
  { id: 'cat-formato-ancho', labels: ['Formato Ancho'] },
  { id: 'cat-soluciones-colaboracion', labels: ['Soluciones de Colaboración'] },
];

async function ensureStoreCategoryLabels(categoryLabels) {
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

    for (const label of categoryLabels) {
      if (label.startsWith(row.name) || target.labels.some((entry) => label.includes(entry.split(',')[0]))) {
        if (!labels.has(label)) {
          labels.add(label);
          changed = true;
        }
      }
    }

    if (changed) {
      await updateStoreCategory(target.id, { inventoryLabels: [...labels] });
      console.log(`• Etiquetas actualizadas en ${row.name}`);
    }
  }

  const solutions = categories.find((row) => row.slug === 'soluciones-negocio');
  if (solutions) {
    const labels = new Set(solutions.inventoryLabels ?? []);
    let changed = false;
    for (const label of categoryLabels) {
      if (label.startsWith('Soluciones de Negocio') && !labels.has(label)) {
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

function mergeDeltronSuppliers(previous, incoming) {
  const preserved = (previous ?? []).filter(
    (supplier) => String(supplier.name ?? '').trim().toLowerCase() !== SUPPLIER_DELTRON.toLowerCase(),
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
            suppliers: mergeDeltronSuppliers(prev.suppliers, product.suppliers),
            brand: product.brand ?? prev.brand,
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
  };
}

async function extractTextOnly(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    return textResult.text ?? '';
  } finally {
    await parser.destroy();
  }
}

async function loadParsed() {
  const seedsDir = join(__dirname, '..', 'data', 'seeds');
  mkdirSync(seedsDir, { recursive: true });

  if (useRawText) {
    if (!existsSync(defaultRawPath)) {
      console.error(`No se encontró texto crudo: ${defaultRawPath}`);
      process.exit(1);
    }
    const text = readFileSync(defaultRawPath, 'utf8');
    const textParsed = parseDeltronLpText(text);
    return {
      ...textParsed,
      products: textParsed.products
        .map((row) => buildDeltronLpProduct(row))
        .filter((product) => product && !isDeltronMerchandisingOrServiceProduct(product)),
    };
  }

  const sourcePath = existsSync(filePath)
    ? filePath
    : existsSync(defaultPdfPath)
      ? defaultPdfPath
      : existsSync(seedPdfPath)
        ? seedPdfPath
        : null;

  if (!sourcePath) {
    console.error(`No se encontró el PDF Deltron. Probado: ${filePath}, ${defaultPdfPath}, ${seedPdfPath}`);
    process.exit(1);
  }

  if (sourcePath !== seedPdfPath) {
    copyFileSync(sourcePath, seedPdfPath);
    console.log(`Copia guardada en ${seedPdfPath}`);
  }

  console.log(`Leyendo ${sourcePath}…`);
  const buffer = readFileSync(sourcePath);
  const parsed = await parseDeltronLpPdf(buffer);
  writeFileSync(defaultRawPath, await extractTextOnly(buffer), 'utf8');
  return parsed;
}

async function main() {
  const parsed = await loadParsed();
  const { products, rowsRead, categories, exchangeRate } = parsed;

  if (products.length === 0) {
    console.error('No se encontraron productos válidos en la lista Deltron.');
    process.exit(1);
  }

  const withStock = products.filter((product) => (product.stock ?? 0) > 0).length;
  const withPrice = products.filter((product) => (product.purchase_price_usd ?? 0) > 0).length;
  const sample = products.find((product) => product.purchase_price_usd > 0) ?? products[0];

  console.log(`Tipo de cambio: ${exchangeRate}`);
  console.log(`Filas parseadas: ${rowsRead}`);
  console.log(`Productos listos: ${products.length}`);
  console.log(`Con stock > 0: ${withStock}`);
  console.log(`Con precio de compra: ${withPrice}`);
  console.log(`Categorías: ${categories.length}`);
  console.log(
    `Ejemplo: ${sample.code} | ${sample.name.slice(0, 48)} | compra $${sample.purchase_price_usd} | ${sample.category}`,
  );

  await ensureStoreCategoryLabels(categories);

  const inventory = await readInventory();
  const codesBefore = new Set(
    inventory.products.map((product) => String(product.code ?? '').trim().toLowerCase()).filter(Boolean),
  );

  const { products: mergedProducts } = mergeByCode(inventory.products, products);
  const actuallyCreated = products.filter(
    (product) => !codesBefore.has(String(product.code ?? '').trim().toLowerCase()),
  ).length;
  const actuallyUpdated = products.length - actuallyCreated;

  const { products: sortedProducts } = ensureProductSortOrders(mergedProducts);

  await writeInventory({
    products: sortedProducts,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Inventario actualizado: ${sortedProducts.length} productos totales.`);
  console.log(`Deltron — nuevos: ${actuallyCreated}, actualizados: ${actuallyUpdated}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
