export const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'];

export const LEGACY_USER_PRICE_ROLE_MAP = {
  corporativo: 'tecnico',
  vip: 'distribuidor',
};

export const PRICE_ROLE_LABELS = {
  public: 'Público',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
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
