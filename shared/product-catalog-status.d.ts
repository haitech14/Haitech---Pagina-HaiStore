export type ProductCatalogStatus = 'activa' | 'borrador' | 'inactiva';

export const PRODUCT_CATALOG_STATUSES: readonly ProductCatalogStatus[];

export function parseProductCatalogStatus(value: unknown): ProductCatalogStatus | null;

export function normalizeProductCatalogStatus(value: unknown): ProductCatalogStatus;

export function isProductVisibleOnStorefront(
  product: { status?: unknown } | null | undefined,
): boolean;
