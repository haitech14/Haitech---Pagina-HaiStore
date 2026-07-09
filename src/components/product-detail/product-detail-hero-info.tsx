import type { ReactNode } from 'react';

import { Star } from 'lucide-react';

import { ProductDetailComplementaCompra } from '@/components/product-detail/product-detail-complementa-compra';
import { ProductDetailHeroSpecs } from '@/components/product-detail/product-detail-hero-specs';
import { resolveTrustWarrantyLabel } from '@/lib/build-product-detail';
import { ProductDetailHeroTrustStrip } from '@/components/product-detail/product-detail-hero-trust-strip';
import { ProductDetailPreparationTypeSelector } from '@/components/product-detail/product-detail-preparation-type-selector';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import type { ConfigureHeroAccessoryCard, ConfigureHeroWarrantyUpgrade } from '@/lib/product-configure-hero-options';
import { HERO_WARRANTY_BASE_OPTION_ID } from '@/lib/product-configure-hero-options';
import { ProductDetailMaintenanceSupplyPlans } from '@/components/product-detail/product-detail-maintenance-supply-plans';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import type { EquipmentSelectionState } from '@/lib/equipment-config-selection';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import type { MaintenanceSupplyPlanSelection } from '@/lib/maintenance-supply-plan-calculator';
import type { Product } from '@/types/product';
import { resolveProductHeroBrand } from '@/lib/product-hero-meta';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { FeaturedProduct } from '@/data/featured-products';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  featuredMeta?: Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'> | undefined;
  tonerCards?: ConfigureTonerCard[];
  selectedTonerOptionIds?: Set<string>;
  onTonerToggle?: (card: ConfigureTonerCard) => void;
  accessoryCards?: ConfigureHeroAccessoryCard[];
  equipmentSelection?: EquipmentSelectionState;
  onAccessoryToggle?: (card: ConfigureHeroAccessoryCard) => void;
  warrantyBaseLabel?: string;
  warrantyUpgrades?: ConfigureHeroWarrantyUpgrade[];
  selectedWarrantyOptionId?: string;
  onWarrantySelect?: (optionId: string) => void;
  showPreparationTypeSelector?: boolean;
  preparationType?: SeminuevaPreparationType;
  onPreparationTypeChange?: (value: SeminuevaPreparationType) => void;
  afterTonerSlot?: ReactNode;
  purchaseMode?: PurchaseMode;
  showMaintenanceSupplyPlans?: boolean;
  maintenanceSupplyPlan?: MaintenanceSupplyPlanSelection;
  onMaintenanceSupplyPlanChange?: (selection: MaintenanceSupplyPlanSelection) => void;
  tonerCatalog?: Product[];
  consumableGroups?: ConsumableGroup[];
}

function resolveBestSellerBadge(
  detail: ProductDetailViewModel,
  featuredMeta?: Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>,
): boolean {
  if (featuredMeta?.reviews && featuredMeta.reviews > 0) return true;
  if (detail.reviews >= 2) return true;
  if (detail.rating >= 4.5 && detail.reviews > 0) return true;
  return false;
}

