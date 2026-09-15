import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { productQualifiesAsSeminuevaEquipment } from '@/lib/inventory-product-name';
import { buildEquipmentCartLineId, type SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import {
  ensureFullPrices,
  resolvePriceRole,
  type PriceRole,
  type ProductRolePrices,
  type UserRole,
} from '@/lib/roles';
import type { InventoryProduct, Product } from '@/types/product';
import {
  normalizePreparationPrices,
  SEMINUEVA_PREPARATION_PRICE_TYPES,
  type SeminuevaPreparationPrices,
  type SeminuevaPreparationPriceType,
} from '../../shared/seminueva-preparation-prices.js';

export type SeminuevaPreparationType = 'acondicionado' | 'semirepotenciado' | 'remanufacturado';

export type { SeminuevaPreparationPrices, SeminuevaPreparationPriceType };
export { normalizePreparationPrices, SEMINUEVA_PREPARATION_PRICE_TYPES };

/** Campos mínimos para calificar y fijar precios de preparado. */
export type PreparationPriceSource = {
  name: string;
  category?: string | null;
  brand?: string | null;
  price?: number;
  prices?: ProductRolePrices;
  preparation_prices?: SeminuevaPreparationPrices;
  attributes?: Product['attributes'];
};

export const SEMINUEVA_PREPARATION_OPTIONS: readonly SeminuevaPreparationType[] = [
  'acondicionado',
  'semirepotenciado',
  'remanufacturado',
] as const;

export const SEMINUEVA_PREPARATION_LABELS: Record<SeminuevaPreparationType, string> = {
  acondicionado: 'Acondicionada',
  semirepotenciado: 'Repotenciada',
  remanufacturado: 'Remanufacturada',
};

const SEMIREPOTENCIADO_SURCHARGE_USD = {
  bn: 200,
  color: 300,
} as const;

/** Recargo por defecto si el producto no tiene `preparation_prices` guardados. */
const REMANUFACTURADO_SURCHARGE_USD = {
  bn: 250,
  color: 300,
} as const;

function asColorCheckProduct(product: PreparationPriceSource): Product {
  return {
    id: 'prep-check',
    name: product.name,
    description: null,
    price: Number(product.price) || Number(product.prices?.public) || 0,
    currency: 'USD',
    image_url: null,
    stock: 0,
    category: product.category ?? null,
    brand: product.brand ?? null,
    created_at: '',
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.attributes ? { attributes: product.attributes } : {}),
  };
}

export function productQualifiesForSeminuevaPreparation(
  product: PreparationPriceSource | InventoryProduct,
): boolean {
  return productQualifiesAsSeminuevaEquipment({
    name: product.name,
    category: product.category ?? null,
  });
}

export function shouldShowSeminuevaPreparationSelector(
  product: Product,
  _role?: UserRole | 'public',
  _viewAsRoles?: readonly UserRole[],
): boolean {
  return productQualifiesForSeminuevaPreparation(product);
}

/** Rol de precio de vitrina para variantes de preparado (público, técnico, ver como…). */
export function resolvePreparationPriceRoleForViewer(
  role: UserRole | 'public',
  viewAsRoles: readonly UserRole[] = [],
): PriceRole {
  if (viewAsRoles.length > 0) {
    const primary = viewAsRoles[0]!;
    return primary === 'corporativo2' ? 'public' : resolvePriceRole(primary);
  }
  return role === 'public' ? 'public' : resolvePriceRole(role);
}

function defaultPreparationSurchargeUsd(
  preparationType: SeminuevaPreparationType,
  product: PreparationPriceSource,
): number {
  const isColor = isColorPrinterEquipment(asColorCheckProduct(product));
  if (preparationType === 'semirepotenciado') {
    return isColor ? SEMIREPOTENCIADO_SURCHARGE_USD.color : SEMIREPOTENCIADO_SURCHARGE_USD.bn;
  }
  if (preparationType === 'remanufacturado') {
    return isColor ? REMANUFACTURADO_SURCHARGE_USD.color : REMANUFACTURADO_SURCHARGE_USD.bn;
  }
  return 0;
}

