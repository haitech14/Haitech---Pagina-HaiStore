import 'dotenv/config';

import {
  ensureProductSortOrders,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import {
  ensureImC320FCompatibleTonerProducts,
  ensureMpC407CompatibleTonerProducts,
  mergeKnownEquipmentTonerProducts,
  wireEquipmentTonerCrossSell,
} from '../server/lib/known-equipment-toners.js';

/**
 * Si OneDrive revierte `server/data/inventory.json`, vuelve a ejecutar este script
 * para restaurar tóneres conocidos (IM C320F CMYK, MP C407, M 320F, etc.).
 */
async function main() {
  const inventory = await readInventory();
  const tonerMerge = mergeKnownEquipmentTonerProducts(inventory.products);
  const mpC407 = ensureMpC407CompatibleTonerProducts(tonerMerge.products);
  const imC320f = ensureImC320FCompatibleTonerProducts(mpC407.products);
  const wired = wireEquipmentTonerCrossSell(imC320f.products);
  const { products } = ensureProductSortOrders(wired.products);

  await writeInventory({
    products,
    deletedProductIds: inventory.deletedProductIds,
    warehouses: inventory.warehouses,
  });

  console.log(
    `Tóneres de equipo: ${tonerMerge.created} nuevos, ${tonerMerge.updated} actualizados; MP C407 CMYK: ${mpC407.updated}; IM C320F CMYK: ${imC320f.created} nuevos / ${imC320f.updated} actualizados; ${wired.wired} equipos con venta cruzada.`,
  );
  console.log(`Total en inventario: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
