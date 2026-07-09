import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useAuth } from '@/context/auth-context';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { resolveCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { PRICE_ROLE_LABELS, type PriceRole, type ProductRolePrices } from '@/lib/roles';
import { cn, formatPenFromUsd, formatUsd, penToUsd } from '@/lib/utils';
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

interface ProductDetailRoleTotalsInput {
  product: Pick<Product, 'id' | 'price' | 'prices' | 'price_role'>;
  quantity: number;
  fullPrices: ProductRolePrices;
  bulkDiscountTiers: BulkDiscountTier[];
  equipmentExtrasUsd: number;
  preparationSurchargeUsd?: number;
}

function useProductDetailRoleTotals({
  product,
  quantity,
  fullPrices,
  bulkDiscountTiers,
  equipmentExtrasUsd,
  preparationSurchargeUsd = 0,
}: ProductDetailRoleTotalsInput) {
  const { isAdmin, viewAsRoles, effectiveRole } = useAuth();

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
        line.priceRole === 'public' ? preparationSurchargeUsd : 0,
      ),
    }));
  }, [
    displayPrice.viewAsRolePrices,
    quantity,
    fullPrices,
    bulkDiscountTiers,
    equipmentExtrasUsd,
    preparationSurchargeUsd,
  ]);

  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;

  return {
    publicTotalUsd,
    tecnicoTotalUsd,
    visitorTotalUsd,
    viewAsTotals,
    showAdminBreakdown,
  };
}

function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
      {percent}% OFF
    </span>
  );
}

function BuySidebarInlineDualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className="text-[1.625rem] font-bold leading-none tabular-nums text-red-600 sm:text-[1.75rem]">
        {formatPenFromUsd(usd)}
      </span>
      <span className="h-5 w-px shrink-0 self-center bg-neutral-300" aria-hidden="true" />
      <span className="text-[1.625rem] font-bold leading-none tabular-nums text-[#001b44] sm:text-[1.75rem]">
        {formatUsd(usd)}
      </span>
    </div>
  );
}

function TecnicoDualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5 tabular-nums', className)}>
      <span className="font-semibold text-red-600">{formatPenFromUsd(usd)}</span>
      <span className="h-3 w-px shrink-0 self-center bg-neutral-300" aria-hidden="true" />
      <span className="font-semibold text-[#001b44]">{formatUsd(usd)}</span>
    </span>
  );
}

function BuySidebarTecnicoPrice({ usd }: { usd: number }) {
  return (
    <p className="mt-1.5 text-xs text-neutral-500">
      Precio técnico: <TecnicoDualPrice usd={usd} />
    </p>
  );
}

interface PurchaseSidebarRolePricesProps extends ProductDetailRoleTotalsInput {
  discountPercent?: number | null;
  className?: string;
  compact?: boolean;
  /** Sidebar de compra: precio rojo, Antes tachado y técnico al iniciar sesión. */
  variant?: 'default' | 'buy-sidebar';
  oldPricePen?: number | null;
  isOnOffer?: boolean;
  catalogPublicUsd?: number;
  offerUnitUsd?: number;
}

