/**
 * One-off: fusiona equipos seminuevos duplicados (mismo modelo normalizado +
 * mismo precio tecnico y publico). Suma stock por warehouse, mergea suppliers,
 * limpia variant_product_ids, elimina el producto descartado y sincroniza
 * inventory + src/data/inventory-catalog.json.
 *
 * Uso: node scripts/merge-duplicate-seminuevos.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '../shared/inventory-product-name.js';
import {
  readInventory,
  writeInventory,
  migrateInventoryProduct,
  invalidateInventoryReadCache,
} from '../server/lib/inventory-store.js';
import { normalizeWarehouses } from '../server/lib/inventory-warehouses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'src', 'data', 'inventory-catalog.json');

/** Extrae clave de modelo: "IM C2000", "MP C3004", con sufijos -cil / -lp. */
export function normalizeModelKey(name) {
  const blob = String(name || '').replace(/\s+/g, ' ').trim();
  if (!blob) return null;
  const noVolt = blob.replace(/\b(110|120|220|240)\s*V\b/gi, ' ');

  const patterns = [
    /\bIM\s*C\s*(\d{3,4}[A-Z]?)\b/i,
    /\bMP\s*C\s*(\d{3,4}[A-Z]?)\b/i,
    /\bSP\s*C\s*(\d{3,4}[A-Z]?)\b/i,
    /\bIM\s*(?!C\b)(\d{3,4}[A-Z]?)\b/i,
    /\bMP\s*(?!C\b)(\d{3,4}[A-Z]?)\b/i,
    /\bSP\s*(?!C\b)(\d{3,4}[A-Z]?)\b/i,
    /\bM\s*(\d{3,4}[A-Z]?)\b/i,
  ];
  const labels = ['IM C', 'MP C', 'SP C', 'IM ', 'MP ', 'SP ', 'M '];

  let model = null;
  for (let i = 0; i < patterns.length; i += 1) {
    const m = noVolt.match(patterns[i]);
    if (m) {
      model = `${labels[i]}${String(m[1]).toUpperCase()}`.replace(/\s+/g, ' ').trim();
      break;
    }
  }
  if (!model) return null;

  let suffix = '';
  if (/cilindro|cuchilla|rod\.?\s*carga/i.test(blob)) suffix += '-cil';
  if (/ligero\s*punto|c\/l\.p/i.test(blob)) suffix += '-lp';
  return model + suffix;
}

function isTonerOrRepuesto(product) {
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  if (/toner|repuesto|suministro/.test(cat)) return true;
  if (/toner|cartucho|repuesto|fusing unit|pcdu|unidad fusora|unidad de imagen/.test(name)) {
    if (!/impresora|multifuncional|plotter|copiadora/.test(name)) return true;
  }
  return false;
}

function isSeminuevaEquipmentCandidate(product) {
  if (!productQualifiesAsSeminuevaEquipment(product)) return false;
  if (productQualifiesAsNuevaEquipment(product)) return false;
  if (isTonerOrRepuesto(product)) return false;
  const name = String(product.name || '').toLowerCase();
  const cat = String(product.category || '').toLowerCase();
  if (cat.includes('seminuevas')) return true;
  return /impresora|multifuncional|plotter|copiadora|seminueva|seminuevo/.test(name);
}

function tecnicoOf(product) {
  return Math.round(Number(product?.prices?.tecnico ?? product?.price ?? 0) || 0);
}

function publicOf(product) {
  return Math.round(Number(product?.prices?.public ?? product?.price ?? 0) || 0);
}

function groupKey(product) {
  const model = normalizeModelKey(product.name);
  if (!model) return null;
  return `${model}|tec:${tecnicoOf(product)}|pub:${publicOf(product)}`;
}

function nearMissKey(product) {
  const model = normalizeModelKey(product.name);
  if (!model) return null;
  return `${model}|tec:${tecnicoOf(product)}`;
}

function hasUsefulImage(product) {
  const url = String(product.image_url || product.image || '').trim();
  return Boolean(url) && !/placeholder|default/i.test(url);
}

/** Preferir: mas stock, mejor nombre Color Seminueva, codigo numerico limpio, imagen. */
function keepScore(product) {
  const stock = Math.max(0, Number(product.stock) || 0);
  const name = String(product.name || '');
  const code = String(product.code || '').trim();
  let score = stock * 10000;
  if (/Color\s+Seminueva/i.test(name)) score += 5000;
  else if (/B\/N\s+Seminueva/i.test(name)) score += 4000;
  else if (/Seminueva|Seminuevo/i.test(name)) score += 1000;
  if (/^\d+$/.test(code)) score += 3000;
  else if (/^\d/.test(code)) score += 800;
  score += Math.max(0, 80 - code.length);
  if (hasUsefulImage(product)) score += 400;
  return score;
}

