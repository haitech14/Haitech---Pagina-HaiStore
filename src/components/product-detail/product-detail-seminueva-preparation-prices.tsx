import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import {
  SEMINUEVA_PREPARATION_LABELS,
  SEMINUEVA_PREPARATION_OPTIONS,
  resolveSeminuevaPreparationSurchargeUsd,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { AdminPurchaseCostLine } from '@/components/product-detail/product-detail-role-prices';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface SeminuevaPreparationPriceRowsProps {
  product: Product;
  catalogPublicUsd: number;
  preparationType: SeminuevaPreparationType;
  quantity: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd: number;
  equipmentExtrasUsd: number;
  className?: string;
}

function PreparationDualPrice({
  usd,
  active,
}: {
  usd: number;
  active: boolean;
}) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';

  const penSpan = showPen ? (
    <span
      className={cn(
        'font-bold leading-none',
        active ? 'text-base text-red-600 sm:text-lg' : 'text-sm text-muted-foreground',
      )}
    >
      {formatPenFromUsd(usd)}
    </span>
  ) : null;
  const usdSpan = showUsd ? (
    <span
      className={cn(
        'font-bold leading-none',
        active ? 'text-base text-[#001b44] sm:text-lg' : 'text-sm text-muted-foreground',
      )}
    >
      {formatUsd(usd)}
    </span>
  ) : null;
  const separator =
    showUsd && showPen ? (
      <span className="h-3.5 w-px shrink-0 self-center bg-neutral-300" aria-hidden="true" />
    ) : null;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-1.5 tabular-nums">
      {penFirst ? (
        <>
          {penSpan}
          {separator}
          {usdSpan}
        </>
      ) : (
        <>
          {usdSpan}
          {separator}
          {penSpan}
        </>
      )}
    </span>
  );
}

export function SeminuevaPreparationPriceRows({
  product,
  catalogPublicUsd,
  preparationType,
  quantity,
  bulkDiscountTiers,
  floorPriceUsd,
  equipmentExtrasUsd,
  className,
}: SeminuevaPreparationPriceRowsProps) {
  const { isAdmin, viewAsRoles } = useAuth();
  const showAdminCost = isAdmin && viewAsRoles.length === 0;

  return (
    <div className={cn('space-y-2', className)} aria-label="Precios por tipo de preparado">
      {SEMINUEVA_PREPARATION_OPTIONS.map((option) => {
        const unitUsd =
          catalogPublicUsd + resolveSeminuevaPreparationSurchargeUsd(option, product);
        const volume = resolveBulkDiscountPricing(quantity, unitUsd, bulkDiscountTiers, {
          floorPriceUsd,
        });
        const totalUsd = volume.totalUsd + equipmentExtrasUsd * quantity;
        const isActive = preparationType === option;

        return (
          <div
            key={option}
            className={cn(
              'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded-md px-1.5 py-1',
              isActive && 'bg-red-50/70 ring-1 ring-inset ring-red-100',
            )}
          >
            <span
              className={cn(
                'text-xs',
                isActive ? 'font-semibold text-[#0f1f3d]' : 'text-muted-foreground',
              )}
            >
              {SEMINUEVA_PREPARATION_LABELS[option]}:
            </span>
            <PreparationDualPrice usd={totalUsd} active={isActive} />
          </div>
        );
      })}
      {showAdminCost ? <AdminPurchaseCostLine productId={product.id} /> : null}
    </div>
  );
}
