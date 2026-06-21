import XLSX from 'xlsx';

import { normalizeAttributes } from './inventory-attributes.js';
import { normalizeProductInput } from './inventory-store.js';
import { concatenateModelos, formatRendLabel } from './repuestos-products-excel.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

export const CATEGORY_MAINFRAME = 'Multifuncionales, Multifuncionales Nuevas';
export const CATEGORY_ACCESORIOS = 'Accesorios';
export const CATEGORY_TONER_ORIGINAL = 'Toner, Toner Original';
export const CATEGORY_REPUESTOS_ORIGINAL = 'Repuestos, Repuestos Originales';

export const SUPPLIER_RICOH_PERU_SAC = 'Proveedor Ricoh del Peru SAC';
export const SUPPLIER_RICOH_PERU = 'Ricoh del Peru';

export const STARTER_TONER_SUFFIX = ' (Incluye Toner de Inicio 5,000 páginas)';

const DATA_START_ROW = 3;
const VALID_CLASSIFICATIONS = new Set([
  'Mainframe',
  'Instalación',
  'Accesorios',
  'Consumible',
  'Consumibles',
  'SUPPLIES',
  'PARTS',
]);

const TONER_TITLE_RE =
  /\bprint\s*cartridge\b|\bprint\s*cart\b|\bcartucho\b|\btoner\b/i;
const REPUESTO_TITLE_RE =
  /\bdrum\b|\bphotonductor\b|\bfusing\b|\btransfer\b|\broller\b|\bfilter\b|\bmaintenance\b|\bwaste\b|\bcleaning\b/i;

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
 * @param {unknown} code
 */
export function normalizeImportCode(code) {
  const value = String(code ?? '').trim();
  if (!value || value === '0') return '';
  return value;
}

