import type { ReactNode } from 'react';
import { Package } from 'lucide-react';

import { InventoryHoverTooltip } from '@/components/admin/inventory/inventory-hover-tooltip';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';
import type { ProductStockLocation } from '@/types/product';

interface ProductStockHoverProps {
  stock: number;
  outOfStock?: boolean;
  stockLocations?: ProductStockLocation[] | null;
  className?: string;
  iconClassName?: string;
  /** Si false, solo muestra el número (p. ej. sin ícono). */
  showIcon?: boolean;
}

function StockLocationsTooltipContent({
  locations,
  total,
}: {
  locations: ProductStockLocation[];
  total: number;
}) {
  return (
    <div className="min-w-[10rem] rounded-md bg-popover px-2.5 py-2 text-left">
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        Lugar de almacén
      </p>
      <ul className="mt-1 space-y-0.5">
        {locations.map((line) => (
          <li
            key={`${line.name}-${line.quantity}`}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="min-w-0 max-w-[9rem] truncate text-foreground">{line.name}</span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {line.quantity}
            </span>
          </li>
        ))}
      </ul>
      {locations.length > 1 ? (
        <p className="mt-1.5 border-t border-border pt-1 text-[0.65rem] text-muted-foreground">
          Total: <span className="font-semibold tabular-nums text-foreground">{total}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Stock con tooltip de almacén al pasar el cursor (tienda). */
export function ProductStockHover({
  stock,
  outOfStock = false,
  stockLocations = null,
  className,
  iconClassName = 'size-3.5 shrink-0',
  showIcon = true,
}: ProductStockHoverProps) {
  const stockLabel = outOfStock
    ? PRODUCT_ON_REQUEST_STOCK_LABEL
    : String(Math.max(0, Math.floor(Number(stock) || 0)));
  const locations = (stockLocations ?? []).filter((row) => row.quantity > 0);
  const showWarehouseTooltip = !outOfStock && locations.length > 0;

  const badge: ReactNode = (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 tabular-nums',
        outOfStock ? 'text-[#8a93a3]' : 'text-emerald-700',
        showWarehouseTooltip ? 'cursor-help' : null,
        className,
      )}
    >
      {showIcon && !outOfStock ? (
        <Package className={iconClassName} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      <span>{stockLabel}</span>
    </span>
  );

  if (!showWarehouseTooltip) return badge;

  return (
    <InventoryHoverTooltip
      side="top"
      align="end"
      ariaLabel={`Stock ${stockLabel}. Lugar de almacén.`}
      trigger={badge}
    >
      <StockLocationsTooltipContent locations={locations} total={stock} />
    </InventoryHoverTooltip>
  );
}
