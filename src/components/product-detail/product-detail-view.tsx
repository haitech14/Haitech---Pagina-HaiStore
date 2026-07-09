import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';

import { ProductDetailBreadcrumbsBar } from '@/components/product-detail/product-detail-breadcrumbs-bar';
import { ProductQuoteDialog } from '@/components/product-detail/product-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductDetailAdvisorBanner } from '@/components/product-detail/product-detail-advisor-banner';
import { ProductDetailConsumables } from '@/components/product-detail/product-detail-consumables';
import { ProductDetailConsumablesStrip } from '@/components/product-detail/product-detail-consumables-strip';
import { ProductDetailDescription } from '@/components/product-detail/product-detail-description';
import { ProductDetailDescriptionPanel } from '@/components/product-detail/product-detail-description-panel';
import { ProductDetailOptionalProducts, type PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import type { EquipmentRentalEstimate } from '@/components/product-detail/product-detail-rental-configurator';
import { computeEquipmentRentalEstimate } from '@/components/product-detail/product-detail-rental-configurator';
import { ProductDetailGallery } from '@/components/product-detail/product-detail-gallery';
import { ProductDetailHeroInfo } from '@/components/product-detail/product-detail-hero-info';
import { ProductDetailMobilePurchaseBar } from '@/components/product-detail/product-detail-mobile-purchase-bar';
import { ProductDetailMockupTabs } from '@/components/product-detail/product-detail-mockup-tabs';
import { ProductDetailSocialProofToast } from '@/components/product-detail/product-detail-social-proof-toast';
import { ProductDetailPurchaseCard } from '@/components/product-detail/product-detail-purchase-card';
import { ProductEquipmentRentalQuoteDialog } from '@/components/product-detail/product-equipment-rental-quote-dialog';
import { ProductRentalQuoteDialog } from '@/components/product-detail/product-rental-quote-dialog';
import { ProductDetailResources } from '@/components/product-detail/product-detail-resources';
import { ProductDetailSpecsTable } from '@/components/product-detail/product-detail-specs-table';
import { buildProductDetail, isColorPrinterEquipment } from '@/lib/build-product-detail';
import { DEFAULT_BULK_DISCOUNT_TIERS, resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { ensureFullPrices } from '@/lib/roles';
import {
  resolvePublicUnitBaseWithPreparationUsd,
  resolveSeminuevaPreparationSurchargeUsd,
  shouldShowSeminuevaPreparationSelector,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { useAuth } from '@/context/auth-context';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
import {
  productQualifiesForMaintenancePlanCta,
  productQualifiesForRentalCta,
} from '@/lib/product-detail-secondary-actions';
import {
  calculateRentalQuote,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_DEFAULT_TERM_MONTHS,
} from '@/lib/rental-calculator';
import { serviceHubPath } from '@/lib/service-hub';
import {
  resolveEquipmentConfigSteps,
} from '@/lib/equipment-config-catalog';
import {
  mergeConsumableTonerOptions,
  mergeCrossSellTonerOptions,
  resolveConfigureTonerCards,
  resolveTonerCatalogLookupIds,
  type ConfigureTonerCard,
} from '@/lib/product-configure-toner';
import {
  buildInitialEquipmentSelection,
  computeEquipmentExtrasPen,
  resolveSelectedEquipmentOptions,
  selectEquipmentOption,
  selectHeroTonerCard,
} from '@/lib/equipment-config-selection';
import {
  HERO_WARRANTY_BASE_OPTION_ID,
  HERO_WARRANTY_UPGRADE_OPTION_IDS,
  resolveHeroAccessoryCards,
  resolveHeroWarrantyBaseLabel,
  resolveHeroWarrantyUpgrades,
  type ConfigureHeroAccessoryCard,
} from '@/lib/product-configure-hero-options';
import { resolveIncludedTonerImage } from '@/lib/product-configure-accessory';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { resolveFrequentlyBoughtItems } from '@/lib/product-compatible-toners';
import { hasCrossSellConfigureCards, mergeMerchandisingEquipmentSteps } from '@/lib/product-merchandising';
import { resolveEquipmentComparison } from '@/lib/product-equipment-comparison';
import {
  resolveEquipmentConsumables,
} from '@/lib/product-equipment-consumables';
import {
  buildMaintenanceSupplyPlanCartOption,
  MAINTENANCE_SUPPLY_PLAN_NONE,
  resolveMaintenanceSupplyPlanQuote,
  type MaintenanceSupplyPlanSelection,
} from '@/lib/maintenance-supply-plan-calculator';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProductConsumables } from '@/hooks/use-product-consumables';
import { useProducts } from '@/hooks/use-products';
import { useProductsByIds } from '@/hooks/use-products-by-ids';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';
import type { CartConfigurationLine } from '@/types/product';
import type { FeaturedProduct } from '@/data/featured-products';
import type { Product } from '@/types/product';

type DetailTab =
  | 'specifications'
  | 'configuration'
  | 'consumables'
  | 'options'
  | 'resources'
  | 'warranty'
  | 'reviews';

interface ProductDetailViewProps {
  product: Product;
  featuredMeta?:
    | FeaturedProduct
    | Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>
    | undefined;
}

const MAINTENANCE_PLAN_FALLBACK = [{ pagesPerMonth: 5000, monthlyPricePen: 150 }] as const;

const ProductDetailComparison = lazy(() =>
  import('@/components/product-detail/product-detail-comparison').then((module) => ({
    default: module.ProductDetailComparison,
  })),
);
const ProductDetailRelated = lazy(() =>
  import('@/components/product-detail/product-detail-related').then((module) => ({
    default: module.ProductDetailRelated,
  })),
);

function useNearViewport(enabled: boolean, rootMargin = '400px 0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return { ref, near };
}

function DetailSectionFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-24 animate-pulse rounded-xl bg-muted/40', className)}
      role="status"
      aria-live="polite"
      aria-label="Cargando sección"
    />
  );
}

