import {
  DEFAULT_DISPLAY_CURRENCY,
  DEFAULT_DUAL_PRICE_ORDER,
  type DisplayCurrency,
  type DualPriceOrder,
} from '@/types/display-currency';

const STORAGE_KEY = 'haistore-display-currency';
const DUAL_ORDER_STORAGE_KEY = 'haistore-dual-price-order';
const PREF_VERSION_KEY = 'haistore-display-currency-version';
const PREF_VERSION = 'pen-first-both-v1';

function applyDefaultCurrencyPrefs(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREF_VERSION_KEY, PREF_VERSION);
  window.localStorage.setItem(STORAGE_KEY, DEFAULT_DISPLAY_CURRENCY);
  window.localStorage.setItem(DUAL_ORDER_STORAGE_KEY, DEFAULT_DUAL_PRICE_ORDER);
}

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === 'undefined') return DEFAULT_DISPLAY_CURRENCY;
  if (window.localStorage.getItem(PREF_VERSION_KEY) !== PREF_VERSION) {
    applyDefaultCurrencyPrefs();
    return DEFAULT_DISPLAY_CURRENCY;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'USD' || stored === 'PEN' || stored === 'BOTH') return stored;
  return DEFAULT_DISPLAY_CURRENCY;
}

export function writeDisplayCurrency(currency: DisplayCurrency): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREF_VERSION_KEY, PREF_VERSION);
  window.localStorage.setItem(STORAGE_KEY, currency);
}

export function readDualPriceOrder(): DualPriceOrder {
  if (typeof window === 'undefined') return DEFAULT_DUAL_PRICE_ORDER;
  const stored = window.localStorage.getItem(DUAL_ORDER_STORAGE_KEY);
  if (stored === 'pen-usd' || stored === 'usd-pen') return stored;
  return DEFAULT_DUAL_PRICE_ORDER;
}

export function writeDualPriceOrder(order: DualPriceOrder): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREF_VERSION_KEY, PREF_VERSION);
  window.localStorage.setItem(DUAL_ORDER_STORAGE_KEY, order);
}
