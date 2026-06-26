/**
 * Sincroniza Velocidad, Volumen mensual y tier Producción según modelo Ricoh IM/MP.
 *
 * Reglas:
 * - Velocidad: dos primeros dígitos tras IM/IM C/MP/MP C (p. ej. IM C2000 → 20 ppm).
 * - Volumen mensual: primer dígito del bloque numérico × 10 000 (C2000 → 20 000 páginas/mes).
 *
 * Uso: node scripts/sync-ricoh-model-speed-production.mjs [--dry-run]
 */
import { randomUUID } from 'node:crypto';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import {
  inferMonthlyProductionLabelFromRicohModelName,
  inferPpmLabelFromRicohModelName,
  inferProduccionTierFromRicohModelName,
  isRicohImMpCatalogEquipment,
} from '../shared/ricoh-model-ppm.js';

const VELOCIDAD_ATTR = 'Velocidad';
const VOLUMEN_ATTR = 'Volumen mensual';
const PRODUCCION_ATTR = 'Producción';

function upsertAttribute(attributes, name, value) {
  const list = Array.isArray(attributes) ? [...attributes] : [];
  const index = list.findIndex((row) => row?.name?.trim() === name);
  if (index >= 0) {
    list[index] = { ...list[index], name, value };
    return list;
  }
  return [...list, { id: randomUUID(), name, value }];
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { products, deletedProductIds, warehouses } = await readInventory();

  let updated = 0;
  const updatedIds = [];
  const nextProducts = products.map((product) => {
    if (!isRicohImMpCatalogEquipment(product)) return product;

    const velocidad = inferPpmLabelFromRicohModelName(product.name ?? '');
    const volumen = inferMonthlyProductionLabelFromRicohModelName(product.name ?? '');
    const produccion = inferProduccionTierFromRicohModelName(product.name ?? '');
    if (!velocidad || !volumen) return product;

    let attributes = product.attributes ?? [];
    const before = JSON.stringify(attributes);

    attributes = upsertAttribute(attributes, VELOCIDAD_ATTR, velocidad);
    attributes = upsertAttribute(attributes, VOLUMEN_ATTR, volumen);
    attributes = upsertAttribute(attributes, PRODUCCION_ATTR, produccion);

    if (JSON.stringify(attributes) === before) return product;

    updated += 1;
    updatedIds.push(product.id);
    return { ...product, attributes };
  });

  console.log(`Equipos Ricoh IM/MP en inventario: ${products.filter(isRicohImMpCatalogEquipment).length}`);
  console.log(`Actualizados (Velocidad + Volumen mensual + Producción): ${updated}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    { products: nextProducts, deletedProductIds, warehouses },
    { syncProductIds: updatedIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
