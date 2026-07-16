import { Package, Printer } from 'lucide-react';

import { resolveProductSpeedPpm } from '@/lib/category-catalog-filters';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';

interface ProductCardStatsLineProps {
  product: ProductBadgeSource;
  stock: number;
  outOfStock?: boolean;
  className?: string;
}

function formatStockLabel(outOfStock: boolean, stock: number): string {
  if (outOfStock) return PRODUCT_ON_REQUEST_STOCK_LABEL;
  const quantity = Math.max(0, Math.floor(Number(stock) || 0));
  return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`;
}

/** Línea compacta: icono + ppm | icono + stock (mockup ecommerce). */
export function ProductCardStatsLine({
  product,
  stock,
  outOfStock = false,
  className,
}: ProductCardStatsLineProps) {
  const ppm = resolveProductSpeedPpm(product);
  const stockLabel = formatStockLabel(outOfStock, stock);

  return (
    <div
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.6875rem] font-medium leading-none text-[#8a93a3] sm:text-[0.75rem]',
        className,
      )}
      aria-label={[ppm != null ? `${ppm} ppm` : null, stockLabel].filter(Boolean).join(', ')}
    >
      {ppm != null ? (
        <>
          <span className="inline-flex items-center gap-1">
            <Printer className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="tabular-nums">{ppm} ppm</span>
          </span>
          <span className="select-none text-[#c5cad3]" aria-hidden="true">
            |
          </span>
        </>
      ) : null}
      <span className="inline-flex items-center gap-1">
        <Package className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="tabular-nums">{stockLabel}</span>
      </span>
    </div>
  );
}
