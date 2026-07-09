import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { productQualifiesAsSeminuevaEquipment } from '@/lib/inventory-product-name';
import { buildEquipmentCartLineId, type SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { Product } from '@/types/product';
import type { UserRole } from '@/lib/roles';

export type SeminuevaPreparationType = 'acondicionado' | 'semirepotenciado' | 'remanufacturado';

export const SEMINUEVA_PREPARATION_OPTIONS: readonly SeminuevaPreparationType[] = [
  'acondicionado',
  'semirepotenciado',
  'remanufacturado',
] as const;

export const SEMINUEVA_PREPARATION_LABELS: Record<SeminuevaPreparationType, string> = {
  acondicionado: 'Acondicionado',
  semirepotenciado: 'Semi repotenciado',
  remanufacturado: 'Remanufacturado',
};

const SEMIREPOTENCIADO_SURCHARGE_USD = {
  bn: 250,
  color: 350,
} as const;

/** Recargo placeholder hasta que el catálogo exponga precios por tipo de preparado. */
const REMANUFACTURADO_SURCHARGE_USD = {
  bn: 400,
  color: 550,
} as const;

export function productQualifiesForSeminuevaPreparation(product: Product): boolean {
  return productQualifiesAsSeminuevaEquipment(product);
}

export function shouldShowSeminuevaPreparationSelector(
  product: Product,
  role: UserRole | 'public',
  viewAsRoles: readonly UserRole[],
): boolean {
  if (role !== 'public' || viewAsRoles.length > 0) return false;
  return productQualifiesForSeminuevaPreparation(product);
}

export function resolveSeminuevaPreparationSurchargeUsd(
  preparationType: SeminuevaPreparationType,
  product: Product,
): number {
  const isColor = isColorPrinterEquipment(product);
  if (preparationType === 'semirepotenciado') {
    return isColor ? SEMIREPOTENCIADO_SURCHARGE_USD.color : SEMIREPOTENCIADO_SURCHARGE_USD.bn;
  }
  if (preparationType === 'remanufacturado') {
    return isColor ? REMANUFACTURADO_SURCHARGE_USD.color : REMANUFACTURADO_SURCHARGE_USD.bn;
  }
  return 0;
}

export function resolvePublicUnitBaseWithPreparationUsd(
  publicPriceUsd: number,
  preparationType: SeminuevaPreparationType,
  product: Product,
): number {
  return publicPriceUsd + resolveSeminuevaPreparationSurchargeUsd(preparationType, product);
}

export function resolveSeminuevaPreparationUnitPrices(
  publicPriceUsd: number,
  product: Product,
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
