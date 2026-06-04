import * as XLSX from 'xlsx';

import { getSupabaseAdmin } from './supabase-auth.js';

const VENTAS_HEADER_KEYS = [
  'fecfac',
  'fecven',
  'documento',
  'serie',
  'numero',
  'nro_ruc',
  'nombre_razon_social',
  'vendedor',
  'usuario',
  'moneda',
  'total',
  'tipo_cambio',
  'importe_soles',
  'descuento',
  'f_pago1',
  'cuenta1',
  'n_operacion1',
  'm1',
  'importe',
  'tc2',
  'dif_camb',
  'monto1',
  'f_pago2',
  'cuenta2',
  'n_operacion2',
  'monto2',
  'f_pago3',
  'cuenta3',
  'n_operacion3',
  'monto3',
  'saldo',
  'observaciones',
  'doc_relacionado',
  'mas_datos',
  'hora',
];

const EXCEL_HEADER_TO_KEY = new Map([
  ['FECFAC', 'fecfac'],
  ['FECVEN', 'fecven'],
  ['DOCUMENTO', 'documento'],
  ['SERIE', 'serie'],
  ['NUMERO', 'numero'],
  ['NRO_RUC', 'nro_ruc'],
  ['NOMBRE O RAZON SOCIAL', 'nombre_razon_social'],
  ['VENDEDOR', 'vendedor'],
  ['USUARIO', 'usuario'],
  ['MONEDA', 'moneda'],
  ['TOTAL', 'total'],
  ['T.C', 'tipo_cambio'],
  ['IMPORTE S/', 'importe_soles'],
  ['DESCUENTO', 'descuento'],
  ['F.PAGO1', 'f_pago1'],
  ['CUENTA1', 'cuenta1'],
  ['N.OPERACION', 'n_operacion1'],
  ['(M)', 'm1'],
  ['IMPORTE', 'importe'],
  ['T.C.', 'tc2'],
  ['DIF.CAMB', 'dif_camb'],
  ['MONTO1', 'monto1'],
  ['F.PAGO2', 'f_pago2'],
  ['CUENTA2', 'cuenta2'],
  ['MONTO2', 'monto2'],
  ['F.PAGO3', 'f_pago3'],
  ['CUENTA3', 'cuenta3'],
  ['MONTO3', 'monto3'],
  ['SALDO', 'saldo'],
  ['OBSERVACION', 'observaciones'],
  ['OBSERVACIONES', 'observaciones'],
  ['DOC. RELACIONADO', 'doc_relacionado'],
  ['MAS DATOS', 'mas_datos'],
  ['HORA', 'hora'],
]);

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function cellToString(value) {
  if (value == null) return '';
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value).trim();
}

/**
 * @param {unknown} value
 * @returns {Date | null}
 */
