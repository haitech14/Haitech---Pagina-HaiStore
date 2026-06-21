import { PDFParse } from 'pdf-parse';

import { LANDING_CATEGORY, landingInventoryCategory } from '../../shared/landing-categories.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { ensureFullPrices } from './roles.js';

export const SUPPLIER_DELTRON = 'Deltron';

/** Líneas Deltron que no deben publicarse en catálogo (merch, servicios, admin). */
export const DELTRON_NON_CATALOG_LINES = new Set([
  'MERCHANDISING',
  'GARANTIA EXTENDIDA',
  'PRODUCTOS SIN CLASIFICAR',
  'SERVICIOS OTROS',
  'MATERIALES_SUMINISTROS',
  'MUESTRA, OTROS',
  'SERVICIOS VENTAS',
  'MATERIALES-ADMINISTRACION',
  'MUESTRA GADGETS',
  'PRECIO STANDARD',
  'PROTEC - MASCARAS KN95',
  'MUESTRA TABLETS',
  'INTERNET, SERVICIOS',
  'SERVICIO TECNICO',
]);

/**
 * @param {{ attributes?: { name: string; value: string }[] } | null | undefined} product
 */
export function getDeltronLineFromProduct(product) {
  const match = product?.attributes?.find((entry) => entry.name === 'Línea Deltron');
  return typeof match?.value === 'string' ? match.value.trim() : '';
}

/**
 * @param {{ id?: string; code?: string; name?: string; attributes?: { name: string; value: string }[] } | null | undefined} product
 */
export function isDeltronMerchandisingOrServiceProduct(product) {
  if (!product) return false;

  const line = getDeltronLineFromProduct(product);
  if (DELTRON_NON_CATALOG_LINES.has(line)) return true;

  const isDeltronImport =
    String(product.id ?? '').startsWith('deltron-') || Boolean(line);
  if (!isDeltronImport) return false;

  const code = String(product.code ?? '');
  const name = String(product.name ?? '');

  if (/^SERV|^CAMBIOLOGO|^ZZCAJA|^ZZETIQ|^ZZFOLLETO|^ZZCERT/i.test(code)) return true;
  if (/SERVICIO|SERIGRAF|TECNOPOR|CAMBIO LOGO|ETIQUETA VOID|FOLLETO SERV/i.test(name)) return true;

  return false;
}

export const DELTRON_IGV_RATE = 0.18;

/** Precios de lista Deltron que indican «consultar» o sin precio real. */
export const DELTRON_PLACEHOLDER_LIST_USD = new Set([130.65, 1306.5, 1004, 1004.0]);

/** @type {Record<string, string>} */
export const DELTRON_WARRANTY_LABELS = {
  A: '30 días',
  B: '90 días',
  C: '6 meses',
  D: '12 meses',
  E: '18 meses',
  F: '24 meses',
  G: '30 meses',
  H: '30 días / 12 meses con PGE',
  J: '6 meses / 12 meses con PGE',
  K: '30 días / 3 años con PGE',
  W: 'Garantía del representante en el Perú',
  X: 'Consultar',
  Y: 'Garantía solo del fabricante',
  P: '36 meses',
  Z: 'No aplica',
};

/**
 * @param {unknown} value
 */
