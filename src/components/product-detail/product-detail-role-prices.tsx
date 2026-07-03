import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useAuth } from '@/context/auth-context';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { resolveCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { PRICE_ROLE_LABELS, type PriceRole, type ProductRolePrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';
interface ProductDetailRolePriceLinesProps {
  product: Pick<Product, 'id' | 'price' | 'prices' | 'price_role'>;
  quantity: number;
  fullPrices: ProductRolePrices;
  bulkDiscountTiers: BulkDiscountTier[];
  equipmentExtrasUsd: number;
  preparationSurchargeUsd?: number;
  className?: string;
  accentPrice?: boolean;
}

function computeRoleTotalUsd(
  role: PriceRole,
  quantity: number,
  fullPrices: ProductRolePrices,
  bulkDiscountTiers: BulkDiscountTier[],
  equipmentExtrasUsd: number,
  preparationSurchargeUsd = 0,
): number {
  const baseUsd =
    fullPrices[role] + (role === 'public' ? preparationSurchargeUsd : 0);
  const volume = resolveBulkDiscountPricing(quantity, baseUsd, bulkDiscountTiers, {
    floorPriceUsd: fullPrices.tecnico,
  });
  return volume.totalUsd + equipmentExtrasUsd * quantity;
}

/** Precio total en ficha: desglose por rol para admin o vista previa. */
export function ProductDetailRolePriceLines({
  product,
  quantity,
  fullPrices,
  bulkDiscountTiers,
  equipmentExtrasUsd,
  preparationSurchargeUsd = 0,
  className,
  accentPrice = false,
}: ProductDetailRolePriceLinesProps) {
  const { isAdmin, viewAsRoles, effectiveRole } = useAuth();

  const mainPriceClass = cn(
    'text-2xl font-bold leading-tight tabular-nums sm:text-[1.75rem]',
    accentPrice ? 'text-red-600' : 'text-foreground',
  );
  const rolePriceClass = 'text-xl font-bold leading-tight tabular-nums text-foreground sm:text-2xl';

  const publicTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd(
        'public',
        quantity,
        fullPrices,
        bulkDiscountTiers,
        equipmentExtrasUsd,
        preparationSurchargeUsd,
      ),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd, preparationSurchargeUsd],
  );

  const tecnicoTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd('tecnico', quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd],
  );

  const displayPrice = resolveCatalogDisplayPrice(product, {
    viewAsRoles,
    effectiveRole,
    isAdmin,
  });

  const visitorTotalUsd = useMemo(() => {
    const baseUsd = displayPrice.previewAsRole ? displayPrice.priceUsd : product.price;
    const adjustedBase =
      !displayPrice.previewAsRole && effectiveRole === 'public'
        ? baseUsd + preparationSurchargeUsd
        : baseUsd;
    const volume = resolveBulkDiscountPricing(quantity, adjustedBase, bulkDiscountTiers, {
      floorPriceUsd: fullPrices.tecnico,
    });
    return volume.totalUsd + equipmentExtrasUsd * quantity;
  }, [
    displayPrice.previewAsRole,
    displayPrice.priceUsd,
    product.price,
    effectiveRole,
    preparationSurchargeUsd,
    quantity,
    bulkDiscountTiers,
    fullPrices.tecnico,
    equipmentExtrasUsd,
  ]);

  const viewAsTotals = useMemo<CatalogRolePriceLine[]>(() => {
    if (displayPrice.viewAsRolePrices.length <= 1) return [];
    return displayPrice.viewAsRolePrices.map((line) => ({
      ...line,
      priceUsd: computeRoleTotalUsd(
        line.priceRole,
        quantity,
        fullPrices,
        bulkDiscountTiers,
        equipmentExtrasUsd,
      ),
    }));
  }, [
    displayPrice.viewAsRolePrices,
    quantity,
    fullPrices,
    bulkDiscountTiers,
    equipmentExtrasUsd,
  ]);

  if (viewAsTotals.length > 1) {
    return (
      <ViewAsRolePrices
        rolePrices={viewAsTotals}
        className={cn('text-sm sm:text-base', className)}
      />
    );
  }

  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;

  if (showAdminBreakdown) {
    return (
      <ul className={cn('space-y-2', className)} aria-label="Precios por rol">
        <li className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {PRICE_ROLE_LABELS.tecnico}
          </span>
          <DualPrice usd={tecnicoTotalUsd} className={rolePriceClass} />
        </li>
        <li className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {PRICE_ROLE_LABELS.public}
          </span>
          <DualPrice usd={publicTotalUsd} className={rolePriceClass} />
        </li>
      </ul>
    );
  }

  return (
    <DualPrice
      usd={visitorTotalUsd}
      className={cn(mainPriceClass, accentPrice && '[&_span]:text-red-600', className)}
    />
  );
}

interface TonerCardRolePricesProps {
  prices: ProductRolePrices;
  className?: string;
}

/** Precio de tóner en selector hero: dual y desglose Técnico/Público para admin. */
export function TonerCardRolePrices({ prices, className }: TonerCardRolePricesProps) {
  const { isAdmin, viewAsRoles } = useAuth();
  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;

  if (showAdminBreakdown) {
    return (
      <span className={cn('mt-0.5 block space-y-0.5', className)}>
        <span className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.tecnico}:</span>
          <DualPrice usd={prices.tecnico} className="font-bold text-foreground" />
        </span>
        <span className="flex flex-wrap items-baseline gap-x-1.5 text-xs sm:text-sm">
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.public}:</span>
          <DualPrice usd={prices.public} className="font-bold text-foreground" />
        </span>
      </span>
    );
  }

  return (
    <span className={cn('mt-0.5 block text-xs font-bold text-foreground sm:text-sm', className)}>
      <DualPrice usd={prices.public} />
    </span>
  );
}
