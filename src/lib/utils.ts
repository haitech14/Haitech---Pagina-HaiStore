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

export { DEFAULT_USD_TO_PEN, USD_TO_PEN } from '@/lib/exchange-rate';

export function usdToPen(usd: number, rate = getUsdToPenSaleRate()): number {
  return Math.round(usd * rate);
}

export function penToUsd(pen: number, rate = getUsdToPenSaleRate()): number {
  return Math.round((pen / rate) * 100) / 100;
}

export function formatUsd(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}

export function formatPenFromUsd(usd: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(usdToPen(usd));
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
