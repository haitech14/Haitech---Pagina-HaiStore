import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { resolveCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { getDisplayPriceVisibility, CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
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
    return displayPrice.viewAsRolePrices.map((line) => {
      const unitBase =
        line.role === 'corporativo2'
          ? line.priceUsd
          : fullPrices[line.priceRole] + (line.priceRole === 'public' ? preparationSurchargeUsd : 0);
      const volume = resolveBulkDiscountPricing(quantity, unitBase, bulkDiscountTiers, {
        floorPriceUsd: fullPrices.tecnico,
      });
      return {
        ...line,
        priceUsd: volume.totalUsd + equipmentExtrasUsd * quantity,
      };
    });
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
    <span className="inline-flex rounded-full bg-[#E30613] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
      {percent}% DSCT
    </span>
  );
}

function BuySidebarInlineDualPrice({ usd, className }: { usd: number; className?: string }) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const both = showUsd && showPen;

  if (isPriceOnRequest(usd)) {
    return (
      <div className={cn('flex flex-col items-start gap-0.5', className)}>
        <span className="text-[1.625rem] font-bold leading-none text-red-600 sm:text-[1.75rem]">
          {CONSULTAR_PRECIO_LABEL}
        </span>
      </div>
    );
  }

  const penPrimary = (
    <span className="text-[1.625rem] font-bold leading-none tabular-nums text-red-600 sm:text-[1.75rem]">
      {formatPenFromUsd(usd)}
    </span>
  );
  const usdPrimary = (
    <span className="text-[1.625rem] font-bold leading-none tabular-nums text-red-600 sm:text-[1.75rem]">
      {formatUsd(usd)}
    </span>
  );
  const usdSecondary = (
    <span className="text-sm font-semibold leading-none tabular-nums text-[#6B7280]">
      {formatUsd(usd)}
    </span>
  );

  return (
    <div className={cn('flex flex-col items-start gap-0.5', className)}>
      {!both ? (
        <>
          {showPen ? penPrimary : null}
          {showUsd ? usdPrimary : null}
        </>
      ) : (
        <>
          {penPrimary}
          {usdSecondary}
        </>
      )}
    </div>
  );
}

function TecnicoDualPrice({ usd, className }: { usd: number; className?: string }) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';

  if (isPriceOnRequest(usd)) {
    return (
      <span className={cn('inline-flex flex-wrap items-baseline gap-x-1', className)}>
        {CONSULTAR_PRECIO_LABEL}
      </span>
    );
  }

  const penSpan = showPen ? (
    <span className="font-medium text-neutral-500">{formatPenFromUsd(usd)}</span>
  ) : null;
  const usdSpan = showUsd ? (
    <span className="font-medium text-neutral-500">{formatUsd(usd)}</span>
  ) : null;
  const separator =
    showUsd && showPen ? (
      <span className="text-neutral-300" aria-hidden="true">
        ·
      </span>
    ) : null;

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1 tabular-nums', className)}>
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

function BuySidebarSecondaryPrices({
  tecnicoUsd,
  showTecnico,
  showAdminPurchaseLine,
  productId,
}: {
  tecnicoUsd: number;
  showTecnico: boolean;
  showAdminPurchaseLine: boolean;
  productId: string;
}) {
  if (!showTecnico && !showAdminPurchaseLine) return null;

  return (
    <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-[0.6875rem] text-neutral-400">
      {showTecnico ? (
        <span>
          Precio técnico: <TecnicoDualPrice usd={tecnicoUsd} />
        </span>
      ) : null}
      {showTecnico && showAdminPurchaseLine ? (
        <span className="text-neutral-300" aria-hidden="true">
          |
        </span>
      ) : null}
      {showAdminPurchaseLine ? <AdminPurchaseCostLine productId={productId} className="mt-0" /> : null}
    </div>
  );
}

