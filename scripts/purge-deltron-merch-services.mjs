import 'dotenv/config';

import { isDeltronMerchandisingOrServiceProduct } from '../server/lib/deltron-lp-pdf.js';
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

async function main() {
  const inventory = await readInventory();
  const removed = inventory.products.filter(isDeltronMerchandisingOrServiceProduct);
  const kept = inventory.products.filter((product) => !isDeltronMerchandisingOrServiceProduct(product));

  if (removed.length === 0) {
    console.log('No hay productos Deltron de merchandising/servicios en el inventario.');
    return;
  }

  const deletedProductIds = [
    ...new Set([...(inventory.deletedProductIds ?? []), ...removed.map((product) => product.id)]),
  ];

  await writeInventory({
    products: kept,
    deletedProductIds,
    warehouses: inventory.warehouses,
  });

  const byLine = new Map();
  for (const product of removed) {
    const line =
      product.attributes?.find((entry) => entry.name === 'Línea Deltron')?.value ?? '(otras líneas)';
    byLine.set(line, (byLine.get(line) ?? 0) + 1);
  }

  console.log(`Eliminados: ${removed.length} productos`);
  console.log(`Inventario: ${inventory.products.length} → ${kept.length}`);
  console.log('Por línea:');
  for (const [line, count] of [...byLine.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(4)}  ${line}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
