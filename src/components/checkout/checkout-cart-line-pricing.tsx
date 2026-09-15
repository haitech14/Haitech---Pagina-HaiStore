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
  const priceProps = { compact: true as const, className: 'justify-end' };

  return (
    <div className={cn('min-w-0 text-right', className)}>
      {showTotal ? (
        <p className={cn(CHECKOUT_TOTALS_PRICE_CLASS, 'font-bold')}>
          <DualPrice usd={lineTotalUsd} {...priceProps} />
        </p>
      ) : null}
      {quantity > 1 ? (
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          {quantity} × <DualPrice usd={unitUsd} compact />
        </p>
      ) : null}
      {volumeDiscount && volumeDiscount.volumeDiscountUsd > 0.001 ? (
        <p className="mt-0.5 text-[0.6875rem] font-semibold text-primary">
          − <DualPrice usd={volumeDiscount.volumeDiscountUsd} compact />
          {volumeDiscount.discountPercent > 0 ? ` (${volumeDiscount.discountPercent}%)` : ''}
        </p>
      ) : null}
    </div>
  );
}
