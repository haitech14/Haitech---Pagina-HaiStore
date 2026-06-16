import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import {
  CATEGORY_COMPATIBLE_TONER,
  compatibleTonerProductIdFromCode,
  parsePriceCell,
} from './compatible-toner-excel.js';
import { normalizeProductInput } from './inventory-store.js';
import { ensureFullPrices } from './roles.js';

export const PROCESSED_PRICE_LIST_CODE_PREFIX = 'LP';
export const CARTUCHO_PREFIX = 'Toner cartucho compatible RICOH ';
const COLOR_TOKEN_PATTERN = /\s+(NEGRO|CYAN|MAGENTA|YELLOW)\s*$/i;

const FOUR_COLOR_VARIANTS = [
  { key: 'CYAN', label: 'Cyan' },
  { key: 'MAGENTA', label: 'Magenta' },
  { key: 'YELLOW', label: 'Yellow' },
  { key: 'NEGRO', label: 'Negro' },
];

/**
 * @param {number} distribuidorPen
 */
export function normalizeMayoristaPen(distribuidorPen) {
  const dist = parsePriceCell(distribuidorPen);
  if (dist <= 0) return 0;
  return Math.max(0, Math.round((dist - 10) * 100) / 100);
}

/**
 * @param {string} modelo
 * @param {string} [marca]
 */
export function stripCartuchoPrefix(modelo, marca = 'RICOH') {
  const text = String(modelo ?? '').trim();
  if (!text) return '';

  const prefixes = [
    CARTUCHO_PREFIX,
    `Toner cartucho compatible ${String(marca).trim()} `,
    'Toner cartucho compatible ',
  ];

  for (const prefix of prefixes) {
    if (text.toUpperCase().startsWith(prefix.toUpperCase())) {
      return text.slice(prefix.length).trim();
    }
  }

  return text;
}

/**
 * @param {string} part
 */
