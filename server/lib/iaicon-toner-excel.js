import XLSX from 'xlsx';

import {
  CATEGORY_IAICON_TONER,
  IAICON_CARTRIDGE_PREFIX,
  SUPPLIER_IAICON,
  SUPPLIER_YYB_GLOBAL,
} from '../../shared/iaicon-toner.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

const MODELO_KEY = 'MODELO\r\nDE EQUIPO';
const REND_KEY = 'REND\r\n5%';
const GRAMAJE_KEY = 'GRAMAJ\r\nE';
const DESCRIPCION_KEY = 'DESCRIPCION ';

/**
 * @param {unknown} value
 */
export function parseNumber(value) {
  if (value === '' || value == null) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  const text = String(value).trim().replace(/,/g, '.');
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const num = Number(match[1]);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * Convierte un precio de compra en soles (con o sin prefijo S/) a USD.
 * @param {unknown} value
 * @param {number} purchaseRate
 */
export function purchaseSolesToUsd(value, purchaseRate) {
  const pen = parseNumber(value);
  if (pen <= 0 || purchaseRate <= 0) return 0;
  return Math.round((pen / purchaseRate) * 100) / 100;
}

/** @deprecated Usar purchaseSolesToUsd */
export function penToUsd(value, purchaseRate) {
  return purchaseSolesToUsd(value, purchaseRate);
}

function collapseSpaces(text) {
  return String(text ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COLOR_TOKEN_REPLACEMENTS = [
  [/\bBK\b/gi, 'Negro'],
  [/\bYW\b/gi, 'Yellow'],
  [/\bMG\b/gi, 'Magenta'],
  [/\bCY\b/gi, 'Cyan'],
  [/\bO\//gi, 'Cyan '],
];

/**
 * @param {string} text
 */
export function expandIaiconColorTokens(text) {
  let result = collapseSpaces(text);
  for (const [pattern, replacement] of COLOR_TOKEN_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return collapseSpaces(result);
}

/**
 * @param {string} raw
 */
export function normalizeIaiconCartridgeTitle(raw) {
  let text = collapseSpaces(raw);
  if (!text) return IAICON_CARTRIDGE_PREFIX;

  const rules = [
    [/\bcartuchos?\s+de\s+toner\b/gi, IAICON_CARTRIDGE_PREFIX],
    [/\bprint\s+cartridge\b/gi, IAICON_CARTRIDGE_PREFIX],
    [/\bpri\s*nt\s*cartri?\s*dge\b/gi, IAICON_CARTRIDGE_PREFIX],
    [/\bpri\s*nt\s*cart\b/gi, IAICON_CARTRIDGE_PREFIX],
    [/\bprint\s+cartri\b/gi, IAICON_CARTRIDGE_PREFIX],
    [/^toner\b(?!\s+cartucho\s+compatible\s+iaicon)/i, IAICON_CARTRIDGE_PREFIX],
  ];

  for (const [pattern, replacement] of rules) {
    text = text.replace(pattern, replacement);
  }

  return expandIaiconColorTokens(text);
}

/**
 * @param {{ titulo: string; modelo: string; gramaje: string; rend: unknown }}
 */
export function buildIaiconTonerDescription({ titulo, modelo, gramaje, rend }) {
  /** @type {string[]} */
  const parts = [titulo.trim()].filter(Boolean);

  const modelSuffix = collapseSpaces(modelo);
  if (modelSuffix) parts.push(modelSuffix);

  const gramajeLabel = collapseSpaces(gramaje);
  if (gramajeLabel) parts.push(gramajeLabel);

  const rendValue = parseNumber(rend);
  if (rendValue > 0) {
    const rendLabel = formatRendLabel(rend);
    if (rendLabel) {
      parts.push(`${rendLabel} páginas al 5%`);
    }
  }

  return parts.join(' — ');
}

/**
 * @param {string} rawCode
 * @param {string} modelo
 * @param {string} titulo
 */
export function normalizeIaiconProductCode(rawCode, modelo, titulo) {
  const direct = collapseSpaces(rawCode);
  if (direct) {
    const first = direct.split('/')[0]?.trim() ?? direct;
    return first.replace(/\s+/g, '').toUpperCase().slice(0, 32);
  }

  const fallback = collapseSpaces(modelo) || collapseSpaces(titulo);
  const slug = fallback
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return `IAICON-${slug || 'SIN-CODIGO'}`;
}

/**
 * @param {string} code
 */
export function iaiconTonerProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `iaicon-toner-${slug || 'sin-codigo'}`;
}

/**
 * @param {string} marca
 */
function formatBrand(marca) {
  const value = collapseSpaces(marca);
  if (!value) return 'iAicon';
  if (value.toUpperCase() === 'IAICON') return 'iAicon';
  return value;
}

/**
 * @param {{
 *   code: string;
 *   titulo: string;
 *   description: string;
 *   modelo: string;
 *   gramaje: string;
 *   marca: string;
 *   rend: unknown;
 *   compraIaicon: number;
 *   compraYyb: number;
 *   mayorista: number;
 *   distribuidor: number;
 *   publico: number;
 * }}
 */
function buildProduct({
  code,
  titulo,
  description,
  modelo,
  gramaje,
  marca,
  rend,
  compraIaicon,
  compraYyb,
  mayorista,
  distribuidor,
  publico,
}) {
  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelo) attributes.push({ name: 'Modelo de equipo', value: modelo });
  if (gramaje) attributes.push({ name: 'Gramaje', value: gramaje });
  const rendLabel = formatRendLabel(rend);
  if (rendLabel && parseNumber(rend) > 0) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }

  /** @type {Array<{ name: string; purchase_price_usd: number }>} */
  const suppliers = [];
  if (compraIaicon > 0) {
    suppliers.push({ name: SUPPLIER_IAICON, purchase_price_usd: compraIaicon });
  }
  if (compraYyb > 0) {
    suppliers.push({ name: SUPPLIER_YYB_GLOBAL, purchase_price_usd: compraYyb });
  }

  const purchase =
    suppliers.length > 0
      ? Math.min(...suppliers.map((supplier) => supplier.purchase_price_usd))
      : 0;

  const distribuidorPrice = roundSalePriceToNinety(distribuidor);
  const publicPrice = roundSalePriceToNinety(publico);

  return normalizeProductInput({
    id: iaiconTonerProductIdFromCode(code),
    code,
    name: titulo,
    description,
    brand: formatBrand(marca),
    category: CATEGORY_IAICON_TONER,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: {
      public: publicPrice,
      tecnico: distribuidorPrice > 0 ? distribuidorPrice : publicPrice,
      distribuidor: distribuidorPrice,
      mayorista: roundSalePriceToNinety(mayorista),
    },
    purchase_price_usd: purchase,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ carryModelo: string; purchaseRate: number }}
 */
export function mapIaiconTonerRow(row, state) {
  const modeloCell = collapseSpaces(row[MODELO_KEY]);
  const carryModelo = modeloCell || state.carryModelo;
  const nextState = {
    ...state,
    carryModelo,
  };

  const rawDescripcion = collapseSpaces(row[DESCRIPCION_KEY] ?? row.DESCRIPCION);
  if (!rawDescripcion) {
    return { product: null, state: nextState };
  }

  const titulo = normalizeIaiconCartridgeTitle(rawDescripcion);
  const gramaje = collapseSpaces(row[GRAMAJE_KEY] ?? row.GRAMAJE);
  const rend = row[REND_KEY] ?? row['REND 5%'] ?? '';
  const marca = collapseSpaces(row.MARCA);
  const code = normalizeIaiconProductCode(row.CODIGO, carryModelo, titulo);

  const compraIaicon = purchaseSolesToUsd(row['Compra iAicon'], state.purchaseRate);
  const compraYyb = purchaseSolesToUsd(row.Compra, state.purchaseRate);
  const mayorista = parseNumber(row['Distribuidor X4']);
  const distribuidor = parseNumber(row.Distribuidor);
  const publico = parseNumber(row.Publico);

  if (compraIaicon <= 0 && compraYyb <= 0 && publico <= 0) {
    return { product: null, state: nextState };
  }

  const description = buildIaiconTonerDescription({
    titulo,
    modelo: carryModelo,
    gramaje,
    rend,
  });

  return {
    product: buildProduct({
      code,
      titulo,
      description,
      modelo: carryModelo,
      gramaje,
      marca,
      rend,
      compraIaicon,
      compraYyb,
      mayorista,
      distribuidor,
      publico,
    }),
    state: nextState,
  };
}

/**
 * @param {Buffer} buffer
 * @param {{ purchaseRate?: number }} [options]
 */
export function parseIaiconTonerWorkbook(buffer, options = {}) {
  const purchaseRate = Math.max(0.01, Number(options.purchaseRate) || 3.7);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  /** @type {{ carryModelo: string; purchaseRate: number }} */
  let state = { carryModelo: '', purchaseRate };

  for (const row of rows) {
    const { product, state: nextState } = mapIaiconTonerRow(row, state);
    state = nextState;
    if (product) products.push(product);
  }

  return products;
}

export { CATEGORY_IAICON_TONER };
