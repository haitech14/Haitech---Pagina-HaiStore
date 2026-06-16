import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { normalizeTonerCartridgeProductLabel, normalizeTonerColorProductName, moveParentheticalSuffixToEnd } from '../../shared/inventory-product-name.js';
import { formatRendLabel } from './repuestos-products-excel.js';

export const CATEGORY_ORIGINAL = 'Toner Original';
export const CATEGORY_TONER = 'Toner Original';
export const CATEGORY_SUMINISTROS = 'Suministros';
export const SUPPLIER_RICOH_PERU = 'Proveedor Ricoh del Peru';
export const SUPPLIER_RICOH_PERU_2 = 'Proveedor Ricoh del Peru 2';
export const OFERTA_DEFAULT_NOTE =
  'Precio especial solo aplica a compras mayores de 6 unidades';

/**
 * @param {string} description
 * @returns {'Suministros' | 'Toner Original'}
 */
export function classifyTonerInventoryCategory(description) {
  const desc = String(description ?? '').trim();
  const upper = desc.toUpperCase();

  if (
    upper.includes('STAPLE') ||
    upper.includes('GRAPA') ||
    upper.includes('GRAPAS') ||
    /\bREFILL\s+STAPLE\b/.test(upper)
  ) {
    return CATEGORY_SUMINISTROS;
  }

  if (upper.includes('->') || upper.includes('COMPATIBLE') || /\bCOMPAT\b/.test(upper)) {
    return CATEGORY_TONER;
  }

  if (
    (/PRINT\s*CARTRIDGE|PRINT\s*CART|\bTONER\b|CARTRIDGE/i.test(desc) && !upper.includes('->')) ||
    /^RICOH\b/i.test(desc)
  ) {
    return CATEGORY_TONER;
  }

  return CATEGORY_TONER;
}

/**
 * Precio de venta: décima más cercana terminada en .90 (p. ej. 82.42 → 82.90).
 * @param {number} value
 */
export function roundSalePriceToNinety(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n - 0.9) + 0.9;
}

/**
 * @param {unknown} value
 */
function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

/**
 * @param {string} code
 */
export function tonerProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `toner-${slug || 'sin-codigo'}`;
}

/**
 * Título del producto: descripción + rendimiento + color normalizado.
 * @param {{ descripcion: string; rend: unknown }}
 */
export function buildTonerProductTitle({ descripcion, rend }) {
  let title = normalizeTonerCartridgeProductLabel(descripcion.trim());
  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    title = `${title} (Rend ${rendLabel})`;
  }
  return moveParentheticalSuffixToEnd(normalizeTonerColorProductName(title));
}

/**
 * Descripción larga: descripción + modelo de equipo + rendimiento.
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildTonerProductDescription({ descripcion, rend, modelo }) {
  const base = normalizeTonerColorProductName(
    normalizeTonerCartridgeProductLabel(descripcion.trim()),
  );
  const rendLabel = formatRendLabel(rend);
  const modelSuffix = modelo.trim();

  let description = base;
  if (modelSuffix) {
    description = `${description} — ${modelSuffix}`;
  }
  if (rendLabel && !description.includes(`Rend ${rendLabel}`)) {
    description = `${description} (Rend ${rendLabel})`;
  }

  return description;
}

/**
 * @deprecated Usar buildTonerProductTitle.
 * @param {{ descripcion: string; rend: unknown; modelo: string }}
 */
export function buildTonerProductName({ descripcion, rend, modelo }) {
  return buildTonerProductTitle({ descripcion, rend, modelo });
}

/**
 * @param {unknown[]} headerRow
 */
function resolveTonerSheetLayout(headerRow) {
  const headers = headerRow.map((cell) => String(cell ?? '').trim().toLowerCase());
  const publicoIndices = headers
    .map((header, index) => (header === 'publico' || header.startsWith('publico') ? index : -1))
    .filter((index) => index >= 0);
  const indexOf = (...needles) => {
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (needles.some((needle) => header === needle || header.includes(needle))) {
        return index;
      }
    }
    return -1;
  };

  const cajaIndex = indexOf('caja');
  const isV3 = cajaIndex >= 0;

  if (isV3) {
    return {
      isV3: true,
      modelo: 0,
      code: 1,
      rend: 2,
      descripcion: 3,
      publico: publicoIndices[0] ?? 4,
      tecnico: publicoIndices[1] ?? publicoIndices[0] ?? 5,
      distribuidor: indexOf('dist') >= 0 ? indexOf('dist') : 6,
      caja: cajaIndex,
      mayorista: indexOf('mayorista') >= 0 ? indexOf('mayorista') : 8,
      canal: indexOf('canal') >= 0 ? indexOf('canal') : 9,
      oferta: indexOf('oferta') >= 0 ? indexOf('oferta') : 10,
      ofertaNote: indexOf('oferta') >= 0 ? indexOf('oferta') + 1 : 11,
    };
  }

  return {
    isV3: false,
    modelo: 0,
    code: 1,
    rend: 2,
    descripcion: 3,
    publico: 4,
    tecnico: 5,
    distribuidor: 5,
    caja: -1,
    mayorista: 6,
    canal: 7,
    oferta: 8,
    ofertaNote: -1,
  };
}

/**
 * @param {unknown[]} row
 * @param {ReturnType<typeof resolveTonerSheetLayout>} layout
 */
function readCell(row, index) {
  if (index < 0) return '';
  return row[index];
}

/**
 * @param {number} cajaPerUnit
 */
