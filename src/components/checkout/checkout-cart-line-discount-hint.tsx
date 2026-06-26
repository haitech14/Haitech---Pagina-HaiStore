import { useMemo } from 'react';
import { Percent, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  resolveCartLineBulkDiscountHint,
  resolveCartLineVolumeUnitUsd,
} from '@/lib/checkout-cart-bulk-discount';
import { formatOfferQuantitySavingsMessageFromUsd } from '@/lib/display-price';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/product';

interface CheckoutCartLineDiscountHintProps {
  item: CartItem;
  className?: string;
}

export function CheckoutCartLineDiscountHint({
  item,
  className,
}: CheckoutCartLineDiscountHintProps) {
  const { updateQuantity } = useCart();
  const settingsQuery = useCompanySettings();
  const tiers = settingsQuery.data?.bulkDiscountTiers ?? [];

  const hint = useMemo(
    () => resolveCartLineBulkDiscountHint(item, tiers),
    [item, tiers],
  );

  if (!hint) return null;

  const handleIncreaseToTarget = () => {
    const volumeUnitPriceUsd = resolveCartLineVolumeUnitUsd(item, hint.targetQuantity, tiers);
    updateQuantity(
      item.lineId,
      hint.targetQuantity,
      volumeUnitPriceUsd != null ? { volumeUnitPriceUsd } : { volumeUnitPriceUsd: null },
    );
  };

  const savingsLabel =
    hint.savingsUsd > 0.001
      ? formatOfferQuantitySavingsMessageFromUsd(hint.targetQuantity, hint.savingsUsd)
      : null;

  return (
    <div
      className={cn(
        'mt-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <Percent className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground sm:text-sm">{hint.message}</p>
          {savingsLabel && !hint.isActive ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{savingsLabel}</p>
          ) : null}
          {!hint.isActive && item.quantity < hint.targetQuantity ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-8 min-h-8 gap-1 text-xs"
              onClick={handleIncreaseToTarget}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Llevar {hint.targetQuantity} unidades
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
