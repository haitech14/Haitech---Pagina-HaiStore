import { useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';

import { CheckoutCartLine } from '@/components/checkout/checkout-cart-line';
import { CheckoutCouponField, type AppliedCheckoutCoupon } from '@/components/checkout/checkout-coupon-field';
import { CheckoutMobileActionBar } from '@/components/checkout/checkout-mobile-action-bar';
import { CheckoutPaymentTotals } from '@/components/checkout/checkout-payment-totals';
import { CheckoutTotalsBreakdown } from '@/components/checkout/checkout-totals-breakdown';
import { CheckoutTotalsRow } from '@/components/checkout/checkout-totals-row';
import { CheckoutUpsellSection } from '@/components/checkout/checkout-upsell-section';
import {
  CHECKOUT_CART_STEP_GRID_CLASS,
} from '@/components/checkout/checkout-layout';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cartLineUnitUsd } from '@/context/cart-context';
import { resolveCartVolumeDiscountSummary } from '@/lib/checkout-cart-bulk-discount';
import { calculateCheckoutTotals, type CheckoutPaymentCurrency } from '@/lib/checkout-totals';
import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { parseCheckoutAddonLineId } from '@/lib/checkout-multifuncional-addons';
import { resolveCheckoutShippingQuote, type CheckoutShippingQuote } from '@/lib/checkout-shipping-options';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import type { ValidateCouponLineItem } from '@/types/discount-coupon';

interface CheckoutCartItemsListProps {
  items: CartItem[];
  cartLineIds: Set<string>;
  onRemoveItem?: (lineId: string) => void;
  showMultifuncionalAddons?: boolean;
  showVolumePromo?: boolean;
}

function CheckoutCartItemsList({
  items,
  cartLineIds,
  onRemoveItem,
  showMultifuncionalAddons = true,
  showVolumePromo = true,
}: CheckoutCartItemsListProps) {
  return (
    <ul className="divide-y divide-border" aria-label="Productos">
      {items.map((item) => (
        <CheckoutCartLine
          key={item.lineId}
          item={item}
          cartLineIds={cartLineIds}
          showMultifuncionalAddons={showMultifuncionalAddons}
          showVolumePromo={showVolumePromo}
          {...(onRemoveItem ? { onRemoveItem } : {})}
        />
      ))}
    </ul>
  );
}

interface CheckoutOrderTotalsProps {
  items: CartItem[];
  totalPrice: number;
  appliedCoupon: AppliedCheckoutCoupon | null;
  shippingQuote?: CheckoutShippingQuote | null;
  showSubtotal?: boolean;
  showVolumeDiscount?: boolean;
  asCard?: boolean;
}

function CheckoutOrderTotalsContent({
  items,
  totalPrice,
  appliedCoupon,
  shippingQuote = null,
  showSubtotal = false,
  showVolumeDiscount = true,
}: Omit<CheckoutOrderTotalsProps, 'asCard'>) {
  const discountUsd = appliedCoupon?.discountUsd ?? 0;
  const freeShipping = Boolean(appliedCoupon?.freeShipping);
  const shippingPen = shippingQuote ? (freeShipping ? 0 : shippingQuote.pen) : null;
  const totals = calculateCheckoutTotals({
    subtotalUsd: totalPrice,
    discountUsd,
    paymentProvider: 'manual',
    shippingPen: shippingPen ?? 0,
    freeShipping,
  });
  const volumeDiscount = showVolumeDiscount ? resolveCartVolumeDiscountSummary(items) : null;
  const dualPriceProps = { className: 'justify-end', stacked: true as const, allowZero: true as const };

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

      {appliedCoupon && discountUsd > 0 ? (
        <CheckoutTotalsRow
          label={`Descuento (${appliedCoupon.code})`}
          value={
            <>
              − <DualPrice usd={discountUsd} {...dualPriceProps} />
            </>
          }
          valueClassName="font-semibold text-primary"
        />
      ) : null}

      {appliedCoupon?.freeShipping ? (
        <p className="text-sm font-medium text-primary" role="status">
          Envío gratis incluido con tu cupón
        </p>
      ) : null}

      <CheckoutTotalsBreakdown
        baseUsd={totals.baseUsd}
        section="tax"
        showSubtotal={showSubtotal}
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
        shippingPen={shippingPen}
        freeShipping={freeShipping}
      />
    </div>
  );
}

export function CheckoutOrderTotals({
  items,
  totalPrice,
  appliedCoupon,
  shippingQuote = null,
  showSubtotal = false,
  showVolumeDiscount = true,
  asCard = true,
}: CheckoutOrderTotalsProps) {
  const content = (
    <CheckoutOrderTotalsContent
      items={items}
      totalPrice={totalPrice}
      appliedCoupon={appliedCoupon}
      shippingQuote={shippingQuote}
      showSubtotal={showSubtotal}
      showVolumeDiscount={showVolumeDiscount}
    />
  );

  if (!asCard) return content;

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="text-lg sm:text-xl">Total</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="text-xs text-muted-foreground sm:text-sm">Precios con IGV incluido.</p>
        {content}
      </CardContent>
    </Card>
  );
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  appliedCoupon: AppliedCheckoutCoupon | null;
  onCouponChange: (coupon: AppliedCheckoutCoupon | null) => void;
  onRemoveItem?: (lineId: string) => void;
  customerEmail?: string;
  client?: HaitechClientFormValues;
  compact?: boolean;
  paymentProvider?: CheckoutPaymentProvider;
  paymentCurrency?: CheckoutPaymentCurrency;
}

