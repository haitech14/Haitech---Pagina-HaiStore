import type { DisplayCurrency } from '@/types/display-currency';
import { formatPenFromUsd, formatUsd, penToUsd, usdToPen } from '@/lib/utils';

export function getDisplayPriceVisibility(displayCurrency: DisplayCurrency) {
  return {
    showUsd: displayCurrency !== 'PEN',
    showPen: displayCurrency !== 'USD',
  };
}

/** Precio formateado según moneda activa ($, S/ o ambos). */
export function formatDisplayPriceFromUsd(
  usd: number,
  displayCurrency: DisplayCurrency,
): string {
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const parts: string[] = [];
  if (showUsd) parts.push(formatUsd(usd));
  if (showPen) parts.push(formatPenFromUsd(usd));
  return parts.join(' · ');
}

/** Monto en soles convertido y formateado según moneda activa. */
export function formatDisplayPriceFromPen(
  pen: number,
  displayCurrency: DisplayCurrency,
): string {
  return formatDisplayPriceFromUsd(penToUsd(pen), displayCurrency);
}

export function formatPenInteger(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(pen);
}

/** Mensaje promocional: «Si llevas N, llévate en $X» según moneda activa. */
export function formatVolumeQuantityPromoMessage(
  quantity: number,
  unitPriceUsd: number,
  displayCurrency: DisplayCurrency,
): string {
  const amount = formatDisplayPriceFromUsd(unitPriceUsd, displayCurrency);
  return `Si llevas ${quantity}, llévate en ${amount}`;
}

/** Mensaje promocional: «Si llevas N, ahorra S/ X soles». */
export function formatOfferQuantitySavingsMessage(
  targetQuantity: number,
  savingsPen: number,
): string {
  const amount = savingsPen.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Si llevas ${targetQuantity}, ahorra S/ ${amount} soles`;
}

export function formatOfferQuantitySavingsMessageFromUsd(
  targetQuantity: number,
  savingsUsd: number,
): string {
  return formatOfferQuantitySavingsMessage(targetQuantity, usdToPen(savingsUsd));
}

export function discountedUsdPrice(usd: number, discountPercent: number): number {
  return Math.round(usd * (1 - discountPercent / 100) * 100) / 100;
}

export function discountedPenPrice(usd: number, discountPercent: number): number {
  return Math.round(usdToPen(usd) * (1 - discountPercent / 100));
}

/** Precio unitario con descuento por volumen según moneda activa. */
export function formatVolumeUnitPrice(
  unitPriceUsd: number,
  discountPercent: number,
  displayCurrency: DisplayCurrency,
): string {
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const parts: string[] = [];

  if (showUsd) {
    parts.push(formatUsd(discountedUsdPrice(unitPriceUsd, discountPercent)));
  }
  if (showPen) {
    parts.push(formatPenInteger(discountedPenPrice(unitPriceUsd, discountPercent)));
  }

  return parts.join(' · ');
}
