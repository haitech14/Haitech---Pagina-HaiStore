import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'EUR', locale = 'es-ES') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { isTonerOrRepuestosCategory, roundPenToNearestNine } from '@/lib/pen-pricing';

export { DEFAULT_USD_TO_PEN, USD_TO_PEN } from '@/lib/exchange-rate';

export function usdToPen(usd: number, rate = getUsdToPenSaleRate()): number {
  if (!Number.isFinite(usd) || usd <= 0 || rate <= 0) return 0;
  return roundPenToNearestNine(usd * rate);
}

export function penToUsd(pen: number, rate = getUsdToPenSaleRate()): number {
  return Math.round((pen / rate) * 100) / 100;
}

export function formatUsd(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}

export function formatPenFromUsd(usd: number, rate = getUsdToPenSaleRate()): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(usdToPen(usd, rate));
}

/** Vitrina: soles al 9 sin centavos; tóner y repuestos con 2 decimales. */
export function formatPenFromUsdDisplay(
  usd: number,
  category?: string | null,
  rate = getUsdToPenSaleRate(),
): string {
  if (isTonerOrRepuestosCategory(category)) {
    return formatPenFromUsdPrecise(usd, rate);
  }
  return formatPenFromUsd(usd, rate);
}

/** Soles con decimales (tabla de inventario). */
export function formatPenFromUsdPrecise(usd: number, rate = getUsdToPenSaleRate()): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd * rate);
}
