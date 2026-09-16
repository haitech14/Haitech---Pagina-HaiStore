const V1_RUC_URL = 'https://api.apis.net.pe/v1/ruc';
const V2_RUC_URL = 'https://api.apis.net.pe/v2/sunat/ruc';
const POSITIVE_TTL_MS = 24 * 60 * 60 * 1000;
const NEGATIVE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 400;
const CACHE_VERSION = 'v2-fiscal-address';

/** @type {Map<string, { expiresAt: number, data: SunatRucResult | null }>} */
const cache = new Map();

function cacheKey(numero) {
  return `${CACHE_VERSION}:${numero}`;
}
/**
 * @typedef {object} SunatRucResult
 * @property {string} numero
 * @property {string} razonSocial
 * @property {string} direccion
 * @property {string} ciudad
 * @property {string} distrito
 * @property {string} departamento
 * @property {string | null} estado
 * @property {string | null} condicion
 */

export class SunatRucError extends Error {
  /**
   * @param {string} message
   * @param {number} [status]
   */
  constructor(message, status = 502) {
    super(message);
    this.name = 'SunatRucError';
    this.status = status;
  }
}

export function normalizeRuc(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 11);
}

export function isCompleteRuc(value) {
  return /^\d{11}$/.test(normalizeRuc(value));
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} record
 * @param {string[]} keys
 */
function pickString(record, keys) {
  if (!isRecord(record)) return '';
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

const SMALL_PLACE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'el']);

function titleCasePlace(value) {
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return words
    .map((word, index) => {
      if (index > 0 && SMALL_PLACE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function placeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function remember(numero, data, ttlMs) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(cacheKey(numero), { data, expiresAt: Date.now() + ttlMs });
}

function buildFiscalAddress(street, distrito, provincia, departamento) {
  const base = String(street ?? '').trim();
  const parts = [];
  const seen = new Set();

  const pushUnique = (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return;
    const key = placeKey(trimmed);
    if (!key || seen.has(key)) return;
    if (base && placeKey(base).includes(key)) return;
    seen.add(key);
    parts.push(trimmed);
  };

  if (base) parts.push(base);
  pushUnique(distrito);
  pushUnique(provincia);
  pushUnique(departamento);

  return parts.join(', ');
}

/**
 * @param {unknown} payload
 * @param {string} numero
 * @returns {SunatRucResult | null}
 */
function mapSunatPayload(payload, numero) {
  const razonSocial = pickString(payload, ['razonSocial', 'razon_social', 'nombre', 'name']);
  if (!razonSocial) return null;

  const distrito = titleCasePlace(pickString(payload, ['distrito']));
  const provincia = titleCasePlace(pickString(payload, ['provincia']));
  const departamento = titleCasePlace(pickString(payload, ['departamento']));
  const provinciaKey = placeKey(provincia);
  const departamentoKey = placeKey(departamento);
  let ciudad = provincia || departamento || distrito;
  if (provinciaKey === 'lima' || departamentoKey === 'lima') ciudad = 'Lima';
  if (provinciaKey === 'callao' || departamentoKey === 'callao') ciudad = 'Callao';

  const street = pickString(payload, [
    'direccion',
    'domicilioFiscal',
    'direccionCompleta',
    'direccion_completa',
    'domicilio_fiscal',
  ]);

  return {
    numero: pickString(payload, ['numeroDocumento', 'ruc']) || numero,
    razonSocial,
    direccion: buildFiscalAddress(street, distrito, provincia, departamento),
    ciudad,
    distrito,
    departamento,
    estado: pickString(payload, ['estado']) || null,
    condicion: pickString(payload, ['condicion']) || null,
  };
}

function apisNetToken() {
  return (process.env.APIS_NET_PE_TOKEN ?? process.env.APISNET_TOKEN ?? '').trim();
}

/**
 * @param {string} url
 * @param {Record<string, string>} [headers]
 */
async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', ...headers },
    signal: AbortSignal.timeout(12_000),
  });
  const body = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, body };
}

function isNotFoundStatus(status) {
  return status === 404 || status === 422;
}

/**
 * Consulta RUC en SUNAT (apis.net.pe v2 con token, v1 como respaldo).
 * @param {string} rawNumero
 * @returns {Promise<SunatRucResult | null>}
 */
export async function lookupSunatRuc(rawNumero) {
  const numero = normalizeRuc(rawNumero);
  if (!isCompleteRuc(numero)) {
    throw new SunatRucError('Ingresa un RUC de 11 dígitos.', 400);
  }

  const cached = cache.get(cacheKey(numero));
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const token = apisNetToken();
  /** @type {SunatRucResult | null} */
  let result = null;
  let lastStatus = 0;

  if (token) {
    const v2 = await fetchJson(`${V2_RUC_URL}?numero=${encodeURIComponent(numero)}`, {
      Authorization: `Bearer ${token}`,
    });
    lastStatus = v2.status;
    if (v2.ok) result = mapSunatPayload(v2.body, numero);
    if (!result && isNotFoundStatus(v2.status)) {
      remember(numero, null, NEGATIVE_TTL_MS);
      return null;
    }
  }

  if (!result) {
    const v1Headers = token ? { Authorization: `Bearer ${token}` } : {};
    const v1 = await fetchJson(`${V1_RUC_URL}?numero=${encodeURIComponent(numero)}`, v1Headers);
    lastStatus = v1.status;
    if (v1.ok) result = mapSunatPayload(v1.body, numero);
    if (!result && isNotFoundStatus(v1.status)) {
      remember(numero, null, NEGATIVE_TTL_MS);
      return null;
    }
    if (!result && !v1.ok) {
      const hint =
        lastStatus === 401 || lastStatus === 403
          ? 'Configura APIS_NET_PE_TOKEN para consultar SUNAT.'
          : 'No se pudo consultar SUNAT en este momento. Inténtalo de nuevo.';
      throw new SunatRucError(hint, lastStatus === 401 || lastStatus === 403 ? 502 : 502);
    }
  }

  remember(numero, result, result ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS);
  return result;
}
