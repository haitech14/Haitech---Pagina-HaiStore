export const PRICE_ROLES = [
  'public',
  'corporativo',
  'tecnico',
  'mayorista',
  'distribuidor',
  'vip',
];

export const PRICE_ROLE_LABELS = {
  public: 'Público',
  corporativo: 'Corporativo',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
  vip: 'VIP',
};

export function isPriceRole(value) {
  return PRICE_ROLES.includes(value);
}

/** Roles de usuario (precio + admin). */
export function isUserRole(value) {
  return value === 'admin' || isPriceRole(value);
}

export function resolvePriceRole(userRole) {
  if (userRole === 'admin') return 'public';
  if (isPriceRole(userRole)) return userRole;
  return 'public';
}

export function ensureFullPrices(prices = {}) {
  const pub = Number(prices.public ?? 0);
  return {
    public: pub,
    corporativo: Number(prices.corporativo ?? Math.round(pub * 0.92)),
    tecnico: Number(prices.tecnico ?? Math.round(pub * 0.88)),
    mayorista: Number(prices.mayorista ?? Math.round(pub * 0.85)),
    distribuidor: Number(prices.distribuidor ?? Math.round(pub * 0.78)),
    vip: Number(prices.vip ?? Math.round(pub * 0.72)),
  };
}
