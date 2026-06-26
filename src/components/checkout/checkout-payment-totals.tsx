import {
  calculateCheckoutTotals,
  hasCardPaymentSurcharge,
  type CheckoutPaymentCurrency,
} from '@/lib/checkout-totals';
import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import { resolveCartVolumeDiscountSummary } from '@/lib/checkout-cart-bulk-discount';
import type { CheckoutShippingQuote } from '@/lib/checkout-shipping-options';
import { CheckoutTotalsBreakdown } from '@/components/checkout/checkout-totals-breakdown';
import { CheckoutTotalsRow } from '@/components/checkout/checkout-totals-row';
import { DualPrice } from '@/components/product-showcase-card';
import type { CartItem } from '@/types/product';

interface CheckoutPaymentTotalsProps {
  items: CartItem[];
  subtotalUsd: number;
  discountUsd?: number;
  paymentProvider: CheckoutPaymentProvider;
  paymentCurrency: CheckoutPaymentCurrency;
  showSubtotal?: boolean;
  showVolumeDiscount?: boolean;
  couponCode?: string | null;
  freeShipping?: boolean;
  shippingQuote?: CheckoutShippingQuote | null;
}

export function CheckoutPaymentTotals({
  items,
  subtotalUsd,
  discountUsd = 0,
  paymentProvider,
  paymentCurrency: _paymentCurrency,
  showSubtotal = false,
  showVolumeDiscount = true,
  couponCode,
  freeShipping = false,
  shippingQuote = null,
}: CheckoutPaymentTotalsProps) {
  const shippingPen = shippingQuote ? (freeShipping ? 0 : shippingQuote.pen) : null;
  const totals = calculateCheckoutTotals({
    subtotalUsd,
    discountUsd,
    paymentProvider,
    shippingPen: shippingPen ?? 0,
    freeShipping,
  });
  const showSurcharge = hasCardPaymentSurcharge(paymentProvider);
  const volumeDiscount = showVolumeDiscount ? resolveCartVolumeDiscountSummary(items) : null;
  const dualPriceProps = { className: 'justify-end', stacked: true as const };

  return (
    <div className="space-y-3">
      {volumeDiscount && volumeDiscount.volumeDiscountUsd > 0.001 ? (
        <>
          <CheckoutTotalsRow
            label="Subtotal artículos"
            value={<DualPrice usd={volumeDiscount.listSubtotalUsd} {...dualPriceProps} />}
            valueClassName="font-medium"
          />
          <CheckoutTotalsRow
            label={
              volumeDiscount.discountPercent > 0
                ? `Dscto (${volumeDiscount.discountPercent}%)`
                : 'Dscto'
            }
            value={
              <>
                − <DualPrice usd={volumeDiscount.volumeDiscountUsd} {...dualPriceProps} />
              </>
            }
            valueClassName="font-semibold text-primary"
          />
        </>
      ) : null}

      {discountUsd > 0 && couponCode ? (
        <CheckoutTotalsRow
          label={`Descuento (${couponCode})`}
          value={
            <>
              − <DualPrice usd={discountUsd} {...dualPriceProps} />
            </>
          }
          valueClassName="font-semibold text-primary"
        />
      ) : null}

      {freeShipping ? (
        <p className="text-sm font-medium text-primary" role="status">
          Envío gratis incluido con tu cupón
        </p>
      ) : null}

      <CheckoutTotalsBreakdown
        baseUsd={totals.baseUsd}
        section="tax"
        showSubtotal={showSubtotal || showSurcharge}
        shippingPen={shippingPen}
        shippingLabel={shippingQuote?.label ?? null}
        freeShipping={freeShipping}
      />

      <CheckoutTotalsRow
        label="Total a pagar"
        value={<DualPrice usd={totals.totalUsd} {...dualPriceProps} />}
        labelClassName="text-sm font-medium text-muted-foreground"
        valueClassName="text-base font-bold sm:text-lg"
        className="border-t border-border pt-3"
      />

      <CheckoutTotalsBreakdown
        baseUsd={totals.baseUsd}
        section="payment-options"
        showCardPreview={!showSurcharge}
        shippingPen={shippingPen}
        freeShipping={freeShipping}
      />
    </div>
  );
}
