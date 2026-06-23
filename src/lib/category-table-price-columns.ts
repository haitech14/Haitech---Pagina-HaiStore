import {
  PRICE_ROLES_EDIT_ORDER,
  resolvePriceRole,
  type PriceRole,
  type UserRole,
} from '@/lib/roles';

/** Columnas de precio visibles en la tabla de categoría según sesión. */
export function getCategoryTableVisiblePriceRoles(
  isAdmin: boolean,
  userRole: UserRole | 'public',
  previewRoles?: readonly UserRole[],
): readonly PriceRole[] {
  if (previewRoles && previewRoles.length > 0) {
    return previewRoles.map((role) => resolvePriceRole(role));
  }
  if (isAdmin) return PRICE_ROLES_EDIT_ORDER;
  return [resolvePriceRole(userRole)];
}

export function countCategoryTableColumns(
  isAdmin: boolean,
  userRole: UserRole | 'public',
  previewRoles?: readonly UserRole[],
): number {
  const specColumns = 4;
  const priceColumns = getCategoryTableVisiblePriceRoles(isAdmin, userRole, previewRoles).length;
  const purchaseColumn = isAdmin ? 1 : 0;
  return 1 + 1 + specColumns + 1 + 1 + purchaseColumn + priceColumns + 1;
}
