/**
 * Sincroniza equipos desde el API de producción hacia inventory-catalog.json
 * y server/data/inventory.json (fallback cuando la API no responde).
 *
 * Uso: node scripts/sync-static-catalog-equipment.mjs
 *      node scripts/sync-static-catalog-equipment.mjs --all-nuevas
 *      node scripts/sync-static-catalog-equipment.mjs --all-seminuevas
 *      node scripts/sync-static-catalog-equipment.mjs --all-impresoras-laser
 *      node scripts/sync-static-catalog-equipment.mjs --all-equipment-fallback
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HOME_HIGHLIGHTED_MODEL_PATTERNS } from '../shared/home-highlighted-products.js';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '../shared/inventory-product-name.js';
import { assignUniqueProductSlugs } from '../shared/product-slug.js';
import { getInventoryPath } from '../server/lib/server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const productsDir = path.join(root, 'public/products');
const apiBase = process.env.HAITECH_CATALOG_SYNC_URL ?? 'https://www.haitech.pe';

/** Equipos prioritarios (usuario + fila destacada + comparador). */
const PRIORITY_EQUIPMENT_IDS = [
  'ricoh-im-430f',
  'bfb264b8-70dc-4ad4-9686-2df02df8c75e',
  'ab878d89-61e0-4e51-a941-03455e1da407',
  '481dbc77-436b-464d-b76f-930f7d79f4ff',
  'cb1e47b2-d784-4bef-ae18-d4dae08723e4',
  '328f41ef-d935-4807-85d0-e1db5bdf73fb',
  'b32a43a1-09e4-49f6-8950-3639c9534700',
  '71289ec2-dbca-4780-b319-eb3d259fadb5',
  'c0ad567a-6ad7-4857-a087-fd574a903a04',
];

function localProductImageExists(productId) {
  return fs.existsSync(path.join(productsDir, `${productId}.webp`));
}

function resolveLocalMedia(product) {
  const id = String(product.id ?? '').trim();
  if (!id) return { image_url: product.image_url ?? null, gallery: product.gallery ?? [] };

  if (localProductImageExists(id)) {
    const base = `/products/${id}.webp`;
    const gallery = [base];
    for (const suffix of ['-2', '-3', '-256', '-512']) {
      const file = path.join(productsDir, `${id}${suffix}.webp`);
      if (fs.existsSync(file)) gallery.push(`/products/${id}${suffix}.webp`);
    }
    return { image_url: base, gallery: [...new Set(gallery)] };
  }

  return {
    image_url: product.image_url ?? null,
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
  };
}

function toCatalogRow(product) {
  const media = resolveLocalMedia(product);
  const prices = product.prices ?? { public: product.price ?? 0 };
  const row = {
    id: product.id,
    name: product.name,
    description: product.description?.trim() || undefined,
    currency: product.currency ?? 'USD',
    stock: product.stock ?? 0,
    category: product.category ?? 'Multifuncionales Nuevas',
    brand: product.brand ?? 'Ricoh',
    image_url: media.image_url,
    gallery: media.gallery,
    prices,
    created_at: product.created_at ?? new Date().toISOString(),
  };

  if (product.code?.trim()) row.code = product.code.trim();
  if (Array.isArray(product.attributes) && product.attributes.length > 0) {
    row.attributes = product.attributes;
  }
  if (product.purchase_price_usd != null) {
    row.purchase_price_usd = product.purchase_price_usd;
  }
  if (product.sort_order != null) row.sort_order = product.sort_order;
  if (product.slug?.trim()) row.slug = product.slug.trim();
  if (Array.isArray(product.storefront_feature_bar) && product.storefront_feature_bar.length > 0) {
    row.storefront_feature_bar = product.storefront_feature_bar;
  }
  if (Array.isArray(product.storefront_hero_bullets) && product.storefront_hero_bullets.length > 0) {
    row.storefront_hero_bullets = product.storefront_hero_bullets;
  }
  if (Array.isArray(product.cross_sell_product_ids) && product.cross_sell_product_ids.length > 0) {
    row.cross_sell_product_ids = product.cross_sell_product_ids;
  }

  return row;
}

const ACCESSORY_RE =
  /\b(cable|papel|banner|adaptador|caja de dinero|mantenimiento box|termica usb|etiquetas|cartridge|toner|tinta|cartucho|tóner|ribbon)\b/i;

const MULTIFUNCTIONAL_RE = /\b(multifuncional|multif\.?|mfp)\b/i;

function isStorefrontEquipment(product) {
  const name = String(product?.name ?? '');
  if (!/impresora/i.test(name) && !MULTIFUNCTIONAL_RE.test(name)) return false;
  if (ACCESSORY_RE.test(name)) return false;
  return true;
}

function isImpresoraLaserEquipment(product) {
  const name = String(product?.name ?? '');
  const cat = String(product?.category ?? '').toLowerCase();
  if (MULTIFUNCTIONAL_RE.test(name)) return false;
  if (!/impresora/i.test(name) && !cat.includes('impresoras laser') && !cat.includes('impresoras láser')) {
    return false;
  }
  if (ACCESSORY_RE.test(name)) return false;
  if (/termica|térmica|sublimaci/i.test(name)) return false;
  return /ricoh/i.test(name) || cat.includes('impresoras laser') || cat.includes('impresoras láser');
}

