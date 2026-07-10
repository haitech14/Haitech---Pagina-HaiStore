import XLSX from 'xlsx';

import { normalizeProductCode } from '../../shared/product-code-prefix.js';
import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import {
  applyMarginSalePriceBump,
  setPrimarySupplier,
  SUPPLIER_RICOH_DEL_PERU,
} from './lp-price-bump.js';
import { formatRendLabel } from './repuestos-products-excel.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

export { SUPPLIER_RICOH_DEL_PERU };
export const REPUESTOS_CATEGORY = 'Repuestos';
export const MODELO_SEPARATOR = ' / ';
export const LP_REPUESTOS_SHEET_CANDIDATES = ['REPUESTOS BN ', 'REPUESTOS BN', 'Repuestos BN'];

/** Traducciones frecuentes cuando la hoja auxiliar no trae nota en español. */
const FALLBACK_TRANSLATIONS = {
  'photoconductor unit': 'unidad de imagen',
  'hot roller': 'rodillo de calor',
  'pressure roller': 'rodillo de presión',
  'ball bearing': 'rodaja / bocina',
  'plain shaft bearing': 'seguro de rodaja',
  'stripper pawl spring': 'resorte de uña de calor',
  'stripper pawls': 'uñas de fusor',
  'stripper pawl': 'uña de fusor',
  'fusing unit': 'unidad fusora',
  'paper feed roller': 'rueda de alimentación',
  'friction pad': 'goma de separación',
  'transfer roller': 'rodillo de transferencia',
  'feed roller': 'rueda de alimentación',
  'pickup roller': 'rueda de pickup',
  'pick-up roller': 'rueda de pickup',
  'pick roller': 'rueda de pickup',
  'reverse roller': 'rueda de reversa',
  'separation roller': 'rueda de separación',
  'paper feed sensor': 'sensor de alimentación',
  'duplex unit': 'unidad dúplex',
  'waste toner bottle': 'botella de tóner residual',
  'exhaust filter': 'filtro de escape',
  'development unit': 'unidad de revelado',
  'developer': 'revelador',
  drum: 'cilindro',
  'cleaning blade': 'cuchilla de limpieza',
  'blade:cleaning': 'cuchilla de limpieza',
  'transfer unit': 'unidad de transferencia',
  'itb unit': 'unidad de transferencia intermedia',
  pcu: 'unidad de imagen (PCU)',
  pcdu: 'unidad de imagen/revelado (PCDU)',
  'coating bar': 'barra lubricadora',
  'charge roller': 'rodillo de carga',
};

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
 * @param {string} code
 */
export function repuestoWebProductIdFromCode(code) {
  const slug = normalizeProductCode(code)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `repuesto-${slug || 'sin-codigo'}`;
}

/**
 * Extrae inglés + traducción española desde textos tipo «EN - es» o «EN (es)».
 * @param {string} description
 * @returns {{ english: string; translation: string }}
 */
export function splitEnglishAndSpanish(description) {
  const raw = cellText(description);
  if (!raw) return { english: '', translation: '' };

  const paren = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren && /[a-záéíóúñü]/i.test(paren[2])) {
    return { english: cellText(paren[1]), translation: cellText(paren[2]) };
  }

  const dashIdx = raw.search(/\s+-\s+/);
  if (dashIdx !== -1) {
    const english = cellText(raw.slice(0, dashIdx));
    const translation = cellText(raw.slice(dashIdx).replace(/^\s*-\s*/, ''));
    if (
      translation &&
      /[a-záéíóúñü]|unidad|rodillo|rueda|goma|fusor|imagen|cilindro|cuchilla|filtro|revelado|transfer|bocina|resorte|uña|seguro|alimentacion|alimentación|separacion|separación|presion|presión|calor|sensor|bandeja|bypass/i.test(
        translation,
      )
    ) {
      return { english, translation };
    }
  }

  // «EN-es» pegado (sin espacios alrededor del guion)
  const glued = raw.match(/^(.+?)-([a-záéíóúñü].+)$/i);
  if (glued && glued[2].split(/\s+/).length <= 12) {
    return { english: cellText(glued[1]), translation: cellText(glued[2]) };
  }

  const spanishTail =
    /^(.+?)\s+((?:unidad|rodillo|rueda|goma|fusor|imagen|cilindro|cuchilla|filtro|revelado|transfer|bocina|resorte|uña|seguro|alimentaci[oó]n|separaci[oó]n|presi[oó]n|calor|sensor|bandeja|bypass)[\s\S]*)$/i.exec(
      raw,
    );
  if (spanishTail) {
    return { english: cellText(spanishTail[1]), translation: cellText(spanishTail[2]) };
  }

  return { english: raw, translation: '' };
}

