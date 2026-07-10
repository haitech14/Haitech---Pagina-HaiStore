import { useId, useMemo } from 'react';
import { ChevronDown, Percent } from 'lucide-react';

import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  resolveEffectiveBulkDiscountTier,
  DEFAULT_BULK_DISCOUNT_TIERS,
  parseBulkDiscountRange,
} from '@/lib/bulk-discount-tiers';
import { resolveProductBulkDiscountHint } from '@/lib/checkout-cart-bulk-discount';
import { formatDisplayPriceFromUsd } from '@/lib/display-price';
import { ensureFullPrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductVolumeDiscountPromoProps {
  product: Product;
  quantity?: number;
  tiers?: BulkDiscountTier[];
  basePriceUsd?: number;
  floorPriceUsd?: number;
  className?: string;
}

function formatTierRangeLabel(range: string): string {
  const bounds = parseBulkDiscountRange(range);
  if (!bounds) return range;
  if (range.includes('+')) return `${range} u.`;
  if (bounds.min === bounds.max) return `${bounds.min} u.`;
  return `${bounds.min}–${bounds.max} u.`;
}

export function ProductVolumeDiscountPromo({
  product,
  quantity = 1,
  tiers: tiersProp,
  basePriceUsd,
  floorPriceUsd,
  className,
}: ProductVolumeDiscountPromoProps) {
  const panelId = useId();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const settingsQuery = useCompanySettings();
  const tiers = tiersProp ?? settingsQuery.data?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS;

  const pricingOptions = useMemo(
    () => ({
      ...(basePriceUsd != null ? { basePriceUsd } : {}),
      ...(floorPriceUsd != null ? { floorPriceUsd } : {}),
    }),
    [basePriceUsd, floorPriceUsd],
  );

  const resolvedBasePriceUsd = basePriceUsd ?? product.price;
  const resolvedFloorPriceUsd =
    floorPriceUsd ?? ensureFullPrices(product.prices ? product.prices : { public: product.price }).tecnico;

  const hint = useMemo(
    () => resolveProductBulkDiscountHint(product, quantity, tiers, pricingOptions),
    [product, quantity, tiers, pricingOptions],
  );

  const tierRows = useMemo(
    () =>
      tiers.map((tier) => {
        const effective = resolveEffectiveBulkDiscountTier(
          tier,
          resolvedBasePriceUsd,
          resolvedFloorPriceUsd,
        );
        return {
          id: tier.range,
          rangeLabel: formatTierRangeLabel(tier.range),
          discountLabel: effective.discount,
          unitAmount: formatDisplayPriceFromUsd(effective.unitUsd, displayCurrency, dualPriceOrder),
        };
      }),
    [tiers, resolvedBasePriceUsd, resolvedFloorPriceUsd, displayCurrency, dualPriceOrder],
  );

  const message = useMemo(() => {
    if (!hint) return null;

    const unitAmount = formatDisplayPriceFromUsd(hint.volumeUnitUsd, displayCurrency, dualPriceOrder);

    if (hint.isActive) {
      return `Llevas ${hint.targetQuantity} unidades · ${unitAmount} c/u`;
    }

    return `Lleva ${hint.targetQuantity} y llévate en ${unitAmount} c/u`;
  }, [hint, displayCurrency, dualPriceOrder]);

  if (!hint || !message || tiers.length === 0) return null;

  return (
    <details
      className={cn(
        'group overflow-hidden rounded-md border border-border bg-muted/30',
        className,
      )}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center gap-2 px-2.5 py-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          '[&::-webkit-details-marker]:hidden',
        )}
        aria-controls={panelId}
      >
        <Percent className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1 text-pretty text-[11px] font-semibold leading-snug text-foreground sm:text-xs">
          Descuentos por volumen
        </span>
        <ChevronDown
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div id={panelId} className="space-y-2 border-t border-border/70 px-2.5 py-2">
        <p className="text-pretty text-[11px] leading-snug text-muted-foreground sm:text-xs" role="status">
          {message}
        </p>
        <ul className="space-y-1" aria-label="Tabla de descuentos por volumen">
          {tierRows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-2 text-[11px] sm:text-xs"
            >
              <span className="text-muted-foreground">
                {row.rangeLabel} · {row.discountLabel}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {row.unitAmount} c/u
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
