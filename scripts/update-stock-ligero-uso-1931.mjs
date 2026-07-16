/**
 * Actualiza stock de equipos de ligero uso (seminuevos) según lista SALA 06/07/2026
 * y lo asigna al almacén id `1931`.
 *
 * Uso: node scripts/update-stock-ligero-uso-1931.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { productQualifiesAsSeminuevaEquipment } from '../shared/inventory-product-name.js';
import {
  normalizeWarehouses,
  stockFromTotalForWarehouse,
} from '../server/lib/inventory-warehouses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INVENTORY_PATH = path.join(ROOT, 'server', 'data', 'inventory.json');

const WAREHOUSE_ID = '1931';
const WAREHOUSE_NAME = 'Almacén 1931';

/** Totales de la lista (columna TOTAL). */
const STOCK_ROWS = [
  { key: 'IM 7000', qty: 0 },
  { key: 'MP 7503', qty: 0 },
  { key: 'MP 6055', qty: 0 },
  { key: 'MP 5055', qty: 3 },
  { key: 'MP 4055', qty: 1 },
  { key: 'IM 2500', qty: 1 },
  { key: 'IM C400', qty: 4 },
  { key: 'MP C307', qty: 1 },
  { key: 'IM 550', qty: 7 },
  { key: 'MP 501', qty: 0 },
  { key: 'M 320F', qty: 9 },
  { key: 'SP 5300', qty: 1 },
  { key: 'SP 4520 DN', qty: 2 },
  { key: 'MC 251', qty: 4 },
  { key: 'MP C2504', qty: 0 },
  { key: 'MP C3004', qty: 3 },
  { key: 'M C3000', qty: 2 },
  { key: 'M C3500', qty: 0 },
  { key: 'MP C4504', qty: 0 },
  { key: 'MC 6000', qty: 0 },
  { key: 'PC 840 DN', qty: 3 },
  { key: 'MP 4054', qty: 0 },
  { key: 'IM 430', qty: 3 },
  { key: 'P 502', qty: 1 },
];

function norm(value) {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isEquipmentCandidate(product) {
  const name = product?.name || '';
  if (/Toner|Tambor|Pack|FEED|ROLLER|PCDU|FUSING|FRICTION|FILTER|Compatible|Accesorio|Unidad de imagen Compatible/i.test(name)) {
    return false;
  }
  if (productQualifiesAsSeminuevaEquipment(product)) return true;
  // P 502 seminuevo mal etiquetado como «Nueva» pero categoría Seminuevas
  if (/Impresoras Laser Seminuevas/i.test(product.category || '') && /P\s*502/i.test(name)) {
    return true;
  }
  return false;
}

function matchesKey(product, key) {
  const name = norm(product.name);
  switch (key) {
    case 'IM 7000':
      return /\bIM\s*7000\b/.test(name);
    case 'MP 7503':
      return /\bMP\s*7503\b/.test(name);
    case 'MP 6055':
      return /\bMP\s*6055\b/.test(name);
    case 'MP 5055':
      return /\bMP\s*5055\b/.test(name);
    case 'MP 4055':
      return /\bMP\s*4055\b/.test(name);
    case 'IM 2500':
      // Preferir IM 2500 B/N, no IM C2500
      return /\bIM\s*2500\b/.test(name) && !/\bIM\s*C\s*2500\b/.test(name);
    case 'IM C400':
      return /\bIM\s*C\s*400F?\b/.test(name);
    case 'MP C307':
      return /\bMP\s*C\s*307\b/.test(name);
    case 'IM 550':
      return /\bIM\s*550F?\b/.test(name) && !/\bIM\s*5500\b/.test(name);
    case 'MP 501':
      return /\bMP\s*501\b/.test(name);
    case 'M 320F':
      return /\bM\s*320F\b/.test(name);
    case 'SP 5300':
      return /\bSP\s*5300/.test(name);
    case 'SP 4520 DN':
      return /\bSP\s*4520/.test(name);
    case 'MC 251':
      return /\bM\s*C\s*251/.test(name) || /\bMC\s*251\b/.test(name);
    case 'MP C2504':
      return /\bMP\s*C\s*2504\b/.test(name) && !/\bEX\b/.test(name);
    case 'MP C3004':
      return /\bMP\s*C\s*3004\b/.test(name) && !/\bEX\b/.test(name);
    case 'M C3000':
      return /\bIM\s*C\s*3000\b/.test(name) || /\bM\s*C\s*3000\b/.test(name);
    case 'M C3500':
      return /\bIM\s*C\s*3500\b/.test(name) || /\bM\s*C\s*3500\b/.test(name);
    case 'MP C4504':
      return /\bMP\s*C\s*4504\b/.test(name) && !/\bEX\b/.test(name);
    case 'MC 6000':
      return /\bIM\s*C\s*6000\b/.test(name) || /\bMC\s*6000\b/.test(name);
    case 'PC 840 DN':
      return /\bSP\s*C\s*840/.test(name) || /\bPC\s*840/.test(name);
    case 'MP 4054':
      return /\bMP\s*4054\b/.test(name);
    case 'IM 430':
      return /\bIM\s*430F?\b/.test(name);
    case 'P 502':
      return /\bP\s*502\b/.test(name) && !/\bIM\s*430/.test(name);
    default:
      return false;
  }
}

function scorePrimary(product, key) {
  const name = norm(product.name);
  let score = Number(product.stock) || 0;
  if (/COLOR SEMINUEVA/.test(name) || /B\/N SEMINUEVA/.test(name)) score += 100;
  if (/SEMINUEVA/.test(name)) score += 20;
  if (/\b110V\b/.test(name)) score -= 5;
  if (/\b220V\b/.test(name)) score -= 3;
  if (/\bEX\b/.test(name)) score -= 50;
  if (key === 'IM C400' && /120V/.test(name)) score += 30;
  if (key === 'IM 550' && /C\/L\.P/.test(name)) score += 40;
  if (key === 'IM 550' && /CILINDRO/.test(name)) score -= 20;
  if (key === 'P 502' && /SEMINUEVAS/i.test(product.category || '')) score += 80;
  if (key === 'P 502' && /NUEVA/.test(name) && !/SEMINUEVAS/i.test(product.category || '')) {
    score -= 100;
  }
  return score;
}

function pickPrimary(matches, key) {
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => scorePrimary(b, key) - scorePrimary(a, key))[0];
}

