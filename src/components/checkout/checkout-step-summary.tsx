import { ShoppingBag, Trash2 } from 'lucide-react';

import { CheckoutCouponField, type AppliedCheckoutCoupon } from '@/components/checkout/checkout-coupon-field';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cartLineUnitUsd } from '@/context/cart-context';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatUsd } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import type { ValidateCouponLineItem } from '@/types/discount-coupon';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  appliedCoupon: AppliedCheckoutCoupon | null;
  onCouponChange: (coupon: AppliedCheckoutCoupon | null) => void;
  onRemoveItem?: (lineId: string) => void;
  customerEmail?: string;
  compact?: boolean;
}

export function CheckoutOrderSummary({
  items,
  totalPrice,
  appliedCoupon,
  onCouponChange,
  onRemoveItem,
  customerEmail,
  compact = false,
}: CheckoutOrderSummaryProps) {
  const couponLineItems: ValidateCouponLineItem[] = items.map((item) => ({
    productId: item.product.id,
    category: item.product.category,
    lineTotalUsd: cartLineUnitUsd(item) * item.quantity,
  }));

  const discountUsd = appliedCoupon?.discountUsd ?? 0;
  const totalAfterDiscount = Math.max(0, totalPrice - discountUsd);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="size-5 text-red-600" aria-hidden="true" />
          Resumen del pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="divide-y divide-border" aria-label="Productos">
          {items.map((item) => {
            const imageUrl = resolveProductImageUrl(item.product);
            const lineUsd = cartLineUnitUsd(item) * item.quantity;
            return (
              <li key={item.lineId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 p-1">
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
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.product.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.quantity} × {formatUsd(cartLineUnitUsd(item))}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    <DualPrice usd={lineUsd} />
                  </p>
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

        {!compact ? (
          <CheckoutCouponField
            subtotalUsd={totalPrice}
            customerEmail={customerEmail}
            lineItems={couponLineItems}
            applied={appliedCoupon}
            onAppliedChange={onCouponChange}
          />
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
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-lg font-bold">
            <DualPrice usd={totalAfterDiscount} />
          </span>
        </div>
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
  return (
    <div className="space-y-4">
      <CheckoutOrderSummary
        items={items}
        totalPrice={totalPrice}
        appliedCoupon={appliedCoupon}
        onCouponChange={onCouponChange}
        onRemoveItem={onRemoveItem}
      />
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
