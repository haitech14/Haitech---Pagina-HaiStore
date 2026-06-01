import { formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';

interface InventoryDualPriceCellProps {
  usd: number;
}

export function InventoryDualPriceCell({ usd }: InventoryDualPriceCellProps) {
  return (
    <div className="min-w-[4.5rem] leading-tight">
      <p className="font-medium tabular-nums">{formatUsd(usd)}</p>
      <p className="text-[0.65rem] text-muted-foreground tabular-nums">
        {formatPenFromUsdPrecise(usd)}
      </p>
    </div>
  );
}
