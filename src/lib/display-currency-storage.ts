import type { DisplayCurrency } from '@/types/display-currency';

const STORAGE_KEY = 'haistore-display-currency';

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === 'undefined') return 'PEN';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'USD' || stored === 'PEN' || stored === 'BOTH') return stored;
  return 'PEN';
}

export function writeDisplayCurrency(currency: DisplayCurrency): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, currency);
}
