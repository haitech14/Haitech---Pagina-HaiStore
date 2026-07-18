import { formatEquipmentRentalPen } from '@/lib/rental-calculator';
import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  CONSULTAR_PRECIO_LABEL,
  getDisplayPriceVisibility,
  isPriceOnRequest,
} from '@/lib/display-price';
import { cn, formatPenFromUsd, formatUsd, penToUsd } from '@/lib/utils';

export interface RentalEstimateDualPriceProps {
  estimatedMonthlyPen: number;
  className?: string;
}

/** Precio mensual de alquiler: PEN como fuente de verdad (sin redondeo al 9). */
export function RentalEstimateDualPrice({
  estimatedMonthlyPen,
  className,
}: RentalEstimateDualPriceProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const visibility = getDisplayPriceVisibility(displayCurrency);
  const showUsd = visibility.showUsd;
  const showPen = visibility.showPen;
  const usd = penToUsd(estimatedMonthlyPen);
  const penFirst = dualPriceOrder === 'pen-usd';

  const usdSpan = showUsd ? (
    <span className="text-foreground">{formatUsd(usd)}</span>
  ) : null;
  const penSpan = showPen ? (
    <span className="text-red-600">S/ {formatEquipmentRentalPen(estimatedMonthlyPen)}</span>
  ) : null;
  const separator =
    showUsd && showPen ? (
      <span aria-hidden="true" className="font-normal text-muted-foreground">
        {' '}
        ·{' '}
      </span>
    ) : null;

  return (
    <span className={cn('inline-flex flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap', className)}>
      {penFirst ? (
        <>
          {penSpan}
          {separator}
          {usdSpan}
        </>
      ) : (
        <>
          {usdSpan}
          {separator}
          {penSpan}
        </>
      )}
    </span>
  );
}

export interface DualPriceProps {
  usd: number;
  className?: string;
  strikethrough?: boolean;
  /** Vitrina destacada: siempre PEN y USD con guion, como el diseño de referencia. */
  alwaysBoth?: boolean;
  /** Apila PEN y USD en líneas separadas (sidebar checkout). */
  stacked?: boolean;
  /**
   * When true, keep rendering $0 / S/ 0 (checkout totals, discounts, IGV).
   * Default: storefront product prices show «Consultar Precio» instead.
   */
  allowZero?: boolean;
}

/** Precio en USD, PEN o ambos según la moneda activa del header. */
export function DualPrice({
  usd,
  className,
  strikethrough = false,
  alwaysBoth = false,
  stacked = false,
  allowZero = false,
}: DualPriceProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const visibility = getDisplayPriceVisibility(displayCurrency);
  const showUsd = alwaysBoth || visibility.showUsd;
  const showPen = alwaysBoth || visibility.showPen;
  const penFirst = dualPriceOrder === 'pen-usd';
  const strike = strikethrough
    ? 'line-through decoration-muted-foreground decoration-solid'
    : undefined;

  if (!allowZero && isPriceOnRequest(usd)) {
    return (
      <span className={cn('whitespace-nowrap', className)}>{CONSULTAR_PRECIO_LABEL}</span>
    );
  }

  const usdSpan = showUsd ? (
    <span className={cn(strike, 'text-foreground')}>{formatUsd(usd)}</span>
  ) : null;
  const penSpan = showPen ? (
    <span className={cn(strike, 'text-foreground')}>{formatPenFromUsd(usd)}</span>
  ) : null;

  if (stacked && showUsd && showPen) {
    const primary = penFirst
      ? { label: formatPenFromUsd(usd), className: 'text-foreground' }
      : { label: formatUsd(usd), className: 'text-foreground' };
    const secondary = penFirst
      ? { label: formatUsd(usd), className: 'text-foreground' }
      : { label: formatPenFromUsd(usd), className: 'text-foreground' };

    return (
      <span
        className={cn(
          'inline-flex flex-col items-end gap-0.5 text-right tabular-nums leading-tight',
          className,
        )}
      >
        <span className={cn(strike, primary.className)}>{primary.label}</span>
        <span className={cn(strike, secondary.className)}>{secondary.label}</span>
      </span>
    );
  }

  const separator =
    showUsd && showPen ? (
      <span aria-hidden="true" className="font-normal text-muted-foreground">
        {' '}
        ·{' '}
      </span>
    ) : null;

  return (
    <span className={cn('inline-flex flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap', className)}>
      {penFirst ? (
        <>
          {penSpan}
          {separator}
          {usdSpan}
        </>
      ) : (
        <>
          {usdSpan}
          {separator}
          {penSpan}
        </>
      )}
    </span>
  );
}
