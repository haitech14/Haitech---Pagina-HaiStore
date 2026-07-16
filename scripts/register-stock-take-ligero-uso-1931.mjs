/**
 * Registra en el módulo Inventario la toma:
 * STOCK EQUIPOS DE LIGERO USO AL 06/07/2026 → Almacén 1931
 *
 * No vuelve a cambiar stock; solo escribe el registro en inventory-stock-takes.json
 * (misma forma que apply-stock-take-1931.mjs para equipos nuevos).
 *
 * Uso: node scripts/register-stock-take-ligero-uso-1931.mjs
 */
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { productQualifiesAsSeminuevaEquipment } from '../shared/inventory-product-name.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'server', 'data');
const INVENTORY_PATH = path.join(DATA_DIR, 'inventory.json');
const TAKES_PATH = path.join(DATA_DIR, 'inventory-stock-takes.json');

const WAREHOUSE_ID = '1931';
const WAREHOUSE_NAME = 'Almacén 1931';

/** Mismos totales / matching que update-stock-ligero-uso-1931.mjs */
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

function warehouseQty(product, warehouseId) {
  const rows = Array.isArray(product.stock_by_warehouse) ? product.stock_by_warehouse : [];
  const row = rows.find((entry) => entry.warehouse_id === warehouseId);
  if (row) return Math.max(0, Math.floor(Number(row.quantity) || 0));
  return Math.max(0, Math.floor(Number(product.stock) || 0));
}

/** Usa el backup más antiguo (= estado previo al primer apply de la lista). */
function previousBackupPath() {
  const files = readdirSync(DATA_DIR)
    .filter((name) => name.startsWith('inventory.json.bak-ligero-uso-1931-'))
    .sort();
  return files.length > 0 ? path.join(DATA_DIR, files[0]) : null;
}

function appendStockTakeRecord(record) {
  mkdirSync(DATA_DIR, { recursive: true });
  let payload = { version: 1, takes: [] };
  if (existsSync(TAKES_PATH)) {
    try {
      payload = JSON.parse(readFileSync(TAKES_PATH, 'utf8'));
      if (!Array.isArray(payload.takes)) payload.takes = [];
    } catch {
      payload = { version: 1, takes: [] };
    }
  }

  // Evitar duplicar el mismo título/fecha si se re-ejecuta
  payload.takes = payload.takes.filter(
    (take) =>
      !(
        take?.title === record.title &&
        take?.warehouseId === record.warehouseId &&
        take?.takenAt === record.takenAt
      ),
  );
  payload.takes.unshift(record);
  writeFileSync(TAKES_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return TAKES_PATH;
}

function main() {
  const current = JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));
  const backupPath = previousBackupPath();
  const previousById = new Map();
  if (backupPath) {
    const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
    for (const product of backup.products ?? []) {
      previousById.set(product.id, product);
    }
  }

  const candidates = (current.products ?? []).filter(isEquipmentCandidate);
  const lines = [];
  const missing = [];

  for (const row of STOCK_ROWS) {
    const matches = candidates.filter((product) => matchesKey(product, row.key));
    const primary = pickPrimary(matches, row.key);
    if (!primary) {
      missing.push(row.key);
      continue;
    }

    const prevProduct = previousById.get(primary.id);
    const previousStock = prevProduct
      ? Math.max(0, Math.floor(Number(prevProduct.stock) || 0))
      : Math.max(0, Math.floor(Number(primary.stock) || 0));
    const newStock = warehouseQty(primary, WAREHOUSE_ID);

    lines.push({
      productId: primary.id,
      name: primary.name,
      code: primary.code ?? null,
      previousStock,
      newStock,
      delta: newStock - previousStock,
      warehouseId: WAREHOUSE_ID,
      warehouseName: WAREHOUSE_NAME,
      listKey: row.key,
    });
  }

  const takeRecord = {
    id: randomUUID(),
    type: 'stock_take',
    title: 'STOCK EQUIPOS DE LIGERO USO AL 06/07/2026',
    source: 'Lista física — totales SALA (INV. Feli)',
    warehouseId: WAREHOUSE_ID,
    warehouseName: WAREHOUSE_NAME,
    takenAt: '2026-07-06',
    createdAt: new Date().toISOString(),
    grandTotal: lines.reduce((sum, line) => sum + line.newStock, 0),
    lines,
    missingKeys: missing,
    notes:
      'Toma de inventario de equipos seminuevos / ligero uso. Stock consolidado en Almacén 1931 (Av. Petit Thouars 1931).',
  };

  const takePath = appendStockTakeRecord(takeRecord);

  console.log(
    JSON.stringify(
      {
        takeId: takeRecord.id,
        takePath,
        title: takeRecord.title,
        warehouse: WAREHOUSE_NAME,
        lines: lines.length,
        grandTotal: takeRecord.grandTotal,
        missing,
        sample: lines.slice(0, 6).map((line) => ({
          key: line.listKey,
          name: line.name,
          previous: line.previousStock,
          next: line.newStock,
          delta: line.delta,
        })),
      },
      null,
      2,
    ),
  );
}

main();