/** Sidebar y barra móvil: Público destacado y Técnico secundario para admin. */
export function PurchaseSidebarRolePrices({
  product,
  quantity,
  fullPrices,
  bulkDiscountTiers,
  equipmentExtrasUsd,
  preparationSurchargeUsd = 0,
  discountPercent = null,
  className,
  compact = false,
  variant = 'default',
  oldPricePen = null,
  isOnOffer = false,
  catalogPublicUsd = 0,
  offerUnitUsd = 0,
}: PurchaseSidebarRolePricesProps) {
  const { user } = useAuth();
  const { publicTotalUsd, tecnicoTotalUsd, visitorTotalUsd, viewAsTotals, showAdminBreakdown } =
    useProductDetailRoleTotals({
      product,
      quantity,
      fullPrices,
      bulkDiscountTiers,
      equipmentExtrasUsd,
      preparationSurchargeUsd,
    });

  const isBuySidebar = variant === 'buy-sidebar';
  const isLoggedIn = user != null;

  const normalPriceUsd =
    oldPricePen != null
      ? penToUsd(oldPricePen)
      : isOnOffer
        ? catalogPublicUsd
        : null;
  const showNormalPrice =
    normalPriceUsd != null && normalPriceUsd > offerUnitUsd + 0.001;
  const compareUnitUsd =
    showNormalPrice && normalPriceUsd
      ? normalPriceUsd
      : oldPricePen != null
        ? penToUsd(oldPricePen)
        : null;
  const showComparePrice =
    isBuySidebar && ((showNormalPrice && normalPriceUsd != null) || oldPricePen != null);
  const antesTotalUsd =
    showComparePrice && compareUnitUsd != null ? compareUnitUsd * quantity : null;
  const displayDiscountPercent =
    discountPercent ??
    (showNormalPrice && normalPriceUsd
      ? Math.round(((normalPriceUsd - offerUnitUsd) / normalPriceUsd) * 100)
      : null);

  const mainPriceClass = cn(
    'font-bold leading-none tabular-nums',
    compact ? 'text-base sm:text-lg' : 'text-[1.625rem] sm:text-[1.75rem]',
    isBuySidebar && '[&_span]:text-red-600',
  );
  const secondaryPriceClass = cn(
    'font-semibold tabular-nums',
    compact ? 'text-xs' : 'text-sm',
  );
  const roleLabelClass = cn(
    'shrink-0 font-semibold text-muted-foreground',
    compact ? 'text-[0.625rem]' : 'text-xs',
  );

  if (viewAsTotals.length > 1) {
    return (
      <div className={className}>
        {showComparePrice && antesTotalUsd != null ? (
          <p className="mb-1 text-xs text-muted-foreground">
            Antes:{' '}
            <DualPrice
              usd={antesTotalUsd}
              strikethrough
              alwaysBoth
              className="inline font-medium text-muted-foreground"
            />
          </p>
        ) : null}
        <ViewAsRolePrices
          rolePrices={viewAsTotals}
          alwaysBoth
          compact={compact}
        />
      </div>
    );
  }

  if (isBuySidebar && showAdminBreakdown) {
    return (
      <div className={className} aria-label="Precios por rol">
        {showComparePrice && antesTotalUsd != null ? (
          <p className="mb-1 text-xs text-muted-foreground">
            Antes:{' '}
            <DualPrice
              usd={antesTotalUsd}
              strikethrough
              alwaysBoth
              className="inline font-medium text-muted-foreground"
            />
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-1.5">
          <BuySidebarInlineDualPrice usd={publicTotalUsd} />
          {displayDiscountPercent != null && displayDiscountPercent > 0 ? (
            <DiscountBadge percent={displayDiscountPercent} />
          ) : null}
        </div>
        <BuySidebarTecnicoPrice usd={tecnicoTotalUsd} />
      </div>
    );
  }

  if (isBuySidebar) {
    return (
      <div className={className}>
        {showComparePrice && antesTotalUsd != null ? (
          <p className="mb-1 text-xs text-muted-foreground">
            Antes:{' '}
            <DualPrice
              usd={antesTotalUsd}
              strikethrough
              alwaysBoth
              className="inline font-medium text-muted-foreground"
            />
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-1.5">
          <BuySidebarInlineDualPrice usd={visitorTotalUsd} />
          {displayDiscountPercent != null && displayDiscountPercent > 0 ? (
            <DiscountBadge percent={displayDiscountPercent} />
          ) : null}
        </div>
        {isLoggedIn ? <BuySidebarTecnicoPrice usd={tecnicoTotalUsd} /> : null}
      </div>
    );
  }

  if (showAdminBreakdown) {
    return (
      <div className={className} aria-label="Precios por rol">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className={roleLabelClass}>{PRICE_ROLE_LABELS.public}:</span>
          <span className={mainPriceClass}>
            <DualPrice usd={publicTotalUsd} alwaysBoth />
          </span>
          {discountPercent != null && discountPercent > 0 ? (
            <DiscountBadge percent={discountPercent} />
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
          <span className={roleLabelClass}>{PRICE_ROLE_LABELS.tecnico}:</span>
          <DualPrice usd={tecnicoTotalUsd} alwaysBoth className={secondaryPriceClass} />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className={mainPriceClass}>
          <DualPrice usd={visitorTotalUsd} alwaysBoth />
        </span>
        {discountPercent != null && discountPercent > 0 ? (
          <DiscountBadge percent={discountPercent} />
        ) : null}
      </div>
      {isLoggedIn ? (
        <p
          className={cn(
            'mt-0.5 text-muted-foreground',
            compact ? 'truncate text-xs' : 'text-xs',
          )}
        >
          Precio técnico: <TecnicoDualPrice usd={tecnicoTotalUsd} />
        </p>
      ) : null}
    </div>
  );
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
  const { publicTotalUsd, tecnicoTotalUsd, visitorTotalUsd, viewAsTotals, showAdminBreakdown } =
    useProductDetailRoleTotals({
      product,
      quantity,
      fullPrices,
      bulkDiscountTiers,
      equipmentExtrasUsd,
      preparationSurchargeUsd,
    });

  const mainPriceClass = cn(
    'text-2xl font-bold leading-tight tabular-nums sm:text-[1.75rem]',
    accentPrice ? 'text-red-600' : 'text-foreground',
  );
  const rolePriceClass = 'text-xl font-bold leading-tight tabular-nums text-foreground sm:text-2xl';

  if (viewAsTotals.length > 1) {
    return (
      <ViewAsRolePrices
        rolePrices={viewAsTotals}
        className={cn('text-sm sm:text-base', className)}
      />
    );
  }

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
  align?: 'start' | 'center';
}

/** Precio de tóner en selector hero: dual y desglose Técnico/Público para admin. */
export function TonerCardRolePrices({
  prices,
  className,
  align = 'center',
}: TonerCardRolePricesProps) {
  const { isAdmin, viewAsRoles } = useAuth();
  const showAdminBreakdown = isAdmin && viewAsRoles.length === 0;
  const rowAlignClass = align === 'start' ? 'justify-start' : 'justify-center';

  if (showAdminBreakdown) {
    return (
      <span className={cn('space-y-0.5', className)}>
        <span
          className={cn(
            'flex flex-wrap items-baseline gap-x-1 text-[0.6875rem] sm:text-xs',
            rowAlignClass,
          )}
        >
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.tecnico}:</span>
          <DualPrice usd={prices.tecnico} className="font-bold text-foreground" />
        </span>
        <span
          className={cn(
            'flex flex-wrap items-baseline gap-x-1 text-[0.6875rem] sm:text-xs',
            rowAlignClass,
          )}
        >
          <span className="font-semibold text-muted-foreground">{PRICE_ROLE_LABELS.public}:</span>
          <DualPrice usd={prices.public} className="font-bold text-foreground" />
        </span>
      </span>
    );
  }

  return (
    <span className={cn('text-[0.6875rem] font-bold text-foreground sm:text-xs', className)}>
      <DualPrice usd={prices.public} />
    </span>
  );
}
