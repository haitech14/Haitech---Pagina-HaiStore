import { getEffectivePrice } from '@/lib/pricing';
import { usdToPen } from '@/lib/utils';
import type { TpvCurrency } from '@/types/tpv';
import type { InventoryProduct, PriceRole } from '@/types/product';

export function unitPriceForTpv(
  product: InventoryProduct,
  priceList: PriceRole,
  currency: TpvCurrency,
): number {
  const usd = getEffectivePrice(product, priceList);
  if (currency === 'USD') return usd;
  return usdToPen(usd);
}

export function formatTpvMoney(amount: number, currency: TpvCurrency): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function tpvCurrencyLabel(currency: TpvCurrency): string {
  return currency === 'USD' ? 'DÓLARES (USD)' : 'SOLES (PEN)';
}
