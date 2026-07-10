import { useMemo } from 'react';
import { Percent, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  resolveCartLineBulkDiscountHint,
  resolveCartLineVolumeUnitUsd,
} from '@/lib/checkout-cart-bulk-discount';
import { formatDisplayPriceFromUsd } from '@/lib/display-price';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/product';

interface CheckoutCartLineDiscountHintProps {
  item: CartItem;
  className?: string;
  variant?: 'default' | 'compact';
}

export function CheckoutCartLineDiscountHint({
  item,
  className,
  variant = 'default',
}: CheckoutCartLineDiscountHintProps) {
  const { updateQuantity } = useCart();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const settingsQuery = useCompanySettings();
  const tiers = settingsQuery.data?.bulkDiscountTiers ?? [];

  const hint = useMemo(
    () => resolveCartLineBulkDiscountHint(item, tiers),
    [item, tiers],
  );

  const message = useMemo(() => {
    if (!hint) return null;

    const unitAmount = formatDisplayPriceFromUsd(hint.volumeUnitUsd, displayCurrency, dualPriceOrder);

    if (hint.isActive) {
      return `Llevas ${hint.targetQuantity} unidades · ${unitAmount} c/u`;
    }

    const unitsNeeded = hint.targetQuantity - item.quantity;
    return unitsNeeded === 1
      ? `Lleva ${hint.targetQuantity} y llévate en ${unitAmount} c/u`
      : `Lleva ${hint.targetQuantity} unidades y llévate en ${unitAmount} c/u`;
  }, [hint, item.quantity, displayCurrency, dualPriceOrder]);

  if (!hint || !message) return null;

  const handleIncreaseToTarget = () => {
    const volumeUnitPriceUsd = resolveCartLineVolumeUnitUsd(item, hint.targetQuantity, tiers);
    updateQuantity(
      item.lineId,
      hint.targetQuantity,
      volumeUnitPriceUsd != null ? { volumeUnitPriceUsd } : { volumeUnitPriceUsd: null },
    );
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-md border border-border bg-muted/30 px-2 py-1.5',
          className,
        )}
        role="status"
      >
        <div className="flex min-w-0 items-start gap-1.5">
          <Percent className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-pretty text-[11px] font-semibold leading-snug text-foreground sm:text-xs">
              {message}
            </p>
            {!hint.isActive && item.quantity < hint.targetQuantity ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-h-8 w-full gap-1 px-2 text-[11px] sm:text-xs"
                onClick={handleIncreaseToTarget}
              >
                <Plus className="size-3" aria-hidden="true" />
                Llevar {hint.targetQuantity} unidades
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mt-0 rounded-md border border-primary/25 bg-primary/5 px-3 py-2.5 sm:px-4 sm:py-3',
        className,
      )}
      role="status"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-2">
          <Percent className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-pretty text-xs font-semibold text-foreground sm:text-sm">{message}</p>
          </div>
        </div>
        {!hint.isActive && item.quantity < hint.targetQuantity ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-h-9 w-full shrink-0 gap-1 text-xs sm:w-auto sm:min-w-[10.5rem]"
            onClick={handleIncreaseToTarget}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Llevar {hint.targetQuantity} unidades
          </Button>
        ) : null}
      </div>
    </div>
  );
}
