import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

interface ProductDualPriceProps {
  usd: number;
  className?: string;
  /** Apila soles debajo del dólar en lugar de en línea. */
  stacked?: boolean;
}

export function ProductDualPrice({ usd, className, stacked = false }: ProductDualPriceProps) {
  if (stacked) {
    return (
      <span className={cn('flex flex-col leading-tight', className)}>
        <span className="font-bold tabular-nums">{formatUsd(usd)}</span>
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {formatPenFromUsd(usd)}
        </span>
      </span>
    );
  }

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="font-normal text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}
