/**
 * Completa Color, Formato papel, Producción y ADF en equipos multifuncionales/impresoras
 * cuando faltan o están vacíos en inventario.
 * Uso: node scripts/backfill-equipment-catalog-attributes.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

import { productQualifiesAsSeminuevaEquipment } from '../shared/inventory-product-name.js';
import { buildInferredEquipmentCatalogAttributes } from '../shared/catalog-attribute-filters.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'server/data/inventory.json');
const dryRun = process.argv.includes('--dry-run');

function isEquipmentProduct(product) {
  const haystack = `${product?.category ?? ''} ${product?.name ?? ''}`.toLowerCase();
  return /multifunc|impresor|impresora|laser|plotter|copiadora|esc[aá]ner/i.test(haystack);
}

function upsertAttributes(product, inferred) {
  if (inferred.length === 0) return false;
  const attributes = Array.isArray(product.attributes) ? [...product.attributes] : [];
  let changed = false;

  for (const { name, value } of inferred) {
    const index = attributes.findIndex((attr) => String(attr?.name ?? '').trim() === name);
    if (index >= 0) {
      if (!String(attributes[index]?.value ?? '').trim()) {
        attributes[index] = { ...attributes[index], name, value };
        changed = true;
      }
      continue;
    }
    attributes.push({ id: randomUUID(), name, value });
    changed = true;
  }

  if (changed) {
    product.attributes = attributes;
  }
  return changed;
}

function main() {
  const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const products = data.products ?? [];
  let updated = 0;
  let seminuevaUpdated = 0;

  for (const product of products) {
    if (!isEquipmentProduct(product)) continue;
    const inferred = buildInferredEquipmentCatalogAttributes(product);
    if (!upsertAttributes(product, inferred)) continue;
    updated += 1;
    if (productQualifiesAsSeminuevaEquipment(product)) seminuevaUpdated += 1;
    if (!dryRun) {
      console.log(`✓ ${product.name.slice(0, 70)}`);
    }
  }

  if (!dryRun && updated > 0) {
    fs.writeFileSync(inventoryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  console.log(
    `\n${dryRun ? 'Simulación' : 'Listo'}: ${updated} equipo(s) actualizados` +
      ` (${seminuevaUpdated} seminueva(s)).`,
  );
}

main();
