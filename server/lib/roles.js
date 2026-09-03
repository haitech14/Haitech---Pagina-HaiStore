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
    return full.public;
  }
  const priceRole = resolvePriceRole(userRole);
  return full[priceRole] ?? full.public;
}