/**
 * @param {string} english
 */
export function fallbackTranslationForDescription(english) {
  const key = cellText(english).toLowerCase();
  if (!key) return '';

  if (FALLBACK_TRANSLATIONS[key]) return FALLBACK_TRANSLATIONS[key];

  for (const [needle, translation] of Object.entries(FALLBACK_TRANSLATIONS)) {
    if (key.startsWith(needle) || key.includes(needle)) return translation;
  }

  return '';
}

/**
 * @param {string[]} modelos
 */
export function concatenateLpRepuestosModelos(modelos) {
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
 * Nombre: Descripción (traducción) Original Modelo (rend págs al 5%).
 * @param {{ descripcion: string; translation?: string; modelo: string; rend: unknown }}
 */
export function buildLpRepuestosWebProductName({
  descripcion,
  translation = '',
  modelo,
  rend,
}) {
  const { english, translation: embedded } = splitEnglishAndSpanish(descripcion);
  const base = english || cellText(descripcion);
  const es = cellText(translation) || embedded || fallbackTranslationForDescription(base);
  const modeloSuffix = cellText(modelo);

  /** @type {string[]} */
  const parts = [];
  if (base) parts.push(base);
  if (es) parts.push(`(${es})`);
  parts.push('Original');
  if (modeloSuffix) parts.push(modeloSuffix);

  let title = parts.join(' ').replace(/\s{2,}/g, ' ').trim();
  const rendLabel = formatRendLabel(rend);
  if (rendLabel) {
    title = `${title} (${rendLabel} págs al 5%)`;
  }
  return title;
}

/**
 * @param {import('xlsx').WorkSheet} sheet
 * @param {unknown[][]} rows
 * @param {number} [colIndex]
 */
export function fillMergedColumnCells(sheet, rows, colIndex = 0) {
  const merges = sheet['!merges'] ?? [];
  for (const merge of merges) {
    if (merge.s.c !== colIndex || merge.e.c !== colIndex) continue;
    const topValue = cellText(rows[merge.s.r]?.[colIndex]);
    if (!topValue) continue;
    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) continue;
      if (!cellText(row[colIndex])) row[colIndex] = topValue;
    }
  }
}

/**
 * @param {unknown[][]} rows
 * @returns {{ byCode: Map<string, string>; byEnglish: Map<string, string> }}
 */
export function buildTranslationMapFromAuxRows(rows) {
  /** @type {Map<string, string>} */
  const byCode = new Map();
  /** @type {Map<string, string>} */
  const byEnglish = new Map();

  for (const row of rows) {
    const code = normalizeProductCode(cellText(row?.[1])).toLowerCase();
    const desc = cellText(row?.[2]);
    if (!desc) continue;
    const { english, translation } = splitEnglishAndSpanish(desc);
    if (!translation) continue;
    if (code && !byCode.has(code)) byCode.set(code, translation);
    const enKey = english.toLowerCase();
    if (enKey && !byEnglish.has(enKey)) byEnglish.set(enKey, translation);
  }

  return { byCode, byEnglish };
}

