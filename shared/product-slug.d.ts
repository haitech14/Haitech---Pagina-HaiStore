export function slugifyProductText(value: string): string;
export function isWeakCatalogSlug(
  slug: string,
  product?: { id?: string },
): boolean;
export function deriveProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string | null;
  category?: string | null;
  code?: string | null;
}): string;
export function proposeProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string | null;
  category?: string | null;
  code?: string | null;
}): string;
export function assignUniqueProductSlugs(
  products: Array<{
    id?: string;
    name?: string;
    slug?: string | null;
    brand?: string | null;
    category?: string | null;
    code?: string | null;
  }>,
): {
  products: Array<{
    id?: string;
    name?: string;
    slug?: string | null;
    brand?: string | null;
    category?: string | null;
    code?: string | null;
  }>;
  assigned: number;
  unchanged: number;
  total: number;
};
export function buildProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string | null;
  category?: string | null;
  code?: string | null;
}): string;
export function buildLegacyProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string | null;
  category?: string | null;
  code?: string | null;
}): string;
export function findProductBySlugOrId<
  T extends { id?: string; slug?: string | null; name?: string },
>(products: readonly T[], lookupKey: string): T | undefined;
