import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

import { normalizeAttributes } from '../server/lib/inventory-attributes.js';
import {
  ensureProductSortOrders,
  migrateInventoryProduct,
  normalizeProductInput,
  readInventory,
  writeInventory,
} from '../server/lib/inventory-store.js';
import { ensureFullPrices } from '../server/lib/roles.js';
import { SUPPLIER_RICOH_PERU } from '../server/lib/toner-products-excel.js';
import { deriveProductSlug } from '../shared/product-slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const CATEGORY = 'Toner, Toner Originales';
const COMPATIBILIDAD_ATTR = 'Compatibilidad';
const MODELO_EQUIPO_ATTR = 'Modelo de equipo';
const RENDIMIENTO_ATTR = 'Rendimiento (5%)';

/** Lista Ricoh: público = corporativo; técnico = distribuidor. */
const TONER_ROWS = [
  {
    code: '841332',
    description: 'TONER 6110D AFICIO 1060/1075/MP7500',
    modelo: 'MP 5500/6000/6001/6002/6500/6503/7000/7001/7500/7502/7503/8000/8001/9001/9002/9003/IM 7000/8000/9000',
    yieldPages: 43000,
    publicUsd: 85,
    tecnicoUsd: 77.27,
    mayoristaUsd: 72.9,
    compraUsd: 61.32,
  },
  {
    code: '842141',
    description: 'Print Cartridge BK MP 305',
    modelo: 'MP 305',
    yieldPages: 9000,
    publicUsd: 46,
    tecnicoUsd: 41.82,
    mayoristaUsd: 39.45,
    compraUsd: 33.98,
  },
  {
    code: '419078',
    description: 'PRINT CARTRIDGE IM 430',
    modelo: 'IM 430 / P502',
    yieldPages: 14500,
    publicUsd: 66,
    tecnicoUsd: 60,
    mayoristaUsd: 56.6,
    compraUsd: 47.9,
  },
  {
    code: '842616',
    description: 'Print Cartridge IM 460H',
    modelo: 'IM 460F',
    yieldPages: 22000,
    publicUsd: 65,
    tecnicoUsd: 59.09,
    mayoristaUsd: 55.75,
    compraUsd: 42.85,
  },
  {
    code: '418477',
    description: 'Print Cartridge IM-600F',
    modelo: 'IM 550F / IM 600F / P800 / P801',
    yieldPages: 25500,
    publicUsd: 150,
    tecnicoUsd: 135,
    mayoristaUsd: 127.36,
    compraUsd: 111.08,
  },
  {
    code: '418480',
    description: 'PRINT CARTRIDGE IM-600H',
    modelo: 'IM 600F',
    yieldPages: 40000,
    publicUsd: 220,
    tecnicoUsd: 200,
    mayoristaUsd: 188.68,
    compraUsd: 149.48,
  },
  {
    code: '25B3492',
    description: 'Print Cartridge Black M 400',
    modelo: 'M-400-FW',
    yieldPages: 20000,
    publicUsd: 195,
    tecnicoUsd: 177.27,
    mayoristaUsd: 167.24,
    compraUsd: 143.69,
  },
  {
    code: '25B3494',
    description: 'Drum Unit M 400',
    modelo: 'M-400-FW',
    yieldPages: 30000,
    publicUsd: 85,
    tecnicoUsd: 77.27,
    mayoristaUsd: 72.9,
    compraUsd: 40.65,
    tipo: 'Unidad de imagen',
  },
  {
    code: '40S0165',
    description: 'Print Cartridge Black M 440',
    modelo: 'M-440F',
    yieldPages: 41000,
    publicUsd: 185,
    tecnicoUsd: 168.18,
    mayoristaUsd: 158.66,
    compraUsd: 133.11,
  },
  {
    code: '40S0166',
    description: 'Drum Unit M 440',
    modelo: 'M-440F',
    yieldPages: 75000,
    publicUsd: 115,
    tecnicoUsd: 104.55,
    mayoristaUsd: 98.63,
    compraUsd: 69.26,
    tipo: 'Unidad de imagen',
  },
  {
    code: '842124',
    description: 'PRINT CARTRIDGE MP 3554 SP',
    modelo: 'MP 2554/2555/3054/3055/3554/3555/IM 2500/3000',
    yieldPages: 24000,
    publicUsd: 88.96,
    tecnicoUsd: 80.87,
    mayoristaUsd: 76.3,
    compraUsd: 66.19,
  },
  {
    code: '407823',
    description: 'BK PRINT CARTRIDGE MP 501 / MP 601',
    modelo: 'MP 501 / MP 601 / 5300 / 5310',
    yieldPages: 20000,
    publicUsd: 160,
    tecnicoUsd: 130,
    mayoristaUsd: 122.64,
    compraUsd: 120.71,
    specialCompraUsd: 106.2,
  },
  {
    code: '842126',
    description: 'Print Cartridge MP 6054',
    modelo: 'MP 4054/4055/5054/5055/6054/6055/IM 4000/5000/6000',
    yieldPages: 37000,
    publicUsd: 99,
    tecnicoUsd: 90,
    mayoristaUsd: 84.91,
    compraUsd: 73.88,
  },
  {
    code: '842831',
    description: 'Print Cartridge BK IM 3510',
    modelo: 'IM 2510 / IM 3510',
    yieldPages: 30100,
    publicUsd: 85,
    tecnicoUsd: 77.27,
    mayoristaUsd: 72.9,
    compraUsd: 58.35,
  },
  {
    code: '842832',
    description: 'PRINT CARTRIDGE IM 6010',
    modelo: 'IM 4510 / IM 6010 / IM 7010',
    yieldPages: 42900,
    publicUsd: 110,
    tecnicoUsd: 100,
    mayoristaUsd: 94.34,
    compraUsd: 77.53,
  },
  {
    code: '408284',
    description: 'PRINT CARTRIDGE SP 3710',
    modelo: 'SP-3710SF / SP-3710DN / M 320F / P-311 220V',
    yieldPages: 5600,
    publicUsd: 99,
    tecnicoUsd: 90,
    mayoristaUsd: 84.91,
    compraUsd: 73.97,
  },
  {
    code: '828553',
    description: 'PRO TONER 8300s',
    modelo: 'PRO 8300/8310/8320',
    yieldPages: 82000,
    publicUsd: 110,
    tecnicoUsd: 100,
    mayoristaUsd: 94.34,
    compraUsd: 78.38,
  },
  {
    code: '828711',
    description: 'PRO TONER 8400S',
    modelo: 'PRO 8400/8410/8420',
    yieldPages: 82000,
    publicUsd: 110,
    tecnicoUsd: 100,
    mayoristaUsd: 94.34,
    compraUsd: 78.41,
  },
  {
    code: '888029',
    description: 'RICOH BLACK TONER TYPE 1160W',
    modelo: 'MP W2400 / W3600 / W3601 / W6700',
    yieldPages: 1430,
    publicUsd: 225,
    tecnicoUsd: 204.55,
    mayoristaUsd: 192.97,
    compraUsd: 165.64,
  },
];