/**
 * @param {{ byCode: Map<string, string>; byEnglish: Map<string, string> }} translationMap
 * @param {string} code
 * @param {string} descripcion
 */
export function resolveTranslation(translationMap, code, descripcion) {
  const codeKey = normalizeProductCode(code).toLowerCase();
  const fromCode = translationMap.byCode.get(codeKey);
  if (fromCode) return fromCode;

  const { english, translation } = splitEnglishAndSpanish(descripcion);
  if (translation) return translation;

  const fromEn = translationMap.byEnglish.get(english.toLowerCase());
  if (fromEn) return fromEn;

  return fallbackTranslationForDescription(english || descripcion);
}

/**
 * @typedef {Object} LpRepuestosWebEntry
 * @property {number} rowIndex
 * @property {string} modelo
 * @property {string} code
 * @property {string} descripcion
 * @property {unknown} rend
 * @property {number} publico
 * @property {number} tecnico
 * @property {number} mayorista
 * @property {number} canal
 * @property {number} oferta
 * @property {string} observacion
 * @property {string} translation
 */

/**
 * @param {unknown[]} row
 * @param {number} rowIndex
 * @param {string} carryModelo
 * @param {Map<string, string>} translationMap
 */
export function mapLpRepuestosWebRow(
  row,
  rowIndex,
  carryModelo = '',
  translationMap = { byCode: new Map(), byEnglish: new Map() },
) {
  const modeloCell = cellText(row?.[0]);
  const code = normalizeProductCode(cellText(row?.[1]));
  const descripcion = cellText(row?.[2]);

  if (!code && !descripcion && !modeloCell) {
    return { entry: null, carryModelo, skipReason: 'fila vacía' };
  }

  if (/^codigo$/i.test(code) || /^descripcion$/i.test(descripcion) || /^modelo$/i.test(modeloCell)) {
    return { entry: null, carryModelo: '', skipReason: 'encabezado' };
  }

  if (!code || !descripcion) {
    return {
      entry: null,
      carryModelo: modeloCell || carryModelo,
      skipReason: !code ? 'sin código' : 'sin descripción',
    };
  }

  const modelo = modeloCell || carryModelo;
  const oferta = parseNumber(row?.[8]);
  const observacion = cellText(row?.[9]);

  return {
    entry: {
      rowIndex,
      modelo,
      code,
      descripcion,
      rend: row?.[3] !== '' && row?.[3] != null ? row[3] : '',
      publico: parseNumber(row?.[4]),
      tecnico: parseNumber(row?.[5]),
      mayorista: parseNumber(row?.[6]),
      canal: parseNumber(row?.[7]),
      oferta,
      observacion,
      translation: resolveTranslation(translationMap, code, descripcion),
    },
    carryModelo: modelo,
  };
}

/**
 * @param {LpRepuestosWebEntry[]} entries
 */
export function groupLpRepuestosEntriesByCode(entries) {
  /** @type {Map<string, LpRepuestosWebEntry[]>} */
  const byCode = new Map();
  for (const entry of entries) {
    const key = entry.code.trim().toLowerCase();
    const group = byCode.get(key);
    if (group) group.push(entry);
    else byCode.set(key, [entry]);
  }
  return byCode;
}

/**
 * @param {LpRepuestosWebEntry[]} entries
 */
