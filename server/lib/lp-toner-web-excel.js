import XLSX from 'xlsx';

import {
  normalizeTonerCartridgeProductLabel,
  normalizeTonerColorProductName,
  TONER_COLOR_CODE_LABELS,
} from '../../shared/inventory-product-name.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import {
  applyMarginSalePriceBump,
  setPrimarySupplier,
  SUPPLIER_RICOH_DEL_PERU,
} from './lp-price-bump.js';
import {
  classifyTonerInventoryCategory,
  roundSalePriceToNinety,
  tonerProductIdFromCode,
} from './toner-products-excel.js';

export {
  roundSalePriceToNinety,
  SUPPLIER_RICOH_DEL_PERU as SUPPLIER_RICOH_PERU,
  tonerProductIdFromCode,
};

export const MODELO_SEPARATOR = ' / ';

const COLOR_TOKEN_PATTERN =
  /\b(BLACK|YELLOW|MAGENTA|CYAN|BK|CY|MG|YW|YL|WY)\b/i;
const PRINT_CARTRIDGE_PATTERN =
  /\bPRINT\s*CARTRIDGE\b|\bPRINT\s*CART\b|\bPRINT\s*CRTRDGE\b/i;
const HEADER_CODE_PATTERN = /^codigo$/i;
const SUMINISTROS_EXTRA_PATTERN =
  /\b(DRUM\s*UNIT|WASTE\s*TONER|FUSING\s*UNIT|TRANSFER|MAINTENANCE\s*UNIT|INK\s*COLLECTION|STAPLE|GRAPA|FOIL|CLEANING|PRE-?TREATMENT|HEAT\s*PRESS|GREASE|FILTER|APPLICATOR|WIPES|GARMENT\s*INK|HEAD\s*UNIT|HEAD:\s*UNIT)\b/i;

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
 * @param {string} description
 */
export function classifyLpTonerCategory(description) {
  if (SUMINISTROS_EXTRA_PATTERN.test(description)) {
    return 'Suministros';
  }
  return classifyTonerInventoryCategory(description);
}

/**
 * @param {string} description
 * @returns {string | null}
 */
export function detectTonerColorCode(description) {
  const match = String(description ?? '').match(COLOR_TOKEN_PATTERN);
  if (!match) return null;
  const raw = match[1].toUpperCase();
  if (raw === 'YL' || raw === 'WY') return 'YW';
  if (raw === 'BLACK') return 'BK';
  if (raw === 'CYAN') return 'CY';
  if (raw === 'MAGENTA') return 'MG';
  if (raw === 'YELLOW') return 'YW';
  return raw;
}

/**
 * @param {string} description
 */
export function isPrintCartridgeDescription(description) {
  return PRINT_CARTRIDGE_PATTERN.test(String(description ?? ''));
}

/**
 * @param {string[]} modelos
 */
export function concatenateLpTonerModelos(modelos) {
  const seen = new Set();
  /** @type {string[]} */
  const unique = [];
  for (const raw of modelos) {
    const modelo = cellText(raw);
    if (!modelo) continue;
    const key = modelo.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(modelo);
  }
  return unique.join(MODELO_SEPARATOR);
}

/**
 * Nombre: descripción normalizada + modelo(s) + (rendimiento págs al 5%).
 * Print Cartridge → Toner Original RICOH (+ color).
 * @param {{ descripcion: string; modelo: string; rend: unknown }}
 */
export function buildLpTonerWebProductName({ descripcion, modelo, rend }) {
  const desc = cellText(descripcion);
  const modeloSuffix = cellText(modelo);
  const colorCode = detectTonerColorCode(desc);
  const colorLabel = colorCode ? TONER_COLOR_CODE_LABELS[colorCode] ?? 'Amarillo' : '';

  let base;
  if (isPrintCartridgeDescription(desc)) {
    base = 'Toner Original RICOH';
    if (colorLabel) base = `${base} ${colorLabel}`;
  } else {
    base = normalizeTonerColorProductName(normalizeTonerCartridgeProductLabel(desc));
  }

  const parts = [base];
  if (modeloSuffix) parts.push(modeloSuffix);
  let title = parts.join(' ').replace(/\s{2,}/g, ' ').trim();

  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    title = `${title} (${rendLabel} págs al 5%)`;
  }

  return title;
}

