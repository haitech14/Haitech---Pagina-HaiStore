import type { ReactNode } from 'react';

import { Star } from 'lucide-react';

import { ProductDetailComplementaCompra } from '@/components/product-detail/product-detail-complementa-compra';
import { ProductDetailHeroSpecs } from '@/components/product-detail/product-detail-hero-specs';
import { ProductDetailHeroTrustStrip } from '@/components/product-detail/product-detail-hero-trust-strip';
import { ProductDetailPreparationTypeSelector } from '@/components/product-detail/product-detail-preparation-type-selector';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import { ProductCardSpecTable } from '@/components/product/product-card-spec-table';
import type { ConfigureHeroAccessoryCard, ConfigureHeroWarrantyUpgrade } from '@/lib/product-configure-hero-options';
import { HERO_WARRANTY_BASE_OPTION_ID } from '@/lib/product-configure-hero-options';
import { ProductDetailMaintenanceSupplyPlans } from '@/components/product-detail/product-detail-maintenance-supply-plans';
import {
  resolveDefaultTonerSupplyTypeForEquipment,
  type ConfigureTonerCard,
} from '@/lib/product-configure-toner';
import type { EquipmentSelectionState } from '@/lib/equipment-config-selection';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import type { MaintenanceSupplyPlanSelection } from '@/lib/maintenance-supply-plan-calculator';
import { resolveProductCardSpecRows } from '@/lib/product-card-short-description';
import type { Product } from '@/types/product';
import { resolveProductHeroBrand, resolveProductHeroConditionLabel } from '@/lib/product-hero-meta';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { FeaturedProduct } from '@/data/featured-products';
import { cn } from '@/lib/utils';

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
  const conditionLabel = resolveProductHeroConditionLabel(product);
  const defaultTonerSupplyType = resolveDefaultTonerSupplyTypeForEquipment(product);
  const showBuyHeroOptions = purchaseMode !== 'rent';

  const hasTonerSection = tonerCards.length > 0;
  const hasAccessorySection = accessoryCards.length > 0;
  const hasWarrantySection = warrantyUpgrades.length > 0 && onWarrantySelect != null;
  const hasMaintenanceSection =
    showMaintenanceSupplyPlans &&
    maintenanceSupplyPlan != null &&
    onMaintenanceSupplyPlanChange != null;
  const hasComplementaItems =
    hasTonerSection || hasAccessorySection || hasWarrantySection || hasMaintenanceSection;
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

  const maintenanceSlot =
    hasMaintenanceSection && maintenanceSupplyPlan && onMaintenanceSupplyPlanChange ? (
      <ProductDetailMaintenanceSupplyPlans
        tonerCards={tonerCards}
        catalog={tonerCatalog}
        consumableGroups={consumableGroups}
        selection={maintenanceSupplyPlan}
        onSelectionChange={onMaintenanceSupplyPlanChange}
      />
    ) : null;

  const heroMetaSegments = [
    skuLabel ? { label: 'Código', value: skuLabel } : null,
    brandLabel ? { label: 'Marca', value: brandLabel } : null,
    conditionLabel ? { label: 'Condición', value: conditionLabel } : null,
  ].filter((segment): segment is { label: string; value: string } => segment != null);

  const cardSpecRows = resolveProductCardSpecRows(product);
  const showHeroBullets = detail.heroSpecBullets.length > 0;
  const showCardSpecFallback = !showHeroBullets && cardSpecRows.length > 0;

  return (
    <div className="flex min-w-0 flex-col">
      {showBestSeller ? (
        <span className="inline-flex w-fit rounded-md bg-orange-500 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white">
          Más vendido
        </span>
      ) : null}

      {reviewCount > 0 ? (
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-2',
            showBestSeller && 'mt-2.5',
          )}
        >
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

      <h1
        className={cn(
          'text-pretty text-lg font-bold leading-snug text-[#0f1f3d] sm:text-xl lg:text-2xl',
          (showBestSeller || reviewCount > 0) && 'mt-2.5',
        )}
      >
        {detail.heroTitle ?? product.name}
      </h1>

      {heroMetaSegments.length > 0 ? (
        <p className="mt-1 text-xs text-neutral-500">
          {heroMetaSegments.map((segment, index) => (
            <span key={segment.label}>
              {index > 0 ? <span className="mx-1.5 text-neutral-300">·</span> : null}
              <span className="font-medium text-neutral-600">{segment.label}:</span> {segment.value}
            </span>
          ))}
        </p>
      ) : null}

      {showHeroBullets ? (
        <ProductDetailHeroSpecs bullets={detail.heroSpecBullets} className="mt-3" />
      ) : showCardSpecFallback ? (
        <ProductCardSpecTable rows={cardSpecRows} className="mt-3 max-w-md" />
      ) : null}

      <ProductDetailHeroTrustStrip
        product={product}
        giftSubtitle={detail.giftTrustSubtitle}
        className={showHeroBullets || showCardSpecFallback ? 'mt-1' : 'mt-3'}
      />

      {showComplementaCompra ? (
        <ProductDetailComplementaCompra
          tonerCards={tonerCards}
          defaultTonerSupplyType={defaultTonerSupplyType}
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
          maintenanceSlot={maintenanceSlot}
          {...(product.storefront_ui != null ? { storefrontUi: product.storefront_ui } : {})}
          className="mt-4"
        />
      ) : preparationSelector ? (
        <div className="mt-3">{preparationSelector}</div>
      ) : null}

      {showBuyHeroOptions ? afterTonerSlot : null}
    </div>
  );
}
