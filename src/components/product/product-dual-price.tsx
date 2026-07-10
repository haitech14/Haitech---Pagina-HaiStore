import { formatEquipmentRentalPen } from '@/lib/rental-calculator';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { getDisplayPriceVisibility } from '@/lib/display-price';
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
  const { displayCurrency } = useDisplayCurrency();
  const visibility = getDisplayPriceVisibility(displayCurrency);
  const showUsd = visibility.showUsd;
  const showPen = visibility.showPen;
  const usd = penToUsd(estimatedMonthlyPen);

  return (
    <span className={cn('inline-flex flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap', className)}>
      {showUsd ? (
        <span className="text-foreground">{formatUsd(usd)}</span>
      ) : null}
      {showUsd && showPen ? (
        <span aria-hidden="true" className="font-normal text-muted-foreground">
          {' '}
          ·{' '}
        </span>
      ) : null}
      {showPen ? (
        <span className="text-red-600">
          S/ {formatEquipmentRentalPen(estimatedMonthlyPen)}
        </span>
      ) : null}
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
}

/** Precio en USD, PEN o ambos según la moneda activa del header. */
export function DualPrice({
  usd,
  className,
  strikethrough = false,
  alwaysBoth = false,
  stacked = false,
}: DualPriceProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const visibility = getDisplayPriceVisibility(displayCurrency);
  const showUsd = alwaysBoth || visibility.showUsd;
  const showPen = alwaysBoth || visibility.showPen;
  const penFirst = dualPriceOrder === 'pen-usd';
  const strike = strikethrough
    ? 'line-through decoration-muted-foreground decoration-solid'
    : undefined;

  if (stacked && showUsd && showPen) {
    const primary = penFirst
      ? { label: formatPenFromUsd(usd), className: 'text-red-600' }
      : { label: formatUsd(usd), className: 'text-foreground' };
    const secondary = penFirst
      ? { label: formatUsd(usd), className: 'text-foreground' }
      : { label: formatPenFromUsd(usd), className: 'text-red-600' };

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

  return (
    <span className={cn('inline-flex flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap', className)}>
      {showUsd ? (
        <span className={cn(strike, 'text-foreground')}>
          {formatUsd(usd)}
        </span>
      ) : null}
      {showUsd && showPen ? (
        <span aria-hidden="true" className="font-normal text-muted-foreground">
          {' '}
          ·{' '}
        </span>
      ) : null}
      {showPen ? (
        <span className={cn(strike, 'text-red-600')}>
          {formatPenFromUsd(usd)}
        </span>
      ) : null}
    </span>
  );
}
