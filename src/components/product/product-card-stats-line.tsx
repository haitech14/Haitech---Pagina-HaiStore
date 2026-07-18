import { Package } from 'lucide-react';

import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';

interface ProductCardStatsLineProps {
  product: ProductBadgeSource;
  stock: number;
  outOfStock?: boolean;
  /** Código de producto a la izquierda; stock queda a la derecha. */
  code?: string | null;
  className?: string;
}

function formatStockLabel(outOfStock: boolean, stock: number): string {
  if (outOfStock) return PRODUCT_ON_REQUEST_STOCK_LABEL;
  return String(Math.max(0, Math.floor(Number(stock) || 0)));
}

/** Línea compacta: código (izq) + stock (der). Velocidad/SPDF van en badges. */
export function ProductCardStatsLine({
  product: _product,
  stock,
  outOfStock = false,
  code = null,
  className,
}: ProductCardStatsLineProps) {
  void _product;
  const stockLabel = formatStockLabel(outOfStock, stock);
  const codeLabel = code?.trim() || null;

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 text-[0.6875rem] font-medium leading-none text-[#8a93a3] sm:text-[0.75rem]',
        className,
      )}
      aria-label={[
        codeLabel ? `Código ${codeLabel}` : null,
        outOfStock ? stockLabel : `Stock ${stockLabel}`,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      {codeLabel ? (
        <span className="min-w-0 truncate tabular-nums" title={codeLabel}>
          {codeLabel}
        </span>
      ) : (
        <span className="min-w-0" aria-hidden="true" />
      )}
      <span
        className={cn(
          'ml-auto inline-flex shrink-0 items-center gap-1 tabular-nums',
          outOfStock ? 'text-[#8a93a3]' : 'text-emerald-700',
        )}
      >
        {!outOfStock ? (
          <Package className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        ) : null}
        <span>{stockLabel}</span>
      </span>
    </div>
  );
}
