export const FORMATO_PAPEL_ATTR: string;
export const PRODUCCION_ATTR: string;
export const ADF_ATTR: string;

export function productAttributeKeys(product: any): Set<string>;
export function inferAdf(product: any): 'Estándar' | 'Doble Scan' | null;
export function inferFormatoPapelFromModel(product: any): 'A4' | 'A3' | null;
export function inferFormatoPapel(product: any): 'A4' | 'A3';
export function resolveFormatoPapel(product: any): 'A4' | 'A3';
export function inferProduccionTier(product: any): string;
export function inferColor(product: any): 'B/N' | 'Color';
export function resolveProductCatalogAttributeKeys(product: any): Set<string>;
export function productMatchesCatalogAttributeFilters(
  product: any,
  attributeKeys: string[],
  productionKey: string | null,
  offerIds?: Set<string>,
): boolean;
export function countProductsForCatalogAttributeKey(
  products: readonly any[],
  key: string,
): number;
export function buildInferredEquipmentCatalogAttributes(
  product: any,
): { name: string; value: string }[];
