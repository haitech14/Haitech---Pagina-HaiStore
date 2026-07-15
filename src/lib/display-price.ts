import {
  DEFAULT_DUAL_PRICE_ORDER,
  type DisplayCurrency,
  type DualPriceOrder,
} from '@/types/display-currency';
import { formatPenFromUsd, formatUsd, penToUsd, usdToPen } from '@/lib/utils';

/** Copy for public storefront when list price is missing or zero. */
export const CONSULTAR_PRECIO_LABEL = 'Consultar Precio';

/** True when the storefront should not show a numeric price ($0 / null / NaN). */
export function isPriceOnRequest(usd: number | null | undefined): boolean {
  return usd == null || !Number.isFinite(usd) || usd <= 0;
}

export function getDisplayPriceVisibility(displayCurrency: DisplayCurrency) {
  return {
    showUsd: displayCurrency !== 'PEN',
    showPen: displayCurrency !== 'USD',
  };
}

/** Precio formateado según moneda activa ($, S/ o ambos) y orden dual. */
export function formatDisplayPriceFromUsd(
  usd: number,
  displayCurrency: DisplayCurrency,
  dualPriceOrder: DualPriceOrder = DEFAULT_DUAL_PRICE_ORDER,
): string {
  if (isPriceOnRequest(usd)) return CONSULTAR_PRECIO_LABEL;

  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const parts: string[] = [];
  const penFirst = dualPriceOrder === 'pen-usd';

  if (penFirst) {
    if (showPen) parts.push(formatPenFromUsd(usd));
    if (showUsd) parts.push(formatUsd(usd));
  } else {
    if (showUsd) parts.push(formatUsd(usd));
    if (showPen) parts.push(formatPenFromUsd(usd));
  }

  return parts.join(' · ');
}

/** Monto en soles convertido y formateado según moneda activa. */
export function formatDisplayPriceFromPen(
  pen: number,
  displayCurrency: DisplayCurrency,
  dualPriceOrder: DualPriceOrder = DEFAULT_DUAL_PRICE_ORDER,
): string {
  return formatDisplayPriceFromUsd(penToUsd(pen), displayCurrency, dualPriceOrder);
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
  dualPriceOrder: DualPriceOrder = DEFAULT_DUAL_PRICE_ORDER,
): string {
  const amount = formatDisplayPriceFromUsd(unitPriceUsd, displayCurrency, dualPriceOrder);
  return `Si llevas ${quantity}, llévate en ${amount}`;
}

/** Mensaje promocional: «Llévate N unidades a S/ X c/u» según moneda activa. */
export function formatVolumePerUnitPromoMessage(
  quantity: number,
  unitPriceUsd: number,
  displayCurrency: DisplayCurrency,
  dualPriceOrder: DualPriceOrder = DEFAULT_DUAL_PRICE_ORDER,
): string {
  const amount = formatDisplayPriceFromUsd(unitPriceUsd, displayCurrency, dualPriceOrder);
  const unitLabel = quantity === 1 ? 'unidad' : 'unidades';
  return `Llévate ${quantity} ${unitLabel} a ${amount} c/u`;
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
  dualPriceOrder: DualPriceOrder = DEFAULT_DUAL_PRICE_ORDER,
): string {
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const parts: string[] = [];
  const penFirst = dualPriceOrder === 'pen-usd';
  const usdPart = formatUsd(discountedUsdPrice(unitPriceUsd, discountPercent));
  const penPart = formatPenInteger(discountedPenPrice(unitPriceUsd, discountPercent));

  if (penFirst) {
    if (showPen) parts.push(penPart);
    if (showUsd) parts.push(usdPart);
  } else {
    if (showUsd) parts.push(usdPart);
    if (showPen) parts.push(penPart);
  }

  return parts.join(' · ');
}
