import 'dotenv/config';

import { normalizeInventoryCategoryToLanding } from '../shared/landing-categories.js';
import {
  ensureProductSortOrders,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';

async function main() {
  const inventory = await readInventory();
  let updated = 0;

  const products = inventory.products.map((product) => {
    const nextCategory = normalizeInventoryCategoryToLanding(product.category);
    if (nextCategory === product.category) return product;
    updated += 1;
    return normalizeProductInput({ ...product, category: nextCategory }, product);
  });

  const { products: sorted } = ensureProductSortOrders(products);

  await writeInventory({
    products: sorted,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(`Categorías normalizadas: ${updated} productos actualizados.`);
  console.log(`Total en inventario: ${sorted.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