export function parseDeltronStock(value) {
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
 * @param {number} value
 */
export function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @param {number} listUsd
 */
export function isDeltronPlaceholderListPrice(listUsd) {
  if (!Number.isFinite(listUsd) || listUsd <= 0) return true;
  if (listUsd >= 9_999_999) return true;
  return DELTRON_PLACEHOLDER_LIST_USD.has(roundMoney(listUsd));
}

/**
 * @param {number} listUsd Precio lista sin IGV.
 * @param {number} exchangeRate
 */
export function buildDeltronPriceStack(listUsd, exchangeRate) {
  if (isDeltronPlaceholderListPrice(listUsd)) {
    return {
      listUsd: 0,
      purchaseUsd: 0,
      purchasePen: 0,
      tecnico: 0,
      mayorista: 0,
      publico: 0,
    };
  }

  const purchaseUsd = roundMoney(listUsd * (1 + DELTRON_IGV_RATE));
  const purchasePen = roundMoney(purchaseUsd * exchangeRate);
  const tecnico = roundMoney(purchaseUsd * 1.4);
  const mayorista = roundMoney(tecnico * 0.95);
  const publico = roundMoney(tecnico * 1.1);

  return {
    listUsd: roundMoney(listUsd),
    purchaseUsd,
    purchasePen,
    tecnico,
    mayorista,
    publico,
  };
}

/**
 * @param {string} code
 */
export function warrantyLabelFromCode(code) {
  const letter = String(code ?? '').trim().toUpperCase().slice(0, 1);
  return DELTRON_WARRANTY_LABELS[letter] ?? 'Consultar';
}

/**
 * @param {string} lineHeader
 */
function cleanDeltronSubcategory(lineHeader) {
  return String(lineHeader ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/, '');
}

/**
 * @param {string} lineHeader
 */
export function mapDeltronLineToCategory(lineHeader) {
  const line = cleanDeltronSubcategory(lineHeader);
  const u = line.toUpperCase();

  if (/SUMINIST|TONER|CONSUMO|BOTELLAS|BOLSAS|CINTAS|TINTA/.test(u)) {
    if (/TONER/.test(u)) {
      return landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerOriginal);
    }
    return landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.suministros);
  }

  if (/^REP |REPUESTOS|REP NB|REP TB|^SERV,/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.repuestos, LANDING_CATEGORY.repuestosOriginales);
  }

  if (/MULTIFUN/.test(u)) return LANDING_CATEGORY.multifuncionales;
  if (/IMP FORMATO|PLOTTER|SUMINIST P\/ PLOTTERS|IMPRESION_CORTE/.test(u)) {
    return LANDING_CATEGORY.formatoAncho;
  }
  if (/IMPRESORA|COMERCIAL MATRICIAL|COMERCIAL TICKETERA|COMERCIAL TANQUE/.test(u)) {
    return LANDING_CATEGORY.impresoras;
  }

  if (/CAMARA|WEBCAM|RED, CAMARAS|SMART HOME - CAMARAS/.test(u)) {
    return LANDING_CATEGORY.camaras;
  }
  if (/ESCANER/.test(u)) return LANDING_CATEGORY.escaneres;

  if (/^MONITOR|MONITORES/.test(u) && !/^MONITORES, RACK/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.monitores, line);
  }

  if (/PROYECTOR|PIZARRA|TELEVISORES/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.solucionesColaboracion, line);
  }

  if (/NOTEBOOK|COMPUTADORA|TABLET|BAREBONE/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.computadorasLaptop, line);
  }

  if (/^CPU |^MB |^MEM |^SSD |^DISCO|^VIDEO,|^CASES|^COOLER|^FAN COOLER|^DVD|^CAJAS PARA/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.computadorasLaptop, line);
  }

  if (
    /^RED |^SERVIDOR|^STORAGE|^UPS |^ASTERISK|^SOFTWARE|^KASPERSKY|^MS ESD|^MS LICENCIAS|^MS OFFICE|^MS WINDOWS|^SOFT,|^Y PATCH|^Y RACK|^MEDIDOR|^MULTIMETRO|^PINZA/.test(
      u,
    )
  ) {
    return landingInventoryCategory(LANDING_CATEGORY.solucionesNegocio, line);
  }

  if (/^AUDIO,|^MOUSE |^TECLADO|^MOCHILA|^CARRY|^CARTUCHERA|^CONSOLAS|^SILLAS GAMER/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.accesorios, line);
  }

  if (
    /^ACC|^ACCESORIOS|^CASES, ACC|^MONITORES, ACC|^NOTEBOOK, ACC|^TABLET, ACC|^COMPONENTES, REPUESTOS/.test(
      u,
    )
  ) {
    return landingInventoryCategory(LANDING_CATEGORY.accesorios, line);
  }

  if (/^SERVICIO|^INTERNET, SERVICIOS|^GARANTIA EXTENDIDA|^MATERIALES|^SERVICIOS/.test(u)) {
    return 'Servicio Técnico';
  }

  if (/^MERCHANDISING|^MUESTRA|^T CELULARES|^T SMARTPHONES|^PROTEC -/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.accesorios, line);
  }

  if (/ENERGIA|ESTABILIZADOR/.test(u)) {
    return landingInventoryCategory(LANDING_CATEGORY.solucionesNegocio, 'Energía y respaldo');
  }

  if (/^PRODUCTOS SIN CLASIFICAR|^PRECIO STANDARD/.test(u)) {
    return 'Varios';
  }

  return landingInventoryCategory(LANDING_CATEGORY.solucionesNegocio, line || 'Varios');
}

