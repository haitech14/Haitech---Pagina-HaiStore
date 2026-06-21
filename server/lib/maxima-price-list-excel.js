import XLSX from 'xlsx';

import { LANDING_CATEGORY, landingInventoryCategory } from '../../shared/landing-categories.js';

import { parsePriceCell } from './compatible-toner-excel.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { ensureFullPrices } from './roles.js';

export const SUPPLIER_MAXIMA = 'Maxima';

const HEADER_ALIASES = {
  haicodigo: 'haicodigo',
  codigo: 'codigo',
  descripcion: 'descripcion',
  subfamilia: 'subfamilia',
  submarca: 'submarca',
  stock: 'stock',
  srq: 'stock',
  compra: 'compra',
  mayorista: 'mayorista',
  tecnico: 'tecnico',
  publico: 'publico',
};

/**
 * @param {unknown} header
 */
function normalizeHeaderKey(header) {
  return String(header ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '');
}

/**
 * @param {unknown[]} headerRow
 */
export function resolveMaximaPriceListLayout(headerRow) {
  /** @type {Record<string, number>} */
  const columns = {};

  headerRow.forEach((cell, index) => {
    const key = normalizeHeaderKey(cell);
    const mapped = HEADER_ALIASES[key];
    if (mapped && columns[mapped] === undefined) {
      columns[mapped] = index;
    }
  });

  const required = ['codigo', 'descripcion', 'subfamilia', 'compra', 'publico'];
  const missing = required.filter((field) => columns[field] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Columnas requeridas ausentes en el Excel Maxima: ${missing.join(', ')}. Encabezados: ${headerRow.join(' | ')}`,
    );
  }

  return columns;
}

/**
 * SRQ / Stock: "2", "10", ">25" → número entero.
 * @param {unknown} value
 */
export function parseMaximaStock(value) {
  const text = String(value ?? '').trim();
  if (!text) return 0;

  const greaterThanMatch = text.match(/^>\s*(\d+)/);
  if (greaterThanMatch) {
    return Math.max(0, parseInt(greaterThanMatch[1], 10) || 0);
  }

  const numeric = parseInt(text.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

/**
 * @param {string} subFamilia
 */
export function mapMaximaSubFamiliaToCategory(subFamilia) {
  const raw = String(subFamilia ?? '').trim();
  const s = raw.toUpperCase();
  if (!s) return 'Varios';

  if (/TONER|TINTA|DRUM IMPRESORA|BANDEJA DE IMPRESORA|TONER FOTOCOPIADORA/.test(s)) {
    return landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.suministros);
  }
  if (s === 'REPUESTOS' || s.includes('REPUESTO')) return 'Repuestos';
  if (/IMP\.\s*MULTIF|IMPRES\.\s*MULTIF|MULTIF\.\s*LASER/.test(s)) return 'Multifuncionales';
  if (/IMP\.\s*LASER|IMPRES\.\s*LASER|^IMPRES\.|^IMP\./.test(s)) return 'Impresoras';
  if (/ACCESORIOS IMPRESORA|^ACCESORIO/.test(s)) return 'Accesorios';
  if (/MONITOR/.test(s)) return 'Monitores';
  if (/NOTEBOOK|COMPUTADORA|PC AIO|TABLET|SMARTPHONE/.test(s)) return LANDING_CATEGORY.computadorasLaptop;
  if (/CAMARA|GRABADORA|^DVR\b|^NVR\b/.test(s)) return LANDING_CATEGORY.camaras;
  if (/ESCANER/.test(s)) return LANDING_CATEGORY.escaneres;
  if (/ROUTER|SWITCH|ACCES POINT|USB INALAMBRICO|ANTIVIRUS|LICENCIAS WINDOWS/.test(s)) {
    return 'Soluciones de Negocio';
  }
  if (
    /SOCKET|AM4|AM5|LGA|MAINBOARD|^MB |DDR|DISCO|SSD|VIDEO|FUENTE|CASE|COOLER|TARJETA|AMD -/.test(
      s,
    )
  ) {
    return LANDING_CATEGORY.computadorasLaptop;
  }
  if (/MOCHILA|BATERIA|UPS|^VARIOS$|SMART|PANTALLA DIGITAL/.test(s)) return 'Accesorios';

  return raw;
}

/**
 * @param {string} code
 */
export function maximaProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `maxima-${slug || 'sin-codigo'}`;
}

/**
 * @param {unknown[]} row
 * @param {Record<string, number>} layout
 */
export function mapMaximaPriceListRow(row, layout) {
  const codigo = String(row[layout.codigo] ?? '').trim();
  const descripcion = String(row[layout.descripcion] ?? '').trim();
  if (!codigo || !descripcion) return null;

  const subFamilia = String(row[layout.subfamilia] ?? '').trim();
  const subMarca = layout.submarca !== undefined ? String(row[layout.submarca] ?? '').trim() : '';
  const haiCodigo =
    layout.haicodigo !== undefined ? String(row[layout.haicodigo] ?? '').trim() : '';

  const stock =
    layout.stock !== undefined ? parseMaximaStock(row[layout.stock]) : 0;
  const compra = parsePriceCell(row[layout.compra]);
  const mayorista = parsePriceCell(row[layout.mayorista]);
  const tecnico = parsePriceCell(row[layout.tecnico]);
  const publico = parsePriceCell(row[layout.publico]);

  return {
    haiCodigo,
    codigo,
    descripcion,
    subFamilia,
    subMarca,
    stock,
    compra,
    mayorista,
    tecnico,
    publico,
  };
}

/**
 * @param {ReturnType<typeof mapMaximaPriceListRow> & object} row
 */
export function buildMaximaPriceListProduct(row) {
  if (!row) return null;

  const category = mapMaximaSubFamiliaToCategory(row.subFamilia);
  const prices = ensureFullPrices({
    public: row.publico,
    tecnico: row.tecnico,
    mayorista: row.mayorista,
    distribuidor: row.mayorista > 0 ? row.mayorista : row.tecnico,
  });

  const purchaseUsd = Math.max(0, row.compra);
  const suppliers =
    purchaseUsd > 0
      ? [{ name: SUPPLIER_MAXIMA, purchase_price_usd: purchaseUsd }]
      : [{ name: SUPPLIER_MAXIMA, purchase_price_usd: 0 }];

  /** @type {{ name: string; value: string }[]} */
  const attributes = [];
  if (row.haiCodigo) {
    attributes.push({ name: 'HaiCodigo', value: row.haiCodigo });
  }
  if (row.subFamilia) {
    attributes.push({ name: 'SubFamilia', value: row.subFamilia });
  }

  return normalizeProductInput({
    id: maximaProductIdFromCode(row.codigo),
    code: row.codigo,
    name: row.descripcion,
    description: row.descripcion,
    brand: row.subMarca || null,
    category,
    currency: 'USD',
    stock: row.stock,
    prices,
    purchase_price_usd: purchaseUsd,
    suppliers,
    attributes: normalizeAttributes(attributes),
    image_url: null,
    gallery: [],
  });
}

/**
 * @param {Buffer | ArrayBuffer} buffer
 */
export function parseMaximaPriceListWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El Excel Maxima no contiene hojas.');
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  if (rows.length < 2) {
    return { rowsRead: 0, products: [], categories: [] };
  }

  const layout = resolveMaximaPriceListLayout(rows[0]);
  const products = [];
  const categories = new Set();

  for (let index = 1; index < rows.length; index += 1) {
    const mapped = mapMaximaPriceListRow(rows[index], layout);
    if (!mapped) continue;
    const product = buildMaximaPriceListProduct(mapped);
    if (!product) continue;
    products.push(product);
    categories.add(product.category);
  }

  return {
    sheetName,
    rowsRead: products.length,
    products,
    categories: [...categories].sort((a, b) => a.localeCompare(b, 'es')),
  };
}