function pickKeeper(products) {
  return [...products].sort((a, b) => {
    const d = keepScore(b) - keepScore(a);
    if (d !== 0) return d;
    return String(a.code || '').localeCompare(String(b.code || ''));
  })[0];
}

function sumStockByWarehouse(products, warehouses) {
  const ids = warehouses.map((w) => w.id);
  const totals = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const p of products) {
    const rows = Array.isArray(p.stock_by_warehouse) ? p.stock_by_warehouse : [];
    for (const row of rows) {
      const wid = row.warehouse_id;
      if (wid in totals) {
        totals[wid] += Math.max(0, Number(row.quantity) || 0);
      }
    }
    if (!rows.length) {
      // fallback: todo el stock legado a operativo si existe
      const legacy = Math.max(0, Number(p.stock) || 0);
      if (legacy && 'operativo' in totals) totals.operativo += legacy;
    }
  }
  return ids.map((warehouse_id) => ({
    warehouse_id,
    quantity: totals[warehouse_id],
  }));
}

function mergeSuppliers(products) {
  const out = [];
  const seen = new Set();
  for (const p of products) {
    const list = Array.isArray(p.suppliers) ? p.suppliers : [];
    for (const s of list) {
      const key = `${s.id || ''}|${s.name || ''}|${s.purchase_price_usd ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...s });
    }
  }
  return out;
}

function clearVariantLinks(products, idsToClear) {
  const ban = new Set(idsToClear);
  for (const p of products) {
    if (!Array.isArray(p.variant_product_ids) || !p.variant_product_ids.length) continue;
    p.variant_product_ids = p.variant_product_ids.filter((id) => !ban.has(id));
    if (!p.variant_product_ids.length) delete p.variant_product_ids;
  }
}

function syncCatalog({ keptProducts, droppedIds, warehouses, deletedProductIds }) {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.warn(`Catalogo no encontrado: ${CATALOG_PATH}`);
    return;
  }
  const backup = `${CATALOG_PATH}.bak-merge-semi-${Date.now()}`;
  fs.copyFileSync(CATALOG_PATH, backup);
  const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const drop = new Set(droppedIds);
  let next = (raw.products || []).filter((p) => !drop.has(p.id));
  const byId = new Map(next.map((p, i) => [p.id, i]));
  for (const live of keptProducts) {
    const idx = byId.get(live.id);
    if (idx != null) next[idx] = { ...next[idx], ...live };
    else {
      next.push(live);
      byId.set(live.id, next.length - 1);
    }
  }
  const catalogDeleted = [
    ...new Set([...(raw.deletedProductIds || []), ...deletedProductIds, ...droppedIds]),
  ];
  fs.writeFileSync(
    CATALOG_PATH,
    `${JSON.stringify({ ...raw, products: next, warehouses, deletedProductIds: catalogDeleted }, null, 2)}\n`,
    'utf8',
  );
  console.log(`Catalog sync: kept=${keptProducts.length} dropped=${droppedIds.length} → ${CATALOG_PATH}`);
  console.log(`Catalog backup: ${backup}`);
}

async function main() {
  invalidateInventoryReadCache();
  const inventory = await readInventory();
  const warehouses = normalizeWarehouses(inventory.warehouses);
  let products = inventory.products.map((p) => migrateInventoryProduct({ ...p }, warehouses));
  const deletedProductIds = [...new Set(inventory.deletedProductIds || [])];

  const candidates = products.filter(isSeminuevaEquipmentCandidate);
  const groups = new Map();
  for (const p of candidates) {
    const key = groupKey(p);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  // Near-miss: mismo modelo+tec, distinto publico (no fusionar)
  const nearGroups = new Map();
  for (const p of candidates) {
    const key = nearMissKey(p);
    if (!key) continue;
    if (!nearGroups.has(key)) nearGroups.set(key, []);
    nearGroups.get(key).push(p);
  }
  const nearMisses = [...nearGroups.entries()]
    .filter(([, arr]) => {
      if (arr.length < 2) return false;
      const pubs = new Set(arr.map(publicOf));
      return pubs.size > 1;
    })
    .map(([key, arr]) => ({
      key,
      products: arr.map((p) => ({
        id: p.id,
        code: p.code,
        pub: publicOf(p),
        tec: tecnicoOf(p),
        stock: p.stock,
        name: p.name,
      })),
    }));

  const mergeGroups = [...groups.entries()].filter(([, arr]) => arr.length > 1);
  const merges = [];
  const keptTouched = [];
  const allDroppedIds = [];

  for (const [key, members] of mergeGroups) {
    const keeper = pickKeeper(members);
    const dropped = members.filter((p) => p.id !== keeper.id);
    const beforeStock = {
      kept: Number(keeper.stock) || 0,
      dropped: dropped.map((d) => ({ id: d.id, code: d.code, stock: Number(d.stock) || 0 })),
      total: members.reduce((s, p) => s + (Number(p.stock) || 0), 0),
    };

    const stock_by_warehouse = sumStockByWarehouse(members, warehouses);
    const stock = stock_by_warehouse.reduce((s, r) => s + r.quantity, 0);
    const suppliers = mergeSuppliers(members);

    const dropIds = dropped.map((d) => d.id);
    let variants = Array.isArray(keeper.variant_product_ids)
      ? keeper.variant_product_ids.filter((id) => !dropIds.includes(id) && id !== keeper.id)
      : [];
    // quitar links cruzados entre el grupo
    const groupIds = new Set(members.map((m) => m.id));
    variants = variants.filter((id) => !groupIds.has(id));

    Object.assign(keeper, {
      stock_by_warehouse,
      stock,
      suppliers,
    });
    if (variants.length) keeper.variant_product_ids = variants;
    else delete keeper.variant_product_ids;

    const migrated = migrateInventoryProduct(keeper, warehouses);
    Object.assign(keeper, migrated);

    // reemplazar keeper en array y quitar dropped
    const dropSet = new Set(dropIds);
    products = products.filter((p) => !dropSet.has(p.id));
    const kIdx = products.findIndex((p) => p.id === keeper.id);
    if (kIdx >= 0) products[kIdx] = keeper;
    else products.push(keeper);

    clearVariantLinks(products, dropIds);
    for (const id of dropIds) {
      if (!deletedProductIds.includes(id)) deletedProductIds.push(id);
    }
    allDroppedIds.push(...dropIds);
    keptTouched.push(keeper);

    merges.push({
      key,
      kept: { id: keeper.id, code: keeper.code, name: keeper.name },
      dropped: dropped.map((d) => ({ id: d.id, code: d.code, name: d.name })),
      stock_before: beforeStock,
      stock_after: Number(keeper.stock) || 0,
      stock_by_warehouse: keeper.stock_by_warehouse,
    });
  }

  if (merges.length === 0) {
    console.log('No hay grupos para fusionar (mismo modelo + tec + pub).');
  } else {
    await writeInventory(
      { products, deletedProductIds, warehouses },
      { syncProductIds: keptTouched.map((p) => p.id) },
    );
    syncCatalog({
      keptProducts: keptTouched,
      droppedIds: allDroppedIds,
      warehouses,
      deletedProductIds,
    });
  }

  console.log('\n=== MERGES ===');
  for (const m of merges) {
    console.log(
      `\n${m.key}\n  KEEP  ${m.kept.code} (${m.kept.id})\n        ${m.kept.name}\n  DROP  ${m.dropped.map((d) => `${d.code} (${d.id})`).join(', ')}\n  STOCK ${m.stock_before.kept} + [${m.stock_before.dropped.map((d) => d.stock).join('+')}] = ${m.stock_before.total} → ${m.stock_after}`,
    );
  }

  if (nearMisses.length) {
    console.log('\n=== NEAR MISSES (mismo modelo+tec, distinto pub — NO fusionados) ===');
    for (const n of nearMisses) {
      console.log(`\n${n.key}`);
      for (const p of n.products) {
        console.log(`  ${p.code} pub=${p.pub} stock=${p.stock} | ${p.name}`);
      }
    }
  }

  // Verificacion IM C2000
  const imc = products.filter(
    (p) =>
      isSeminuevaEquipmentCandidate(p) &&
      normalizeModelKey(p.name) === 'IM C2000',
  );
  const imcCil = products.filter(
    (p) =>
      isSeminuevaEquipmentCandidate(p) &&
      normalizeModelKey(p.name) === 'IM C2000-cil',
  );
  console.log('\n=== VERIFY IM C2000 ===');
  console.log(
    'standard:',
    imc.map((p) => ({ code: p.code, id: p.id, stock: p.stock, tec: tecnicoOf(p), pub: publicOf(p) })),
  );
  console.log(
    'cilindro:',
    imcCil.map((p) => ({ code: p.code, id: p.id, stock: p.stock, tec: tecnicoOf(p), pub: publicOf(p) })),
  );

  console.log(
    '\n' +
      JSON.stringify(
        {
          mergeCount: merges.length,
          merges: merges.map((m) => ({
            key: m.key,
            kept: m.kept,
            dropped: m.dropped,
            stock_before: m.stock_before,
            stock_after: m.stock_after,
          })),
          nearMissCount: nearMisses.length,
          nearMisses,
        },
        null,
        2,
      ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