/**
 * @param {string} code
 */
export function deltronProductIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `deltron-${slug || 'sin-codigo'}`;
}

/**
 * @param {string} line
 */
function normalizeProductLine(line) {
  return String(line ?? '')
    .replace(/\r/g, '')
    .replace(/\)\s*(>\d+)/, ') $1')
    .trim();
}

/**
 * @param {string} line
 */
export function parseDeltronProductLine(line) {
  const normalized = normalizeProductLine(line);
  if (!normalized || normalized.startsWith('CODIGO ')) return null;
  if (normalized.startsWith('--') || normalized.includes('deltron.com.pe')) return null;
  if (/^Pag\.\s+\d+/i.test(normalized)) return null;

  const codeMatch = normalized.match(/^([A-Z0-9][\w-]*)\s+(.+)$/);
  if (!codeMatch) return null;

  const code = codeMatch[1];
  let rest = codeMatch[2];

  let internalId = null;
  const idMatch = rest.match(/-\(\*(\d+)\)/);
  if (idMatch) {
    internalId = idMatch[1];
    rest = rest.replace(/-\(\*(\d+)\)/, ' ').trim();
  }

  const tailPatterns = [
    /^(.*?)\s+(>?)(\d+)\s+([\d.]+)\s+consultar\s+([A-Z])\s+(.+)$/i,
    /^(.*?)\s+(>?)(\d+)\s+([\d.]+)\s+([\d.]+)\s*%\s+([A-Z])\s+(.+)$/,
    /^(.*?)\s+(>?)(\d+)\s+([\d.]+)\s+([A-Z])\s+(.+)$/,
    /^(.*?)\s+(>?)(\d+)\s+([\d.]+)\s+([A-Z]{2})\s+(.+)$/,
    /^(.*?)\s+(>?)(\d+)\s+([\d.]+)\s+(.+)$/,
  ];

  /** @type {RegExpMatchArray | null} */
  let match = null;
  for (const pattern of tailPatterns) {
    match = rest.match(pattern);
    if (match) break;
  }
  if (!match) return null;

  let title;
  let stockRaw;
  let listUsd;
  let pgePercent = null;
  let warrantyCode = 'X';
  let brand;

  if (match.length === 7 && /consultar/i.test(String(match[0]))) {
    [, title, , stockRaw, listUsd, warrantyCode, brand] = match;
  } else if (match.length === 8 && String(match[5]).includes('%')) {
    [, title, , stockRaw, listUsd, pgePercent, warrantyCode, brand] = match;
  } else if (match.length === 7 && /^[A-Z]$/.test(String(match[5]))) {
    [, title, , stockRaw, listUsd, warrantyCode, brand] = match;
  } else if (match.length === 7 && /^[A-Z]{2}$/.test(String(match[5]))) {
    [, title, , stockRaw, listUsd, warrantyCode, brand] = match;
    warrantyCode = warrantyCode.slice(0, 1);
  } else if (match.length === 6) {
    [, title, , stockRaw, listUsd, brand] = match;
    const brandParts = String(brand).trim().split(/\s+/);
    if (brandParts.length > 1 && /^[A-Z]$/.test(brandParts[0])) {
      warrantyCode = brandParts[0];
      brand = brandParts.slice(1).join(' ');
    }
  } else {
    return null;
  }

  const listUsdNumber = Number.parseFloat(String(listUsd));
  if (!Number.isFinite(listUsdNumber)) return null;

  return {
    code,
    title: String(title).trim(),
    internalId,
    stock: parseDeltronStock(stockRaw),
    listUsd: listUsdNumber,
    pgePercent: pgePercent != null ? Number.parseFloat(String(pgePercent)) : null,
    warrantyCode: String(warrantyCode ?? 'X').trim().toUpperCase().slice(0, 1),
    brand: String(brand ?? '').trim() || null,
  };
}

