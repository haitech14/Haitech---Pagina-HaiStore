export function isCatalogPriceOnRequest(price: number | null | undefined): boolean;
export function getCatalogSortPrice(product: {
  price?: number | null;
  prices?: { public?: number | null };
} | null | undefined): number | null;
export function compareCatalogProductsBySort(
  sortBy: string,
  a: {
    price?: number | null;
    prices?: { public?: number | null };
    name?: string;
    sort_order?: number | null;
  },
  b: {
    price?: number | null;
    prices?: { public?: number | null };
    name?: string;
    sort_order?: number | null;
  },
): number;
