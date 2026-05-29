/** Roles de precio visibles en catálogo (de mayor a menor descuento típico). */
export const PRICE_ROLES = [
  'public',
  'corporativo',
  'tecnico',
  'mayorista',
  'distribuidor',
  'vip',
] as const;

export type PriceRole = (typeof PRICE_ROLES)[number];

export type UserRole = PriceRole | 'admin';

export type ProductRolePrices = Record<PriceRole, number>;

export const PRICE_ROLE_LABELS: Record<PriceRole, string> = {
  public: 'Público',
  corporativo: 'Corporativo',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
  vip: 'VIP',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ...PRICE_ROLE_LABELS,
  admin: 'Administrador',
};

export function isPriceRole(value: string): value is PriceRole {
  return (PRICE_ROLES as readonly string[]).includes(value);
}

export function isUserRole(value: string): value is UserRole {
  return value === 'admin' || isPriceRole(value);
}

/** Rol usado para calcular precio en catálogo según sesión. */
export function resolvePriceRole(userRole: string): PriceRole {
  if (userRole === 'admin') return 'public';
  if (isPriceRole(userRole)) return userRole;
  return 'public';
}

export function createEmptyPrices(): ProductRolePrices {
  return {
    public: 0,
    corporativo: 0,
    tecnico: 0,
    mayorista: 0,
    distribuidor: 0,
    vip: 0,
  };
}

/** Completa precios faltantes a partir del precio público. */
export function ensureFullPrices(prices: Partial<ProductRolePrices>): ProductRolePrices {
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
