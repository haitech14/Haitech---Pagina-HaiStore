import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { formatUsd } from '@/lib/utils';

export const CARD_PAYMENT_SURCHARGE_RATE = 0.05;
export const INSTALLMENT_SURCHARGE_RATE = 0.10;
export const INSTALLMENT_COUNT = 6;
export const IGV_RATE = 0.18;

export type CheckoutPaymentCurrency = 'USD' | 'PEN';

export interface CheckoutIgvBreakdown {
  gravadaUsd: number;
  igvUsd: number;
  gravadaPen: number;
  igvPen: number;
}

export interface CheckoutCardPaymentPreview {
  surchargeUsd: number;
  surchargePen: number;
  totalWithCardUsd: number;
  totalWithCardPen: number;
}

export interface CheckoutInstallmentPreview {
  totalWithInstallmentUsd: number;
  totalWithInstallmentPen: number;
  perInstallmentUsd: number;
  perInstallmentPen: number;
}

export interface CheckoutTotals {
  subtotalUsd: number;
  discountUsd: number;
  baseUsd: number;
  shippingPen: number;
  shippingUsd: number;
  cardSurchargeUsd: number;
  totalUsd: number;
  basePen: number;
  cardSurchargePen: number;
  totalPen: number;
}

export function penAmountToUsd(pen: number, exchangeRate?: number): number {
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  if (rate <= 0 || pen <= 0) return 0;
  return Math.round((pen / rate) * 100) / 100;
}

export function hasCardPaymentSurcharge(provider: CheckoutPaymentProvider): boolean {
  return provider === 'culqi';
}

/** IGV incluido en el precio: base gravada + impuesto 18%. */
export function calculateIgvBreakdown(
  amountUsd: number,
  exchangeRate?: number,
): CheckoutIgvBreakdown {
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const safeAmount = Math.max(0, amountUsd);
  const gravadaUsd = Math.round((safeAmount / (1 + IGV_RATE)) * 100) / 100;
  const igvUsd = Math.round((safeAmount - gravadaUsd) * 100) / 100;
  const gravadaPen = Math.round(gravadaUsd * rate * 100) / 100;
  const igvPen = Math.round(igvUsd * rate * 100) / 100;
  return { gravadaUsd, igvUsd, gravadaPen, igvPen };
}

/** Vista previa del recargo por pago con tarjeta (+5%). */
export function calculateCardPaymentPreview(
  baseUsd: number,
  exchangeRate?: number,
): CheckoutCardPaymentPreview {
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const safeBase = Math.max(0, baseUsd);
  const surchargeUsd = Math.round(safeBase * CARD_PAYMENT_SURCHARGE_RATE * 100) / 100;
  const totalWithCardUsd = Math.round((safeBase + surchargeUsd) * 100) / 100;
  const surchargePen = Math.round(surchargeUsd * rate * 100) / 100;
  const totalWithCardPen = Math.round(totalWithCardUsd * rate * 100) / 100;
  return { surchargeUsd, surchargePen, totalWithCardUsd, totalWithCardPen };
}

/** Vista previa de cuotas: +10% sobre base post-descuento, dividido en 6 cuotas. */
export function calculateInstallmentPreview(
  baseUsd: number,
  exchangeRate?: number,
): CheckoutInstallmentPreview {
  const rate = exchangeRate ?? getUsdToPenSaleRate();
  const safeBase = Math.max(0, baseUsd);
  const totalWithInstallmentUsd =
    Math.round(safeBase * (1 + INSTALLMENT_SURCHARGE_RATE) * 100) / 100;
  const perInstallmentUsd =
    Math.round((totalWithInstallmentUsd / INSTALLMENT_COUNT) * 100) / 100;
  const totalWithInstallmentPen = Math.round(totalWithInstallmentUsd * rate * 100) / 100;
  const perInstallmentPen =
    Math.round((totalWithInstallmentPen / INSTALLMENT_COUNT) * 100) / 100;
  return {
    totalWithInstallmentUsd,
    totalWithInstallmentPen,
    perInstallmentUsd,
    perInstallmentPen,
  };
}

export function calculateCheckoutTotals(params: {
  subtotalUsd: number;
  discountUsd?: number;
  paymentProvider: CheckoutPaymentProvider;
  shippingPen?: number;
  freeShipping?: boolean;
  exchangeRate?: number;
}): CheckoutTotals {
  const discountUsd = params.discountUsd ?? 0;
  const exchangeRate = params.exchangeRate ?? getUsdToPenSaleRate();
  const baseUsd = Math.max(0, Math.round((params.subtotalUsd - discountUsd) * 100) / 100);
  const shippingPen = params.freeShipping ? 0 : Math.max(0, params.shippingPen ?? 0);
  const shippingUsd = penAmountToUsd(shippingPen, exchangeRate);
  const cardSurchargeUsd = hasCardPaymentSurcharge(params.paymentProvider)
    ? Math.round(baseUsd * CARD_PAYMENT_SURCHARGE_RATE * 100) / 100
    : 0;
  const totalUsd = Math.round((baseUsd + shippingUsd + cardSurchargeUsd) * 100) / 100;
  const basePen = Math.round(baseUsd * exchangeRate * 100) / 100;
  const cardSurchargePen = Math.round(cardSurchargeUsd * exchangeRate * 100) / 100;
  const totalPen = Math.round(totalUsd * exchangeRate * 100) / 100;

  return {
    subtotalUsd: params.subtotalUsd,
    discountUsd,
    baseUsd,
    shippingPen,
    shippingUsd,
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
