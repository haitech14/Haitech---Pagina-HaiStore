export type DisplayCurrency = 'USD' | 'PEN' | 'BOTH';

/** Orden vertical en modo BOTH: soles arriba o dólares arriba. */
export type DualPriceOrder = 'pen-usd' | 'usd-pen';

export const DISPLAY_CURRENCIES: readonly DisplayCurrency[] = ['USD', 'PEN', 'BOTH'] as const;

/** Moneda mostrada al visitar la tienda por primera vez ($ + S/). */
export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'BOTH';

/** Orden por defecto en modo BOTH ($ a la izquierda, S/ a la derecha). */
export const DEFAULT_DUAL_PRICE_ORDER: DualPriceOrder = 'usd-pen';
