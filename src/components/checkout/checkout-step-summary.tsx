import { useMemo } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';

import { CheckoutCartLineDiscountHint } from '@/components/checkout/checkout-cart-line-discount-hint';
import { CheckoutCouponField, type AppliedCheckoutCoupon } from '@/components/checkout/checkout-coupon-field';
import { CheckoutMultifuncionalLineAddons } from '@/components/checkout/checkout-multifuncional-line-addons';
import { CheckoutPaymentTotals } from '@/components/checkout/checkout-payment-totals';
import { CheckoutUpsellSection } from '@/components/checkout/checkout-upsell-section';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cartLineUnitUsd } from '@/context/cart-context';
import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import type { CheckoutPaymentCurrency } from '@/lib/checkout-totals';
import { parseCheckoutAddonLineId } from '@/lib/checkout-multifuncional-addons';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatUsd } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import type { ValidateCouponLineItem } from '@/types/discount-coupon';

interface CheckoutCartItemsListProps {
  items: CartItem[];
  cartLineIds: Set<string>;
  onRemoveItem?: (lineId: string) => void;
}

function CheckoutCartItemsList({ items, cartLineIds, onRemoveItem }: CheckoutCartItemsListProps) {
  return (
    <ul className="divide-y divide-border" aria-label="Productos">
      {items.map((item) => {
        const imageUrl = resolveProductImageUrl(item.product);
        const lineUsd = cartLineUnitUsd(item) * item.quantity;
        return (
          <li key={item.lineId} className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 p-1 sm:size-20">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-bold text-muted-foreground" aria-hidden="true">
                  {item.product.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-pretty text-sm font-semibold leading-snug sm:text-base lg:line-clamp-3">
                {item.product.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.quantity} × {formatUsd(cartLineUnitUsd(item))}
              </p>
              <p className="mt-1 text-sm font-bold">
                <DualPrice usd={lineUsd} />
              </p>
              <CheckoutCartLineDiscountHint item={item} />
              <CheckoutMultifuncionalLineAddons item={item} cartLineIds={cartLineIds} />
            </div>
            {onRemoveItem ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 self-start text-muted-foreground hover:text-destructive"
                aria-label={`Eliminar ${item.product.name} del pedido`}
                onClick={() => onRemoveItem(item.lineId)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

interface CheckoutOrderTotalsProps {
  totalPrice: number;
  appliedCoupon: AppliedCheckoutCoupon | null;
  showSubtotal?: boolean;
  asCard?: boolean;
}

function CheckoutOrderTotalsContent({
  totalPrice,
  appliedCoupon,
  showSubtotal = false,
}: Omit<CheckoutOrderTotalsProps, 'asCard'>) {
  const discountUsd = appliedCoupon?.discountUsd ?? 0;
  const totalAfterDiscount = Math.max(0, totalPrice - discountUsd);

  return (
    <div className="space-y-2">
      {showSubtotal ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            <DualPrice usd={totalPrice} />
          </span>
        </div>
      ) : null}

      {appliedCoupon && discountUsd > 0 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Descuento ({appliedCoupon.code})</span>
          <span className="font-semibold text-primary">
            − <DualPrice usd={discountUsd} />
          </span>
        </div>
      ) : null}

      {appliedCoupon?.freeShipping ? (
        <p className="text-sm font-medium text-primary" role="status">
          Envío gratis incluido con tu cupón
        </p>
      ) : null}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium text-muted-foreground">Total a pagar</span>
        <span className="text-lg font-bold">
          <DualPrice usd={totalAfterDiscount} />
        </span>
      </div>
    </div>
  );
}

export function CheckoutOrderTotals({
  totalPrice,
  appliedCoupon,
  showSubtotal = false,
  asCard = true,
}: CheckoutOrderTotalsProps) {
  const content = (
    <CheckoutOrderTotalsContent
      totalPrice={totalPrice}
      appliedCoupon={appliedCoupon}
      showSubtotal={showSubtotal}
    />
  );

  if (!asCard) return content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Total</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
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
  compact = false,
  paymentProvider,
  paymentCurrency,
}: CheckoutOrderSummaryProps) {
  const cartLineIds = useMemo(() => new Set(items.map((item) => item.lineId)), [items]);
  const couponLineItems: ValidateCouponLineItem[] = items.map((item) => ({
    productId: item.product.id,
    category: item.product.category,
    lineTotalUsd: cartLineUnitUsd(item) * item.quantity,
  }));
  const discountUsd = appliedCoupon?.discountUsd ?? 0;
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
          items={items}
          cartLineIds={cartLineIds}
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
            subtotalUsd={totalPrice}
            discountUsd={discountUsd}
            paymentProvider={paymentProvider}
            paymentCurrency={paymentCurrency}
            showSubtotal
            {...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {})}
            {...(appliedCoupon?.freeShipping ? { freeShipping: true as const } : {})}
          />
        ) : (
          <CheckoutOrderTotalsContent
            totalPrice={totalPrice}
            appliedCoupon={appliedCoupon}
            showSubtotal={compact}
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingBag className="size-5 text-red-600 sm:size-6" aria-hidden="true" />
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
            />
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Total y sugerencias">
          <CheckoutOrderTotals
            totalPrice={totalPrice}
            appliedCoupon={appliedCoupon}
            showSubtotal
          />
          <CheckoutUpsellSection excludeProductIds={cartProductIds} />
        </aside>
      </div>

      <Button
        type="button"
        onClick={onContinue}
        className="min-h-11 w-full bg-red-600 text-base font-semibold hover:bg-red-500"
      >
        Continuar a envío
      </Button>
    </div>
  );
}