/**
 * @param {string} text
 */
export function extractDeltronExchangeRate(text) {
  const match = String(text ?? '').match(/TIPO DE CAMBIO\s+([\d.]+)/i);
  const rate = match ? Number.parseFloat(match[1]) : Number.NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : 3.4;
}

/**
 * @param {string} text
 */
export function parseDeltronLpText(text, exchangeRate = extractDeltronExchangeRate(text)) {
  const lines = String(text ?? '').split(/\r?\n/);
  /** @type {ReturnType<typeof parseDeltronProductLine>[]} */
  const rows = [];
  const categories = new Set();
  let currentLine = 'Varios';

  for (const rawLine of lines) {
    const line = normalizeProductLine(rawLine);
    if (!line) continue;

    const headerMatch = line.match(/^CODIGO (.+?) STOCK PREC US/);
    if (headerMatch) {
      currentLine = headerMatch[1].trim();
      continue;
    }

    const parsed = parseDeltronProductLine(line);
    if (!parsed) continue;

    const category = mapDeltronLineToCategory(currentLine);
    categories.add(category);
    rows.push({
      ...parsed,
      deltronLine: currentLine,
      category,
      exchangeRate,
    });
  }

  return {
    exchangeRate,
    rowsRead: rows.length,
    products: rows,
    categories: [...categories],
  };
}

/**
 * @param {ReturnType<typeof parseDeltronLpText>['products'][number]} row
 */
export function buildDeltronLpProduct(row) {
  if (!row?.code || !row.title) return null;

  const pricesStack = buildDeltronPriceStack(row.listUsd, row.exchangeRate);
  const prices = ensureFullPrices({
    public: pricesStack.publico,
    tecnico: pricesStack.tecnico,
    mayorista: pricesStack.mayorista,
    distribuidor: pricesStack.mayorista > 0 ? pricesStack.mayorista : pricesStack.tecnico,
  });

  const suppliers =
    pricesStack.purchaseUsd > 0
      ? [{ name: SUPPLIER_DELTRON, purchase_price_usd: pricesStack.purchaseUsd }]
      : [{ name: SUPPLIER_DELTRON, purchase_price_usd: 0 }];

  const warranty = warrantyLabelFromCode(row.warrantyCode);

  /** @type {{ name: string; value: string }[]} */
  const attributes = [
    { name: 'Línea Deltron', value: row.deltronLine },
    { name: 'Garantía', value: warranty },
    { name: 'Precio lista USD', value: pricesStack.listUsd > 0 ? String(pricesStack.listUsd) : 'Consultar' },
    { name: 'Compra PEN', value: pricesStack.purchasePen > 0 ? String(pricesStack.purchasePen) : '—' },
    { name: 'Tipo de cambio', value: String(row.exchangeRate) },
  ];

  if (row.internalId) {
    attributes.push({ name: 'Código Deltron', value: row.internalId });
  }
  if (row.pgePercent != null && Number.isFinite(row.pgePercent)) {
    attributes.push({ name: '% PGE', value: `${row.pgePercent}%` });
  }

  return normalizeProductInput({
    id: deltronProductIdFromCode(row.code),
    code: row.code,
    name: row.title,
    description: row.title,
    brand: row.brand,
    category: row.category,
    currency: 'USD',
    stock: row.stock,
    prices,
    purchase_price_usd: pricesStack.purchaseUsd,
    suppliers,
    attributes: normalizeAttributes(attributes),
    image_url: null,
    gallery: [],
  });
}

/**
 * @param {Buffer | Uint8Array | ArrayBuffer} buffer
 */
export async function parseDeltronLpPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    const text = textResult.text ?? '';
    const parsed = parseDeltronLpText(text);
    const products = parsed.products
      .map((row) => buildDeltronLpProduct(row))
      .filter((product) => product != null && !isDeltronMerchandisingOrServiceProduct(product));

    return {
      ...parsed,
      textLength: text.length,
      products,
    };
  } finally {
    await parser.destroy();
  }
}
