import { resolveCorporativo2FixedPen, resolveCorporativo2FixedUsd } from '../../shared/corporativo2-fixed-prices.js';

export const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'];

/** Roles de usuario legacy sin columna propia; se resuelven al tier indicado. */
export const LEGACY_USER_PRICE_ROLE_MAP = {
  corporativo: 'tecnico',
  corporativo2: 'public',
  vip: 'distribuidor',
};

export const PRICE_ROLE_LABELS = {
  public: 'Corporativo',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  /** Misma etiqueta que `tecnico` en UI; la clave interna se mantiene. */
  distribuidor: 'Técnico',
};

export function isPriceRole(value) {
  return PRICE_ROLES.includes(value);
}

export function isLegacyUserPriceRole(value) {
  return Object.prototype.hasOwnProperty.call(LEGACY_USER_PRICE_ROLE_MAP, value);
}

/** Roles de usuario (precio + admin + legacy). */
export function isUserRole(value) {
  return value === 'admin' || isPriceRole(value) || isLegacyUserPriceRole(value);
}

export function resolvePriceRole(userRole) {
  if (userRole === 'admin') return 'public';
  if (isPriceRole(userRole)) return userRole;
  if (isLegacyUserPriceRole(userRole)) return LEGACY_USER_PRICE_ROLE_MAP[userRole];
  return 'public';
}

export function ensureFullPrices(prices = {}) {
  const pub = Number(prices.public ?? 0);
  return {
    public: pub,
    tecnico: Number(prices.tecnico ?? prices.corporativo ?? Math.round(pub * 0.88)),
    mayorista: Number(prices.mayorista ?? Math.round(pub * 0.85)),
    distribuidor: Number(prices.distribuidor ?? prices.vip ?? Math.round(pub * 0.78)),
  };
}

function penToUsd(pen, rate) {
  if (!Number.isFinite(pen) || pen <= 0 || !Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round((pen / rate) * 100) / 100;
}

function roundUsdToNearestFortyNineOrNinetyNine(usd) {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  const n = Math.round(usd);
  const base = Math.floor(n / 100);
  const candidates = new Set();
  for (const block of [base - 1, base, base + 1]) {
    if (block < 0) continue;
    const c49 = block * 100 + 49;
    const c99 = block * 100 + 99;
    if (c49 > 0) candidates.add(c49);
    if (c99 > 0) candidates.add(c99);
  }
  if (n < 100) {
    candidates.add(49);
    candidates.add(99);
  }
  let best = [...candidates][0] ?? 99;
  let bestDistance = Math.abs(n - best);
  for (const candidate of candidates) {
    const distance = Math.abs(n - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function isEquipmentCategory(category) {
  const normalized = String(category ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (/toner|repuesto/.test(normalized)) return false;
  return /impresor|multifunc|escan|scanner|plotter|fotocop|laptop|monitor|equipo/.test(normalized);
}

/** Precio USD según rol de usuario (corporativo 2: USD fijo, PEN fijo o Corporativo). */
export function resolveUserRolePriceUsd(prices = {}, userRole, options = {}) {
  const full = ensureFullPrices(prices);
  if (userRole === 'corporativo2') {
    const keys = options.productKeys ?? [];
    const fixedUsd = resolveCorporativo2FixedUsd(...keys);
    if (fixedUsd != null && fixedUsd > 0) {
      return fixedUsd;
    }
    const fixedPen = resolveCorporativo2FixedPen(...keys);
    if (fixedPen != null && fixedPen > 0 && options.saleRate > 0) {
      return penToUsd(fixedPen, options.saleRate);
    }
    const rawPublic = full.public;
    return options.isEquipment ? roundUsdToNearestFortyNineOrNinetyNine(rawPublic) : rawPublic;
  }
  const priceRole = resolvePriceRole(userRole);
  const raw = full[priceRole] ?? full.public;
  if (priceRole === 'tecnico') return raw;
  return options.isEquipment ? roundUsdToNearestFortyNineOrNinetyNine(raw) : raw;
}

export { isEquipmentCategory };
