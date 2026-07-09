export type DisplayCurrency = 'USD' | 'PEN' | 'BOTH';

export const DISPLAY_CURRENCIES: readonly DisplayCurrency[] = ['USD', 'PEN', 'BOTH'] as const;

/** Moneda mostrada al visitar la tienda por primera vez ($ + S/). */
export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'BOTH';