function isNuevaMultifuncional(product) {
  const category = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '');
  return (
    category.includes('multifuncional') &&
    /\bnueva\b/i.test(name) &&
    !/\bseminueva\b/i.test(name)
  );
}

function findHighlightEquipmentIds(allProducts) {
  const ids = new Set();
  for (const pattern of HOME_HIGHLIGHTED_MODEL_PATTERNS) {
    const match = allProducts.find(
      (product) =>
        isNuevaMultifuncional(product) &&
        pattern.test(`${product.name ?? ''} ${product.code ?? ''}`),
    );
    if (match?.id) ids.add(match.id);
  }
  return ids;
}

async function fetchProductionProducts() {
  const response = await fetch(`${apiBase}/api/products`);
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function fetchProductionDetail(id) {
  const response = await fetch(`${apiBase}/api/products/${encodeURIComponent(id)}`);
  if (!response.ok) return null;
  return response.json();
}

async function fetchDetailsBatch(ids, concurrency = 6) {
  const rows = [];
  const queue = [...ids];
  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) break;
      const summary = listCache.find((product) => product.id === id);
      if (!summary) continue;
      const detail = (await fetchProductionDetail(id)) ?? summary;
      rows.push(toCatalogRow(detail));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return rows;
}

let listCache = [];

function loadCatalog() {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  return Array.isArray(data.products) ? data : { products: [] };
}

function upsertCatalogProducts(existing, incoming) {
  const map = new Map(existing.map((product) => [product.id, product]));
  for (const row of incoming) {
    map.set(row.id, { ...map.get(row.id), ...row });
  }
  return [...map.values()];
}

function loadInventoryFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { products: [], warehouses: [], deletedProductIds: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const syncAllNuevas =
    process.argv.includes('--all-nuevas') || process.argv.includes('--all-equipment-fallback');
  const syncAllSeminuevas =
    process.argv.includes('--all-seminuevas') || process.argv.includes('--all-equipment-fallback');
  const syncAllImpresorasLaser =
    process.argv.includes('--all-impresoras-laser') ||
    process.argv.includes('--all-equipment-fallback');

  const list = await fetchProductionProducts();
  listCache = list;

  let targetIds = new Set(PRIORITY_EQUIPMENT_IDS);
  for (const id of findHighlightEquipmentIds(list)) targetIds.add(id);

  if (syncAllNuevas) {
    for (const product of list) {
      if (isNuevaMultifuncional(product)) targetIds.add(product.id);
      if (productQualifiesAsNuevaEquipment(product) && isImpresoraLaserEquipment(product)) {
        targetIds.add(product.id);
      }
    }
  }

  if (syncAllSeminuevas) {
    for (const product of list) {
      if (!productQualifiesAsSeminuevaEquipment(product) || !isStorefrontEquipment(product)) continue;
      const name = String(product.name ?? '');
      if (/ricoh|canon|savin|kyocera|xerox/i.test(name)) targetIds.add(product.id);
    }
  }

  if (syncAllImpresorasLaser) {
    for (const product of list) {
      if (isImpresoraLaserEquipment(product)) targetIds.add(product.id);
    }
  }

  const rows = await fetchDetailsBatch([...targetIds]);

  const catalog = loadCatalog();
  const before = catalog.products.length;
  catalog.products = upsertCatalogProducts(catalog.products, rows);
  const slugResult = assignUniqueProductSlugs(catalog.products);
  catalog.products = slugResult.products;
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  const inventoryPath = getInventoryPath();
  fs.mkdirSync(path.dirname(inventoryPath), { recursive: true });
  const inventory = loadInventoryFile(inventoryPath);
  inventory.products = upsertCatalogProducts(inventory.products ?? [], rows);
  const invSlugResult = assignUniqueProductSlugs(inventory.products);
  inventory.products = invSlugResult.products;
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

  const staticIds = new Set(catalog.products.map((product) => product.id));
  const highlightGaps = [];
  for (const pattern of HOME_HIGHLIGHTED_MODEL_PATTERNS) {
    const match = list.find(
      (product) =>
        isNuevaMultifuncional(product) &&
        pattern.test(`${product.name ?? ''} ${product.code ?? ''}`),
    );
    if (!match) highlightGaps.push(String(pattern));
    else if (!staticIds.has(match.id)) highlightGaps.push(`${match.name} (${match.id})`);
  }

  console.log(`[sync] Catálogo: ${before} → ${catalog.products.length} productos`);
  console.log(`[sync] Slugs asignados en catálogo: ${slugResult.assigned}`);
  console.log(`[sync] Actualizados ${rows.length} equipos en:`);
  console.log(`  · ${path.relative(root, catalogPath)}`);
  console.log(`  · ${inventoryPath}`);
  for (const row of rows) {
    console.log(`  ✓ ${row.name}`);
  }

  if (highlightGaps.length > 0) {
    console.log('\n[sync] Patrones destacados sin equipo en catálogo estático:');
    for (const gap of highlightGaps) console.log(`  · ${gap}`);
  } else {
    console.log('\n[sync] ✓ Todos los patrones de «Lo más destacado» tienen equipo en catálogo.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
