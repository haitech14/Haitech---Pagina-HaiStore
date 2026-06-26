import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { formatUsd } from '@/lib/utils';

export const CARD_PAYMENT_SURCHARGE_RATE = 0.05;

export type CheckoutPaymentCurrency = 'USD' | 'PEN';

export interface CheckoutTotals {
  subtotalUsd: number;
  discountUsd: number;
  baseUsd: number;
  cardSurchargeUsd: number;
  totalUsd: number;
  basePen: number;
  cardSurchargePen: number;
  totalPen: number;
}

export function hasCardPaymentSurcharge(provider: CheckoutPaymentProvider): boolean {
  return provider === 'culqi';
}

export function calculateCheckoutTotals(params: {
  subtotalUsd: number;
  discountUsd?: number;
  paymentProvider: CheckoutPaymentProvider;
  exchangeRate?: number;
}): CheckoutTotals {
  const discountUsd = params.discountUsd ?? 0;
  const exchangeRate = params.exchangeRate ?? getUsdToPenSaleRate();
  const baseUsd = Math.max(0, Math.round((params.subtotalUsd - discountUsd) * 100) / 100);
  const cardSurchargeUsd = hasCardPaymentSurcharge(params.paymentProvider)
    ? Math.round(baseUsd * CARD_PAYMENT_SURCHARGE_RATE * 100) / 100
    : 0;
  const totalUsd = Math.round((baseUsd + cardSurchargeUsd) * 100) / 100;
  const basePen = Math.round(baseUsd * exchangeRate * 100) / 100;
  const cardSurchargePen = Math.round(cardSurchargeUsd * exchangeRate * 100) / 100;
  const totalPen = Math.round(totalUsd * exchangeRate * 100) / 100;

  return {
    subtotalUsd: params.subtotalUsd,
    discountUsd,
    baseUsd,
    cardSurchargeUsd,
    totalUsd,
    basePen,
    cardSurchargePen,
    totalPen,
  };
}

export function formatPenAmount(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pen);
}

export function formatCheckoutAmount(
  usd: number,
  pen: number,
  currency: CheckoutPaymentCurrency,
): string {
  return currency === 'PEN' ? formatPenAmount(pen) : formatUsd(usd);
}
