/**
 * Redondeo comercial en soles: enteros que terminan en 9.
 * Ej.: 2188 → 2199; 1262 → 1299; 1439 (ya termina en 9) se mantiene.
 */
export function roundPenCharm99(pen: number): number {
  if (!Number.isFinite(pen) || pen <= 0) return 0;

  const n = Math.round(pen);
  if (n % 10 === 9) return n;

  if (n < 100) {
    return Math.max(9, Math.ceil(n / 10) * 10 - 1);
  }

  return Math.ceil((n + 1) / 100) * 100 - 1;
}

export function usdToPenCharm(usd: number, exchangeRate: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || exchangeRate <= 0) return 0;
  return roundPenCharm99(usd * exchangeRate);
}

export function penCharmToUsd(pen: number, exchangeRate: number): number {
  if (!Number.isFinite(pen) || pen <= 0 || exchangeRate <= 0) return 0;
  return Math.round((pen / exchangeRate) * 100) / 100;
}

export function formatPenInteger(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(pen));
}