/**
 * @param {{ descripcion: string; modelo: string; rend: unknown; observacion?: string }}
 */
export function buildLpTonerWebDescription({ descripcion, modelo, rend, observacion = '' }) {
  const name = buildLpTonerWebProductName({ descripcion, modelo, rend });
  const note = cellText(observacion);
  if (!note) return name;
  return `${name}\n\n${note}`;
}

/**
 * Compra = Canal (sin redondear). La oferta x6 se documenta en Observaciones.
 * @param {number} canal
 * @param {number} oferta
 * @param {string} ofertaNote
 */
function buildSuppliersAndObservacion(canal, oferta, ofertaNote = '') {
  const canalPrice = parseNumber(canal);
  const ofertaPrice = parseNumber(oferta);
  const note = cellText(ofertaNote);
  const suppliers = setPrimarySupplier([], canalPrice, SUPPLIER_RICOH_DEL_PERU);

  /** @type {string[]} */
  const obsParts = [];
  if (note) obsParts.push(note);
  if (ofertaPrice > 0) {
    obsParts.push(`Canal precio x6 unidades: USD ${ofertaPrice.toFixed(2)}`);
  }

  return {
    suppliers,
    observacion: obsParts.join('\n'),
    canalPrice,
  };
}

/**
 * @typedef {Object} LpTonerWebEntry
 * @property {number} rowIndex
 * @property {string} modelo
 * @property {string} code
 * @property {unknown} rend
 * @property {string} descripcion
 * @property {number} publico
 * @property {number} tecnico
 * @property {number} mayorista
 * @property {number} canal
 * @property {number} oferta
 * @property {string} observacion
 * @property {string | null} colorCode
 */

/**
 * @param {import('xlsx').WorkSheet} sheet
 * @param {unknown[][]} rows
 */
function fillMergedModeloCells(sheet, rows) {
  const merges = sheet['!merges'] ?? [];
  for (const merge of merges) {
    if (merge.s.c !== 0 || merge.e.c !== 0) continue;
    const topValue = cellText(rows[merge.s.r]?.[0]);
    if (!topValue) continue;
    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) continue;
      if (!cellText(row[0])) row[0] = topValue;
    }
  }
}

/**
 * @param {unknown[]} row
 * @param {number} rowIndex
 * @param {string} carryModelo
 * @returns {{ entry: LpTonerWebEntry | null; carryModelo: string; skipReason?: string }}
 */
export function mapLpTonerWebRow(row, rowIndex, carryModelo = '') {
  const modeloCell = cellText(row?.[0]);
  const code = cellText(row?.[1]);
  const descripcion = cellText(row?.[3]);

  if (!code && !descripcion && !modeloCell) {
    return { entry: null, carryModelo, skipReason: 'fila vacía' };
  }

  if (HEADER_CODE_PATTERN.test(code) || /^descripcion$/i.test(descripcion)) {
    return { entry: null, carryModelo: '', skipReason: 'encabezado' };
  }

  if (!code || !descripcion) {
    return {
      entry: null,
      carryModelo: modeloCell || carryModelo,
      skipReason: !code ? 'sin código' : 'sin descripción',
    };
  }

  const category = classifyLpTonerCategory(descripcion);
  const isSuministros = category === 'Suministros';
  // Suministros (grapas, etc.) no heredan el modelo del tóner anterior.
  const modelo = isSuministros ? modeloCell : modeloCell || carryModelo;
  const carryModeloNext = isSuministros ? '' : modelo;

  return {
    entry: {
      rowIndex,
      modelo,
      code,
      rend: row?.[2] !== '' && row?.[2] != null ? row[2] : '',
      descripcion,
      publico: parseNumber(row?.[4]),
      tecnico: parseNumber(row?.[5]),
      mayorista: parseNumber(row?.[6]),
      canal: parseNumber(row?.[7]),
      oferta: parseNumber(row?.[8]),
      observacion: cellText(row?.[9]),
      colorCode: detectTonerColorCode(descripcion),
    },
    carryModelo: carryModeloNext,
  };
}