function applyStock(product, qty, warehouses) {
  const patch = stockFromTotalForWarehouse(qty, WAREHOUSE_ID, warehouses);
  product.stock = patch.stock;
  product.stock_by_warehouse = patch.stock_by_warehouse;
}

function main() {
  const raw = fs.readFileSync(INVENTORY_PATH, 'utf8');
  const data = JSON.parse(raw);

  const warehouses = normalizeWarehouses(data.warehouses);
  if (!warehouses.some((w) => w.id === WAREHOUSE_ID)) {
    warehouses.push({
      id: WAREHOUSE_ID,
      name: WAREHOUSE_NAME,
      delivery_time: 'Inmediata',
    });
  }
  data.warehouses = warehouses;

  const candidates = (data.products ?? []).filter(isEquipmentCandidate);
  const report = [];
  let updated = 0;
  let zeroedDupes = 0;

  for (const row of STOCK_ROWS) {
    const matches = candidates.filter((p) => matchesKey(p, row.key));
    const primary = pickPrimary(matches, row.key);

    if (!primary) {
      report.push({ action: 'MISS', key: row.key, qty: row.qty });
      continue;
    }

    const before = primary.stock;
    applyStock(primary, row.qty, warehouses);
    updated += 1;
    report.push({
      action: 'UPDATE',
      key: row.key,
      qty: row.qty,
      before,
      after: primary.stock,
      id: primary.id,
      name: primary.name,
      warehouse: WAREHOUSE_ID,
    });

    for (const dup of matches) {
      if (dup.id === primary.id) continue;
      const beforeDup = dup.stock;
      applyStock(dup, 0, warehouses);
      zeroedDupes += 1;
      report.push({
        action: 'ZERO_DUPE',
        key: row.key,
        before: beforeDup,
        after: 0,
        id: dup.id,
        name: dup.name,
      });
    }
  }

  const expectedTotal = STOCK_ROWS.reduce((sum, row) => sum + row.qty, 0);
  const appliedTotal = report
    .filter((row) => row.action === 'UPDATE')
    .reduce((sum, row) => sum + row.qty, 0);

  const backup = `${INVENTORY_PATH}.bak-ligero-uso-1931-${Date.now()}`;
  fs.writeFileSync(backup, raw);
  fs.writeFileSync(INVENTORY_PATH, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        backup,
        warehouse: { id: WAREHOUSE_ID, name: WAREHOUSE_NAME },
        updated,
        zeroedDupes,
        expectedTotal,
        appliedTotal,
        miss: report.filter((r) => r.action === 'MISS'),
        updates: report.filter((r) => r.action === 'UPDATE'),
        dupes: report.filter((r) => r.action === 'ZERO_DUPE'),
      },
      null,
      2,
    ),
  );
}

main();
