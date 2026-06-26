import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';

import { CheckoutCartLineDiscountHint } from '@/components/checkout/checkout-cart-line-discount-hint';
import { CheckoutCartLinePricing } from '@/components/checkout/checkout-cart-line-pricing';
import { CheckoutCartLineQuantity } from '@/components/checkout/checkout-cart-line-quantity';
import { CheckoutMultifuncionalLineAddons } from '@/components/checkout/checkout-multifuncional-line-addons';
import { Button } from '@/components/ui/button';
import { cartLineUnitUsd, useCart } from '@/context/cart-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  resolveCartLineBulkDiscountHint,
  resolveCartLineVolumeDiscountSummary,
  resolveCartLineVolumeUnitUsd,
} from '@/lib/checkout-cart-bulk-discount';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/product';

interface CheckoutCartLineProps {
  item: CartItem;
  cartLineIds: Set<string>;
  onRemoveItem?: (lineId: string) => void;
  showMultifuncionalAddons?: boolean;
  showVolumePromo?: boolean;
  className?: string;
}

export function CheckoutCartLine({
  item,
  cartLineIds,
  onRemoveItem,
  showMultifuncionalAddons = true,
  showVolumePromo = true,
  className,
}: CheckoutCartLineProps) {
  const { updateQuantity } = useCart();
  const settingsQuery = useCompanySettings();
  const tiers = settingsQuery.data?.bulkDiscountTiers ?? [];

  const imageUrl = resolveProductImageUrl(item.product);
  const unitUsd = cartLineUnitUsd(item);
  const quantityControlId = `checkout-qty-${item.lineId}`;

  const hint = useMemo(
    () => resolveCartLineBulkDiscountHint(item, tiers),
    [item, tiers],
  );
  const volumeDiscount = useMemo(() => {
    if (!hint?.isActive) return null;
    return resolveCartLineVolumeDiscountSummary(item);
  }, [item, hint]);

  const changeQuantity = (nextQuantity: number) => {
    if (nextQuantity <= 0) {
      onRemoveItem?.(item.lineId);
      return;
    }

    const volumeUnitPriceUsd = resolveCartLineVolumeUnitUsd(item, nextQuantity, tiers);
    updateQuantity(
      item.lineId,
      nextQuantity,
      volumeUnitPriceUsd != null ? { volumeUnitPriceUsd } : { volumeUnitPriceUsd: null },
    );
  };

  return (
    <li className={cn('space-y-3 py-4 first:pt-0 last:pb-0 sm:space-y-3.5', className)}>
      <div className="flex gap-3 sm:gap-4">
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

        <div className="min-w-0 flex-1 space-y-2.5 sm:space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-pretty text-sm font-semibold leading-snug sm:text-base">
              {item.product.name}
            </p>
            {onRemoveItem ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 self-start text-muted-foreground hover:text-destructive"
                aria-label={`Eliminar ${item.product.name} del pedido`}
                onClick={() => onRemoveItem(item.lineId)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <CheckoutCartLineQuantity
              id={quantityControlId}
              product={item.product}
              quantity={item.quantity}
              onDecrease={() => changeQuantity(item.quantity - 1)}
              onIncrease={() => changeQuantity(item.quantity + 1)}
            />
            <CheckoutCartLinePricing
              unitUsd={unitUsd}
              quantity={item.quantity}
              className="sm:min-w-[9.5rem]"
              volumeDiscount={showVolumePromo ? volumeDiscount : null}
            />
          </div>
        </div>
      </div>

      {showVolumePromo ? (
        <CheckoutCartLineDiscountHint item={item} variant="compact" />
      ) : null}

      {showMultifuncionalAddons ? (
        <CheckoutMultifuncionalLineAddons item={item} cartLineIds={cartLineIds} />
      ) : null}
    </li>
  );
}
