import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { resolveCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { getDisplayPriceVisibility, CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
import { isEquipmentDisplayPriceCategory, roundEquipmentDisplayUsd } from '@/lib/pen-pricing';
import { PRICE_ROLE_LABELS, type PriceRole, type ProductRolePrices } from '@/lib/roles';
import { cn, formatPenFromUsd, formatStorefrontUsd, formatUsd, penToUsd } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailRolePriceLinesProps {
  product: Pick<Product, 'id' | 'price' | 'prices' | 'price_role' | 'category'>;
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
  category?: string | null,
): number {
  const isEquipment = isEquipmentDisplayPriceCategory(category);
  const rawRoleUsd = fullPrices[role];
  const roleUsd =
    isEquipment && role !== 'tecnico' ? roundEquipmentDisplayUsd(rawRoleUsd) : rawRoleUsd;
  const floorPriceUsd = fullPrices.tecnico + preparationSurchargeUsd;
  const baseUsd = roleUsd + preparationSurchargeUsd;
  const volume = resolveBulkDiscountPricing(quantity, baseUsd, bulkDiscountTiers, {
    floorPriceUsd,
  });
  return volume.totalUsd + equipmentExtrasUsd * quantity;
}

interface ProductDetailRoleTotalsInput {
  product: Pick<Product, 'id' | 'price' | 'prices' | 'price_role' | 'category'>;
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
        product.category,
      ),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd, preparationSurchargeUsd, product.category],
  );

  const tecnicoTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd(
        'tecnico',
        quantity,
        fullPrices,
        bulkDiscountTiers,
        equipmentExtrasUsd,
        preparationSurchargeUsd,
        product.category,
      ),
    [quantity, fullPrices, bulkDiscountTiers, equipmentExtrasUsd, preparationSurchargeUsd, product.category],
  );

  const displayPrice = resolveCatalogDisplayPrice(product, {
    viewAsRoles,
    effectiveRole,
    isAdmin,
  });

  const visitorTotalUsd = useMemo(
    () =>
      computeRoleTotalUsd(
        displayPrice.priceRole,
        quantity,
        fullPrices,
        bulkDiscountTiers,
        equipmentExtrasUsd,
        preparationSurchargeUsd,
        product.category,
      ),
    [
      displayPrice.priceRole,
      quantity,
      fullPrices,
      bulkDiscountTiers,
      equipmentExtrasUsd,
      preparationSurchargeUsd,
      product.category,
    ],
  );

  const viewAsTotals = useMemo<CatalogRolePriceLine[]>(() => {
    if (displayPrice.viewAsRolePrices.length <= 1) return [];
    return displayPrice.viewAsRolePrices.map((line) => {
      const unitBase =
        line.role === 'corporativo2'
          ? line.priceUsd
          : fullPrices[line.priceRole] + preparationSurchargeUsd;
      const volume = resolveBulkDiscountPricing(quantity, unitBase, bulkDiscountTiers, {
        floorPriceUsd: fullPrices.tecnico + preparationSurchargeUsd,
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

function DiscountBadge({ percent, onBrand = false }: { percent: number; onBrand?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide',
        onBrand ? 'bg-white text-[#6B1423]' : 'bg-[#E30613] text-white',
      )}
    >
      {percent}% DSCT
    </span>
  );
}

function BuySidebarInlineDualPrice({
  usd,
  className,
  onBrand = false,
}: {
  usd: number;
  className?: string;
  onBrand?: boolean;
}) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const both = showUsd && showPen;
  const primaryClass = cn(
    'text-[1.75rem] font-bold leading-none tabular-nums sm:text-[2rem]',
    onBrand ? 'text-white' : 'text-neutral-900',
  );
  const secondaryClass = cn(
    'text-sm font-semibold leading-none tabular-nums',
    onBrand ? 'text-white/80' : 'text-[#6B7280]',
  );

  if (isPriceOnRequest(usd)) {
    return (
      <div className={cn('flex flex-col items-start gap-0.5', className)}>
        <span className={primaryClass}>{CONSULTAR_PRECIO_LABEL}</span>
      </div>
    );
  }

  const penPrimary = <span className={primaryClass}>{formatPenFromUsd(usd)}</span>;
  const usdPrimary = <span className={primaryClass}>{formatStorefrontUsd(usd)}</span>;
  const usdSecondary = <span className={secondaryClass}>{formatStorefrontUsd(usd)}</span>;

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

function TecnicoDualPrice({
  usd,
  className,
  onBrand = false,
}: {
  usd: number;
  className?: string;
  onBrand?: boolean;
}) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';
  const mutedClass = onBrand ? 'font-medium text-white/75' : 'font-medium text-neutral-500';
  const sepClass = onBrand ? 'text-white/40' : 'text-neutral-300';

  if (isPriceOnRequest(usd)) {
    return (
      <span className={cn('inline-flex flex-wrap items-baseline gap-x-1', className)}>
        {CONSULTAR_PRECIO_LABEL}
      </span>
    );
  }

  const penSpan = showPen ? <span className={mutedClass}>{formatPenFromUsd(usd)}</span> : null;
  const usdSpan = showUsd ? <span className={mutedClass}>{formatUsd(usd)}</span> : null;
  const separator =
    showUsd && showPen ? (
      <span className={sepClass} aria-hidden="true">
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
  onBrand = false,
}: {
  tecnicoUsd: number;
  showTecnico: boolean;
  showAdminPurchaseLine: boolean;
  productId: string;
  onBrand?: boolean;
}) {
  if (!showTecnico && !showAdminPurchaseLine) return null;

  return (
    <div
      className={cn(
        'mt-1 flex flex-wrap items-baseline gap-x-1 text-[0.6875rem]',
        onBrand ? 'text-white/75' : 'text-neutral-400',
      )}
    >
      {showTecnico ? (
        <span>
          Precio técnico: <TecnicoDualPrice usd={tecnicoUsd} onBrand={onBrand} />
        </span>
      ) : null}
      {showTecnico && showAdminPurchaseLine ? (
        <span className={onBrand ? 'text-white/40' : 'text-neutral-300'} aria-hidden="true">
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
  /** Texto claro sobre fondo marca (sidebar rojo). */
  onBrand?: boolean;
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
  onBrand = false,
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
        <span
          className={cn(
            'text-xs font-medium tabular-nums line-through sm:text-[13px]',
            onBrand
              ? 'text-white/70 decoration-white/70'
              : 'text-[#9CA3AF] decoration-[#9CA3AF]',
          )}
        >
          {formatPenFromUsd(antesTotalUsd)}
        </span>
        {displayDiscountPercent != null && displayDiscountPercent > 0 ? (
          <DiscountBadge percent={displayDiscountPercent} onBrand={onBrand} />
        ) : null}
      </div>
    ) : null;

  const mainPriceClass = cn(
    'font-bold leading-none tabular-nums',
    compact ? 'text-base sm:text-lg' : 'text-[1.625rem] sm:text-[1.75rem]',
    isBuySidebar && (onBrand ? '[&_span]:text-white' : '[&_span]:text-neutral-900'),
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
        <BuySidebarInlineDualPrice usd={publicTotalUsd} onBrand={onBrand} />
        <BuySidebarSecondaryPrices
          tecnicoUsd={tecnicoTotalUsd}
          showTecnico
          showAdminPurchaseLine={allowPurchaseLine}
          productId={product.id}
          onBrand={onBrand}
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
            <DiscountBadge percent={displayDiscountPercent} onBrand={onBrand} />
            {savingsUsd != null && savingsUsd > 0.001 ? (
              <span
                className={cn(
                  'text-xs font-semibold',
                  onBrand ? 'text-white' : 'text-emerald-600',
                )}
              >
                Ahorras: {formatPenFromUsd(savingsUsd)}
              </span>
            ) : null}
          </div>
        ) : null}
        {showOfferBreakdown && savingsUsd != null && savingsUsd > 0.001 && storeCompareRow ? (
          <p
            className={cn(
              'mb-1 text-xs font-semibold',
              onBrand ? 'text-white' : 'text-emerald-600',
            )}
          >
            Ahorras: {formatPenFromUsd(savingsUsd)}
          </p>
        ) : null}
        <BuySidebarInlineDualPrice usd={visitorTotalUsd} onBrand={onBrand} />
        <BuySidebarSecondaryPrices
          tecnicoUsd={tecnicoTotalUsd}
          showTecnico={showTecnicoSecondary}
          showAdminPurchaseLine={allowPurchaseLine}
          productId={product.id}
          onBrand={onBrand}
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