function slugifyCodePart(part) {
  return String(part ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @param {string[]} parts
 * @param {string} colorKey
 */
function buildLpCode(parts, colorKey) {
  const colorSlug = slugifyCodePart(colorKey) || 'SIN-COLOR';
  const headParts = parts.map(slugifyCodePart).filter(Boolean);
  const head = [PROCESSED_PRICE_LIST_CODE_PREFIX, ...headParts].join('-');
  const suffix = `-${colorSlug}`;
  const maxLen = 64;
  const available = maxLen - suffix.length;
  const trimmedHead =
    head.length <= available ? head : head.slice(0, available).replace(/-+$/, '');
  return `${trimmedHead}${suffix}`.slice(0, maxLen);
}

/**
 * @param {string} text
 */
export function isUnidadImagenModelo(text) {
  return String(text ?? '').toUpperCase().includes('UNIDAD DE IMAGEN');
}

/**
 * @param {string} text
 */
function isFourColors(text) {
  return String(text ?? '').trim().toUpperCase() === '4 COLORES';
}

/**
 * @param {string} text
 */
function titleCaseColor(text) {
  const value = String(text ?? '').trim().toLowerCase();
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * @param {string} modelo
 * @param {string} colores
 */
export function inferColorLabel(modelo, colores) {
  const modeloUpper = String(modelo ?? '').trim().toUpperCase();
  const tokens = ['NEGRO', 'CYAN', 'MAGENTA', 'YELLOW'];
  for (const token of tokens) {
    if (modeloUpper.endsWith(token) || modeloUpper.includes(` ${token}`)) {
      return titleCaseColor(token);
    }
  }

  const coloresUpper = String(colores ?? '').trim().toUpperCase();
  if (coloresUpper === 'NEGRO') return 'Negro';
  if (coloresUpper.startsWith('CYAN')) return 'Cyan';
  if (coloresUpper.startsWith('MAGENTA')) return 'Magenta';
  if (coloresUpper.startsWith('YELLOW')) return 'Yellow';
  if (coloresUpper === 'COLORES') return 'Colores';

  const fromColumn = titleCaseColor(colores);
  return fromColumn;
}

/**
 * @param {string} stripped
 * @param {string} colorLabel
 */
function formatUnidadImagenName(stripped, colorLabel) {
  let base = String(stripped ?? '')
    .trim()
    .replace(/\s+4\s+COLORES\s*$/i, '')
    .replace(COLOR_TOKEN_PATTERN, '')
    .trim();
  base = base.replace(/^UNIDAD DE IMAGEN/i, 'Unidad de imagen');
  if (colorLabel) {
    return `${base} ${colorLabel}`.replace(/\s+/g, ' ').trim();
  }
  return base.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} modelo
 * @param {string} colores
 */
export function resolveProductName(modelo, colores) {
  const rawModelo = String(modelo ?? '').trim();
  if (!isUnidadImagenModelo(rawModelo)) {
    return rawModelo;
  }

  const stripped = stripCartuchoPrefix(rawModelo, inferMarcaFromModelo(rawModelo));
  if (isFourColors(colores)) {
    return formatUnidadImagenName(stripped, '');
  }

  const colorLabel = inferColorLabel(rawModelo, colores);
  return formatUnidadImagenName(stripped, colorLabel);
}

/**
 * @param {string} modelo
 */
function inferMarcaFromModelo(modelo) {
  const match = String(modelo ?? '').match(/compatible\s+([A-Z0-9]+)\s/i);
  return match?.[1] ?? 'RICOH';
}

/**
 * @param {number} pen
 * @param {number} rate
 */
function penToUsd(pen, rate) {
  const amount = parsePriceCell(pen);
  const exchange = Number(rate);
  if (amount <= 0 || !Number.isFinite(exchange) || exchange <= 0) return 0;
  return Math.round((amount / exchange) * 100) / 100;
}

/**
 * @param {{
 *   marca: string;
 *   modelo: string;
 *   colores: string;
 *   compraPen: number;
 *   distribuidorPen: number;
 *   corporativoPen: number;
 *   colorLabel?: string;
 *   isUnidadImagen?: boolean;
 * }} row
 */
export function buildProcessedPriceListCode(row) {
  const stripped = stripCartuchoPrefix(row.modelo, row.marca);
  const colorKey = String(row.colorLabel ?? inferColorLabel(row.modelo, row.colores) ?? '')
    .trim()
    .toUpperCase();

  if (row.isUnidadImagen || isUnidadImagenModelo(row.modelo)) {
    const modelPart = stripped
      .replace(/^UNIDAD DE IMAGEN\s*/i, '')
      .replace(/\s+4\s+COLORES\s*$/i, '')
      .replace(COLOR_TOKEN_PATTERN, '')
      .trim();
    return buildLpCode([row.marca, 'UI', modelPart], colorKey);
  }

  const modelPart = stripped.replace(COLOR_TOKEN_PATTERN, '').trim();
  return buildLpCode([row.marca, modelPart], colorKey);
}

function normalizeHeaderCell(cell) {
  return String(cell ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * @param {Array<unknown>} headerRow
 */
export function resolveProcessedPriceListLayout(headerRow) {
  const headers = (headerRow ?? []).map(normalizeHeaderCell);
  const idx = (...needles) => {
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (needles.some((needle) => header === needle || header.includes(needle))) {
        return index;
      }
    }
    return -1;
  };

  const marca = idx('marca');
  const modelo = idx('modelo');
  const colores = idx('colores', 'color');
  const compra = idx('compra');
  const tecnico = idx('tecnico');
  const mayorista = idx('mayorista');
  const publico = idx('publico');
  const distribuidor = idx('distribuidor', 'dist');

  if (tecnico >= 0 && mayorista >= 0 && publico >= 0) {
    return {
      variant: 'explicit-tiers',
      marca: marca >= 0 ? marca : 0,
      modelo: modelo >= 0 ? modelo : 1,
      colores: colores >= 0 ? colores : 2,
      compra: compra >= 0 ? compra : 3,
      tecnico,
      mayorista,
      publico,
    };
  }

  return {
    variant: 'legacy',
    marca: 0,
    modelo: 1,
    colores: 2,
    compra: 3,
    distribuidor: distribuidor >= 0 ? distribuidor : 5,
    publico: publico >= 0 ? publico : 6,
  };
}

/**
 * @param {Array<unknown>} row
 * @param {number} index
 */
function readProcessedPriceListCell(row, index) {
  if (index < 0) return '';
  return row[index];
}

/**
 * @param {Array<unknown>} row
 * @param {ReturnType<typeof resolveProcessedPriceListLayout>} [layout]
 */
export function mapProcessedPriceListRow(row, layout = resolveProcessedPriceListLayout([])) {
  const marca = String(readProcessedPriceListCell(row, layout.marca) ?? '').trim();
  const modelo = String(readProcessedPriceListCell(row, layout.modelo) ?? '').trim();
  const colores = String(readProcessedPriceListCell(row, layout.colores) ?? '').trim();
  const compraPen = parsePriceCell(readProcessedPriceListCell(row, layout.compra));

  if (!marca || /^marca$/i.test(marca) || compraPen <= 0) {
    return [];
  }

  let tecnicoPen = 0;
  let mayoristaPen = 0;
  let distribuidorPen = 0;
  let publicoPen = 0;

  if (layout.variant === 'explicit-tiers') {
    tecnicoPen = parsePriceCell(readProcessedPriceListCell(row, layout.tecnico));
    mayoristaPen = parsePriceCell(readProcessedPriceListCell(row, layout.mayorista));
    publicoPen = parsePriceCell(readProcessedPriceListCell(row, layout.publico));
    distribuidorPen = tecnicoPen;
  } else {
    distribuidorPen = parsePriceCell(readProcessedPriceListCell(row, layout.distribuidor));
    publicoPen = parsePriceCell(readProcessedPriceListCell(row, layout.publico));
    mayoristaPen = normalizeMayoristaPen(distribuidorPen);
    tecnicoPen = distribuidorPen;
  }

  const base = {
    marca,
    modelo,
    colores,
    compraPen,
    tecnicoPen,
    mayoristaPen,
    distribuidorPen,
    publicoPen,
    corporativoPen: publicoPen,
    isUnidadImagen: isUnidadImagenModelo(modelo),
  };

  return expandUnidadImagenFourColors(base);
}

/**
 * @param {{
 *   marca: string;
 *   modelo: string;
 *   colores: string;
 *   compraPen: number;
 *   mayoristaPen: number;
 *   distribuidorPen: number;
 *   corporativoPen: number;
 *   isUnidadImagen?: boolean;
 *   colorLabel?: string;
 * }} row
 * @returns {Array<{
 *   marca: string;
 *   modelo: string;
 *   colores: string;
 *   compraPen: number;
 *   mayoristaPen: number;
 *   distribuidorPen: number;
 *   corporativoPen: number;
 *   isUnidadImagen?: boolean;
 *   colorLabel?: string;
 * }>}
 */
export function expandUnidadImagenFourColors(row) {
  if (!row.isUnidadImagen || !isFourColors(row.colores)) {
    return [row];
  }

  const stripped = stripCartuchoPrefix(row.modelo, row.marca);

  return FOUR_COLOR_VARIANTS.map((variant) => ({
    ...row,
    modelo: formatUnidadImagenName(stripped, variant.label),
    colorLabel: variant.label,
  }));
}

/**
 * @param {{
 *   marca: string;
 *   modelo: string;
 *   colores: string;
 *   compraPen: number;
 *   tecnicoPen?: number;
 *   mayoristaPen: number;
 *   distribuidorPen: number;
 *   publicoPen?: number;
 *   corporativoPen: number;
 *   isUnidadImagen?: boolean;
 *   colorLabel?: string;
 * }} row
 * @param {{ saleRate: number; purchaseRate: number }} rates
 */
export function buildProcessedPriceListProduct(row, rates) {
  const colorLabel = row.colorLabel ?? inferColorLabel(row.modelo, row.colores);
  const name =
    row.isUnidadImagen || isUnidadImagenModelo(row.modelo)
      ? row.colorLabel
        ? String(row.modelo ?? '').trim()
        : resolveProductName(row.modelo, row.colores)
      : String(row.modelo ?? '').trim();
  const code = buildProcessedPriceListCode({ ...row, colorLabel });

  const purchaseUsd = penToUsd(row.compraPen, rates.purchaseRate);
  const publicUsd = penToUsd(row.publicoPen ?? row.corporativoPen, rates.saleRate);
  const tecnicoUsd = penToUsd(row.tecnicoPen ?? 0, rates.saleRate);
  const distribuidorUsd = penToUsd(row.distribuidorPen, rates.saleRate);
  const mayoristaUsd = penToUsd(row.mayoristaPen, rates.saleRate);

  const prices = ensureFullPrices({
    public: publicUsd,
    tecnico: tecnicoUsd > 0 ? tecnicoUsd : undefined,
    distribuidor: distribuidorUsd > 0 ? distribuidorUsd : undefined,
    mayorista: mayoristaUsd > 0 ? mayoristaUsd : undefined,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [{ name: 'Marca compatible', value: row.marca }];
  if (colorLabel) {
    attributes.push({ name: 'Color', value: colorLabel });
  }

  return normalizeProductInput({
    id: compatibleTonerProductIdFromCode(code),
    code,
    name,
    description: name,
    brand: null,
    category: CATEGORY_COMPATIBLE_TONER,
    currency: 'USD',
    stock: 0,
    image_url: '/categories/toner-suministros.png',
    gallery: ['/categories/toner-suministros.png'],
    prices,
    purchase_price_usd: purchaseUsd,
    attributes: normalizeAttributes(attributes),
    suppliers: purchaseUsd > 0 ? [{ name: row.marca, purchase_price_usd: purchaseUsd }] : [],
  });
}

/**
 * @param {Buffer} buffer
 * @param {{ saleRate?: number; purchaseRate?: number }} [options]
 */
export function parseProcessedPriceListWorkbook(buffer, options = {}) {
  const saleRate = Number(options.saleRate) > 0 ? Number(options.saleRate) : 3.7;
  const purchaseRate = Number(options.purchaseRate) > 0 ? Number(options.purchaseRate) : saleRate;

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rowsRead: 0, products: [] };

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  const layout = resolveProcessedPriceListLayout(rows[0] ?? []);
  const dataStartIndex = layout.variant === 'explicit-tiers' ? 1 : 0;

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  let rowsRead = 0;

  for (let index = dataStartIndex; index < rows.length; index += 1) {
    const row = rows[index];
    if (!Array.isArray(row)) continue;

    const marca = String(row[layout.marca] ?? row[0] ?? '').trim();
    if (/^marca$/i.test(marca)) continue;

    const expanded = mapProcessedPriceListRow(row, layout);
    if (expanded.length === 0) continue;

    rowsRead += 1;
    for (const item of expanded) {
      products.push(buildProcessedPriceListProduct(item, { saleRate, purchaseRate }));
    }
  }

  return { rowsRead, products };
}
