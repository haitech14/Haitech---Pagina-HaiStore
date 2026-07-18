import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { PRODUCT_ON_REQUEST_STOCK_DETAIL_LABEL } from '@/lib/product-on-request-label';
import { ensureFullPrices } from '@/lib/roles';
import { cn, penToUsd } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPriceBlockProps {
  product: Product;
  detail: ProductDetailViewModel;
  className?: string;
  showStock?: boolean;
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
          <DualPrice
            usd={penToUsd(detail.oldPricePen)}
            strikethrough
            className="inline"
          />
        </p>
      ) : null}

      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <AdminRolePricesTooltip productId={product.id} displayUsd={displayUsd}>
          <span className="text-[1.625rem] font-bold leading-none text-foreground sm:text-[1.75rem]">
            <DualPrice usd={displayUsd} />
          </span>
        </AdminRolePricesTooltip>
        {detail.discountPercent != null ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 sm:text-sm">
            -{detail.discountPercent}%
          </span>
        ) : null}
      </div>

      {showStock ? (
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-xs font-medium sm:text-sm',
            !outOfStock && 'text-[#0f1f3d]',
          )}
        >
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold',
              outOfStock
                ? 'border border-amber-400 bg-amber-100 text-amber-950'
                : 'bg-emerald-100 text-emerald-600',
            )}
            aria-hidden="true"
          >
            {outOfStock ? '!' : '✓'}
          </span>
          <span className={outOfStock ? ON_REQUEST_STOCK_BADGE_CLASS : undefined}>
            {outOfStock
              ? PRODUCT_ON_REQUEST_STOCK_DETAIL_LABEL
              : `${stockDisplay} disponibles`}
          </span>
        </p>
      ) : null}
    </div>
  );
}
