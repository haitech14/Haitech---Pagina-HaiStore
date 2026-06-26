import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeAttributes } from '../server/lib/inventory-attributes.js';
import {
  migrateInventoryProduct,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { isBundleProduct } from '../server/lib/product-bundle.js';
import { CATEGORY_COMPATIBLE_TONER } from '../shared/compatible-toner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');

function isIntercopyTonerProduct(product) {
  const id = String(product?.id ?? '');
  const name = String(product?.name ?? '');
  const brand = String(product?.brand ?? '');
  return (
    brand === 'Intercopy' ||
    id.startsWith('intercopy-') ||
    (id.startsWith('toner-pack-') && /Intercopy/i.test(name)) ||
    (/Intercopy/i.test(name) && /Toner (Cartucho|Recarga)/i.test(name))
  );
}

function resolvePackColorValue(product) {
  const contenido = (product.attributes ?? []).find((row) => row?.name === 'Contenido')?.value;
  if (/cyan.*magenta|amarillo|negro/i.test(String(contenido ?? ''))) {
    return 'Color';
  }
  return 'Negro';
}

function ensureColorAttribute(product) {
  const attributes = [...(product.attributes ?? [])];
  const colorIndex = attributes.findIndex((row) => String(row?.name ?? '').trim() === 'Color');

  let colorValue;
  if (isBundleProduct(product)) {
    colorValue = resolvePackColorValue(product);
  } else {
    const existing = colorIndex >= 0 ? String(attributes[colorIndex]?.value ?? '').trim() : '';
    colorValue = existing || 'Negro';
  }

  if (colorIndex >= 0) {
    attributes[colorIndex] = { ...attributes[colorIndex], name: 'Color', value: colorValue };
  } else {
    attributes.push({ name: 'Color', value: colorValue });
  }

  return normalizeAttributes(attributes);
}

function syncCatalogJson(products) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const byId = new Map((catalog.products ?? []).map((product) => [String(product.id), product]));

  for (const product of products) {
    const existing = byId.get(String(product.id));
    byId.set(String(product.id), {
      ...(existing ?? {}),
      ...product,
      slug: product.slug ?? existing?.slug,
    });
  }

  catalog.products = [...byId.values()];
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

async function main() {
  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  let updated = 0;

  const products = inventory.products.map((product) => {
    if (!isIntercopyTonerProduct(product)) return product;

    const attributes = ensureColorAttribute(product);
    const category = CATEGORY_COMPATIBLE_TONER;
    const changed =
      product.category !== category ||
      JSON.stringify(product.attributes ?? []) !== JSON.stringify(attributes);

    if (!changed) return product;

    updated += 1;
    return migrateInventoryProduct(
      {
        ...product,
        category,
        attributes,
      },
      warehouses,
    );
  });

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds ?? [],
    warehouses,
  });

  const intercopyProducts = products.filter(isIntercopyTonerProduct);
  syncCatalogJson(intercopyProducts);

  const missingColor = intercopyProducts.filter(
    (product) => !((product.attributes ?? []).some((row) => row?.name === 'Color')),
  );

  console.log(`Productos Intercopy actualizados: ${updated}`);
  console.log(`Total en Toner Compatible: ${intercopyProducts.length}`);
  console.log(`Sin atributo Color: ${missingColor.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