export function ProductDetailView({ product, featuredMeta }: ProductDetailViewProps) {
  const navigate = useNavigate();
  const { role, viewAsRoles } = useAuth();
  const { data: rentalPlansRaw = [] } = useRentalPlans({ activeOnly: true });
  const { data: companySettings } = useCompanySettings();
  const rentalPlansFromApi = useMemo(() => {
    const mapped = rentalPlansRaw.map((plan) => ({
      pagesPerMonth: plan.pagesPerMonth,
      monthlyPricePen: plan.monthlyPricePen,
    }));
    return mapped.length > 0 ? mapped : [...MAINTENANCE_PLAN_FALLBACK];
  }, [rentalPlansRaw]);
  const bulkDiscountTiers = companySettings?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS;
  const detail = useMemo(
    () => buildProductDetail(product, featuredMeta, rentalPlansFromApi, bulkDiscountTiers),
    [product, featuredMeta, rentalPlansFromApi, bulkDiscountTiers],
  );
  const { ref: relatedDeferRef, near: relatedNearViewport } = useNearViewport(true);
  const { data: catalogProducts = [], isLoading: catalogLoading } = useProducts({
    enabled: detail.isPrinterEquipment,
  });
  const tonerCatalogLookupIds = useMemo(
    () =>
      detail.isPrinterEquipment
        ? resolveTonerCatalogLookupIds(product, detail.equipmentConfigSteps)
        : [],
    [detail.equipmentConfigSteps, detail.isPrinterEquipment, product],
  );
  const { data: tonerCatalogProducts = [] } = useProductsByIds(
    tonerCatalogLookupIds,
    detail.isPrinterEquipment && tonerCatalogLookupIds.length > 0,
  );
  const catalogForEquipment = useMemo(() => {
    if (catalogProducts.length === 0) return tonerCatalogProducts;
    if (tonerCatalogProducts.length === 0) return catalogProducts;
    const merged = new Map(catalogProducts.map((row) => [row.id, row]));
    for (const row of tonerCatalogProducts) {
      if (!merged.has(row.id)) merged.set(row.id, row);
    }
    return [...merged.values()];
  }, [catalogProducts, tonerCatalogProducts]);
  const { data: consumableGroupsFromApi = [] } = useProductConsumables(
    product.id,
    detail.isPrinterEquipment,
  );
  const frequentlyBought = useMemo(
    () => resolveFrequentlyBoughtItems(product, catalogProducts),
    [product, catalogProducts],
  );
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const breadcrumbs = useMemo(
    () => buildProductBreadcrumbs(product, detail.displayTitle, categoryTree),
    [product, detail.displayTitle, categoryTree],
  );
  const [activeTab, setActiveTab] = useState<DetailTab>('specifications');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [maintenanceQuoteOpen, setMaintenanceQuoteOpen] = useState(false);
  const [maintenanceSupplyPlan, setMaintenanceSupplyPlan] =
    useState<MaintenanceSupplyPlanSelection>(MAINTENANCE_SUPPLY_PLAN_NONE);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [preparationType, setPreparationType] = useState<SeminuevaPreparationType>('acondicionado');
  const purchaseActionsRef = useRef<HTMLDivElement>(null);
  const mobilePurchaseVisibilityRef = useRef<HTMLDivElement>(null);
  const productInfoSectionRef = useRef<HTMLElement>(null);
  const rentalConfiguratorRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const showPreparationTypeSelector = shouldShowSeminuevaPreparationSelector(
    product,
    role,
    viewAsRoles,
  );
  const preparationSurchargeUsd = showPreparationTypeSelector
    ? resolveSeminuevaPreparationSurchargeUsd(preparationType, product)
    : 0;
  const publicUnitBaseUsd = resolvePublicUnitBaseWithPreparationUsd(
    fullPrices.public,
    showPreparationTypeSelector ? preparationType : 'acondicionado',
    product,
  );
  const volumePricing = useMemo(
    () =>
      resolveBulkDiscountPricing(quantity, publicUnitBaseUsd, bulkDiscountTiers, {
        floorPriceUsd: fullPrices.tecnico,
      }),
    [quantity, publicUnitBaseUsd, bulkDiscountTiers, fullPrices.tecnico],
  );
  const outOfStock = isProductOutOfStock(product);

  useEffect(() => {
    setQuantity(1);
    setPreparationType('acondicionado');
    setMaintenanceSupplyPlan(MAINTENANCE_SUPPLY_PLAN_NONE);
  }, [product.id]);

  const handleQuotePdfPreviewClose = useCallback((open: boolean) => {
    if (!open) {
      setQuotePdfPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return null;
      });
    }
  }, []);

  const descriptionText =
    detail.descriptionContent?.paragraphs.join(' ') ??
    detail.bullets.slice(0, 2).join(' ');

  const consumableGroups = useMemo(
    () =>
      catalogForEquipment.length > 0
        ? resolveEquipmentConsumables(product, catalogForEquipment)
        : consumableGroupsFromApi.length > 0
          ? consumableGroupsFromApi
          : resolveEquipmentConsumables(product, catalogForEquipment),
    [catalogForEquipment, product, consumableGroupsFromApi],
  );

  const equipmentSteps = useMemo(
    () =>
      mergeMerchandisingEquipmentSteps(
        mergeCrossSellTonerOptions(
          mergeConsumableTonerOptions(
            resolveEquipmentConfigSteps(detail.equipmentConfigSteps, catalogForEquipment, product),
            consumableGroups,
          ),
          product,
          catalogForEquipment,
        ),
        product,
        catalogForEquipment,
      ),
    [detail.equipmentConfigSteps, catalogForEquipment, product, consumableGroups],
  );

  const comparison = useMemo(
    () =>
      detail.isPrinterEquipment
        ? resolveEquipmentComparison(product, catalogProducts, detail.specs)
        : null,
    [detail.isPrinterEquipment, product, catalogProducts, detail.specs],
  );

  const showConsumablesTab = detail.isPrinterEquipment;
  const useRicohTabs = detail.isPrinterEquipment;

  const tabs = useMemo(() => {
    const items: { id: DetailTab; label: string }[] = [
      { id: 'specifications', label: 'Especificaciones' },
    ];

    if (useRicohTabs) {
      items.push(
        { id: 'consumables', label: 'Repuestos' },
        { id: 'resources', label: 'Descargas' },
        { id: 'warranty', label: 'Garantía y soporte' },
      );
      return items;
    }

    if (equipmentSteps.length > 0) {
      items.push({ id: 'configuration', label: 'Configuración' });
    }

    if (showConsumablesTab) {
      items.push({ id: 'consumables', label: 'Repuestos' });
    }

    if (detail.reviews > 0) {
      items.push({ id: 'reviews', label: `Opiniones (${detail.reviews})` });
    }
    return items;
  }, [useRicohTabs, equipmentSteps.length, showConsumablesTab, detail.reviews]);

  const handleTechnicalSheetFallback = useCallback(() => {
    const hasResourcesTab = tabs.some((tab) => tab.id === 'resources');
    setActiveTab(hasResourcesTab ? 'resources' : 'specifications');
    requestAnimationFrame(() => {
      productInfoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [tabs]);

  const tabIds = useMemo(() => tabs.map((tab) => tab.id).join(','), [tabs]);

  useEffect(() => {
    if (!tabIds.split(',').includes(activeTab)) {
      setActiveTab('specifications');
    }
  }, [activeTab, tabIds]);

  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>('buy');
  const [rentalEstimate, setRentalEstimate] = useState<EquipmentRentalEstimate | null>(null);

  const [equipmentSelection, setEquipmentSelection] = useState(() =>
    buildInitialEquipmentSelection(equipmentSteps),
  );

  const equipmentStepsSignature = useMemo(
    () =>
      equipmentSteps
        .map((step) =>
          `${step.id}:${step.options.map((option) => `${option.id}:${option.productId ?? ''}`).join(',')}`,
        )
        .join('|'),
    [equipmentSteps],
  );

  useEffect(() => {
    setEquipmentSelection(buildInitialEquipmentSelection(equipmentSteps));
  }, [product.id, equipmentStepsSignature]);

  const selectedEquipmentOptions = useMemo(
    () => resolveSelectedEquipmentOptions(equipmentSteps, equipmentSelection),
    [equipmentSteps, equipmentSelection],
  );

  const tonerStep = useMemo(
    () => equipmentSteps.find((step) => step.id === 'toner'),
    [equipmentSteps],
  );

  const garantiaStep = useMemo(
    () => equipmentSteps.find((step) => step.id === 'garantia'),
    [equipmentSteps],
  );

  const heroAccessoryCards = useMemo(
    () => (detail.isPrinterEquipment ? resolveHeroAccessoryCards(equipmentSteps) : []),
    [equipmentSteps, detail.isPrinterEquipment],
  );

  const heroWarrantyUpgrades = useMemo(
    () => (detail.isPrinterEquipment ? resolveHeroWarrantyUpgrades(garantiaStep) : []),
    [detail.isPrinterEquipment, garantiaStep],
  );

  const heroWarrantyBaseLabel = useMemo(
    () => resolveHeroWarrantyBaseLabel(garantiaStep),
    [garantiaStep],
  );

  const includedToner = useMemo(
    () => tonerStep?.options.find((option) => option.included) ?? tonerStep?.options[0] ?? null,
    [tonerStep],
  );

  const purchasableTonerCards = useMemo(
    () =>
      resolveConfigureTonerCards(
        tonerStep,
        consumableGroups,
        resolveIncludedTonerImage(includedToner?.image),
        catalogForEquipment,
        product,
      ),
    [catalogForEquipment, consumableGroups, includedToner?.image, product, tonerStep],
  );

  const handleHeroTonerToggle = useCallback(
    (card: ConfigureTonerCard) => {
      if (!tonerStep) return;
      setEquipmentSelection((current) =>
        selectHeroTonerCard(current, tonerStep, card.optionId),
      );
    },
    [tonerStep],
  );

  const handleHeroAccessoryToggle = useCallback(
    (card: ConfigureHeroAccessoryCard) => {
      const step = equipmentSteps.find((entry) => entry.id === card.stepId);
      if (!step) return;
      setEquipmentSelection((current) =>
        selectEquipmentOption(current, step, card.optionId),
      );
    },
    [equipmentSteps],
  );

  const selectedWarrantyOptionId = useMemo(() => {
    const selected = equipmentSelection.garantia ?? new Set<string>();
    for (const optionId of HERO_WARRANTY_UPGRADE_OPTION_IDS) {
      if (selected.has(optionId)) return optionId;
    }
    return HERO_WARRANTY_BASE_OPTION_ID;
  }, [equipmentSelection.garantia]);

  const handleHeroWarrantySelect = useCallback(
    (optionId: string) => {
      if (!garantiaStep) return;
      if (optionId === HERO_WARRANTY_BASE_OPTION_ID) {
        setEquipmentSelection((current) => ({ ...current, garantia: new Set<string>() }));
        return;
      }
      setEquipmentSelection((current) => selectEquipmentOption(current, garantiaStep, optionId));
    },
    [garantiaStep],
  );

  const equipmentConfiguration = useMemo<CartConfigurationLine | undefined>(() => {
    const maintenanceSupplyPlanQuote = resolveMaintenanceSupplyPlanQuote(
      maintenanceSupplyPlan,
      purchasableTonerCards,
      catalogForEquipment,
      consumableGroups,
    );
    const maintenanceSupplyPlanOption = maintenanceSupplyPlanQuote
      ? buildMaintenanceSupplyPlanCartOption(maintenanceSupplyPlanQuote)
      : null;

    const options = maintenanceSupplyPlanOption
      ? [...selectedEquipmentOptions, maintenanceSupplyPlanOption]
      : selectedEquipmentOptions;

    if (options.length === 0) return undefined;
    return {
      options,
      extrasPen: computeEquipmentExtrasPen(options),
    };
  }, [
    catalogForEquipment,
    consumableGroups,
    maintenanceSupplyPlan,
    purchasableTonerCards,
    selectedEquipmentOptions,
  ]);

  const showMaintenanceSupplyPlans = detail.isPrinterEquipment;

  const maintenancePlans =
    detail.rentalPlans.length > 0 ? detail.rentalPlans : rentalPlansFromApi;

  const showConfigureSection =
    detail.isPrinterEquipment &&
    (maintenancePlans.length > 0 ||
      equipmentSteps.some((step) => step.id === 'toner') ||
      equipmentSteps.some((step) =>
        step.options.some((option) =>
          ['casetera-250', 'casetera-500', 'gabinete', 'estabilizador-2000w', 'router-wifi', 'garantia-2y'].includes(
            option.id,
          ),
        ),
      ) ||
      (product.upsell_product_ids?.length ?? 0) > 0 ||
      (product.upsell_optional_products?.length ?? 0) > 0 ||
      hasCrossSellConfigureCards(product, catalogProducts) ||
      frequentlyBought.length > 0);

  const handlePurchaseModeChange = useCallback((mode: PurchaseMode) => {
    setPurchaseMode(mode);
    if (mode === 'buy') {
      setRentalEstimate(null);
    } else if (mode === 'rent') {
      setMaintenanceSupplyPlan(MAINTENANCE_SUPPLY_PLAN_NONE);
    }
  }, []);

  const showRentalAction = productQualifiesForRentalCta(product);
  const showMaintenancePlanAction = productQualifiesForMaintenancePlanCta(product);

  const maintenanceQuoteBreakdown = useMemo(
    () =>
      calculateRentalQuote({
        monthlyPages: RENTAL_DEFAULT_MONTHLY_PAGES,
        includesPaper: false,
        includesOperator: false,
        plans: maintenancePlans,
        termMonths: RENTAL_DEFAULT_TERM_MONTHS,
      }),
    [maintenancePlans],
  );

  const handleRentalClick = useCallback(() => {
    const hasInlineRentalFlow = detail.rentalPlans.length > 0 && showConfigureSection;
    if (!hasInlineRentalFlow) {
      navigate(serviceHubPath('alquiler'));
      return;
    }
    handlePurchaseModeChange('rent');
    requestAnimationFrame(() => {
      rentalConfiguratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [
    detail.rentalPlans.length,
    showConfigureSection,
    handlePurchaseModeChange,
    navigate,
  ]);

  const handleMaintenancePlanClick = useCallback(() => {
    setMaintenanceQuoteOpen(true);
  }, []);

  const secondaryPurchaseActionProps = {
    showRentalAction,
    onRentalClick: handleRentalClick,
    showMaintenancePlanAction,
    onMaintenancePlanClick: handleMaintenancePlanClick,
  };

  const heroGridClass =
    'grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-6';

  const detailLayoutGridClass =
    'lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(280px,340px)] lg:items-start lg:gap-6 xl:gap-8';

  const showOriginalBadge =
    /ricoh/i.test(detail.brandLabel) &&
    (/original/i.test(product.name) || /original/i.test(product.category ?? ''));

  const isColorEquipment = useMemo(() => isColorPrinterEquipment(product), [product]);
  const equipmentBasePriceUsd = fullPrices.public;

  const fallbackRentalQuoteEstimate = useMemo<EquipmentRentalEstimate | null>(() => {
    if (detail.rentalPlans.length === 0) return null;
    return computeEquipmentRentalEstimate({
      monthlyPages: detail.rentalPlans[0]?.pagesPerMonth ?? 5000,
      equipmentQuantity: 1,
      termMonths: 12,
      equipmentBasePriceUsd,
      isColorEquipment,
      includePaper: false,
      includeOperator: false,
      includeLaptop: false,
      includeLaminator: false,
      includeGuillotine: false,
      includeResidentTech: false,
      includeSpiralBinder: false,
    });
  }, [detail.rentalPlans, equipmentBasePriceUsd, isColorEquipment]);

  const activeRentalQuoteEstimate = rentalEstimate ?? fallbackRentalQuoteEstimate;
  const isRentQuoteMode = purchaseMode === 'rent' && activeRentalQuoteEstimate != null;

  return (
    <div className="bg-neutral-50 pb-20 lg:pb-0">
      <div className="container py-3 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <ProductDetailBreadcrumbsBar items={breadcrumbs} productId={product.id} />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className={detailLayoutGridClass}>
            <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-span-2">
              <div className={heroGridClass}>
                <div className="min-w-0">
                  <ProductDetailGallery
                    items={detail.gallery}
                    productName={product.name}
                    product={product}
                    showOriginalBadge={showOriginalBadge}
                    brandLabel={detail.brandLabel}
                  />
                </div>

                <ProductDetailHeroInfo
                  product={product}
                  detail={detail}
                  featuredMeta={featuredMeta}
                  tonerCards={purchasableTonerCards}
                  selectedTonerOptionIds={equipmentSelection.toner ?? new Set<string>()}
                  onTonerToggle={handleHeroTonerToggle}
                  accessoryCards={heroAccessoryCards}
                  equipmentSelection={equipmentSelection}
                  onAccessoryToggle={handleHeroAccessoryToggle}
                  warrantyBaseLabel={heroWarrantyBaseLabel}
                  warrantyUpgrades={heroWarrantyUpgrades}
                  selectedWarrantyOptionId={selectedWarrantyOptionId}
                  onWarrantySelect={handleHeroWarrantySelect}
                  showPreparationTypeSelector={showPreparationTypeSelector}
                  preparationType={preparationType}
                  onPreparationTypeChange={setPreparationType}
                  purchaseMode={purchaseMode}
                  showMaintenanceSupplyPlans={showMaintenanceSupplyPlans}
                  maintenanceSupplyPlan={maintenanceSupplyPlan}
                  onMaintenanceSupplyPlanChange={setMaintenanceSupplyPlan}
                  tonerCatalog={catalogForEquipment}
                  consumableGroups={consumableGroups}
                />
              </div>

              <div ref={mobilePurchaseVisibilityRef} className="mt-4 lg:hidden">
                <ProductDetailPurchaseCard
                  product={product}
                  detail={detail}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  volumePricing={volumePricing}
                  purchaseActionsRef={purchaseActionsRef}
                  purchaseMode={purchaseMode}
                  onPurchaseModeChange={handlePurchaseModeChange}
                  rentalEstimate={rentalEstimate}
                  maintenancePlanMonthlyPen={maintenanceQuoteBreakdown.monthlySubtotalPen ?? null}
                  preparationSurchargeUsd={preparationSurchargeUsd}
                  showSeminuevaPreparationPrices={showPreparationTypeSelector}
                  showRentalTab={detail.isPrinterEquipment}
                  equipmentBasePriceUsd={equipmentBasePriceUsd}
                  onRentalEstimateChange={setRentalEstimate}
                  rentalConfiguratorRef={rentalConfiguratorRef}
                  onQuoteClick={() => setQuoteOpen(true)}
                  onTechnicalSheetFallback={handleTechnicalSheetFallback}
                  {...secondaryPurchaseActionProps}
                  {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
                  {...(showPreparationTypeSelector ? { preparationType } : {})}
                  onQuoteGenerated={setQuotePdfPreview}
                />
              </div>
            </div>

            <div className="hidden lg:block">
              <ProductDetailPurchaseCard
                product={product}
                detail={detail}
                quantity={quantity}
                onQuantityChange={setQuantity}
                volumePricing={volumePricing}
                purchaseActionsRef={purchaseActionsRef}
                purchaseMode={purchaseMode}
                onPurchaseModeChange={handlePurchaseModeChange}
                rentalEstimate={rentalEstimate}
                maintenancePlanMonthlyPen={maintenanceQuoteBreakdown.monthlySubtotalPen ?? null}
                preparationSurchargeUsd={preparationSurchargeUsd}
                showSeminuevaPreparationPrices={showPreparationTypeSelector}
                showRentalTab={detail.isPrinterEquipment}
                equipmentBasePriceUsd={equipmentBasePriceUsd}
                onRentalEstimateChange={setRentalEstimate}
                rentalConfiguratorRef={rentalConfiguratorRef}
                onQuoteClick={() => setQuoteOpen(true)}
                onTechnicalSheetFallback={handleTechnicalSheetFallback}
                {...secondaryPurchaseActionProps}
                {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
                {...(showPreparationTypeSelector ? { preparationType } : {})}
                onQuoteGenerated={setQuotePdfPreview}
              />
            </div>
          </div>

          <section
            ref={productInfoSectionRef}
            className="mt-5 border-t border-neutral-200 pt-5 sm:mt-6 sm:pt-6"
            aria-label="Información del producto"
          >
            <ProductDetailMockupTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as DetailTab)}
            />

            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="w-full py-4 sm:py-5"
            >
              {activeTab === 'specifications' ? (
                <div className="w-full space-y-4 sm:space-y-5">
                  <div className="grid w-full grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
                    <div className="min-w-0 space-y-3">
                      <h2 className="text-base font-bold text-neutral-900 sm:text-lg">Descripción</h2>
                      {useRicohTabs && detail.descriptionContent ? (
                        <div className="space-y-4">
                          <ProductDetailDescriptionPanel
                            content={detail.descriptionContent}
                            specs={detail.specs}
                            sku={detail.sku}
                            showSpecs={false}
                            compact
                          />
                          <ProductDetailDescription
                            content={detail.descriptionContent}
                            omitPanelSummary
                          />
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs leading-relaxed text-neutral-700 sm:text-sm">
                          <p className={cn(!descriptionExpanded && 'line-clamp-6')}>{descriptionText}</p>
                          {descriptionText.length > 280 ? (
                            <button
                              type="button"
                              onClick={() => setDescriptionExpanded((value) => !value)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-sm"
                            >
                              {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <h2 className="text-base font-bold text-neutral-900 sm:text-lg">Ficha técnica</h2>
                      {detail.specs.length > 0 ? (
                        <ProductDetailSpecsTable specs={detail.specs} variant="ficha" />
                      ) : (
                        <p className="text-xs text-neutral-600 sm:text-sm">
                          No hay especificaciones técnicas registradas para este producto.
                        </p>
                      )}
                    </div>
                  </div>

                  {!catalogLoading &&
                  useRicohTabs &&
                  consumableGroups.some(
                    (group) => group.items.length > 0 || group.subgroups.length > 0,
                  ) ? (
                    <ProductDetailConsumablesStrip
                      groups={consumableGroups}
                      onViewAll={() => setActiveTab('consumables')}
                    />
                  ) : null}
                  <ProductDetailAdvisorBanner />
                </div>
              ) : null}

              {activeTab === 'resources' ? (
                <div className="w-full space-y-6">
                  <ProductDetailResources
                    links={detail.resourceLinks}
                    product={product}
                    displayTitle={detail.displayTitle}
                    sku={detail.sku}
                    brandLabel={detail.brandLabel}
                    categoryLabel={detail.categoryLabel}
                    heroSpecBullets={detail.heroSpecBullets}
                  />
                  <ProductDetailAdvisorBanner />
                </div>
              ) : null}

              {activeTab === 'configuration' ? (
                <div>
                  {catalogLoading && equipmentSteps.length === 0 ? (
                    <div className="space-y-2" role="status" aria-live="polite" aria-label="Cargando configuración">
                      <div className="h-6 w-52 animate-pulse rounded bg-muted" />
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-11 animate-pulse rounded-md bg-muted/60" />
                      ))}
                    </div>
                  ) : equipmentSteps.length > 0 ? (
                    <ProductDetailOptionalProducts
                      steps={equipmentSteps}
                      selection={equipmentSelection}
                      onSelectionChange={setEquipmentSelection}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeTab === 'consumables' ? (
                <div className="w-full space-y-6">
                  {catalogLoading ? (
                    <div className="space-y-6" role="status" aria-live="polite" aria-label="Cargando repuestos">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-3">
                          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 3 }).map((__, cardIndex) => (
                              <div key={cardIndex} className="h-28 animate-pulse rounded-lg bg-muted/50" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ProductDetailConsumables groups={consumableGroups} />
                  )}
                  <ProductDetailAdvisorBanner />
                </div>
              ) : null}

              {activeTab === 'warranty' ? (
                <div className="w-full space-y-4">
                  <h3 className="text-lg font-bold text-[#0f1f3d]">Garantía y soporte</h3>
                  {detail.warrantyBullets.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {detail.warrantyBullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Garantía oficial de 12 meses con soporte técnico especializado pre y postventa.
                    </p>
                  )}
                  <ProductDetailAdvisorBanner />
                </div>
              ) : null}

              {activeTab === 'reviews' ? (
                <div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Aún no hay opiniones publicadas para este producto.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {comparison ? (
          <div ref={comparisonRef}>
            <Suspense fallback={<DetailSectionFallback className="mt-10" />}>
              <ProductDetailComparison data={comparison} />
            </Suspense>
          </div>
        ) : null}

        <div ref={relatedDeferRef} className="h-px w-full" aria-hidden="true" />
        {relatedNearViewport ? (
          <Suspense fallback={<DetailSectionFallback className="mt-10" />}>
            <ProductDetailRelated product={product} />
          </Suspense>
        ) : null}
      </div>

      {isRentQuoteMode && activeRentalQuoteEstimate ? (
        <ProductEquipmentRentalQuoteDialog
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          product={product}
          displayTitle={detail.displayTitle}
          sku={detail.sku}
          brandLabel={detail.brandLabel}
          estimate={activeRentalQuoteEstimate}
          onGenerated={setQuotePdfPreview}
        />
      ) : (
        <ProductQuoteDialog
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          product={product}
          displayTitle={detail.displayTitle}
          sku={detail.sku}
          brandLabel={detail.brandLabel}
          categoryLabel={detail.categoryLabel}
          heroSpecBullets={detail.heroSpecBullets}
          heroLead={detail.heroLead}
          heroDescription={detail.heroDescription}
          equipmentConfiguration={equipmentConfiguration}
          onGenerated={setQuotePdfPreview}
        />
      )}

      <ProductQuotePdfViewer
        preview={quotePdfPreview}
        onOpenChange={handleQuotePdfPreviewClose}
        autoDownload
      />

      {showMaintenancePlanAction ? (
        <ProductRentalQuoteDialog
          open={maintenanceQuoteOpen}
          onOpenChange={setMaintenanceQuoteOpen}
          product={product}
          displayTitle={detail.displayTitle}
          sku={detail.sku}
          brandLabel={detail.brandLabel}
          breakdown={maintenanceQuoteBreakdown}
          onGenerated={setQuotePdfPreview}
        />
      ) : null}

      <ProductDetailMobilePurchaseBar
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        volumePricing={volumePricing}
        basePriceUsd={publicUnitBaseUsd}
        catalogPublicUsd={fullPrices.public}
        bulkDiscountTiers={bulkDiscountTiers}
        floorPriceUsd={fullPrices.tecnico}
        outOfStock={outOfStock}
        purchaseActionsRef={mobilePurchaseVisibilityRef}
        preparationSurchargeUsd={preparationSurchargeUsd}
        oldPricePen={detail.oldPricePen}
        isOnOffer={detail.isOnOffer}
        discountPercent={detail.discountPercent}
        {...secondaryPurchaseActionProps}
        {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
        {...(showPreparationTypeSelector ? { preparationType } : {})}
      />

      <ProductDetailSocialProofToast
        productName={product.name}
        productImageUrl={resolveProductImageUrl(product)}
      />
    </div>
  );
}