/**
 * Agrupa bloques consecutivos BK/CY/MG/YW y concatena modelos con " / ".
 * @param {LpTonerWebEntry[]} entries
 */
export function applyCmykModeloGroups(entries) {
  const needed = new Set(['BK', 'CY', 'MG', 'YW']);
  /** @type {LpTonerWebEntry[]} */
  const out = entries.map((entry) => ({ ...entry }));

  let index = 0;
  while (index < out.length) {
    const window = out.slice(index, index + 4);
    if (window.length < 4) break;

    const codes = window.map((entry) => entry.colorCode);
    const unique = new Set(codes.filter(Boolean));
    const allColorToners =
      codes.every(Boolean) && unique.size === 4 && [...needed].every((c) => unique.has(c));

    if (!allColorToners) {
      index += 1;
      continue;
    }

    const modelosConcat = concatenateLpTonerModelos(window.map((entry) => entry.modelo));

    for (let offset = 0; offset < 4; offset += 1) {
      out[index + offset].modelo = modelosConcat || out[index + offset].modelo;
    }

    index += 4;
  }

  return out;
}

/**
 * @param {LpTonerWebEntry} entry
 */
export function mapLpTonerWebEntryToProduct(entry) {
  const category = classifyLpTonerCategory(entry.descripcion);
  const name = buildLpTonerWebProductName({
    descripcion: entry.descripcion,
    modelo: entry.modelo,
    rend: entry.rend,
  });
  const description = buildLpTonerWebDescription({
    descripcion: entry.descripcion,
    modelo: entry.modelo,
    rend: entry.rend,
    observacion: entry.observacion,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (entry.modelo) {
    attributes.push({ name: 'Modelo de equipo', value: entry.modelo });
  }
  const rendLabel = formatRendLabel(entry.rend);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }
  if (entry.colorCode) {
    const colorValue = TONER_COLOR_CODE_LABELS[entry.colorCode] ?? 'Amarillo';
    attributes.push({ name: 'Color', value: colorValue });
  }

  const { suppliers, observacion, canalPrice } = buildSuppliersAndObservacion(
    entry.canal,
    entry.oferta,
    entry.observacion,
  );
  if (observacion) {
    attributes.push({
      name: 'Observaciones',
      value: observacion,
    });
  }

  const { prices } = applyMarginSalePriceBump(
    {
      public: entry.publico,
      tecnico: entry.tecnico,
      mayorista: entry.mayorista,
      distribuidor: entry.tecnico,
    },
    canalPrice,
    { round: roundSalePriceToNinety },
  );

  const isTonerLike =
    category === 'Toner Original' || isPrintCartridgeDescription(entry.descripcion);

  return normalizeProductInput({
    id: tonerProductIdFromCode(entry.code),
    code: entry.code,
    name,
    description: observacion ? `${name}\n\n${observacion}` : description,
    brand: isTonerLike || category === 'Suministros' ? 'Ricoh' : null,
    category,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices,
    purchase_price_usd: canalPrice > 0 ? canalPrice : 0,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {Buffer} buffer
 * @returns {{ products: ReturnType<typeof normalizeProductInput>[]; skipped: Array<{ row: number; reason: string; detail?: string }> }}
 */
export function parseLpTonerWebWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { products: [], skipped: [] };

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });
  fillMergedModeloCells(sheet, rows);

  /** @type {LpTonerWebEntry[]} */
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

  const grouped = applyCmykModeloGroups(entries);
  const products = grouped.map((entry) => mapLpTonerWebEntryToProduct(entry));

  return { products, skipped };
}
