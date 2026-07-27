import XLSX from 'xlsx';

import { TONER_COLOR_CODE_LABELS } from '../../shared/inventory-product-name.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import {
  applyCmykModeloGroups,
  buildLpTonerWebDescription,
  buildLpTonerWebProductName,
  classifyLpTonerCategory,
  detectTonerColorCode,
  fillMergedModeloCells,
  isPrintCartridgeDescription,
  mapLpTonerWebRow,
} from './lp-toner-web-excel.js';
import {
  roundSalePriceToNinety,
  SUPPLIER_CORP_ROSS,
  SUPPLIER_RICOH_PERU,
  tonerProductIdFromCode,
} from './toner-products-excel.js';

export const CATEGORY_TONER_ORIGINALES = 'Toner Originales';
export const CATEGORY_SUMINISTROS = 'Suministros';
const MIN_PRICE_GAP_USD = 10;

/**
 * @param {unknown} value
 */
export function formatListProductCode(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return String(value).trim();
}

/**
 * @param {{ public?: number; tecnico?: number; mayorista?: number; distribuidor?: number }} prices
 * @param {number} purchasePrice
 * @param {{ previousPublic?: number }} [options]
 */
export function applyLpTonerV4PriceFloors(prices, purchasePrice, options = {}) {
  const buy = Math.max(0, Number(purchasePrice) || 0);
  const previousPublic = Math.max(0, Number(options.previousPublic) || 0);

  let tecnico = roundSalePriceToNinety(Number(prices?.tecnico) || 0);
  let mayorista = roundSalePriceToNinety(Number(prices?.mayorista) || 0);
  let distribuidor = roundSalePriceToNinety(
    Number(prices?.distribuidor) || Number(prices?.tecnico) || 0,
  );
  let publicPrice = roundSalePriceToNinety(Number(prices?.public) || 0);

  if (previousPublic > publicPrice) {
    publicPrice = roundSalePriceToNinety(previousPublic);
  }

  if (buy > 0 && tecnico < buy + MIN_PRICE_GAP_USD) {
    tecnico = roundSalePriceToNinety(buy + MIN_PRICE_GAP_USD);
  }

  if (tecnico > 0 && publicPrice < tecnico + MIN_PRICE_GAP_USD) {
    publicPrice = roundSalePriceToNinety(tecnico + MIN_PRICE_GAP_USD);
  }

  if (distribuidor <= 0) distribuidor = tecnico;

  return {
    public: publicPrice,
    tecnico,
    mayorista,
    distribuidor,
  };
}

/**
 * @param {unknown} value
 */
function parseNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  const text = String(value ?? '')
    .trim()
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, '');
  if (!text || text === '-' || text === '—') return 0;
  const num = Number(text);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * @param {unknown} value
 */
function cellText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} value
 */
function normCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

/**
 * Extrae token de modelo desde descripción cuando la columna A está vacía.
 * @param {string} descripcion
 */
export function extractEquipmentModelFromDescription(descripcion) {
  const desc = cellText(descripcion);
  if (!desc) return '';

  const typeMatch = desc.match(/\bType\s+(C\d{3,4}[A-Z]?)\b/i);
  if (typeMatch) return typeMatch[1].toUpperCase();

  const trailingMatch = desc.match(/\b(C\d{3,4}[A-Z]?)\b/i);
  if (trailingMatch) return trailingMatch[1].toUpperCase();

  return '';
}

/**
 * @param {{ modelo?: string; descripcion?: string }} entry
 */
function resolveEntryModelo(entry) {
  const fromColumn = cellText(entry.modelo);
  if (fromColumn) return fromColumn;
  return extractEquipmentModelFromDescription(entry.descripcion ?? '');
}

/**
 * Une filas con el mismo código: conserva la primera y concatena modelos con «/».
 * @param {import('./lp-toner-web-excel.js').LpTonerWebEntry[]} entries
 */
