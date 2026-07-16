import type { ProductRolePrices } from '../src/lib/roles';

export type SeminuevaPreparationPriceType = 'semirepotenciado' | 'remanufacturado';

export type SeminuevaPreparationPrices = Partial<
  Record<SeminuevaPreparationPriceType, ProductRolePrices>
>;

export const SEMINUEVA_PREPARATION_PRICE_TYPES: readonly SeminuevaPreparationPriceType[];

export function normalizePreparationPrices(
  input: unknown,
): SeminuevaPreparationPrices | undefined;
