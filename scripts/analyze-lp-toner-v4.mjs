import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

import { buildTonerProductTitle, roundSalePriceToNinety } from '../server/lib/toner-products-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const xlsxPath = join(root, 'LP Toner v4.xlsx');
const invPath = join(root, 'server', 'data', 'inventory.json');
const outPath = join(root, 'data', 'analysis-lp-toner-v4.json');

function normKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function parseNum(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  const num = Number(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

function findRicohSupplier(suppliers) {
  return (suppliers ?? []).find((row) => /ricoh/i.test(String(row?.name ?? '')));
}

function findRossSupplier(suppliers) {
  return (suppliers ?? []).find((row) => /ross/i.test(String(row?.name ?? '')));
}

function fillMergedModeloCells(sheet, rows) {
  const merges = sheet['!merges'] ?? [];
  for (const merge of merges) {
    if (merge.s.c !== 0 || merge.e.c !== 0) continue;
    const topValue = String(rows[merge.s.r]?.[0] ?? '').trim();
    if (!topValue) continue;
    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) continue;
      if (!String(row[0] ?? '').trim()) row[0] = topValue;
    }
  }
}

const buffer = readFileSync(xlsxPath);
const workbook = XLSX.read(buffer);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
fillMergedModeloCells(sheet, rows);

/** @type {Array<any>} */
const excelRows = [];
let carryModelo = '';

for (let index = 1; index < rows.length; index += 1) {
  const row = rows[index];
  const modeloCell = String(row[0] ?? '').trim();
  const code = String(row[1] ?? '').trim();
  const descripcion = String(row[3] ?? '').trim();

  if (!code && !descripcion) continue;
  if (/^codigo$/i.test(code) || /^descripcion$/i.test(descripcion)) continue;

  if (!code || !descripcion) {
    carryModelo = modeloCell || carryModelo;
    continue;
  }

  const modelo = modeloCell || carryModelo;
  carryModelo = modeloCell || carryModelo;
  const sugerido = parseNum(row[4]);
  const canal = parseNum(row[7]);
  const expectedTitle = buildTonerProductTitle({
    descripcion,
    rend: row[2],
    modelo,
  });

  excelRows.push({
    rowNum: index + 1,
    modelo,
    code,
    descripcion,
    rend: row[2],
    sugerido,
    tecnico: parseNum(row[5]),
    mayorista: parseNum(row[6]),
    canal,
    ross: Math.round(canal * 1.1 * 100) / 100,
    expectedTitle,
  });
}

/** @type {Map<string, any[]>} */
const byCode = new Map();
/** @type {Map<string, any[]>} */
const byDesc = new Map();
/** @type {Map<string, any[]>} */
const byCodeDesc = new Map();

for (const entry of excelRows) {
  const codeKey = normCode(entry.code);
  const descKey = normKey(entry.descripcion);
  const comboKey = `${codeKey}|${descKey}`;

  if (!byCode.has(codeKey)) byCode.set(codeKey, []);
  byCode.get(codeKey).push(entry);

  if (!byDesc.has(descKey)) byDesc.set(descKey, []);
  byDesc.get(descKey).push(entry);

  if (!byCodeDesc.has(comboKey)) byCodeDesc.set(comboKey, []);
  byCodeDesc.get(comboKey).push(entry);
}

const dupCodes = [...byCode.entries()]
  .filter(([, list]) => list.length > 1)
  .map(([code, list]) => ({
    code,
    count: list.length,
    rows: list.map((row) => ({
      row: row.rowNum,
      descripcion: row.descripcion,
      modelo: row.modelo,
    })),
  }));

const dupDescriptions = [...byDesc.entries()]
  .filter(([, list]) => list.length > 1)
  .map(([descripcion, list]) => ({
    descripcion,
    count: list.length,
    codes: list.map((row) => row.code),
    rows: list.map((row) => row.rowNum),
  }));

const dupExactRows = [...byCodeDesc.entries()]
  .filter(([, list]) => list.length > 1)
  .map(([combo, list]) => ({
    combo,
    count: list.length,
    rows: list.map((row) => row.rowNum),
  }));

const inventoryRaw = JSON.parse(readFileSync(invPath, 'utf8'));
const products = inventoryRaw.products ?? inventoryRaw;

/** @type {Map<string, any>} */
const invByCode = new Map();
for (const product of products) {
  const codeKey = normCode(product.code);
  if (codeKey) invByCode.set(codeKey, product);
}

/** @type {any[]} */
const matched = [];
/** @type {any[]} */
const notInInventory = [];
/** @type {any[]} */
const priceMismatches = [];
/** @type {any[]} */
const titleMismatches = [];
/** @type {any[]} */
const supplierMismatches = [];

