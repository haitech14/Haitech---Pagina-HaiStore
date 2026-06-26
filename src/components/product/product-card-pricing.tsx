import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { DualPrice } from '@/components/product/product-dual-price';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import {
  PRODUCT_CARD_DISCOUNT_CLASS,
  PRODUCT_CARD_PRICE_COMPARE_CLASS,
  PRODUCT_CARD_PRICE_FEATURED_CLASS,
  PRODUCT_CARD_PRICE_MAIN_CLASS,
} from '@/lib/product-card-title';
import { cn, formatPenFromUsd, usdToPen } from '@/lib/utils';

function formatPenStrike(usd: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdToPen(usd));
}

interface ProductCardPricingProps {
  productId: string;
  priceUsd: number;
  oldPriceUsd?: number;
  discountPercent?: number;
  /** Solo soles (ofertas relámpago). */
  penOnly?: boolean;
  /** Vitrina de productos destacados (tipografía de precio más grande). */
  featured?: boolean;
  /** Vista tabla de catálogo: precios compactos. */
  variant?: 'card' | 'table';
}

export function ProductCardPricing({
  productId,
  priceUsd,
  oldPriceUsd,
  discountPercent,
  penOnly = false,
  featured = false,
  variant = 'card',
}: ProductCardPricingProps) {
  const pricing = resolveProductCardPricing(productId, priceUsd, {
    ...(oldPriceUsd != null ? { oldPrice: oldPriceUsd } : {}),
    ...(discountPercent != null ? { discount: discountPercent } : {}),
  });

  const isTable = variant === 'table';
  const priceMainClass = isTable
    ? 'text-xs font-semibold tabular-nums text-foreground'
    : featured
      ? PRODUCT_CARD_PRICE_FEATURED_CLASS
      : PRODUCT_CARD_PRICE_MAIN_CLASS;
  const compareClass = isTable
    ? 'text-[0.65rem] font-normal tabular-nums text-muted-foreground line-through'
    : PRODUCT_CARD_PRICE_COMPARE_CLASS;
  const discountClass = isTable
    ? 'inline-flex rounded px-1 py-px text-[0.65rem] font-medium tabular-nums bg-green-50 text-green-700'
    : PRODUCT_CARD_DISCOUNT_CLASS;

  return (
    <div className={cn(isTable ? 'space-y-0 leading-tight' : 'space-y-0.5')}>
      <div className={priceMainClass}>
        {penOnly ? (
          formatPenFromUsd(pricing.currentUsd)
        ) : (
          <AdminRolePricesTooltip
            productId={productId}
            displayUsd={pricing.currentUsd}
            className={priceMainClass}
          >
            <DualPrice usd={pricing.currentUsd} />
          </AdminRolePricesTooltip>
        )}
      </div>
      <div className="flex w-full flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5">
        <div className={cn(compareClass, 'min-w-0')}>
          {penOnly ? (
            formatPenStrike(pricing.compareUsd)
          ) : (
            <DualPrice usd={pricing.compareUsd} strikethrough className="text-pretty" />
          )}
        </div>
        <span className={cn(discountClass, 'shrink-0 text-right')}>{pricing.discountPercent}% DSCTO</span>
      </div>
    </div>
  );
}
