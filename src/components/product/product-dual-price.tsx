import { useDisplayCurrency } from '@/context/display-currency-context';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

export interface DualPriceProps {
  usd: number;
  className?: string;
  strikethrough?: boolean;
  /** Vitrina destacada: siempre USD y PEN con guion, como el diseño de referencia. */
  alwaysBoth?: boolean;
  /** Apila USD y PEN en líneas separadas (sidebar checkout). */
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
  const { displayCurrency } = useDisplayCurrency();
  const visibility = getDisplayPriceVisibility(displayCurrency);
  const showUsd = alwaysBoth || visibility.showUsd;
  const showPen = alwaysBoth || visibility.showPen;
  const strike = strikethrough
    ? 'line-through decoration-muted-foreground decoration-solid'
    : undefined;

  if (stacked && showUsd && showPen) {
    return (
      <span
        className={cn(
          'inline-flex flex-col items-end gap-0.5 text-right tabular-nums leading-tight',
          className,
        )}
      >
        <span className={cn(strike, 'text-foreground')}>{formatUsd(usd)}</span>
        <span className={cn(strike, 'text-red-600')}>{formatPenFromUsd(usd)}</span>
      </span>
    );
  }

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
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
        <span className={cn(strike, showUsd ? 'text-red-600' : 'text-foreground')}>
          {formatPenFromUsd(usd)}
        </span>
      ) : null}
    </span>
  );
}
