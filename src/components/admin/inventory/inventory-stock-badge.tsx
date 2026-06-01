import { Badge } from '@/components/ui/badge';
import { InventoryHoverTooltip } from '@/components/admin/inventory/inventory-hover-tooltip';
import { getStockBreakdown } from '@/lib/inventory-stock';
import { cn } from '@/lib/utils';
import type { InventoryProduct, InventoryWarehouse } from '@/types/product';

interface InventoryStockBadgeProps {
  product: InventoryProduct;
  warehouses: InventoryWarehouse[];
}

export function InventoryStockBadge({ product, warehouses }: InventoryStockBadgeProps) {
  const breakdown = getStockBreakdown(product, warehouses);
  const total = product.stock;
  const hasMultiple = breakdown.filter((line) => line.quantity > 0).length > 1;

  const badge = (
    <Badge variant={total > 0 ? 'secondary' : 'destructive'} className="tabular-nums">
      {total}
    </Badge>
  );

  return (
    <InventoryHoverTooltip
      side="top"
      align="center"
      ariaLabel={`Stock total: ${total}. Desglose por almacén.`}
      trigger={badge}
    >
      <div className="min-w-[10rem] rounded-md bg-popover px-2.5 py-2 text-left">
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          Stock por almacén
        </p>
        <ul className="mt-1 space-y-0.5">
          {breakdown.map((line) => (
            <li
              key={line.warehouseId}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="max-w-[9rem] truncate text-foreground">{line.warehouseName}</span>
              <span
                className={cn(
                  'shrink-0 font-semibold tabular-nums',
                  line.quantity > 0 ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {line.quantity}
              </span>
            </li>
          ))}
        </ul>
        {hasMultiple && (
          <p className="mt-1.5 border-t border-border pt-1 text-[0.65rem] text-muted-foreground">
            Total: <span className="font-semibold tabular-nums text-foreground">{total}</span>
          </p>
        )}
      </div>
    </InventoryHoverTooltip>
  );
}