function formatYieldPages(pages) {
  return Number(pages).toLocaleString('en-US');
}

function formatBaseName(description, tipo) {
  let trimmed = String(description ?? '').trim();
  if (tipo === 'Unidad de imagen') {
    return trimmed.replace(/^Drum Unit\b/i, 'Drum Unit Original RICOH');
  }

  trimmed = trimmed
    .replace(/\bPRINT\s*CARTRIDGE\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  trimmed = trimmed.replace(/^(BK|BLACK|CY|CYAN|MG|MAGENTA|YW|YELLOW)\s+/i, '').trim();
  trimmed = trimmed.replace(/^TONER\s+/i, '').trim();
  trimmed = trimmed.replace(/^RICOH\s+/i, '').trim();
  return `Toner Cartucho Original RICOH ${trimmed}`.replace(/\s{2,}/g, ' ').trim();
}

function buildTitledDescription(row) {
  const base = formatBaseName(row.description, row.tipo);
  const yieldLabel = formatYieldPages(row.yieldPages);
  return `${base} - ${row.modelo} - (${yieldLabel} págs)`;
}

function upsertAttribute(list, name, value) {
  const next = [...list];
  const index = next.findIndex(
    (attr) => String(attr.name ?? '').trim().toLowerCase() === name.toLowerCase(),
  );
  if (index === -1) {
    next.push({ id: randomUUID(), name, value });
    return next;
  }
  next[index] = { ...next[index], name, value };
  return next;
}

function buildAttributes(row, existing = []) {
  let attributes = normalizeAttributes(existing);
  attributes = upsertAttribute(attributes, COMPATIBILIDAD_ATTR, row.modelo);
  attributes = upsertAttribute(attributes, MODELO_EQUIPO_ATTR, row.modelo);
  attributes = upsertAttribute(attributes, RENDIMIENTO_ATTR, `${formatYieldPages(row.yieldPages)} págs`);
  attributes = upsertAttribute(attributes, 'Color', 'Negro');
  attributes = upsertAttribute(attributes, 'Tipo', row.tipo ?? 'Tóner');
  return attributes;
}

function buildPrices(row) {
  return ensureFullPrices({
    public: row.publicUsd,
    tecnico: row.tecnicoUsd,
    mayorista: row.mayoristaUsd,
    distribuidor: row.tecnicoUsd,
  });
}

function syncRicohSupplier(existingSuppliers, compraUsd) {
  const list = Array.isArray(existingSuppliers) ? [...existingSuppliers] : [];
  const ricohIndex = list.findIndex((row) =>
    String(row.name ?? '').toLowerCase().includes('ricoh'),
  );
  if (ricohIndex >= 0) {
    list[ricohIndex] = {
      ...list[ricohIndex],
      purchase_price_usd: compraUsd,
    };
    return list;
  }
  if (list.length > 0) {
    list[0] = { ...list[0], purchase_price_usd: compraUsd };
    return list;
  }
  return [{ id: randomUUID(), name: SUPPLIER_RICOH_PERU, purchase_price_usd: compraUsd }];
}

function findExistingProduct(products, code) {
  const wanted = String(code).trim().toUpperCase();
  return (
    products.find((row) => String(row.code ?? '').trim().toUpperCase() === wanted) ??
    products.find((row) => String(row.id ?? '').trim().toUpperCase() === wanted)
  );
}

function syncCatalogJson(productsById) {
  const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const byId = new Map((catalog.products ?? []).map((row) => [String(row.id), row]));
  for (const product of productsById) {
    const existing =
      byId.get(String(product.id)) ??
      [...byId.values()].find(
        (row) => String(row.code ?? '').trim().toUpperCase() === String(product.code).trim().toUpperCase(),
      );
    const id = String(existing?.id ?? product.id);
    if (existing && existing.id !== product.id) {
      byId.delete(String(existing.id));
    }
    byId.set(id, {
      ...(existing ?? {}),
      ...product,
      id,
    });
  }
  catalog.products = [...byId.values()];
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

async function main() {
  const inventory = await readInventory();
  const warehouses = inventory.warehouses;
  const byId = new Map(inventory.products.map((row) => [String(row.id), row]));
  const saved = [];

  for (const row of TONER_ROWS) {
    const title = buildTitledDescription(row);
    const prev = findExistingProduct([...byId.values()], row.code);
    const suppliers = syncRicohSupplier(prev?.suppliers, row.compraUsd);
    const payload = {
      id: prev?.id ?? row.code,
      code: row.code,
      slug: prev?.slug ?? deriveProductSlug({ id: prev?.id ?? row.code, name: title }),
      name: title,
      description: title,
      brand: 'Ricoh',
      category: CATEGORY,
      currency: 'USD',
      status: 'activa',
      prices: buildPrices(row),
      purchase_price_usd: row.compraUsd,
      special_purchase_price_usd: row.specialCompraUsd ?? 0,
      suppliers,
      attributes: buildAttributes(row, prev?.attributes),
      stock: prev?.stock ?? 0,
      stock_by_warehouse: prev?.stock_by_warehouse,
      image_url: prev?.image_url ?? null,
      gallery: prev?.gallery ?? [],
      attachments: prev?.attachments ?? [],
      created_at: prev?.created_at,
      sort_order: prev?.sort_order,
      view_count: prev?.view_count,
    };

    const merged = migrateInventoryProduct(
      normalizeProductInput(payload, prev ?? undefined, warehouses),
      warehouses,
    );

    if (prev && prev.id !== merged.id) {
      byId.delete(String(prev.id));
    }
    byId.set(String(merged.id), merged);
    saved.push({ product: merged, created: !prev });
    console.log(
      `${prev ? '↻' : '+'} ${merged.code}  ${merged.name}  compra=${merged.purchase_price_usd}` +
        (merged.special_purchase_price_usd > 0
          ? `  especial=${merged.special_purchase_price_usd}`
          : ''),
    );
  }

  const { products: sorted } = ensureProductSortOrders([...byId.values()]);
  const syncProductIds = saved.map((row) => row.product.id);

  await writeInventory(
    {
      products: sorted,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses,
    },
    { syncProductIds },
  );

  const persisted = sorted.filter((row) => syncProductIds.includes(row.id));
  syncCatalogJson(persisted);

  const created = saved.filter((row) => row.created).length;
  const updated = saved.length - created;
  console.log(`\nListo: ${created} creados, ${updated} actualizados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
