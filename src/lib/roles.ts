import { roundEquipmentDisplayUsd } from '@/lib/pen-pricing';
import { resolveCorporativo2FixedPen } from '@/lib/corporativo2-fixed-prices';
import { penToUsd } from '@/lib/utils';

/** Tiers de precio editables en inventario y catálogo. */
export const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'] as const;

export type PriceRole = (typeof PRICE_ROLES)[number];

/** Orden en formularios de inventario: mayorista → técnico → distribuidor → público. */
export const PRICE_ROLES_EDIT_ORDER: readonly PriceRole[] = [
  'mayorista',
  'tecnico',
  'distribuidor',
  'public',
];
/** Roles de usuario legacy sin columna propia; se resuelven al tier indicado. */
export const LEGACY_USER_PRICE_ROLE_MAP = {
  corporativo: 'tecnico',
  corporativo2: 'public',
  vip: 'distribuidor',
} as const;

export type LegacyUserPriceRole = keyof typeof LEGACY_USER_PRICE_ROLE_MAP;

export type UserRole = PriceRole | 'admin' | LegacyUserPriceRole;

export type ProductRolePrices = Record<PriceRole, number>;

export const PRICE_ROLE_LABELS: Record<PriceRole, string> = {
  public: 'Corporativo',
  tecnico: 'Técnico',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ...PRICE_ROLE_LABELS,
  admin: 'Administrador',
  corporativo: 'Corporativo',
  corporativo2: 'Corporativo 2',
  vip: 'VIP',
};

export function isPriceRole(value: string): value is PriceRole {
  return (PRICE_ROLES as readonly string[]).includes(value);
}

export function isLegacyUserPriceRole(value: string): value is LegacyUserPriceRole {
  return value in LEGACY_USER_PRICE_ROLE_MAP;
}

export function isUserRole(value: string): value is UserRole {
  return value === 'admin' || isPriceRole(value) || isLegacyUserPriceRole(value);
}

/** Rol usado para calcular precio en catálogo según sesión. */
export function resolvePriceRole(userRole: string): PriceRole {
  if (userRole === 'admin') return 'public';
  if (isPriceRole(userRole)) return userRole;
  if (isLegacyUserPriceRole(userRole)) return LEGACY_USER_PRICE_ROLE_MAP[userRole];
  return 'public';
}

export function createEmptyPrices(): ProductRolePrices {
  return {
    public: 0,
    tecnico: 0,
    mayorista: 0,
    distribuidor: 0,
  };
}

/** Completa precios faltantes; acepta claves legacy (corporativo → técnico, vip → distribuidor). */
export function ensureFullPrices(
  prices: Partial<ProductRolePrices> & {
    corporativo?: number;
    vip?: number;
  } = {},
): ProductRolePrices {
  const pub = Number(prices.public ?? 0);
  return {
    public: pub,
    tecnico: Number(prices.tecnico ?? prices.corporativo ?? Math.round(pub * 0.88)),
    mayorista: Number(prices.mayorista ?? Math.round(pub * 0.85)),
    distribuidor: Number(prices.distribuidor ?? prices.vip ?? Math.round(pub * 0.78)),
  };
}

/** Precio USD según rol de usuario (incluye corporativo 2 con PEN fijo por producto). */
export function resolveUserRolePriceUsd(
  prices: Partial<ProductRolePrices> & {
    corporativo?: number;
    vip?: number;
  },
  userRole: string,
  options?: {
    isEquipment?: boolean;
    saleRate?: number | undefined;
    productKeys?: readonly (string | null | undefined)[] | undefined;
  },
): number {
  const full = ensureFullPrices(prices);
  if (userRole === 'corporativo2') {
    const fixedPen = resolveCorporativo2FixedPen(...(options?.productKeys ?? []));
    if (fixedPen != null && fixedPen > 0 && options?.saleRate != null && options.saleRate > 0) {
      return penToUsd(fixedPen, options.saleRate);
    }
    const raw = full.public;
    return options?.isEquipment ? roundEquipmentDisplayUsd(raw) : raw;
  }
  const priceRole = resolvePriceRole(userRole);
  const raw = full[priceRole] ?? full.public;
  return options?.isEquipment ? roundEquipmentDisplayUsd(raw) : raw;
}

/** PEN de vitrina/catálogo para un rol (corporativo 2 puede tener PEN fijo). */
export function resolveUserRoleDisplayPen(
  prices: Partial<ProductRolePrices> & {
    corporativo?: number;
    vip?: number;
  },
  userRole: string,
  options: {
    isEquipment: boolean;
    saleRate?: number | undefined;
    productKeys?: readonly (string | null | undefined)[] | undefined;
    penFromUsd: (usd: number) => number;
  },
): number {
  if (userRole === 'corporativo2') {
    const fixedPen = resolveCorporativo2FixedPen(...(options.productKeys ?? []));
    if (fixedPen != null && fixedPen > 0) return fixedPen;
  }
  const usd = resolveUserRolePriceUsd(prices, userRole, {
    isEquipment: options.isEquipment,
    saleRate: options.saleRate,
    productKeys: options.productKeys,
  });
  return options.penFromUsd(usd);
}
