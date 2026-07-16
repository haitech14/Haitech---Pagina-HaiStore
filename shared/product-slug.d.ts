export function slugifyProductText(value: string): string;
export function deriveProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
}): string;
export function proposeProductSlug(product: {
  id?: string;
  name?: string;
  slug?: string | null;
}): string;
export function assignUniqueProductSlugs(
  products: Array<{ id?: string; name?: string; slug?: string | null }>,
): {
  products: Array<{ id?: string; name?: string; slug?: string | null }>;
  assigned: number;
  unchanged: number;
  total: number;
};
export function buildProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
}): string;
export function buildLegacyProductPath(product: {
  id?: string;
  name?: string;
  slug?: string | null;
}): string;
export function findProductBySlugOrId(
  products: Array<{ id?: string; slug?: string | null; name?: string }>,
  lookupKey: string,
): { id?: string; slug?: string | null; name?: string } | undefined;
