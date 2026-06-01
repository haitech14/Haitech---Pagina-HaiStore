/** Tipo de cambio por defecto USD → PEN (referencial). */
export const DEFAULT_USD_TO_PEN = 3.7;

let activeSaleRate = DEFAULT_USD_TO_PEN;
let activePurchaseRate = DEFAULT_USD_TO_PEN;

export function normalizeUsdToPenRate(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_USD_TO_PEN;
  }
  return Math.round(parsed * 10000) / 10000;
}

/** Tipo de cambio venta (precios al cliente, tienda, TPV). */
export function getUsdToPenSaleRate(): number {
  return activeSaleRate;
}

/** Tipo de cambio compra (costos y columna «Compra» del inventario). */
export function getUsdToPenPurchaseRate(): number {
  return activePurchaseRate;
}

/** Alias de venta; usado en la tienda pública. */
export function getUsdToPenRate(): number {
  return activeSaleRate;
}

export function setExchangeRates(sale: unknown, purchase?: unknown): void {
  activeSaleRate = normalizeUsdToPenRate(sale);
  activePurchaseRate = normalizeUsdToPenRate(purchase ?? sale);
}

export function setUsdToPenRate(rate: unknown): void {
  setExchangeRates(rate, activePurchaseRate);
}

/** Alias histórico; preferir `getUsdToPenSaleRate()`. */
export const USD_TO_PEN = DEFAULT_USD_TO_PEN;
