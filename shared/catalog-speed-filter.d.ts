export const SPEED_FILTER_OPTIONS: readonly {
  key: string;
  sidebarLabel: string;
  min: number;
  max: number;
}[];

export function parsePpmFromText(text: string | null | undefined): number | null;
export function resolveProductSpeedPpm(product: {
  name?: string | null;
  code?: string | null;
  attributes?: { name?: string; value?: string }[];
}): number | null;
export function findSpeedFilterOption(speedKey: string | null | undefined): (typeof SPEED_FILTER_OPTIONS)[number] | null;
export function productMatchesSpeedFilterKey(product: object, speedKey: string | null | undefined): boolean;
export function productMatchesSpeedFilterKeys(product: object, speedKeys: readonly string[]): boolean;
export function countProductsForSpeedFilterKey(products: readonly object[], speedKey: string): number;
