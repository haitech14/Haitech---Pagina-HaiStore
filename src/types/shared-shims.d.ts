declare module '../../shared/category-inventory-labels.js' {
  export const catalogFamilyForSlug: (slug: string) => string | null;
  export const applyEquipmentSubcategorySlugFilter: <T>(products: readonly T[], subSlug: string | null | undefined) => T[];
}

declare module '../../shared/home-catalog-filter.js' {
  export const isPrinterEquipmentProduct: (product: unknown) => boolean;
  export const productMatchesCategoryFilter: (product: any, filterValue: string) => boolean;
  export const productMatchesCondition: (product: any, condition: any, catalogFamily: any) => boolean;
  export const productMatchesCatalogFamily: (product: any, family: string) => boolean;
}

declare module '../../shared/catalog-brand-filter.js' {
  export const buildBrandFacets: (products: any[]) => { key: string; label: string; count: number }[];
  export const productMatchesBrandFilter: (product: any, brandKeys: string[]) => boolean;
  export const normalizeCatalogBrandKey: (value: string) => string;
  export const getCatalogBrandLabel: (key: string) => string;
}

declare module '../../shared/catalog-most-viewed-offers.js' {
  export const MOST_VIEWED_OFFER_ATTR_KEY: string;
  export const resolveMostViewedOfferProductIds: (products: any[]) => Set<string>;
  export const resolveMostViewedOfferProductIdsFromLocalStorage: () => Set<string>;
  export const productHasMostViewedOfferAttribute: (product: any, offerIds: Set<string>) => boolean;
  export const appendMostViewedOfferFacet: (
    facets: { key: string; label: string; count: number }[],
    offerIds: Set<string>,
  ) => { key: string; label: string; count: number }[];
  export const compareProductsByViewCount: (a: any, b: any) => number;
  export const resolveCatalogAttributeKeys: (product: any, offerIds: Set<string>) => Set<string>;
}

declare module '../../shared/ricoh-model-ppm.js' {
  export function resolveRicohModelPpm(input: unknown): number | null;
}

