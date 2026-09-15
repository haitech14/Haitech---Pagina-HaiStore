export const IM550F_CHILD_VARIANT_IDS: Set<string>;

export function isIm550fChildVariantSku(product: unknown): boolean;

export function isEquipmentVariantSkuForSearch(product: unknown): boolean;

export function collectReferencedVariantProductIds(products: unknown[]): Set<string>;

export function excludeEquipmentVariantSkusFromSearch<T extends { id?: string | null }>(
  list: T[],
  catalog?: T[],
): T[];