export function excelValueToDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H ?? 0, parsed.M ?? 0, parsed.S ?? 0);
    }
  }
  const text = cellToString(value);
  if (!text) return null;
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]) - 1;
    const year = Number(slash[3]);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const iso = new Date(text);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function excelValueToIso(value) {
  const date = excelValueToDate(value);
  return date ? date.toISOString() : null;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function parseReportDate(value) {
  const date = excelValueToDate(value);
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * @param {string | null} isoDate YYYY-MM-DD
 * @returns {string | null}
 */
function firstDayOfMonth(isoDate) {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-01`;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function cellToNumber(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = cellToString(value).replace(/,/g, '');
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

/**
 * @param {string} documento
 * @param {string} serie
 * @param {string} numero
 */
export function buildVentasExternalKey(documento, serie, numero) {
  return [documento, serie, numero]
    .map((part) =>
      String(part ?? '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' '),
    )
    .join('|');
}

/**
 * @param {string} moneda
 */
function normalizeCurrency(moneda) {
  const upper = normalizeHeader(moneda);
  if (upper.includes('SOL')) return 'PEN';
  if (upper.includes('DOLAR') || upper === 'USD') return 'USD';
  return upper || 'USD';
}

/**
 * @param {Buffer | ArrayBuffer | Uint8Array} buffer
 */
export function parseVentasWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { meta: {}, rows: [] };
  }

  const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: true,
  });

  /** @type {Record<string, string>} */
  let meta = {
    empresa: '',
    sucursal: '',
    periodStart: null,
    periodEnd: null,
    periodMonth: null,
  };

  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    const label = normalizeHeader(row[0]);
    if (label === 'EMPRESA') meta.empresa = cellToString(row[1]);
    if (label === 'SUCURSAL') meta.sucursal = cellToString(row[1]);
    if (label === 'DESDE') {
      meta.periodStart = parseReportDate(row[1]);
      const hastaLabel = normalizeHeader(row[13]);
      if (hastaLabel === 'HASTA') {
        meta.periodEnd = parseReportDate(row[14]);
      }
    }
  }

  meta.periodMonth = firstDayOfMonth(meta.periodStart);

  const headerRowIndex = matrix.findIndex(
    (row) => Array.isArray(row) && normalizeHeader(row[0]) === 'FECFAC',
  );
  if (headerRowIndex < 0) {
    return { meta, rows: [] };
  }

  const headerRow = matrix[headerRowIndex];
  /** @type {Map<number, string>} */
  const colKeyByIndex = new Map();
  let nOperacionCount = 0;

  for (let col = 0; col < headerRow.length; col += 1) {
    const normalized = normalizeHeader(headerRow[col]);
    let key = EXCEL_HEADER_TO_KEY.get(normalized);
    if (normalized === 'N.OPERACION') {
      nOperacionCount += 1;
      key = nOperacionCount === 1 ? 'n_operacion1' : nOperacionCount === 2 ? 'n_operacion2' : 'n_operacion3';
    }
    if (key) colKeyByIndex.set(col, key);
  }

  /** @type {Array<Record<string, unknown>>} */
  const rows = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex];
    if (!Array.isArray(row)) continue;

    /** @type {Record<string, unknown>} */
    const record = {};
    for (const [col, key] of colKeyByIndex.entries()) {
      record[key] = row[col] ?? '';
    }

    const documento = cellToString(record.documento);
    const serie = cellToString(record.serie);
    const numero = cellToString(record.numero);
    if (!documento && !serie && !numero) continue;

    const invoiceIso = excelValueToIso(record.fecfac);
    if (!invoiceIso) continue;

    record.invoice_date = invoiceIso;
    record.due_date = excelValueToIso(record.fecven);
    record.external_key = buildVentasExternalKey(documento, serie, numero);
    record.report_period_start = meta.periodStart;
    record.report_period_end = meta.periodEnd;
    record.report_period_month = meta.periodMonth;

    rows.push(record);
  }

  return { meta, rows };
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ sourceFilename?: string }} options
 */
function rowToDbRecord(row, options = {}) {
  const documento = cellToString(row.documento);
  const serie = cellToString(row.serie);
  const numero = cellToString(row.numero);
  const taxId = cellToString(row.nro_ruc) || null;
  const currency = normalizeCurrency(cellToString(row.moneda));

  /** @type {Record<string, string | number>} */
  const reportData = {};
  for (const key of VENTAS_HEADER_KEYS) {
    const value = row[key];
    if (value != null && value !== '') {
      reportData[key] = typeof value === 'number' ? value : cellToString(value);
    }
  }

  const periodMonth = row.report_period_month;
  if (!periodMonth || typeof periodMonth !== 'string') {
    throw new Error('Falta report_period_month en la fila');
  }

  return {
    external_key: String(row.external_key),
    invoice_date: String(row.invoice_date),
    due_date: row.due_date ? String(row.due_date) : null,
    document_type: documento || 'DESCONOCIDO',
    serie,
    numero,
    tax_id: taxId,
    customer_name: cellToString(row.nombre_razon_social) || '—',
    seller_name: cellToString(row.vendedor) || null,
    user_name: cellToString(row.usuario) || null,
    currency,
    total: cellToNumber(row.total) ?? 0,
    exchange_rate: cellToNumber(row.tipo_cambio),
    total_pen: cellToNumber(row.importe_soles),
    payment_date: cellToString(row.f_pago1) || null,
    related_doc: cellToString(row.doc_relacionado) || null,
    observations: cellToString(row.observaciones) || null,
    hora: cellToString(row.hora) || null,
    report_period_start: row.report_period_start ?? null,
    report_period_end: row.report_period_end ?? null,
    report_period_month: periodMonth,
    source_filename: options.sourceFilename ?? null,
    report_data: reportData,
    updated_at: new Date().toISOString(),
  };
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ sourceFilename?: string }} [options]
 */
export async function importVentasDocumentRows(rows, options = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase no configurado');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  /** @type {Array<{ row: number; message: string }>} */
  const errors = [];

  /** @type {Map<string, string | null>} */
  const customerByTaxId = new Map();

  async function resolveCustomerId(taxId) {
    if (!taxId) return null;
    if (customerByTaxId.has(taxId)) {
      return customerByTaxId.get(taxId) ?? null;
    }
    const { data } = await supabase
      .from('store_customers')
      .select('id')
      .eq('tax_id', taxId)
      .maybeSingle();
    const id = data?.id ?? null;
    customerByTaxId.set(taxId, id);
    return id;
  }

  for (let index = 0; index < rows.length; index += 1) {
    try {
      const dbRow = rowToDbRecord(rows[index], options);
      const customerId = await resolveCustomerId(dbRow.tax_id);
      const now = new Date().toISOString();
      const payload = {
        ...dbRow,
        customer_id: customerId,
        created_at: now,
        updated_at: now,
      };

      const { data: existing, error: lookupError } = await supabase
        .from('imported_sale_documents')
        .select('id')
        .eq('external_key', dbRow.external_key)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing?.id) {
        const { error } = await supabase
          .from('imported_sale_documents')
          .update({
            ...dbRow,
            customer_id: customerId,
            updated_at: now,
          })
          .eq('id', existing.id);
        if (error) throw error;
        updated += 1;
      } else {
        const { error } = await supabase.from('imported_sale_documents').insert(payload);
        if (error) throw error;
        created += 1;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(/** @type {{ message: unknown }} */ (error).message)
            : 'Error desconocido';
      errors.push({
        row: index + 1,
        message,
      });
      skipped += 1;
    }
  }

  return { created, updated, skipped, errors, total: rows.length };
}

export const IMPORTED_SALE_ADMIN_SELECT = `
  id,
  external_key,
  invoice_date,
  due_date,
  document_type,
  serie,
  numero,
  tax_id,
  customer_name,
  seller_name,
  user_name,
  currency,
  total,
  exchange_rate,
  total_pen,
  payment_date,
  related_doc,
  observations,
  hora,
  report_period_start,
  report_period_end,
  report_period_month,
  customer_id,
  source_filename,
  report_data,
  created_at,
  updated_at,
  customer:store_customers (
    id,
    full_name,
    company_name,
    tax_id,
    email
  )
`;
