import {
  calculateCheckoutTotals,
  formatCheckoutAmount,
  hasCardPaymentSurcharge,
  type CheckoutPaymentCurrency,
} from '@/lib/checkout-totals';
import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import { DualPrice } from '@/components/product-showcase-card';

interface CheckoutPaymentTotalsProps {
  subtotalUsd: number;
  discountUsd?: number;
  paymentProvider: CheckoutPaymentProvider;
  paymentCurrency: CheckoutPaymentCurrency;
  showSubtotal?: boolean;
  couponCode?: string | null;
  freeShipping?: boolean;
}

export function CheckoutPaymentTotals({
  subtotalUsd,
  discountUsd = 0,
  paymentProvider,
  paymentCurrency,
  showSubtotal = false,
  couponCode,
  freeShipping = false,
}: CheckoutPaymentTotalsProps) {
  const totals = calculateCheckoutTotals({
    subtotalUsd,
    discountUsd,
    paymentProvider,
  });
  const showSurcharge = hasCardPaymentSurcharge(paymentProvider);

  return (
    <div className="space-y-2">
      {showSubtotal && !showSurcharge ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            <DualPrice usd={totals.subtotalUsd} />
          </span>
        </div>
      ) : null}

      {discountUsd > 0 && couponCode ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Descuento ({couponCode})</span>
          <span className="font-semibold text-primary">
            − <DualPrice usd={discountUsd} />
          </span>
        </div>
      ) : null}

      {freeShipping ? (
        <p className="text-sm font-medium text-primary" role="status">
          Envío gratis incluido con tu cupón
        </p>
      ) : null}

      {showSurcharge ? (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {paymentCurrency === 'PEN'
                ? formatCheckoutAmount(totals.baseUsd, totals.basePen, 'PEN')
                : formatCheckoutAmount(totals.baseUsd, totals.basePen, 'USD')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recargo tarjeta (5%)</span>
            <span className="font-medium text-amber-700">
              +{' '}
              {formatCheckoutAmount(
                totals.cardSurchargeUsd,
                totals.cardSurchargePen,
                paymentCurrency,
              )}
            </span>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium text-muted-foreground">Total a pagar</span>
        <span className="text-lg font-bold">
          {paymentCurrency === 'PEN' ? (
            <span className="text-red-600">
              {formatCheckoutAmount(totals.totalUsd, totals.totalPen, 'PEN')}
            </span>
          ) : paymentCurrency === 'USD' ? (
            formatCheckoutAmount(totals.totalUsd, totals.totalPen, 'USD')
          ) : (
            <DualPrice usd={totals.totalUsd} />
          )}
        </span>
      </div>
    </div>
  );
}
