import { ensureFullPrices, resolvePriceRole, USER_ROLE_LABELS, type UserRole } from '@/lib/roles';
import type { Product } from '@/types/product';

/** Roles disponibles para vista previa de precios (admin). */
export const VIEW_AS_ROLE_OPTIONS: readonly { value: UserRole; label: string }[] = [
  { value: 'public', label: USER_ROLE_LABELS.public },
  { value: 'mayorista', label: USER_ROLE_LABELS.mayorista },
  { value: 'tecnico', label: USER_ROLE_LABELS.tecnico },
  { value: 'corporativo', label: USER_ROLE_LABELS.corporativo },
  { value: 'distribuidor', label: USER_ROLE_LABELS.distribuidor },
  { value: 'vip', label: USER_ROLE_LABELS.vip },
];

export function applyViewAsPriceToProduct(product: Product, viewRole: string): Product {
  const prices = ensureFullPrices(product.prices ?? { public: product.price });
  const priceRole = resolvePriceRole(viewRole);
  return {
    ...product,
    prices,
    price: prices[priceRole] ?? product.price,
    price_role: priceRole,
  };
}

export function applyViewAsPriceToProducts(products: Product[], viewRole: string): Product[] {
  return products.map((product) => applyViewAsPriceToProduct(product, viewRole));
}

export function isPreviewingAsRoles(roles: readonly UserRole[]): boolean {
  return roles.length > 0;
}

/** Solo transforma el producto cuando hay un único rol de vista previa. */
export function shouldApplyViewAsPriceTransform(roles: readonly UserRole[]): boolean {
  return roles.length === 1;
}

export function viewAsRolesQueryKey(roles: readonly UserRole[]): string {
  return [...roles].sort().join(',');
}
