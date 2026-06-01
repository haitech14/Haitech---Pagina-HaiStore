import { formatPenInteger, usdToPenCharm } from '@/lib/pen-pricing';
import { cn, formatUsd } from '@/lib/utils';
import type { InventorySupplier } from '@/types/product';

interface InventorySuppliersTooltipContentProps {
  suppliers: InventorySupplier[];
  referencePurchaseUsd: number;
  exchangeRate: number;
}

export function InventorySuppliersTooltipContent({
  suppliers,
  referencePurchaseUsd,
  exchangeRate,
}: InventorySuppliersTooltipContentProps) {
  const rows = suppliers.filter(
    (row) => row.name?.trim() || Number(row.purchase_price_usd) > 0,
  );

  if (rows.length === 0) {
    return (
      <div className="min-w-[10rem] rounded-md bg-popover px-2.5 py-2 text-left">
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          Proveedores
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Sin proveedores registrados.</p>
      </div>
    );
  }

  const pricedUsd = rows
    .map((row) => Number(row.purchase_price_usd) || 0)
    .filter((n) => n > 0);
  const minUsd = pricedUsd.length > 0 ? Math.min(...pricedUsd) : 0;

  return (
    <div className="min-w-[11rem] max-w-[16rem] rounded-md bg-popover px-2.5 py-2 text-left">
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        Proveedores registrados
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {rows.map((row) => {
          const usd = Number(row.purchase_price_usd) || 0;
          const isReference =
            usd > 0 && Math.abs(usd - referencePurchaseUsd) < 0.01 && usd === minUsd;
          return (
            <li key={row.id} className="text-xs">
              <p
                className={cn(
                  'truncate font-medium text-foreground',
                  isReference && 'text-emerald-700 dark:text-emerald-400',
                )}
              >
                {row.name?.trim() || 'Sin nombre'}
                {isReference && rows.length > 1 ? (
                  <span className="ml-1 font-normal text-muted-foreground">(ref.)</span>
                ) : null}
              </p>
              <p className="tabular-nums text-foreground">{formatUsd(usd)}</p>
              <p className="tabular-nums text-muted-foreground">
                {usd > 0 ? formatPenInteger(usdToPenCharm(usd, exchangeRate)) : 'S/ —'}
              </p>
            </li>
          );
        })}
      </ul>
      {rows.length > 1 && (
        <p className="mt-2 border-t border-border pt-1.5 text-[0.65rem] text-muted-foreground">
          La columna Compra usa el menor precio entre proveedores.
        </p>
      )}
    </div>
  );
}
