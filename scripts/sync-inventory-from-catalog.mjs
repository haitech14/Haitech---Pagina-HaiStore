/**
 * Restaura / alinea server/data/inventory.json con el catálogo maestro.
 * Uso: node scripts/sync-inventory-from-catalog.mjs
 *      node scripts/sync-inventory-from-catalog.mjs --import-missing
 *      node scripts/sync-inventory-from-catalog.mjs --reset-deleted
 */
import { syncInventoryFromCatalog } from '../server/lib/inventory-store.js';

const importMissing = process.argv.includes('--import-missing') || !process.argv.includes('--merge-only');
const resetDeleted = process.argv.includes('--reset-deleted');

const result = await syncInventoryFromCatalog({ importMissing, resetDeleted });

console.log(
  `✓ Inventario sincronizado: ${result.products.length} productos ` +
    `(${result.catalogCount} del catálogo, ${result.customCount} personalizados)`,
);
