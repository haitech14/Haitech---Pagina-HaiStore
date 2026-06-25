export const MOST_VIEWED_OFFER_ATTR_KEY: string;
export function resolveMostViewedOfferProductIds(products: readonly any[]): Set<string>;
export function resolveMostViewedOfferProductIdsFromLocalStorage(): Set<string>;
export function productHasMostViewedOfferAttribute(product: any, offerIds: Set<string>): boolean;
export function appendMostViewedOfferFacet(
  facets: { key: string; label: string; count: number }[],
  offerIds: Set<string>,
): { key: string; label: string; count: number }[];
export function compareProductsByViewCount(a: any, b: any): number;
export function resolveCatalogAttributeKeys(product: any, offerIds: Set<string>): Set<string>;

