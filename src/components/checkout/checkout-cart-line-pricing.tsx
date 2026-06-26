import { DualPrice } from '@/components/product-showcase-card';
import { CHECKOUT_TOTALS_PRICE_CLASS } from '@/components/checkout/checkout-layout';
import type { CartLineVolumeDiscountSummary } from '@/lib/checkout-cart-bulk-discount';
import { cn } from '@/lib/utils';

interface CheckoutCartLinePricingProps {
  unitUsd: number;
  quantity: number;
  className?: string;
  compact?: boolean;
  showTotal?: boolean;
  volumeDiscount?: CartLineVolumeDiscountSummary | null;
}

export function CheckoutCartLinePricing({
  unitUsd,
  quantity,
  className,
  compact = false,
  showTotal = true,
  volumeDiscount,
}: CheckoutCartLinePricingProps) {
  const lineTotalUsd = unitUsd * quantity;
  const dualPriceProps = { className: 'justify-end' };
  const inlineDualPriceProps = { className: 'font-medium tabular-nums' };

  if (compact) {
    return (
      <dl className={cn('space-y-0.5 text-xs sm:text-sm', className)}>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <dt className="text-muted-foreground">P. Unit</dt>
          <dd className={cn(CHECKOUT_TOTALS_PRICE_CLASS, 'm-0')}>
            <DualPrice usd={unitUsd} {...inlineDualPriceProps} />
          </dd>
        </div>
        {showTotal ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <dt className="font-medium text-foreground">Total</dt>
              <dd className={cn(CHECKOUT_TOTALS_PRICE_CLASS, 'm-0 font-bold')}>
                <DualPrice usd={lineTotalUsd} {...inlineDualPriceProps} />
              </dd>
            </div>
            {volumeDiscount && volumeDiscount.volumeDiscountUsd > 0.001 ? (
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <dt className="text-muted-foreground">
                  {volumeDiscount.discountPercent > 0
                    ? `Dscto (${volumeDiscount.discountPercent}%)`
                    : 'Dscto'}
                </dt>
                <dd className={cn(CHECKOUT_TOTALS_PRICE_CLASS, 'm-0 font-semibold text-primary')}>
                  − <DualPrice usd={volumeDiscount.volumeDiscountUsd} {...inlineDualPriceProps} />
                </dd>
              </div>
            ) : null}
          </>
        ) : null}
      </dl>
    );
  }

  return (
    <dl
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-xs sm:text-sm',
        className,
      )}
    >
      <dt className="text-muted-foreground">P. Unit</dt>
      <dd className={cn(CHECKOUT_TOTALS_PRICE_CLASS, compact ? 'text-xs sm:text-sm' : '')}>
        <DualPrice usd={unitUsd} {...dualPriceProps} />
      </dd>
      {showTotal ? (
        <>
          <dt className={cn('font-medium text-foreground', compact ? '' : 'sm:text-sm')}>Total</dt>
          <dd
            className={cn(
              CHECKOUT_TOTALS_PRICE_CLASS,
              'font-bold',
              compact ? 'text-sm sm:text-base' : 'text-sm sm:text-base',
            )}
          >
            <DualPrice usd={lineTotalUsd} {...dualPriceProps} />
          </dd>
          {volumeDiscount && volumeDiscount.volumeDiscountUsd > 0.001 ? (
            <>
              <dt className="text-muted-foreground">
                {volumeDiscount.discountPercent > 0
                  ? `Dscto (${volumeDiscount.discountPercent}%)`
                  : 'Dscto'}
              </dt>
              <dd
                className={cn(
                  CHECKOUT_TOTALS_PRICE_CLASS,
                  'font-semibold text-primary',
                  compact ? 'text-xs sm:text-sm' : '',
                )}
              >
                − <DualPrice usd={volumeDiscount.volumeDiscountUsd} {...dualPriceProps} />
              </dd>
            </>
          ) : null}
        </>
      ) : null}
    </dl>
  );
}