export function ProductDetailHeroInfo({
  product,
  detail,
  featuredMeta,
  tonerCards = [],
  selectedTonerOptionIds,
  onTonerToggle,
  accessoryCards = [],
  equipmentSelection,
  onAccessoryToggle,
  warrantyBaseLabel,
  warrantyUpgrades = [],
  selectedWarrantyOptionId = HERO_WARRANTY_BASE_OPTION_ID,
  onWarrantySelect,
  showPreparationTypeSelector = false,
  preparationType = 'acondicionado',
  onPreparationTypeChange,
  afterTonerSlot,
  purchaseMode = 'buy',
  showMaintenanceSupplyPlans = false,
  maintenanceSupplyPlan,
  onMaintenanceSupplyPlanChange,
  tonerCatalog = [],
  consumableGroups = [],
}: ProductDetailHeroInfoProps) {
  const brandLabel = resolveProductHeroBrand(product) ?? detail.brandLabel;
  const displayRating = Number(detail.rating.toFixed(1));
  const fullStars = Math.min(5, Math.max(0, Math.round(displayRating)));
  const reviewCount = featuredMeta?.reviews ?? detail.reviews;
  const showBestSeller = resolveBestSellerBadge(detail, featuredMeta);
  const skuLabel = detail.sku?.trim() || product.code?.trim();
  const showBuyHeroOptions = purchaseMode !== 'rent';

  const hasTonerSection = tonerCards.length > 0;
  const hasAccessorySection = accessoryCards.length > 0;
  const hasWarrantySection = warrantyUpgrades.length > 0 && onWarrantySelect != null;
  const hasComplementaItems = hasTonerSection || hasAccessorySection || hasWarrantySection;
  const showComplementaCompra =
    showBuyHeroOptions &&
    hasComplementaItems &&
    equipmentSelection != null &&
    (!hasTonerSection || (selectedTonerOptionIds != null && onTonerToggle != null)) &&
    (!hasAccessorySection || onAccessoryToggle != null);

  const preparationSelector =
    showBuyHeroOptions && showPreparationTypeSelector && onPreparationTypeChange ? (
      <ProductDetailPreparationTypeSelector
        product={product}
        value={preparationType}
        onChange={onPreparationTypeChange}
        className="mb-2"
      />
    ) : null;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2.5">
        {showBestSeller ? (
          <span className="inline-flex rounded-md bg-orange-500 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white">
            Más vendido
          </span>
        ) : null}

        <p className="text-[0.6875rem] text-neutral-500 sm:text-xs">
          {skuLabel ? (
            <>
              <span className="font-semibold text-neutral-600">CODIGO:</span> {skuLabel}
            </>
          ) : null}
          {skuLabel && brandLabel ? <span className="mx-2 text-neutral-300">|</span> : null}
          {brandLabel ? (
            <>
              <span className="font-semibold text-neutral-600">MARCA:</span> {brandLabel}
            </>
          ) : null}
        </p>
      </div>

      {reviewCount > 0 ? (
        <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-2">
          <div
            className="flex min-w-0 items-center gap-1.5"
            aria-label={`Valoración ${displayRating} de 5, ${reviewCount} valoraciones`}
          >
            <div className="flex shrink-0 gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={
                    index < fullStars
                      ? 'size-4 fill-amber-400 text-amber-400'
                      : 'size-4 fill-neutral-200 text-neutral-200'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-blue-600">
              ({reviewCount} valoraciones de clientes)
            </span>
          </div>
        </div>
      ) : null}

      <h1 className="mt-2.5 text-pretty text-lg font-bold leading-snug text-[#0f1f3d] sm:text-xl lg:text-2xl">
        {detail.heroTitle ?? product.name}
      </h1>

      <ProductDetailHeroSpecs bullets={detail.heroSpecBullets} className="mt-3" />

      <ProductDetailHeroTrustStrip
        warrantyLabel={resolveTrustWarrantyLabel(warrantyBaseLabel)}
        giftSubtitle={detail.giftTrustSubtitle}
        className="mt-3"
      />

      {showComplementaCompra ? (
        <ProductDetailComplementaCompra
          tonerCards={tonerCards}
          accessoryCards={accessoryCards}
          selectedTonerOptionIds={selectedTonerOptionIds ?? new Set<string>()}
          equipmentSelection={equipmentSelection}
          onTonerToggle={onTonerToggle ?? (() => undefined)}
          onAccessoryToggle={onAccessoryToggle ?? (() => undefined)}
          {...(warrantyBaseLabel ? { warrantyBaseLabel } : {})}
          warrantyUpgrades={warrantyUpgrades}
          selectedWarrantyOptionId={selectedWarrantyOptionId}
          {...(onWarrantySelect ? { onWarrantySelect } : {})}
          beforeTonerSlot={hasTonerSection ? preparationSelector : undefined}
          leadingSlot={!hasTonerSection ? preparationSelector : undefined}
          className="mt-3"
        />
      ) : preparationSelector ? (
        <div className="mt-3">{preparationSelector}</div>
      ) : null}

      {showBuyHeroOptions &&
      showMaintenanceSupplyPlans &&
      maintenanceSupplyPlan &&
      onMaintenanceSupplyPlanChange ? (
        <ProductDetailMaintenanceSupplyPlans
          tonerCards={tonerCards}
          catalog={tonerCatalog}
          consumableGroups={consumableGroups}
          selection={maintenanceSupplyPlan}
          onSelectionChange={onMaintenanceSupplyPlanChange}
          className="mt-3"
        />
      ) : null}

      {showBuyHeroOptions ? afterTonerSlot : null}
    </div>
  );
}