function baseRolePrices(product: PreparationPriceSource): ProductRolePrices {
  const publicFallback = Number(product.price) || Number(product.prices?.public) || 0;
  return ensureFullPrices(product.prices ?? { public: publicFallback });
}

/**
 * Precio unitario USD por rol para un tipo de preparado.
 * Acondicionado = precios base. Otros: `preparation_prices` o recargo por defecto.
 */
export function resolvePreparationRolePriceUsd(
  preparationType: SeminuevaPreparationType,
  product: PreparationPriceSource | InventoryProduct,
  role: PriceRole = 'public',
): number {
  const base = baseRolePrices(product);
  if (preparationType === 'acondicionado') {
    return Number(base[role]) || 0;
  }

  const stored = normalizePreparationPrices(product.preparation_prices)?.[preparationType];
  if (stored) {
    return Number(stored[role]) || 0;
  }

  const surcharge = defaultPreparationSurchargeUsd(preparationType, product);
  return (Number(base[role]) || 0) + surcharge;
}

/** Precios por rol efectivos (absolutos) para un tipo de preparado. */
export function resolvePreparationRolePrices(
  preparationType: SeminuevaPreparationType,
  product: PreparationPriceSource | InventoryProduct,
): ProductRolePrices {
  if (preparationType === 'acondicionado') {
    return baseRolePrices(product);
  }

  const stored = normalizePreparationPrices(product.preparation_prices)?.[preparationType];
  if (stored) return ensureFullPrices(stored);

  const base = baseRolePrices(product);
  const surcharge = defaultPreparationSurchargeUsd(preparationType, product);
  return ensureFullPrices({
    public: (Number(base.public) || 0) + surcharge,
    tecnico: (Number(base.tecnico) || 0) + surcharge,
    mayorista: (Number(base.mayorista) || 0) + surcharge,
    distribuidor: (Number(base.distribuidor) || 0) + surcharge,
  });
}

export function resolveSeminuevaPreparationSurchargeUsd(
  preparationType: SeminuevaPreparationType,
  product: PreparationPriceSource | InventoryProduct,
): number {
  if (preparationType === 'acondicionado') return 0;
  const basePublic = Number(baseRolePrices(product).public) || 0;
  const unitPublic = resolvePreparationRolePriceUsd(preparationType, product, 'public');
  return Math.max(0, Math.round((unitPublic - basePublic) * 100) / 100);
}

export function resolvePublicUnitBaseWithPreparationUsd(
  publicPriceUsd: number,
  preparationType: SeminuevaPreparationType,
  product: PreparationPriceSource | InventoryProduct,
): number {
  if (preparationType === 'acondicionado') {
    return publicPriceUsd;
  }
  const storedOrDefault = resolvePreparationRolePriceUsd(preparationType, product, 'public');
  const basePublic = Number(baseRolePrices(product).public) || 0;
  const surcharge = Math.max(0, storedOrDefault - basePublic);
  return publicPriceUsd + surcharge;
}

export function resolveSeminuevaPreparationUnitPrices(
  publicPriceUsd: number,
  product: PreparationPriceSource | InventoryProduct,
): Record<SeminuevaPreparationType, number> {
  return {
    acondicionado: resolvePublicUnitBaseWithPreparationUsd(publicPriceUsd, 'acondicionado', product),
    semirepotenciado: resolvePublicUnitBaseWithPreparationUsd(
      publicPriceUsd,
      'semirepotenciado',
      product,
    ),
    remanufacturado: resolvePublicUnitBaseWithPreparationUsd(
      publicPriceUsd,
      'remanufacturado',
      product,
    ),
  };
}

export function buildCartLineId(
  productId: string,
  paidOptions: SelectedEquipmentOption[],
  preparationType?: SeminuevaPreparationType,
): string {
  const base = buildEquipmentCartLineId(productId, paidOptions);
  if (preparationType && preparationType !== 'acondicionado') {
    return `${base}::prep:${preparationType}`;
  }
  return base;
}
