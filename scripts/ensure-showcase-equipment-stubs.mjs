/**
 * Materializa en inventario todos los stubs de vitrina remanufacturada que aún no existen.
 */
import {
  findInventoryProductByLookupKey,
} from '../shared/product-lookup.js';
import {
  SHOWCASE_EQUIPMENT_STUBS,
  showcaseStubToInventoryProduct,
} from '../shared/showcase-equipment-stubs.js';
import {
  invalidateInventoryReadCache,
  mutateInventory,
  readInventory,
} from '../server/lib/inventory-store.js';

async function main() {
  const createdIds = [];
  const skippedIds = [];

  await mutateInventory((inventory) => {
    const products = [...(inventory.products ?? [])];
    for (const stub of SHOWCASE_EQUIPMENT_STUBS) {
      const existing = findInventoryProductByLookupKey(products, stub.id);
      if (existing) {
        skippedIds.push(stub.id);
        continue;
      }
      products.push(showcaseStubToInventoryProduct(stub));
      createdIds.push(stub.id);
    }
    return { ...inventory, products };
  }, { syncProductIds: createdIds });

  invalidateInventoryReadCache();
  const { products } = await readInventory();
  console.log(
    JSON.stringify(
      {
        created: createdIds,
        skipped: skippedIds,
        totalProducts: products.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