/** Solo admin: costo de compra y proveedor debajo del precio de venta. */
export function AdminPurchaseCostLine({
  productId: _productId,
  className: _className,
}: {
  productId: string;
  className?: string;
}) {
  // No mostrar precio de compra en la ficha / tienda (ni para admin).
  return null;
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
  /** Oculta badge % OFF cuando va en cabecera del sidebar mockup. */
  showDiscountBadge?: boolean;
  /** Muestra línea Compra para admin en layout mockup. */
  showAdminPurchaseLine?: boolean;
  /** Desglose Antes / DSCTO / Ahorras estilo mockup laptop. */
  showOfferBreakdown?: boolean;
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
  offerUnitUsd: _offerUnitUsd = 0,
  showDiscountBadge: _showDiscountBadge = true,
  showAdminPurchaseLine = false,
  showOfferBreakdown = false,
}: PurchaseSidebarRolePricesProps) {
  const { user, isAdmin, viewAsRoles } = useAuth();
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
  const previewAsRole = viewAsRoles.length > 0;
  /** Solo mostrar precio técnico extra fuera de vista previa (p. ej. no al ver solo Público). */
  const showTecnicoSecondary = isLoggedIn && !previewAsRole && !showAdminBreakdown;
  const allowPurchaseLine = showAdminPurchaseLine && isAdmin;

  const saleUnitUsd = Math.max(0, visitorTotalUsd / Math.max(1, quantity));
  const commercialCompareUsd =
    saleUnitUsd > 0 ? Math.round((saleUnitUsd / (1 - 0.11)) * 100) / 100 : null;
  const normalPriceUsd =
    oldPricePen != null
      ? penToUsd(oldPricePen)
      : isOnOffer && catalogPublicUsd > saleUnitUsd + 0.001
        ? catalogPublicUsd
        : catalogPublicUsd > saleUnitUsd + 0.001
          ? catalogPublicUsd
          : commercialCompareUsd;
  const showNormalPrice =
    normalPriceUsd != null && normalPriceUsd > saleUnitUsd + 0.001;
  const compareUnitUsd = showNormalPrice ? normalPriceUsd : null;
  const showComparePrice = isBuySidebar && compareUnitUsd != null;
  const antesTotalUsd =
    showComparePrice && compareUnitUsd != null ? compareUnitUsd * quantity : null;
  const displayDiscountPercent =
    discountPercent ??
    (showNormalPrice && normalPriceUsd
      ? Math.max(1, Math.round(((normalPriceUsd - saleUnitUsd) / normalPriceUsd) * 100))
      : null);

  const storeCompareRow =
    showComparePrice && antesTotalUsd != null ? (
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium tabular-nums text-[#9CA3AF] line-through decoration-[#9CA3AF] sm:text-[13px]">
          {formatPenFromUsd(antesTotalUsd)}
        </span>
        {displayDiscountPercent != null && displayDiscountPercent > 0 ? (
          <DiscountBadge percent={displayDiscountPercent} />
        ) : null}
      </div>
    ) : null;

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
        {storeCompareRow}
        <ViewAsRolePrices rolePrices={viewAsTotals} compact={compact} />
      </div>
    );
  }

  if (isBuySidebar && showAdminBreakdown) {
    return (
      <div className={className} aria-label="Precios por rol">
        {storeCompareRow}
        <BuySidebarInlineDualPrice usd={publicTotalUsd} />
        <BuySidebarSecondaryPrices
          tecnicoUsd={tecnicoTotalUsd}
          showTecnico
          showAdminPurchaseLine={allowPurchaseLine}
          productId={product.id}
        />
        {!allowPurchaseLine && isAdmin ? <AdminPurchaseCostLine productId={product.id} /> : null}
      </div>
    );
  }

  const savingsUsd =
    showOfferBreakdown && antesTotalUsd != null
      ? Math.max(0, antesTotalUsd - visitorTotalUsd)
      : null;

  if (isBuySidebar) {
    return (
      <div className={className}>
        {storeCompareRow}
        {showOfferBreakdown && displayDiscountPercent != null && displayDiscountPercent > 0 && !storeCompareRow ? (
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <DiscountBadge percent={displayDiscountPercent} />
            {savingsUsd != null && savingsUsd > 0.001 ? (
              <span className="text-xs font-semibold text-emerald-600">
                Ahorras: {formatPenFromUsd(savingsUsd)}
              </span>
            ) : null}
          </div>
        ) : null}
        {showOfferBreakdown && savingsUsd != null && savingsUsd > 0.001 && storeCompareRow ? (
          <p className="mb-1 text-xs font-semibold text-emerald-600">
            Ahorras: {formatPenFromUsd(savingsUsd)}
          </p>
        ) : null}
        <BuySidebarInlineDualPrice usd={visitorTotalUsd} />
        <BuySidebarSecondaryPrices
          tecnicoUsd={tecnicoTotalUsd}
          showTecnico={showTecnicoSecondary}
          showAdminPurchaseLine={allowPurchaseLine}
          productId={product.id}
        />
      </div>
    );
  }

  if (showAdminBreakdown) {
    return (
      <div className={className} aria-label="Precios por rol">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className={roleLabelClass}>{PRICE_ROLE_LABELS.public}:</span>
          <span className={mainPriceClass}>
            <DualPrice usd={publicTotalUsd} />
          </span>
          {discountPercent != null && discountPercent > 0 ? (
            <DiscountBadge percent={discountPercent} />
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
          <span className={roleLabelClass}>{PRICE_ROLE_LABELS.tecnico}:</span>
          <DualPrice usd={tecnicoTotalUsd} className={secondaryPriceClass} />
        </div>
        <AdminPurchaseCostLine productId={product.id} />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className={mainPriceClass}>
          <DualPrice usd={visitorTotalUsd} />
        </span>
        {discountPercent != null && discountPercent > 0 ? (
          <DiscountBadge percent={discountPercent} />
        ) : null}
      </div>
      {showTecnicoSecondary ? (
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
      <div className={className}>
        <ul className="space-y-2" aria-label="Precios por rol">
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
        <AdminPurchaseCostLine productId={product.id} />
      </div>
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