for (const entry of excelRows) {
  const product = invByCode.get(normCode(entry.code));
  if (!product) {
    notInInventory.push(entry);
    continue;
  }

  matched.push({ excel: entry, product });

  const invPublic = parseNum(product.prices?.public);
  const sugeridoRounded = roundSalePriceToNinety(entry.sugerido);
  const publicMatchesRaw = Math.abs(invPublic - entry.sugerido) <= 0.01;
  const publicMatchesRounded = Math.abs(invPublic - sugeridoRounded) <= 0.01;

  if (!publicMatchesRaw && !publicMatchesRounded) {
    priceMismatches.push({
      code: entry.code,
      descripcion: entry.descripcion,
      excelSugerido: entry.sugerido,
      excelSugeridoRounded: sugeridoRounded,
      invPublic,
      diff: Math.round((invPublic - entry.sugerido) * 100) / 100,
    });
  }

  const invName = String(product.name ?? '').trim();
  const titleMatches = normKey(invName) === normKey(entry.expectedTitle);

  if (!titleMatches) {
    titleMismatches.push({
      code: entry.code,
      descripcion: entry.descripcion,
      expectedTitle: entry.expectedTitle,
      invName,
    });
  }

  const ricoh = findRicohSupplier(product.suppliers);
  const ross = findRossSupplier(product.suppliers);
  const ricohPrice = parseNum(ricoh?.purchase_price_usd ?? product.purchase_price_usd);
  const rossPrice = parseNum(ross?.purchase_price_usd);

  if (entry.canal > 0 && Math.abs(ricohPrice - entry.canal) > 0.02) {
    supplierMismatches.push({
      code: entry.code,
      type: 'RICOH',
      excelCanal: entry.canal,
      invPurchase: ricohPrice,
      diff: Math.round((ricohPrice - entry.canal) * 100) / 100,
    });
  }

  if (entry.ross > 0) {
    if (!ross) {
      supplierMismatches.push({
        code: entry.code,
        type: 'CORP ROSS ausente',
        excelRoss: entry.ross,
        invPurchase: null,
      });
    } else if (Math.abs(rossPrice - entry.ross) > 0.02) {
      supplierMismatches.push({
        code: entry.code,
        type: 'CORP ROSS',
        excelRoss: entry.ross,
        invPurchase: rossPrice,
        diff: Math.round((rossPrice - entry.ross) * 100) / 100,
      });
    }
  }
}

const excelCodes = new Set(excelRows.map((row) => normCode(row.code)));
const tonerInInvNotInExcel = products
  .filter((product) => /toner|suministro/i.test(String(product.category ?? '')))
  .filter((product) => {
    const codeKey = normCode(product.code);
    return codeKey && !excelCodes.has(codeKey);
  })
  .map((product) => ({
    code: product.code,
    name: product.name,
    category: product.category,
    public: product.prices?.public,
  }));

const report = {
  generatedAt: new Date().toISOString(),
  source: xlsxPath,
  sheet: sheetName,
  summary: {
    excelTotalRows: excelRows.length,
    matchedInInventory: matched.length,
    notInInventory: notInInventory.length,
    duplicateCodes: dupCodes.length,
    duplicateDescriptions: dupDescriptions.length,
    duplicateExactRows: dupExactRows.length,
    priceMismatches: priceMismatches.length,
    titleMismatches: titleMismatches.length,
    supplierMismatches: supplierMismatches.length,
    tonerInInventoryNotInExcel: tonerInInvNotInExcel.length,
  },
  duplicates: {
    codes: dupCodes,
    descriptions: dupDescriptions,
    exactRows: dupExactRows,
  },
  notInInventory: notInInventory.map((row) => ({
    row: row.rowNum,
    code: row.code,
    descripcion: row.descripcion,
    expectedTitle: row.expectedTitle,
    sugerido: row.sugerido,
    canal: row.canal,
    ross: row.ross,
  })),
  priceMismatches,
  titleMismatches,
  supplierMismatches,
  tonerInInventoryNotInExcel: tonerInInvNotInExcel,
};

writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(report.summary, null, 2));
console.log('\n--- DUPLICADOS CÓDIGO ---');
for (const row of dupCodes) console.log(row.code, 'x', row.count, row.rows.map((item) => item.row).join(', '));
console.log('\n--- DUPLICADOS DESCRIPCIÓN (top 15) ---');
for (const row of dupDescriptions.slice(0, 15)) {
  console.log(`[${row.count}x] ${row.descripcion.slice(0, 60)} → códigos: ${row.codes.join(', ')}`);
}
console.log('\n--- NO EN INVENTARIO (primeros 20) ---');
for (const row of notInInventory.slice(0, 20)) {
  console.log(row.code, row.descripcion.slice(0, 50), `Sug:${row.sugerido} Canal:${row.canal}`);
}
console.log('\n--- DESALINEACIÓN PRECIOS (primeros 15) ---');
for (const row of priceMismatches.slice(0, 15)) {
  console.log(row.code, `Excel:${row.excelSugerido} Inv:${row.invPublic} Δ${row.diff}`);
}
console.log('\n--- DESALINEACIÓN PROVEEDORES (primeros 15) ---');
for (const row of supplierMismatches.slice(0, 15)) {
  console.log(row.code, row.type, JSON.stringify(row));
}
console.log(`\nReporte completo: ${outPath}`);
