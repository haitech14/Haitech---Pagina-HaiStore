/**
 * Redondeo comercial en soles enteros al dígito 9 más cercano.
 * Ej.: 2287 → 2289; 2190 → 2189; 2429 (ya termina en 9) se mantiene.
 */
export function roundPenToNearestNine(pen: number): number {
  if (!Number.isFinite(pen) || pen <= 0) return 0;

  const n = Math.round(pen);
  const base = Math.floor(n / 10);
  const candidates = [base * 10 - 1, base * 10 + 9].filter((value) => value > 0);

  let best = candidates[0] ?? 9;
  let bestDistance = Math.abs(n - best);

  for (const candidate of candidates) {
    const distance = Math.abs(n - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Redondeo comercial en soles: centésimas que terminan en 9 (segundo decimal = 9).
 * Ej.: 33.30 → 33.29; 10.04 → 10.09; 10.09 (ya termina en 9) se mantiene.
 */
export function roundPenCharm99(pen: number): number {
  if (!Number.isFinite(pen) || pen <= 0) return 0;

  const centavos = Math.round(pen * 100);
  const quotient = Math.floor(centavos / 10);

  const candidates = [
    (quotient - 1) * 10 + 9,
    quotient * 10 + 9,
    (quotient + 1) * 10 + 9,
  ].filter((value) => value >= 9);

  let best = candidates[0] ?? 9;
  let bestDistance = Math.abs(centavos - best);

  for (const candidate of candidates) {
    const distance = Math.abs(centavos - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best / 100;
}

/** Conversión USD → PEN sin redondeo comercial (p. ej. precio de compra). */
export function usdToPenPrecise(usd: number, exchangeRate: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || exchangeRate <= 0) return 0;
  return Math.round(usd * exchangeRate * 100) / 100;
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
  const rounded = Math.round(pen * 100) / 100;
  const hasFraction = Math.abs(rounded % 1) > 0.001;

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}
