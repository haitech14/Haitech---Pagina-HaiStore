import fs from 'fs';

import {
  ensureListedOriginalTonerProducts,
  wireEquipmentTonerCrossSell,
} from '../server/lib/known-equipment-toners.js';

const INVENTORY_PATH = new URL('../server/data/inventory.json', import.meta.url);
const INDEX_PATH = new URL('../public/catalog/inventory-index.json', import.meta.url);

const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
const listed = ensureListedOriginalTonerProducts(inventory.products);
const wired = wireEquipmentTonerCrossSell(listed.products);
inventory.products = wired.products;
fs.writeFileSync(INVENTORY_PATH, `${JSON.stringify(inventory)}\n`);

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
const byId = new Map(wired.products.map((product) => [product.id, product]));
index.products = index.products.map((row) => {
  const fresh = byId.get(row.id);
  if (!fresh) return row;
  return {
    ...row,
    name: fresh.name,
    code: fresh.code,
    description: fresh.description,
    prices: fresh.prices,
    attributes: fresh.attributes,
    cross_sell_product_ids: fresh.cross_sell_product_ids,
  };
});
index.generatedAt = new Date().toISOString();
fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index)}\n`);

console.log(
  JSON.stringify(
    {
      listedUpdated: listed.updated,
      listedMissing: listed.missing,
      wired: wired.wired,
    },
    null,
    2,
  ),
);
