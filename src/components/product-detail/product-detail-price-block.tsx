import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { ensureFullPrices } from '@/lib/roles';
import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPriceBlockProps {
  product: Product;
  detail: ProductDetailViewModel;
  className?: string;
  showStock?: boolean;
}

function formatPenStrike(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pen);
}

export function ProductDetailPriceBlock({
  product,
  detail,
  className,
  showStock = false,
}: ProductDetailPriceBlockProps) {
  const displayUsd = product.prices
    ? ensureFullPrices(product.prices).public
    : product.price;
  const outOfStock = product.stock <= 0;
  const stockDisplay = outOfStock ? 0 : product.stock;

  return (
    <div className={cn('px-4 py-3.5 sm:py-4', className)}>
      {detail.oldPricePen != null ? (
        <p className="text-xs text-muted-foreground sm:text-sm">
          Antes:{' '}
          <span className="line-through decoration-muted-foreground">{formatPenStrike(detail.oldPricePen)}</span>
        </p>
      ) : null}

      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <AdminRolePricesTooltip productId={product.id} displayUsd={displayUsd}>
          <span className="text-[1.625rem] font-bold leading-none text-red-600 sm:text-[1.75rem]">
            {formatPenFromUsdPrecise(displayUsd)}
          </span>
        </AdminRolePricesTooltip>
        {detail.discountPercent != null ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 sm:text-sm">
            -{detail.discountPercent}%
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        Equivalente aprox. {formatUsd(displayUsd)}
      </p>

      {showStock ? (
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-xs font-medium sm:text-sm',
            outOfStock ? 'text-red-600' : 'text-[#0f1f3d]',
          )}
        >
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold',
              outOfStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600',
            )}
            aria-hidden="true"
          >
            {outOfStock ? '!' : '✓'}
          </span>
          {outOfStock ? 'Sin stock' : `${stockDisplay} en stock`}
        </p>
      ) : null}
    </div>
  );
}