function collapseSpaces(text) {
  return String(text ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} titulo
 */
export function isStarterTonerTitle(titulo) {
  return /\bstarter\s+toner\b/i.test(String(titulo ?? ''));
}

/**
 * @param {string} titulo
 * @param {string} [classification]
 */
export function isTonerConsumibleTitle(titulo, classification = '') {
  const text = collapseSpaces(titulo);
  if (!text) return false;
  if (isStarterTonerTitle(text)) return false;
  if (classification === 'SUPPLIES') return true;
  if (REPUESTO_TITLE_RE.test(text) && !TONER_TITLE_RE.test(text)) return false;
  return TONER_TITLE_RE.test(text);
}

/**
 * @param {string} titulo
 */
export function normalizeRicohOriginalTonerTitle(titulo) {
  let text = collapseSpaces(titulo);
  if (!text) return 'Toner Cartucho Original RICOH';

  const rules = [
    [/\bprint\s+cartridge\b/gi, 'Toner Cartucho Original RICOH'],
    [/\bprint\s+cart\b/gi, 'Toner Cartucho Original RICOH'],
    [/\bpri\s*nt\s*cart\b/gi, 'Toner Cartucho Original RICOH'],
  ];

  for (const [pattern, replacement] of rules) {
    text = text.replace(pattern, replacement);
  }

  return collapseSpaces(text);
}

/**
 * @param {{ titulo: string; yield: unknown; modelos: string }}
 */
export function buildOriginalTonerTitle({ titulo, yield: yieldValue, modelos }) {
  let name = normalizeRicohOriginalTonerTitle(titulo);
  const rendLabel = formatRendLabel(yieldValue);
  if (rendLabel && parseNumber(yieldValue) > 0) {
    name = `${name} — ${rendLabel} páginas al 5%`;
  }
  const modelSuffix = collapseSpaces(modelos);
  if (modelSuffix) {
    name = `${name} — ${modelSuffix}`;
  }
  return name;
}

/**
 * @param {{ titulo: string; modelos: string }}
 */
export function buildAccesorioTitle({ titulo, modelos }) {
  const base = collapseSpaces(titulo);
  const modelSuffix = collapseSpaces(modelos);
  if (!modelSuffix) return base;
  if (!base) return modelSuffix;
  return `${base} — ${modelSuffix}`;
}

/**
 * @param {{ titulo: string; modelos: string }}
 */
export function buildRepuestoImportTitle({ titulo, modelos }) {
  const base = collapseSpaces(titulo);
  const modelSuffix = collapseSpaces(modelos);
  if (!modelSuffix) return base;
  if (!base) return modelSuffix;
  return `${base} — ${modelSuffix}`;
}

/**
 * @param {import('./ricoh-lp-importacion-excel.js').RicohImportEntry} entry
 */
function pickBestPriceEntry(entries) {
  return (
    entries.find((entry) => entry.publico > 0) ??
    entries.find((entry) => entry.compra > 0) ??
    entries[0]
  );
}

/**
 * @param {Record<string, number>} existing
 * @param {Record<string, number>} incoming
 */
export function mergeAlternativeRolePrices(existing, incoming) {
  return {
    public: existing.public > 0 ? existing.public : incoming.public,
    tecnico: existing.tecnico > 0 ? existing.tecnico : incoming.tecnico,
    distribuidor:
      existing.distribuidor > 0 ? existing.distribuidor : incoming.distribuidor,
    mayorista: existing.mayorista > 0 ? existing.mayorista : incoming.mayorista,
  };
}

/**
 * @param {Array<{ name: string; purchase_price_usd: number }>} existing
 * @param {Array<{ name: string; purchase_price_usd: number }>} incoming
 */
export function mergeAlternativeSuppliers(existing, incoming) {
  const byName = new Map(
    (existing ?? []).map((supplier) => [supplier.name.trim().toLowerCase(), supplier]),
  );

  for (const supplier of incoming ?? []) {
    const key = supplier.name.trim().toLowerCase();
    const prev = byName.get(key);
    if (!prev || Number(prev.purchase_price_usd) <= 0) {
      byName.set(key, supplier);
    }
  }

  return [...byName.values()];
}

/**
 * @param {Array<{ name: string; value: string }>} attributes
 * @param {string} name
 * @param {string} value
 */
function upsertAttribute(attributes, name, value) {
  const trimmed = String(value ?? '').trim();
  const list = [...(attributes ?? [])];
  const index = list.findIndex((row) => row.name?.trim() === name);
  if (!trimmed) {
    return index === -1 ? list : list.filter((_, itemIndex) => itemIndex !== index);
  }
  if (index === -1) {
    return [...list, { name, value: trimmed }];
  }
  return list.map((row, itemIndex) =>
    itemIndex === index ? { ...row, name, value: trimmed } : row,
  );
}

/**
 * @typedef {Object} RicohImportEntry
 * @property {string} classification
 * @property {string} modelo
 * @property {string} code
 * @property {string} titulo
 * @property {number} compra
 * @property {number} mayorista
 * @property {number} tecnico
 * @property {number} publico
 * @property {string} uniNec
 * @property {unknown} yield
 */

/**
 * @typedef {Object} RicohImportBlock
 * @property {RicohImportEntry} mainframe
 * @property {RicohImportEntry[]} instalacion
 */

/**
 * @param {Array<unknown>} row
 * @returns {RicohImportEntry | null}
 */
export function mapRicohImportRow(row) {
  const classification = String(row[0] ?? '').trim();
  if (!classification || !VALID_CLASSIFICATIONS.has(classification)) {
    return null;
  }

  const modelo = collapseSpaces(row[1]);
  const code = normalizeImportCode(row[2]);
  const titulo = collapseSpaces(row[3]);
  const compra = parseNumber(row[7]);
  const mayorista = parseNumber(row[8]);
  const tecnico = parseNumber(row[9]);
  const publico = parseNumber(row[10]);
  const uniNec = collapseSpaces(row[11]);
  const yieldValue = row[12] !== '' && row[12] != null ? row[12] : '';

  if (classification === 'Instalación') {
    if (!titulo && !code) return null;
    return {
      classification,
      modelo,
      code,
      titulo,
      compra,
      mayorista,
      tecnico,
      publico,
      uniNec,
      yield: yieldValue,
    };
  }

  if (!code || !titulo) return null;

  return {
    classification,
    modelo,
    code,
    titulo,
    compra,
    mayorista,
    tecnico,
    publico,
    uniNec,
    yield: yieldValue,
  };
}

/**
 * @param {RicohImportEntry[]} entries
 */
export function groupEntriesByCode(entries) {
  /** @type {Map<string, RicohImportEntry[]>} */
  const byCode = new Map();

  for (const entry of entries) {
    const key = normalizeImportCode(entry.code).toLowerCase();
    if (!key) continue;
    const group = byCode.get(key);
    if (group) {
      group.push(entry);
    } else {
      byCode.set(key, [entry]);
    }
  }

  return byCode;
}

/**
 * @param {RicohImportEntry[]} entries
 */
function buildPriceIndex(entries) {
  const byCode = groupEntriesByCode(entries);
  /** @type {Map<string, RicohImportEntry>} */
  const index = new Map();
  for (const [code, group] of byCode.entries()) {
    index.set(code, pickBestPriceEntry(group));
  }
  return index;
}

/**
 * @param {RicohImportBlock} block
 * @param {Map<string, RicohImportEntry>} priceIndex
 */
export function buildInstallationBundle(block, priceIndex) {
  /** @type {string[]} */
  const lines = [];
  const totals = { compra: 0, mayorista: 0, tecnico: 0, publico: 0 };
  let starterSuffix = '';

  for (const row of block.instalacion) {
    if (isStarterTonerTitle(row.titulo)) {
      starterSuffix = STARTER_TONER_SUFFIX;
      lines.push(`• ${row.titulo} (incluido en el equipo)`);
      continue;
    }

    const linked = row.code ? priceIndex.get(row.code.toLowerCase()) : null;
    const label = row.code
      ? `${row.titulo || linked?.titulo || 'Ítem'} [${row.code}]`
      : row.titulo;
    lines.push(`• ${label}`);

    if (linked) {
      totals.compra += linked.compra;
      totals.mayorista += linked.mayorista;
      totals.tecnico += linked.tecnico;
      totals.publico += linked.publico;
    }
  }

  const hasTotals =
    totals.compra > 0 ||
    totals.mayorista > 0 ||
    totals.tecnico > 0 ||
    totals.publico > 0;

  if (hasTotals) {
    lines.push(
      `Coste instalación — Compra: $${totals.compra.toFixed(2)} | Mayorista: $${totals.mayorista.toFixed(2)} | Técnico: $${totals.tecnico.toFixed(2)} | Público: $${totals.publico.toFixed(2)}`,
    );
  }

  return {
    text: lines.join('\n'),
    totals,
    starterSuffix,
  };
}

/**
 * @param {RicohImportEntry} mainframe
 * @param {{ compra: number; mayorista: number; tecnico: number; publico: number }} installTotals
 */
function buildBundledMainframePrices(mainframe, installTotals) {
  return {
    compra: roundSalePriceToNinety(mainframe.compra + installTotals.compra),
    mayorista: roundSalePriceToNinety(mainframe.mayorista + installTotals.mayorista),
    tecnico: roundSalePriceToNinety(mainframe.tecnico + installTotals.tecnico),
    publico: roundSalePriceToNinety(mainframe.publico + installTotals.publico),
  };
}

/**
 * @param {string} code
 */
function productIdFromCode(prefix, code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${slug || 'sin-codigo'}`;
}

/**
 * @param {RicohImportEntry[]} group
 * @param {string} category
 * @param {string} supplierName
 * @param {(args: { titulo: string; modelos: string; yield: unknown }) => string} buildTitle
 */
function buildGroupedCatalogProduct(group, category, supplierName, buildTitle, idPrefix) {
  const priceSource = pickBestPriceEntry(group);
  const modelos = concatenateModelos(group.map((entry) => entry.modelo));
  const name = buildTitle({
    titulo: priceSource.titulo,
    modelos,
    yield: group.find((entry) => parseNumber(entry.yield) > 0)?.yield ?? priceSource.yield,
  });

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [];
  if (modelos) attributes.push({ name: 'Modelo de equipo', value: modelos });

  const rendLabel = formatRendLabel(
    group.find((entry) => parseNumber(entry.yield) > 0)?.yield ?? priceSource.yield,
  );
  if (
    category === CATEGORY_TONER_ORIGINAL &&
    rendLabel &&
    parseNumber(priceSource.yield) > 0
  ) {
    attributes.push({ name: 'Rendimiento (5%)', value: rendLabel });
  }

  const uniNotes = [
    ...new Set(
      group
        .map((entry) => entry.uniNec)
        .filter(Boolean)
        .map((value) => `Uni Nec: ${value}`),
    ),
  ];
  if (uniNotes.length > 0) {
    attributes.push({ name: 'Nota', value: uniNotes.join(' · ') });
  }

  const compra = parseNumber(priceSource.compra);
  const suppliers =
    compra > 0 ? [{ name: supplierName, purchase_price_usd: compra }] : [];

  return normalizeProductInput({
    id: productIdFromCode(idPrefix, priceSource.code),
    code: priceSource.code,
    name,
    description: name,
    brand: 'Ricoh',
    category,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: {
      public: roundSalePriceToNinety(priceSource.publico),
      tecnico: roundSalePriceToNinety(priceSource.tecnico),
      distribuidor: roundSalePriceToNinety(priceSource.tecnico),
      mayorista: roundSalePriceToNinety(priceSource.mayorista),
    },
    purchase_price_usd: compra,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {RicohImportBlock} block
 * @param {Map<string, RicohImportEntry>} priceIndex
 */
function buildMainframeProduct(block, priceIndex) {
  const { mainframe, instalacion } = block;
  const installation = buildInstallationBundle({ mainframe, instalacion }, priceIndex);
  const bundled = buildBundledMainframePrices(mainframe, installation.totals);

  let name = mainframe.titulo;
  if (installation.starterSuffix && !name.includes('Toner de Inicio')) {
    name = `${name}${installation.starterSuffix}`;
  }

  const bundleLine = installation.totals.publico > 0
    ? `Paquete instalado — Compra: $${bundled.compra.toFixed(2)} | Mayorista: $${bundled.mayorista.toFixed(2)} | Técnico: $${bundled.tecnico.toFixed(2)} | Público: $${bundled.publico.toFixed(2)}`
    : '';
  const installationText = [installation.text, bundleLine].filter(Boolean).join('\n');

  /** @type {Array<{ name: string; value: string }>} */
  const attributes = [
    { name: 'Modelo de equipo', value: mainframe.modelo || mainframe.titulo },
  ];
  if (installationText) {
    attributes.push({ name: 'Instalación', value: installationText });
  }

  const compra = parseNumber(mainframe.compra);
  const suppliers =
    compra > 0 ? [{ name: SUPPLIER_RICOH_PERU_SAC, purchase_price_usd: compra }] : [];

  return normalizeProductInput({
    id: productIdFromCode('ricoh-mf', mainframe.code),
    code: mainframe.code,
    name,
    description: name,
    brand: 'Ricoh',
    category: CATEGORY_MAINFRAME,
    currency: 'USD',
    stock: 0,
    image_url: null,
    gallery: [],
    prices: {
      public: bundled.publico,
      tecnico: bundled.tecnico,
      distribuidor: bundled.tecnico,
      mayorista: bundled.mayorista,
    },
    purchase_price_usd: bundled.compra,
    attributes: normalizeAttributes(attributes),
    suppliers,
  });
}

/**
 * @param {Array<Array<unknown>>} rows
 */
export function collectRicohImportBlocks(rows) {
  /** @type {RicohImportEntry[]} */
  const catalogEntries = [];
  /** @type {RicohImportBlock[]} */
  const blocks = [];
  /** @type {RicohImportBlock | null} */
  let current = null;

  for (let index = DATA_START_ROW; index < rows.length; index += 1) {
    const row = rows[index];
    if (!Array.isArray(row)) continue;

    const entry = mapRicohImportRow(row);
    if (!entry) continue;

    if (entry.classification === 'Mainframe') {
      if (current) blocks.push(current);
      current = { mainframe: entry, instalacion: [] };
      continue;
    }

    if (entry.classification === 'Instalación') {
      if (current) current.instalacion.push(entry);
      continue;
    }

    catalogEntries.push(entry);
  }

  if (current) blocks.push(current);
  return { blocks, catalogEntries };
}

/**
 * @param {Buffer} buffer
 */
export function parseRicohLpImportacionWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  });

  const { blocks, catalogEntries } = collectRicohImportBlocks(rows);
  const priceIndex = buildPriceIndex(catalogEntries);

  /** @type {ReturnType<typeof normalizeProductInput>[]} */
  const products = [];

  for (const block of blocks) {
    products.push(buildMainframeProduct(block, priceIndex));
  }

  const accesorios = catalogEntries.filter((entry) => entry.classification === 'Accesorios');
  const tonerEntries = catalogEntries.filter(
    (entry) =>
      entry.classification === 'SUPPLIES' ||
      ((entry.classification === 'Consumible' || entry.classification === 'Consumibles') &&
        isTonerConsumibleTitle(entry.titulo, entry.classification)),
  );
  const repuestoEntries = catalogEntries.filter(
    (entry) =>
      entry.classification === 'PARTS' ||
      ((entry.classification === 'Consumible' || entry.classification === 'Consumibles') &&
        !isTonerConsumibleTitle(entry.titulo, entry.classification)),
  );

  for (const group of groupEntriesByCode(accesorios).values()) {
    products.push(
      buildGroupedCatalogProduct(
        group,
        CATEGORY_ACCESORIOS,
        SUPPLIER_RICOH_PERU,
        ({ titulo, modelos }) => buildAccesorioTitle({ titulo, modelos }),
        'ricoh-acc',
      ),
    );
  }

  for (const group of groupEntriesByCode(tonerEntries).values()) {
    products.push(
      buildGroupedCatalogProduct(
        group,
        CATEGORY_TONER_ORIGINAL,
        SUPPLIER_RICOH_PERU,
        ({ titulo, modelos, yield: yieldValue }) =>
          buildOriginalTonerTitle({ titulo, modelos, yield: yieldValue }),
        'ricoh-toner',
      ),
    );
  }

  for (const group of groupEntriesByCode(repuestoEntries).values()) {
    products.push(
      buildGroupedCatalogProduct(
        group,
        CATEGORY_REPUESTOS_ORIGINAL,
        SUPPLIER_RICOH_PERU,
        ({ titulo, modelos }) => buildRepuestoImportTitle({ titulo, modelos }),
        'ricoh-rep',
      ),
    );
  }

  return products;
}