export function mergeLpRepuestosEntriesToProduct(entries) {
  if (!entries.length) return null;

  const first = entries[0];
  const modelosConcat = concatenateLpRepuestosModelos(entries.map((entry) => entry.modelo));
  const translation =
    entries.map((entry) => entry.translation).find((value) => cellText(value)) || first.translation;

  const name = buildLpRepuestosWebProductName({
    descripcion: first.descripcion,
    translation,
    modelo: modelosConcat,
    rend: first.rend,
  });

  /** @type {string[]} */
  const obsParts = [];
  for (const entry of entries) {
    const note = cellText(entry.observacion);
    if (note && !obsParts.includes(note)) obsParts.push(note);
    if (entry.oferta > 0) {
      const ofertaNote = `Canal precio x6 unidades: USD ${entry.oferta.toFixed(2)}`;
      if (!obsParts.includes(ofertaNote)) obsParts.push(ofertaNote);
    }
  }
  const observacion = obsParts.join('\n');

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelosConcat) {
    attributes.push({ name: 'Modelo de equipo', value: modelosConcat });
  }
  const rendLabel = formatRendLabel(first.rend);
  if (rendLabel) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }
  if (translation) {
    attributes.push({ name: 'Traducción', value: translation });
  }
  if (observacion) {
    attributes.push({ name: 'Observaciones', value: observacion });
  }

  const canalPrice = first.canal;
  const { prices } = applyMarginSalePriceBump(
    {
      public: first.publico,
      tecnico: first.tecnico,
      mayorista: first.mayorista,
      distribuidor: first.tecnico,
    },
    canalPrice,
    { round: roundSalePriceToNinety },
  );

  const suppliers = setPrimarySupplier([], canalPrice, SUPPLIER_RICOH_DEL_PERU);

  return normalizeProductInput({
    id: repuestoWebProductIdFromCode(first.code),
    code: first.code,
    name,
    description: observacion ? `${name}\n\n${observacion}` : name,
    brand: 'Ricoh',
    category: REPUESTOS_CATEGORY,
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
 * @param {import('xlsx').WorkBook} workbook
 */
function pickRepuestosSheet(workbook) {
  for (const candidate of LP_REPUESTOS_SHEET_CANDIDATES) {
    if (workbook.Sheets[candidate]) return candidate;
  }
  const fuzzy = workbook.SheetNames.find((name) => /repuestos\s*bn/i.test(name));
  if (fuzzy) return fuzzy;
  const plain = workbook.SheetNames.find((name) => /^repuestos$/i.test(name.trim()));
  return plain ?? workbook.SheetNames[0] ?? null;
}

/**
 * @param {import('xlsx').WorkBook} workbook
 */
function loadAuxTranslationMap(workbook) {
  const auxName =
    workbook.SheetNames.find((name) => /^repuestos\s*\(2\)$/i.test(name.trim())) ??
    workbook.SheetNames.find((name) => /repuestos/i.test(name) && /\(2\)/.test(name));
  if (!auxName) return { byCode: new Map(), byEnglish: new Map() };
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[auxName], {
    header: 1,
    defval: '',
  });
  return buildTranslationMapFromAuxRows(rows);
}

/**
 * @param {Buffer} buffer
 * @returns {{ products: ReturnType<typeof normalizeProductInput>[]; skipped: Array<{ row: number; reason: string }>; sheetName: string; translationHits: number }}
 */
export function parseLpRepuestosWebWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = pickRepuestosSheet(workbook);
  if (!sheetName) return { products: [], skipped: [], sheetName: '', translationHits: 0 };

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });
  fillMergedColumnCells(sheet, rows, 0);

  const translationMap = loadAuxTranslationMap(workbook);

  /** @type {LpRepuestosWebEntry[]} */
  const entries = [];
  /** @type {Array<{ row: number; reason: string }>} */
  const skipped = [];
  let carryModelo = '';
  let translationHits = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const { entry, carryModelo: nextModelo, skipReason } = mapLpRepuestosWebRow(
      rows[index],
      index,
      carryModelo,
      translationMap,
    );
    carryModelo = nextModelo;
    if (entry) {
      if (entry.translation) translationHits += 1;
      entries.push(entry);
      continue;
    }
    if (skipReason && skipReason !== 'fila vacía') {
      skipped.push({ row: index + 1, reason: skipReason });
    }
  }

  const byCode = groupLpRepuestosEntriesByCode(entries);
  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];
  for (const group of byCode.values()) {
    const product = mergeLpRepuestosEntriesToProduct(group);
    if (product) products.push(product);
  }

  return { products, skipped, sheetName, translationHits };
}
