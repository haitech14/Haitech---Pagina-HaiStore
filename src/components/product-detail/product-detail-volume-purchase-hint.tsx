import { useMemo } from 'react';
import { Tag } from 'lucide-react';

import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatVolumePerUnitPromoMessage } from '@/lib/display-price';
import {
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
} from '@/lib/bulk-discount-tiers';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';

interface ProductDetailVolumePurchaseHintProps {
  quantity: number;
  basePriceUsd: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd?: number;
  equipmentExtrasUsd?: number;
  className?: string;
}

export function ProductDetailVolumePurchaseHint({
  quantity,
  basePriceUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
  equipmentExtrasUsd = 0,
  className,
}: ProductDetailVolumePurchaseHintProps) {
  const { displayCurrency } = useDisplayCurrency();

  const message = useMemo(() => {
    if (bulkDiscountTiers.length === 0) return null;

    const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, bulkDiscountTiers, {
      floorPriceUsd,
    });
    if (!hint) return null;

    const pricing = resolveBulkDiscountPricing(
      hint.targetQuantity,
      basePriceUsd,
      bulkDiscountTiers,
      { floorPriceUsd },
    );
    const unitUsd = pricing.unitUsd + equipmentExtrasUsd;

    if (hint.isActive) {
      return `Descuento por volumen activo · ${formatVolumePerUnitPromoMessage(
        hint.targetQuantity,
        unitUsd,
        displayCurrency,
      )}`;
    }

    return formatVolumePerUnitPromoMessage(hint.targetQuantity, unitUsd, displayCurrency);
  }, [
    bulkDiscountTiers,
    quantity,
    basePriceUsd,
    floorPriceUsd,
    equipmentExtrasUsd,
    displayCurrency,
  ]);

  if (!message) return null;

  return (
    <div className={cn(className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
        <Tag className="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
        Compra por volumen
      </p>
      <p className="mt-0.5 text-xs leading-snug text-neutral-500">{message}</p>
    </div>
  );
}
