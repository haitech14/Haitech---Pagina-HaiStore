export function buildBrandFacets(
  products: readonly any[],
): { key: string; label: string; count: number }[];
export function productMatchesBrandFilter(product: any, brandKeys: string[]): boolean;
export function normalizeCatalogBrandKey(value: string): string;
export function getCatalogBrandLabel(key: string): string;

