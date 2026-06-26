export const BRAND_FILTER_OPTIONS: readonly {
  key: string;
  label: string;
}[];

export function buildBrandFacets(
  products: readonly any[],
): { key: string; label: string; count: number }[];
export function buildBrandFilterOptions(
  products: readonly any[],
): { key: string; label: string; count: number }[];
export function countProductsForBrandFilterKey(
  products: readonly any[],
  brandKey: string,
): number;
export function findBrandFilterOption(
  brandKey: string | null | undefined,
): { key: string; label: string } | null;
export function productMatchesBrandFilter(product: any, brandKeys: string[]): boolean;
export function normalizeCatalogBrandKey(value: string): string | null;
export function getCatalogBrandLabel(key: string): string | null;

