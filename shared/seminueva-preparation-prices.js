import { ensureFullPrices } from '../server/lib/roles.js';

/** Tipos de preparado con precio propio (acondicionado = precios base del producto). */
export const SEMINUEVA_PREPARATION_PRICE_TYPES = ['semirepotenciado', 'remanufacturado'];

/**
 * Normaliza precios absolutos por tipo de preparado.
 * Solo conserva tipos con al menos un precio > 0.
 * @param {unknown} input
 * @returns {Record<string, Record<string, number>> | undefined}
 */
export function normalizePreparationPrices(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;

  /** @type {Record<string, Record<string, number>>} */
  const result = {};

  for (const type of SEMINUEVA_PREPARATION_PRICE_TYPES) {
    const raw = /** @type {Record<string, unknown>} */ (input)[type];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const prices = ensureFullPrices(raw);
    const hasPrice = Object.values(prices).some((value) => Number(value) > 0);
    if (!hasPrice) continue;
    result[type] = prices;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
