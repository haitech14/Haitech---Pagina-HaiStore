export function slugifyProductText(value: string): string;
export function isWeakCatalogSlug(
  slug: string,
  product?: { id?: string },
): boolean;
export function deriveProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string;
  category?: string;
  code?: string;
}): string;
export function proposeProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string;
  category?: string;
  code?: string;
}): string;
export function assignUniqueProductSlugs(
  products: Array<{
    id?: string;
    name?: string;
    slug?: string | null;
    brand?: string;
    category?: string;
    code?: string;
  }>,
): {
  products: Array<{
    id?: string;
    name?: string;
    slug?: string | null;
    brand?: string;
    category?: string;
    code?: string;
  }>;
  assigned: number;
  unchanged: number;
  total: number;
};
export function buildProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string;
  category?: string;
  code?: string;
}): string;
export function buildLegacyProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
  brand?: string;
  category?: string;
  code?: string;
}): string;
export function findProductBySlugOrId(
  products: Array<{ id?: string; slug?: string | null; name?: string }>,
  lookupKey: string,
): { id?: string; slug?: string | null; name?: string } | undefined;
