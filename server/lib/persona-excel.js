import * as XLSX from 'xlsx';

import { mapHaiSupportTipoClienteToRole } from './haisupport-customers.js';
import { ensureStoreCustomerFromHaitechClient } from './haisupport-bridge.js';
import { getSupabaseAdmin } from './supabase-auth.js';

/** @type {readonly string[]} */
export const PERSONA_DATA_KEYS = [
  'tipo_documento',
  'numero_documento',
  'nombre_razon_social',
  'direccion',
  'referencia',
  'correo_principal',
  'correo_secundario',
  'telefono_principal',
  'ubigeo',
  'pais_emisor',
  'estado',
  'tipo_sunat',
  'tipo_persona',
  'tipo_precio',
  'categoria',
  'canal_ruta',
  'frecuencia_visita',
  'dia_visita',
  'linea_credito',
  'fecha_nacimiento',
  'contacto',
  'vendedor',
  'observaciones',
];

const EXCEL_HEADER_TO_KEY = new Map([
  ['TIPO DE DOCUMENTO', 'tipo_documento'],
  ['NUMERO DE DOCUMENTO', 'numero_documento'],
  ['NOMBRE O RAZON SOCIAL', 'nombre_razon_social'],
  ['DIRECCION', 'direccion'],
  ['REFERENCIA', 'referencia'],
  ['CORREO PRINCIPAL', 'correo_principal'],
  ['CORREO SECUNDARIO', 'correo_secundario'],
  ['TELEFONO PRINCIPAL', 'telefono_principal'],
  ['UBIGEO', 'ubigeo'],
  ['PAIS EMISOR', 'pais_emisor'],
  ['ESTADO', 'estado'],
  ['TIPO SUNAT', 'tipo_sunat'],
  ['TIPO PERSONA', 'tipo_persona'],
  ['TIPO PRECIO', 'tipo_precio'],
  ['CATEGORIA', 'categoria'],
  ['CANAL RUTA', 'canal_ruta'],
  ['FRECUENCIA VISITA', 'frecuencia_visita'],
  ['DIA VISITA', 'dia_visita'],
  ['LINEA DE CREDITO', 'linea_credito'],
  ['FECHA NACIMIENTO', 'fecha_nacimiento'],
  ['CONTACTO', 'contacto'],
  ['VENDEDOR', 'vendedor'],
  ['OBSERVACIONES', 'observaciones'],
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
    return value.toLocaleDateString('es-PE');
  }
  return String(value).trim();
}

/**
 * @param {Buffer | ArrayBuffer | Uint8Array} buffer
 * @returns {Array<Record<string, string>>}
 */
export function parsePersonaWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  if (!matrix.length) return [];

  const headerRow = matrix[0] ?? [];
  /** @type {Array<string | null>} */
  const columnKeys = headerRow.map((header) => {
    const key = EXCEL_HEADER_TO_KEY.get(normalizeHeader(header));
    return key ?? null;
  });

  const rows = [];
  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    const line = matrix[rowIndex] ?? [];
    /** @type {Record<string, string>} */
    const persona = {};
    let hasValue = false;

    for (let col = 0; col < columnKeys.length; col += 1) {
      const key = columnKeys[col];
      if (!key) continue;
      const value = cellToString(line[col]);
      persona[key] = value;
      if (value) hasValue = true;
    }

    if (!hasValue) continue;
    if (!persona.numero_documento && !persona.nombre_razon_social) continue;
    rows.push(persona);
  }

  return rows;
}

/** @param {string | null | undefined} tipoPrecio */
export function mapTipoPrecioExcelToRole(tipoPrecio) {
  const norm = normalizeHeader(tipoPrecio).replace(/\s+/g, ' ');
  if (norm.includes('TECNICO')) return 'tecnico';
  if (norm.includes('DISTRIBUIDOR')) return 'distribuidor';
  if (norm.includes('MAYORISTA')) return 'mayorista';
  if (norm.includes('CORPORATIVO')) return 'corporativo';
  if (norm.includes('VIP')) return 'vip';
  if (norm.includes('PUBLICO') || norm === 'PUBLIC') return 'public';
  return mapHaiSupportTipoClienteToRole(tipoPrecio);
}

function resolvePersonaEmail(persona) {
  const primary = persona.correo_principal?.trim();
  if (primary && !primary.includes('no-send')) return primary;
  const secondary = persona.correo_secundario?.trim();
  if (secondary) return secondary;
  const doc = persona.numero_documento?.replace(/\W/g, '');
  if (doc) return `${doc}@cliente.haitech.pe`;
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@cliente.haitech.pe`;
}

/** @param {Record<string, string>} persona */
export function personaRowToHaitechClient(persona) {
  const tipoCliente = mapTipoPrecioExcelToRole(persona.tipo_precio);
  return {
    nombre: persona.nombre_razon_social?.trim() || persona.contacto?.trim() || 'Sin nombre',
    nombreContacto: persona.contacto?.trim() || persona.nombre_razon_social?.trim() || '',
    rucDni: persona.numero_documento?.trim() || '',
    telefono: persona.telefono_principal?.trim() || '000000000',
    direccion: persona.direccion?.trim() || '-',
    ciudad: persona.ubigeo?.trim() || 'Lima',
    tipoCliente,
    email: resolvePersonaEmail(persona),
    notas: persona.observaciones?.trim() || null,
    persona_data: sanitizePersonaData(persona),
    source: 'haistore',
  };
}

/** @param {Record<string, unknown>} persona */
export function sanitizePersonaData(persona) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of PERSONA_DATA_KEYS) {
    const value = persona[key];
    out[key] = value != null ? String(value).trim() : '';
  }
  return out;
}

/** @param {Array<Record<string, string>>} rows */
export async function importPersonaCustomerRows(rows) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  /** @type {Array<{ row: number; message: string }>} */
  const errors = [];
  const supabase = getSupabaseAdmin();

  for (let index = 0; index < rows.length; index += 1) {
    const persona = sanitizePersonaData(rows[index]);
    try {
      const client = personaRowToHaitechClient(persona);
      let existed = false;
      if (supabase && client.rucDni) {
        const { data } = await supabase
          .from('store_customers')
          .select('id')
          .eq('tax_id', client.rucDni)
          .maybeSingle();
        existed = Boolean(data?.id);
      }

      const result = await ensureStoreCustomerFromHaitechClient(client);
      if (result.clientId) {
        if (existed) updated += 1;
        else created += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      errors.push({
        row: index + 2,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return { created, updated, skipped, errors, total: rows.length };
}

export const STORE_CUSTOMER_ADMIN_SELECT =
  'id, profile_id, email, full_name, phone, company_name, tax_id, nombre_contacto, direccion, ciudad, tipo_cliente, persona_data, productos_interes, notes, source, created_at, updated_at';