export function consolidateDuplicateCodeEntries(entries) {
  /** @type {Map<string, import('./lp-toner-web-excel.js').LpTonerWebEntry[]>} */
  const byCode = new Map();

  for (const entry of entries) {
    const key = normCode(entry.code);
    if (!byCode.has(key)) byCode.set(key, []);
    byCode.get(key).push(entry);
  }

  /** @type {import('./lp-toner-web-excel.js').LpTonerWebEntry[]} */
  const consolidated = [];

  for (const group of byCode.values()) {
    if (group.length === 1) {
      const [single] = group;
      consolidated.push({
        ...single,
        modelo: resolveEntryModelo(single),
      });
      continue;
    }

    const [first, ...rest] = group;
    /** @type {string[]} */
    const modelos = [];
    const seen = new Set();

    for (const row of group) {
      const modelo =
        extractEquipmentModelFromDescription(row.descripcion) || cellText(row.modelo);
      if (!modelo) continue;
      const key = modelo.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      modelos.push(modelo);
    }

    consolidated.push({
      ...first,
      modelo: modelos.join('/'),
      observacion: [
        cellText(first.observacion),
        rest.length
          ? `Modelos adicionales en lista LP: ${rest.map((row) => cellText(row.descripcion)).filter(Boolean).join('; ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  return consolidated;
}

/**
 * @param {number} canal
 */
export function buildLpTonerV4Suppliers(canal) {
  const canalPrice = parseNumber(canal);
  if (canalPrice <= 0) return [];

  return [
    { name: SUPPLIER_RICOH_PERU, purchase_price_usd: canalPrice },
    {
      name: SUPPLIER_CORP_ROSS,
      purchase_price_usd: Math.round(canalPrice * 1.1 * 100) / 100,
    },
  ];
}

/**
 * @param {import('./lp-toner-web-excel.js').LpTonerWebEntry} entry
 */
export function mapLpTonerV4EntryToProduct(entry) {
  const inventoryCategory =
    classifyLpTonerCategory(entry.descripcion) === CATEGORY_SUMINISTROS
      ? CATEGORY_SUMINISTROS
      : CATEGORY_TONER_ORIGINALES;
  const modelo = cellText(entry.modelo);
  const listCode = formatListProductCode(entry.code);
  const name = buildLpTonerWebProductName({
    descripcion: entry.descripcion,
    modelo,
    rend: entry.rend,
  });
  const description = buildLpTonerWebDescription({
    descripcion: entry.descripcion,
    modelo,
    rend: entry.rend,
    observacion: entry.observacion,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelo) {
    attributes.push({ name: 'Modelo de equipo', value: modelo });
  }
  const rendLabel = formatRendLabel(entry.rend);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }
  if (entry.colorCode) {
    const colorValue = TONER_COLOR_CODE_LABELS[entry.colorCode] ?? 'Amarillo';
    attributes.push({ name: 'Color', value: colorValue });
  }
  if (cellText(entry.observacion)) {
    attributes.push({ name: 'Observaciones', value: cellText(entry.observacion) });
  }

  const canalPrice = parseNumber(entry.canal);
  const suppliers = buildLpTonerV4Suppliers(canalPrice);
  const sugerido = parseNumber(entry.publico);
  const prices = applyLpTonerV4PriceFloors(
    {
      public: roundSalePriceToNinety(sugerido),
      tecnico: roundSalePriceToNinety(parseNumber(entry.tecnico)),
      mayorista: roundSalePriceToNinety(parseNumber(entry.mayorista)),
      distribuidor: roundSalePriceToNinety(parseNumber(entry.tecnico)),
    },
    canalPrice,
  );

  const isTonerLike =
    inventoryCategory === CATEGORY_TONER_ORIGINALES ||
    isPrintCartridgeDescription(entry.descripcion);

  return {
    id: tonerProductIdFromCode(listCode),
    code: listCode,
    name,
    description,
    brand: isTonerLike || inventoryCategory === CATEGORY_SUMINISTROS ? 'Ricoh' : null,
    category: inventoryCategory,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices,
    purchase_price_usd: canalPrice > 0 ? canalPrice : 0,
    attributes: normalizeAttributes(attributes),
    suppliers,
  };
}

/**
 * @param {Buffer} buffer
 */
export function parseLpTonerV4Workbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { products: [], skipped: [], duplicateCodesMerged: [] };

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });
  fillMergedModeloCells(sheet, rows);

  /** @type {import('./lp-toner-web-excel.js').LpTonerWebEntry[]} */
  const entries = [];
  /** @type {Array<{ row: number; reason: string; detail?: string }>} */
  const skipped = [];
  let carryModelo = '';

  for (let index = 0; index < rows.length; index += 1) {
    const { entry, carryModelo: nextModelo, skipReason } = mapLpTonerWebRow(
      rows[index],
      index,
      carryModelo,
    );
    carryModelo = nextModelo;
    if (entry) {
      entries.push(entry);
      continue;
    }
    if (skipReason && skipReason !== 'fila vacía') {
      skipped.push({ row: index + 1, reason: skipReason });
    }
  }

  const rawCountByCode = new Map();
  for (const entry of entries) {
    const key = normCode(entry.code);
    rawCountByCode.set(key, (rawCountByCode.get(key) ?? 0) + 1);
  }

  const consolidated = consolidateDuplicateCodeEntries(entries);
  const duplicateModelosByCode = new Map(
    consolidated
      .filter((entry) => (rawCountByCode.get(normCode(entry.code)) ?? 0) > 1)
      .map((entry) => [normCode(entry.code), entry.modelo]),
  );
  const duplicateCodesMerged = consolidated
    .filter((entry) => (rawCountByCode.get(normCode(entry.code)) ?? 0) > 1)
    .map((entry) => ({
      code: entry.code,
      modelo: entry.modelo,
      name: buildLpTonerWebProductName({
        descripcion: entry.descripcion,
        modelo: entry.modelo,
        rend: entry.rend,
      }),
    }));

  const grouped = applyCmykModeloGroups(consolidated).map((entry) => {
    const lockedModelo = duplicateModelosByCode.get(normCode(entry.code));
    if (!lockedModelo) return entry;
    return { ...entry, modelo: lockedModelo };
  });

  /** @type {Array<{ code: string; modelo: string; descripcion: string }>} */
  const concatenatedModels = grouped
    .filter((entry) => cellText(entry.modelo).includes('/'))
    .map((entry) => ({
      code: formatListProductCode(entry.code),
      modelo: cellText(entry.modelo),
      descripcion: cellText(entry.descripcion),
    }));

  const products = grouped.map((entry) => mapLpTonerV4EntryToProduct(entry));

  return { products, skipped, duplicateCodesMerged, concatenatedModels };
}
