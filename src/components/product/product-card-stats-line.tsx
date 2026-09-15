import { Package } from 'lucide-react';

import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';

interface ProductCardStatsLineProps {
  product: ProductBadgeSource;
  stock: number;
  outOfStock?: boolean;
  /** Código de producto y stock centrados en la tarjeta. */
  code?: string | null;
  /** Si es false, no muestra stock (solo código si hay). */
  showStock?: boolean;
  className?: string;
}

function formatStockLabel(outOfStock: boolean, stock: number): string {
  if (outOfStock) return PRODUCT_ON_REQUEST_STOCK_LABEL;
  return `Stock ${Math.max(0, Math.floor(Number(stock) || 0))}`;
}

/** Línea compacta: código y stock centrados. */
export function ProductCardStatsLine({
  product: _product,
  stock,
  outOfStock = false,
  code = null,
  showStock = true,
  className,
}: ProductCardStatsLineProps) {
  void _product;
  const stockLabel = formatStockLabel(outOfStock, stock);
  const codeLabel = code?.trim() || null;

  if (!codeLabel && !showStock) return null;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center justify-center gap-3 text-center',
        'text-[0.6875rem] font-medium leading-none text-[#8a93a3] sm:text-[0.75rem]',
        className,
      )}
      aria-label={[
        codeLabel ? `Código ${codeLabel}` : null,
        showStock ? stockLabel : null,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      {codeLabel ? (
        <span className="min-w-0 truncate tabular-nums" title={codeLabel}>
          Cód. {codeLabel}
        </span>
      ) : null}
      {showStock ? (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap tabular-nums',
            outOfStock ? 'text-[#8a93a3]' : 'text-emerald-700',
          )}
        >
          {!outOfStock ? (
            <Package className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          ) : null}
          <span>{stockLabel}</span>
        </span>
      ) : null}
    </div>
  );
}