export function CheckoutOrderSummary({
  items,
  totalPrice,
  appliedCoupon,
  onCouponChange,
  onRemoveItem,
  customerEmail,
  client,
  compact = false,
  paymentProvider,
  paymentCurrency,
}: CheckoutOrderSummaryProps) {
  const cartLineIds = useMemo(() => new Set(items.map((item) => item.lineId)), [items]);
  const primaryItems = useMemo(
    () => items.filter((item) => !parseCheckoutAddonLineId(item.lineId)),
    [items],
  );
  const couponLineItems: ValidateCouponLineItem[] = items.map((item) => ({
    productId: item.product.id,
    category: item.product.category,
    lineTotalUsd: cartLineUnitUsd(item) * item.quantity,
  }));
  const discountUsd = appliedCoupon?.discountUsd ?? 0;
  const freeShipping = Boolean(appliedCoupon?.freeShipping);
  const shippingQuote = useMemo(
    () => (client ? resolveCheckoutShippingQuote(client, { freeShipping }) : null),
    [client, freeShipping],
  );
  const showPaymentTotals = paymentProvider != null && paymentCurrency != null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="size-5 text-red-600" aria-hidden="true" />
          Resumen del pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CheckoutCartItemsList
          items={primaryItems}
          cartLineIds={cartLineIds}
          showMultifuncionalAddons={false}
          showVolumePromo={false}
          {...(onRemoveItem ? { onRemoveItem } : {})}
        />

        {!compact ? (
          <CheckoutCouponField
            subtotalUsd={totalPrice}
            customerEmail={customerEmail}
            lineItems={couponLineItems}
            applied={appliedCoupon}
            onAppliedChange={onCouponChange}
          />
        ) : null}

        {showPaymentTotals && paymentProvider != null && paymentCurrency != null ? (
          <CheckoutPaymentTotals
            items={items}
            subtotalUsd={totalPrice}
            discountUsd={discountUsd}
            paymentProvider={paymentProvider}
            paymentCurrency={paymentCurrency}
            showSubtotal
            showVolumeDiscount={false}
            shippingQuote={shippingQuote}
            {...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {})}
            {...(freeShipping ? { freeShipping: true as const } : {})}
          />
        ) : (
          <CheckoutOrderTotalsContent
            items={items}
            totalPrice={totalPrice}
            appliedCoupon={appliedCoupon}
            shippingQuote={shippingQuote}
            showSubtotal={compact}
            showVolumeDiscount={false}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface CheckoutStepSummaryProps {
  items: CartItem[];
  totalPrice: number;
  appliedCoupon: AppliedCheckoutCoupon | null;
  onCouponChange: (coupon: AppliedCheckoutCoupon | null) => void;
  onRemoveItem?: (lineId: string) => void;
  onContinue: () => void;
}

export function CheckoutStepSummary({
  items,
  totalPrice,
  appliedCoupon,
  onCouponChange,
  onRemoveItem,
  onContinue,
}: CheckoutStepSummaryProps) {
  const couponLineItems: ValidateCouponLineItem[] = items.map((item) => ({
    productId: item.product.id,
    category: item.product.category,
    lineTotalUsd: cartLineUnitUsd(item) * item.quantity,
  }));
  const cartProductIds = items.map((item) => item.product.id);
  const cartLineIds = useMemo(() => new Set(items.map((item) => item.lineId)), [items]);
  const primaryItems = useMemo(
    () => items.filter((item) => !parseCheckoutAddonLineId(item.lineId)),
    [items],
  );

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-5 lg:items-start lg:gap-6', CHECKOUT_CART_STEP_GRID_CLASS)}>
        <Card className="min-w-0 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="size-5 text-red-600" aria-hidden="true" />
              Tu carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            <CheckoutCartItemsList
              items={primaryItems}
              cartLineIds={cartLineIds}
              {...(onRemoveItem ? { onRemoveItem } : {})}
            />
            <CheckoutCouponField
              subtotalUsd={totalPrice}
              lineItems={couponLineItems}
              applied={appliedCoupon}
              onAppliedChange={onCouponChange}
              collapsible
            />
            <Button
              type="button"
              onClick={onContinue}
              className="hidden min-h-11 w-full bg-red-600 text-base font-semibold hover:bg-red-500 sm:inline-flex"
            >
              Continuar a envío
            </Button>
          </CardContent>
        </Card>

        <aside
          className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:max-w-[38rem] lg:justify-self-end lg:w-full"
          aria-label="Total y sugerencias"
        >
          <CheckoutOrderTotals
            items={primaryItems}
            totalPrice={totalPrice}
            appliedCoupon={appliedCoupon}
            showSubtotal
          />
          <CheckoutUpsellSection excludeProductIds={cartProductIds} />
        </aside>
      </div>

      <CheckoutMobileActionBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total estimado</p>
            <p className="text-lg font-bold leading-tight">
              <DualPrice usd={totalPrice - (appliedCoupon?.discountUsd ?? 0)} allowZero />
            </p>
          </div>
          <Button
            type="button"
            onClick={onContinue}
            className="min-h-11 shrink-0 bg-red-600 px-5 text-base font-semibold hover:bg-red-500"
          >
            Continuar
          </Button>
        </div>
      </CheckoutMobileActionBar>
    </div>
  );
}
