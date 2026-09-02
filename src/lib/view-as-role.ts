import { ensureFullPrices, resolvePriceRole, resolveUserRolePriceUsd, USER_ROLE_LABELS, type UserRole } from '@/lib/roles';
import type { Product } from '@/types/product';

/** Roles disponibles para vista previa de precios (admin). */
export const VIEW_AS_ROLE_OPTIONS: readonly { value: UserRole; label: string }[] = [
  { value: 'corporativo2', label: USER_ROLE_LABELS.corporativo2 },
  { value: 'public', label: USER_ROLE_LABELS.public },
  { value: 'distribuidor', label: USER_ROLE_LABELS.distribuidor },
  { value: 'tecnico', label: USER_ROLE_LABELS.tecnico },
  { value: 'mayorista', label: USER_ROLE_LABELS.mayorista },
];

export function applyViewAsPriceToProduct(product: Product, viewRole: string): Product {
  const prices = ensureFullPrices(product.prices ?? { public: product.price });
  const priceUsd = resolveUserRolePriceUsd(prices, viewRole, {
    productKeys: [product.id, product.code],
  });
  return {
    ...product,
    prices,
    price: priceUsd,
    price_role: viewRole === 'corporativo2' ? 'public' : resolvePriceRole(viewRole),
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
