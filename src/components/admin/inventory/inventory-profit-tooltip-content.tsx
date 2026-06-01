import { formatPenInteger } from '@/lib/pen-pricing';
import { cn, formatUsd } from '@/lib/utils';
import type { PriceRole } from '@/types/product';

/** Cantidades típicas de pedido mayorista para el desglose de margen. */
export const MAYORISTA_ORDER_QUANTITIES = [3, 6, 12, 30, 50] as const;

function profitToneClass(isProfit: boolean, size: 'md' | 'sm' = 'md') {
  const base =
    size === 'md'
      ? 'text-sm font-semibold tabular-nums'
      : 'text-xs tabular-nums';
  return cn(
    base,
    isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive',
    size === 'sm' &&
      (isProfit ? 'text-emerald-600/90 dark:text-emerald-500/90' : 'text-destructive/80'),
  );
}

interface InventoryProfitTooltipContentProps {
  profitUsd: number;
  profitPen: number;
  priceRole?: PriceRole;
}

export function InventoryProfitTooltipContent({
  profitUsd,
  profitPen,
  priceRole,
}: InventoryProfitTooltipContentProps) {
  const isProfit = profitUsd >= 0;
  const showMayoristaOrders = priceRole === 'mayorista';

  return (
    <div
      className={cn(
        'rounded-md bg-popover px-2.5 py-2 text-left',
        showMayoristaOrders ? 'min-w-[11.5rem]' : 'min-w-[9rem]',
      )}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {isProfit ? 'Ganancia por unidad' : 'Pérdida por unidad'}
      </p>
      <p className={cn('mt-0.5 whitespace-nowrap', profitToneClass(isProfit))}>
        {formatUsd(profitUsd)}
      </p>
      <p className={cn('whitespace-nowrap', profitToneClass(isProfit, 'sm'))}>
        {formatPenInteger(profitPen)}
      </p>

      {showMayoristaOrders && (
        <>
          <p className="mt-2 border-t border-border pt-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Margen por pedido
          </p>
          <ul className="mt-1 space-y-1.5">
            {MAYORISTA_ORDER_QUANTITIES.map((qty) => {
              const orderProfitUsd = Math.round(profitUsd * qty * 100) / 100;
              const orderProfitPen = profitPen * qty;
              return (
                <li key={qty}>
                  <p className="text-[0.65rem] text-muted-foreground">{qty} equipos</p>
                  <p className={cn('whitespace-nowrap', profitToneClass(isProfit))}>
                    {formatUsd(orderProfitUsd)}
                  </p>
                  <p className={cn('whitespace-nowrap', profitToneClass(isProfit, 'sm'))}>
                    {formatPenInteger(orderProfitPen)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
