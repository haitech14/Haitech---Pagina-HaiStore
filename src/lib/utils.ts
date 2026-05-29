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

/** Tipo de cambio referencial USD → PEN para precios duales en vitrina. */
export const USD_TO_PEN = 3.7;

export function usdToPen(usd: number): number {
  return Math.round(usd * USD_TO_PEN);
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
