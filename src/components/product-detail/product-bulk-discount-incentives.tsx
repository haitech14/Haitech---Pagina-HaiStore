import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
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

function formatQuantityLabel(quantity: number): string {
  return `Lleva ${quantity} unidad${quantity === 1 ? '' : 'es'}`;
}

export function ProductBulkDiscountIncentives({
  product,
  tiers,
  className,
}: ProductBulkDiscountIncentivesProps) {
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

  if (incentives.length === 0) return null;

  return (
    <ul
      className={cn('space-y-1', className)}
      aria-label="Precio por unidad según cantidad"
    >
      {incentives.map(({ quantity, pricing }) => (
        <li
          key={quantity}
          className="flex flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground"
        >
          <span className="font-medium text-foreground">
            {formatQuantityLabel(quantity)}:
          </span>
          <DualPrice usd={pricing.unitUsd} alwaysBoth className="font-semibold text-red-600" />
          <span aria-hidden="true">c/u</span>
          <span className="sr-only">
            {pricing.unitUsd} dólares por unidad con descuento por volumen
          </span>
        </li>
      ))}
    </ul>
  );
}
