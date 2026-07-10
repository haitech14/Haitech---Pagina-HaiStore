import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatVolumeQuantityPromoMessage } from '@/lib/display-price';
import { ensureFullPrices } from '@/lib/roles';
import {
  resolveBulkDiscountPricing,
  resolveBulkDiscountTierForQuantity,
} from '@/lib/bulk-discount-tiers';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

const INCENTIVE_QUANTITIES = [2, 3, 5, 10] as const;

interface ProductBulkDiscountIncentivesProps {
  product: Product;
  tiers: BulkDiscountTier[];
  className?: string;
}

export function ProductBulkDiscountIncentives({
  product,
  tiers,
  className,
}: ProductBulkDiscountIncentivesProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const fullPrices = ensureFullPrices(
    product.prices ? product.prices : { public: product.price },
  );
  const basePriceUsd = fullPrices.public;
  const floorPriceUsd = fullPrices.tecnico;

  const incentives = useMemo(() => {
    if (tiers.length === 0) return [];

    return INCENTIVE_QUANTITIES.flatMap((quantity) => {
      const tier = resolveBulkDiscountTierForQuantity(quantity, tiers);
      if (!tier) return [];

      const pricing = resolveBulkDiscountPricing(quantity, basePriceUsd, tiers, {
        floorPriceUsd,
      });
      if (pricing.savingsUsd <= 0.001) return [];

      return [{ quantity, pricing }];
    });
  }, [tiers, basePriceUsd, floorPriceUsd]);

  const [open, setOpen] = useState(false);
  const panelId = 'bulk-discount-incentives-panel';

  if (incentives.length === 0) return null;

  return (
    <div className={cn(className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-xs font-semibold text-foreground">Descuento por volumen</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? (
        <ul id={panelId} className="mt-1 space-y-0.5" aria-label="Promociones por cantidad">
          {incentives.map(({ quantity, pricing }) => (
            <li key={quantity} className="text-xs text-muted-foreground">
              {formatVolumeQuantityPromoMessage(
                quantity,
                pricing.unitUsd,
                displayCurrency,
                dualPriceOrder,
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
