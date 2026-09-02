export type ProductCatalogStatus = 'activa' | 'borrador' | 'inactiva';

export const PRODUCT_CATALOG_STATUSES: readonly ProductCatalogStatus[];

export const STOREFRONT_HIDDEN_BRAND_KEYS: Set<string>;

export function parseProductCatalogStatus(value: unknown): ProductCatalogStatus | null;

export function normalizeProductCatalogStatus(value: unknown): ProductCatalogStatus;

export function isStorefrontHiddenBrand(brand: unknown): boolean;

export function isStorefrontHiddenConsumableProduct(
  product:
    | { name?: unknown; category?: unknown; description?: unknown }
    | null
    | undefined,
): boolean;

export function isProductVisibleOnStorefront(
  product:
    | { status?: unknown; brand?: unknown; name?: unknown; category?: unknown; description?: unknown }
    | null
    | undefined,
): boolean;