function formatCajaAttribute(cajaPerUnit) {
  const unit = roundSalePriceToNinety(cajaPerUnit);
  if (unit <= 0) return '';
  const boxTotal = Math.round(unit * 4 * 100) / 100;
  return `USD ${unit.toFixed(2)}/u · caja 4 u. (USD ${boxTotal.toFixed(2)})`;
}

/**
 * @param {number} canal
 * @param {number} oferta
 * @param {string} ofertaNote
 */
function buildTonerSuppliers(canal, oferta, ofertaNote = '') {
  /** @type {Array<{ name: string; purchase_price_usd: number }>} */
  const suppliers = [];
  const canalPrice = parseNumber(canal);
  const ofertaPrice = parseNumber(oferta);

  if (canalPrice > 0) {
    suppliers.push({ name: SUPPLIER_RICOH_PERU, purchase_price_usd: canalPrice });
  }
  if (ofertaPrice > 0) {
    suppliers.push({ name: SUPPLIER_RICOH_PERU_2, purchase_price_usd: ofertaPrice });
  }

  return {
    suppliers,
    ofertaNote:
      ofertaPrice > 0
        ? ofertaNote.trim() || OFERTA_DEFAULT_NOTE
        : '',
  };
}

/**
 * @param {Array<unknown>} row
 * @param {string} carryModelo
 * @param {ReturnType<typeof resolveTonerSheetLayout>} [layout]
 * @returns {{ product: ReturnType<typeof normalizeProductInput> | null; carryModelo: string }}
 */
export function mapTonerExcelRowToProduct(row, carryModelo = '', layout = resolveTonerSheetLayout([])) {
  const modeloCell = String(readCell(row, layout.modelo) ?? '').trim();
  const carryModeloNext = modeloCell || carryModelo;

  const code = String(readCell(row, layout.code) ?? '').trim();
  const rend = readCell(row, layout.rend);
  const rendValue = rend !== '' && rend != null ? rend : '';
  const description = String(readCell(row, layout.descripcion) ?? '').trim();
  const publicoRaw = parseNumber(readCell(row, layout.publico));
  const tecnicoRaw = parseNumber(readCell(row, layout.tecnico));
  const distribuidorRaw = parseNumber(readCell(row, layout.distribuidor));
  const cajaRaw = parseNumber(readCell(row, layout.caja));
  const mayoristaRaw = parseNumber(readCell(row, layout.mayorista));
  const canal = parseNumber(readCell(row, layout.canal));
  const oferta = parseNumber(readCell(row, layout.oferta));
  const ofertaNote = String(readCell(row, layout.ofertaNote) ?? '').trim();

  if (!code || !description) {
    return { product: null, carryModelo: carryModeloNext };
  }

  const classifiedCategory = classifyTonerInventoryCategory(description);
  const category = layout.isV3 ? CATEGORY_TONER : classifiedCategory;
  const upper = description.toUpperCase();
  const isCartridgeOriginal =
    (/PRINT\s*CARTRIDGE|PRINT\s*CART|\bTONER\b|CARTRIDGE/i.test(description) &&
      !upper.includes('->')) ||
    /^RICOH\b/i.test(description);
  const isOriginal = category === CATEGORY_SUMINISTROS || isCartridgeOriginal;
  const modeloForProduct =
    classifiedCategory === CATEGORY_SUMINISTROS && !layout.isV3 ? modeloCell : carryModeloNext;

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modeloForProduct) {
    attributes.push({ name: 'Modelo de equipo', value: modeloForProduct });
  }
  const rendLabel = formatRendLabel(rendValue);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }
  const cajaLabel = formatCajaAttribute(cajaRaw);
  if (cajaLabel) {
    attributes.push({ name: 'Precio caja (4 u.)', value: cajaLabel });
  }

  const { suppliers, ofertaNote: resolvedOfertaNote } = buildTonerSuppliers(
    canal,
    oferta,
    ofertaNote,
  );
  if (resolvedOfertaNote) {
    attributes.push({ name: 'Nota oferta', value: resolvedOfertaNote });
  }

  const tecnicoRounded = roundSalePriceToNinety(
    tecnicoRaw > 0 ? tecnicoRaw : distribuidorRaw,
  );
  const prices = {
    public: roundSalePriceToNinety(publicoRaw),
    tecnico: tecnicoRounded,
    distribuidor: roundSalePriceToNinety(distribuidorRaw),
    mayorista: roundSalePriceToNinety(mayoristaRaw),
  };

  const name = buildTonerProductTitle({
    descripcion: description,
    rend: rendValue,
  });
  const productDescription = buildTonerProductDescription({
    descripcion: description,
    rend: rendValue,
    modelo: modeloForProduct,
  });

  return {
    product: normalizeProductInput({
      id: tonerProductIdFromCode(code),
      code,
      name,
      description: productDescription,
      brand: isOriginal ? 'Ricoh' : null,
      category,
      currency: 'USD',
      stock: 0,
      image_url: '/categories/toner-suministros.png',
      gallery: ['/categories/toner-suministros.png'],
      prices,
      purchase_price_usd: canal > 0 ? canal : 0,
      attributes: normalizeAttributes(attributes),
      suppliers,
    }),
    carryModelo:
      classifiedCategory === CATEGORY_SUMINISTROS && !layout.isV3 ? '' : carryModeloNext,
  };
}

/**
 * @param {Buffer} buffer
 */
export function parseTonerProductsWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  const layout = resolveTonerSheetLayout(rows[0] ?? []);

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  let carryModelo = '';

  for (let index = 1; index < rows.length; index += 1) {
    const { product, carryModelo: nextModelo } = mapTonerExcelRowToProduct(
      rows[index],
      carryModelo,
      layout,
    );
    carryModelo = nextModelo;
    if (product) products.push(product);
  }

  return products;
}
