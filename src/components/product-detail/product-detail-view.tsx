import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { ProductDetailGallery } from '@/components/product-detail/product-detail-gallery';
import { ProductDetailHeroInfo } from '@/components/product-detail/product-detail-hero-info';
import { ProductDetailMobilePurchaseBar } from '@/components/product-detail/product-detail-mobile-purchase-bar';
import { ProductDetailPurchaseCard } from '@/components/product-detail/product-detail-purchase-card';
import { ProductDetailResources } from '@/components/product-detail/product-detail-resources';
import { ProductDetailSpecsTable } from '@/components/product-detail/product-detail-specs-table';
import { buildProductDetail } from '@/lib/build-product-detail';
import { DEFAULT_BULK_DISCOUNT_TIERS, resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { ensureFullPrices } from '@/lib/roles';
import { buildProductBreadcrumbs } from '@/lib/build-product-breadcrumbs';
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
  selectHeroTonerCard,
} from '@/lib/equipment-config-selection';
import { resolveIncludedTonerImage } from '@/lib/product-configure-accessory';
import { resolveFrequentlyBoughtItems } from '@/lib/product-compatible-toners';
import { hasCrossSellConfigureCards, mergeMerchandisingEquipmentSteps } from '@/lib/product-merchandising';
import { resolveEquipmentComparison } from '@/lib/product-equipment-comparison';
import {
  resolveEquipmentConsumables,
} from '@/lib/product-equipment-consumables';
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
  | 'description'
  | 'configuration'
  | 'consumables'
  | 'options'
  | 'resources'
  | 'warranty'
  | 'reviews';

interface ProductDetailViewProps {
  product: Product;
  featuredMeta?: FeaturedProduct | undefined;
}

const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Carlos M.',
    city: 'Lima',
    rating: 5,
    text: 'Excelente equipo, llegó a tiempo y la instalación fue muy profesional.',
  },
  {
    id: '2',
    author: 'María G.',
    city: 'Arequipa',
    rating: 5,
    text: 'Muy buena calidad de impresión y el soporte técnico respondió rápido.',
  },
  {
    id: '3',
    author: 'Luis R.',
    city: 'Trujillo',
    rating: 4,
    text: 'Ideal para nuestra oficina. Fácil de usar y confiable.',
  },
];

const MAINTENANCE_PLAN_FALLBACK = [{ pagesPerMonth: 5000, monthlyPricePen: 150 }] as const;

const ProductDetailConfigureEquipment = lazy(() =>
  import('@/components/product-detail/product-detail-configure-equipment').then((module) => ({
    default: module.ProductDetailConfigureEquipment,
  })),
);
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
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);
  const [quantity, setQuantity] = useState(1);
  const purchaseActionsRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const volumePricing = useMemo(
    () =>
      resolveBulkDiscountPricing(quantity, displayUsd, bulkDiscountTiers, {
        floorPriceUsd: fullPrices.tecnico,
      }),
    [quantity, displayUsd, bulkDiscountTiers, fullPrices.tecnico],
  );
  const outOfStock = isProductOutOfStock(product);

  useEffect(() => {
    setQuantity(1);
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
    if (useRicohTabs) {
      return [
        { id: 'description' as const, label: 'Descripción' },
        { id: 'consumables' as const, label: 'Repuestos' },
        { id: 'resources' as const, label: 'Descargas' },
        { id: 'warranty' as const, label: 'Garantía y soporte' },
      ];
    }

    const items: { id: DetailTab; label: string }[] = [{ id: 'description', label: 'Descripción' }];

    if (equipmentSteps.length > 0) {
      items.push({ id: 'configuration', label: 'Configuración' });
    }

    if (showConsumablesTab) {
      items.push({ id: 'consumables', label: 'Repuestos' });
    }

    items.push({ id: 'reviews', label: `Opiniones (${detail.reviews})` });
    return items;
  }, [useRicohTabs, equipmentSteps.length, showConsumablesTab, detail.reviews]);

  const tabIds = useMemo(() => tabs.map((tab) => tab.id).join(','), [tabs]);

  useEffect(() => {
    if (!tabIds.split(',').includes(activeTab)) {
      setActiveTab('description');
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

  const equipmentConfiguration = useMemo<CartConfigurationLine | undefined>(() => {
    if (selectedEquipmentOptions.length === 0) return undefined;
    return {
      options: selectedEquipmentOptions,
      extrasPen: computeEquipmentExtrasPen(selectedEquipmentOptions),
    };
  }, [selectedEquipmentOptions]);

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
    }
  }, []);

  const heroGridClass =
    'grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-5 xl:gap-6';

  const scrollToComparison = () => {
    if (comparison) {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setActiveTab('description');
  };

  const showOriginalBadge =
    /ricoh/i.test(detail.brandLabel) &&
    (/original/i.test(product.name) || /original/i.test(product.category ?? ''));

  const configureEquipmentSection = showConfigureSection ? (
    <Suspense fallback={<DetailSectionFallback className="mt-4" />}>
      <ProductDetailConfigureEquipment
        product={product}
        detail={detail}
        plans={maintenancePlans}
        equipmentSteps={equipmentSteps}
        equipmentSelection={equipmentSelection}
        onEquipmentSelectionChange={setEquipmentSelection}
        frequentlyBought={frequentlyBought}
        catalogProducts={catalogForEquipment}
        consumableGroups={consumableGroups}
        purchaseMode={purchaseMode}
        onPurchaseModeChange={handlePurchaseModeChange}
        onRentalEstimateChange={setRentalEstimate}
        purchaseActionsRef={purchaseActionsRef}
        layout="inline"
        className="mt-4"
      />
    </Suspense>
  ) : null;

  return (
    <div className="bg-white pb-20 lg:pb-0">
      <div className="container py-3 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <ProductDetailBreadcrumbsBar items={breadcrumbs} productId={product.id} />
        </div>

        <div className={heroGridClass}>
          <div className="min-w-0">
            <ProductDetailGallery
              items={detail.gallery}
              productName={product.name}
              product={product}
              showOriginalBadge={showOriginalBadge}
              brandLabel={detail.brandLabel}
            />
            <div className="h-px w-full" aria-hidden="true" />
            {configureEquipmentSection}
          </div>

          <ProductDetailHeroInfo
            product={product}
            detail={detail}
            showCompareAction={comparison != null}
            onCompareClick={scrollToComparison}
            onQuoteClick={() => setQuoteOpen(true)}
            tonerCards={purchasableTonerCards}
            selectedTonerOptionIds={equipmentSelection.toner ?? new Set<string>()}
            onTonerToggle={handleHeroTonerToggle}
          />

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
              {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
              onQuoteGenerated={setQuotePdfPreview}
            />
          </div>

        </div>

        <div className="mt-4 lg:hidden">
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
            {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
            onQuoteGenerated={setQuotePdfPreview}
          />
        </div>

        <section
          className="mt-8 border-t border-border/60 pt-6 sm:mt-10"
          aria-label="Información del producto"
        >
          <div className="min-w-0">
          <div className="border-b border-border/60">
            <div
              role="tablist"
              aria-label="Secciones del producto"
              className="flex gap-6 overflow-x-auto sm:gap-8"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 border-b-2 pb-3 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-[#0f1f3d]/70 hover:text-[#0f1f3d]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="pt-6"
          >
            {activeTab === 'description' ? (
              useRicohTabs && detail.descriptionContent ? (
                <div className="space-y-8">
                  <ProductDetailDescriptionPanel
                    content={detail.descriptionContent}
                    specs={detail.specs}
                    sku={detail.sku}
                  />

                  <ProductDetailDescription
                    content={detail.descriptionContent}
                    omitPanelSummary
                  />


                  {!catalogLoading &&
                  consumableGroups.some(
                    (group) => group.items.length > 0 || group.subgroups.length > 0,
                  ) ? (
                    <ProductDetailConsumablesStrip
                      groups={consumableGroups}
                      className="mt-2"
                      onViewAll={() => setActiveTab('consumables')}
                    />
                  ) : null}
                  <ProductDetailAdvisorBanner />
                </div>
              ) : useRicohTabs ? (
                <div className="space-y-0">
                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      <p className={cn(!descriptionExpanded && 'line-clamp-6')}>{descriptionText}</p>
                      {descriptionText.length > 280 ? (
                        <button
                          type="button"
                          onClick={() => setDescriptionExpanded((value) => !value)}
                          className="text-sm font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                          {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                      ) : null}
                    </div>
                    <aside className="space-y-3">
                      <h3 className="text-base font-bold text-[#0f1f3d] sm:text-lg">
                        Especificaciones técnicas
                      </h3>
                      <ProductDetailSpecsTable specs={detail.specs} />
                    </aside>
                  </div>
                  <ProductDetailAdvisorBanner />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    <p className={cn(!descriptionExpanded && 'line-clamp-6')}>{descriptionText}</p>
                    {descriptionText.length > 280 ? (
                      <button
                        type="button"
                        onClick={() => setDescriptionExpanded((value) => !value)}
                        className="text-sm font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    ) : null}
                  </div>
                  <aside className="space-y-3">
                    <h3 className="text-base font-bold text-[#0f1f3d] sm:text-lg">
                      Especificaciones técnicas
                    </h3>
                    <ProductDetailSpecsTable specs={detail.specs} />
                  </aside>
                </div>
              )
            ) : null}

            {activeTab === 'resources' ? (
              <div className="max-w-3xl space-y-6">
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
              <div className="max-w-3xl">
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
              <div className="max-w-5xl space-y-6">
                {catalogLoading ? (
                  <div className="space-y-6" role="status" aria-live="polite" aria-label="Cargando repuestos">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-3">
                        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="max-w-3xl space-y-4">
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
              <ul className="grid max-w-3xl gap-4">
                {MOCK_REVIEWS.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-border/60 bg-muted/15 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#0f1f3d]">
                        {review.author}
                        <span className="font-normal text-muted-foreground"> · {review.city}</span>
                      </p>
                      <p className="text-xs font-semibold text-red-600" aria-label={`${review.rating} de 5 estrellas`}>
                        {'★'.repeat(review.rating)}
                        <span className="text-muted-foreground/40">{'★'.repeat(5 - review.rating)}</span>
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          </div>
        </section>

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

      <ProductQuotePdfViewer
        preview={quotePdfPreview}
        onOpenChange={handleQuotePdfPreviewClose}
      />

      <ProductDetailMobilePurchaseBar
        product={product}
        quantity={quantity}
        volumePricing={volumePricing}
        basePriceUsd={displayUsd}
        bulkDiscountTiers={bulkDiscountTiers}
        floorPriceUsd={fullPrices.tecnico}
        outOfStock={outOfStock}
        purchaseActionsRef={purchaseActionsRef}
        {...(equipmentConfiguration ? { equipmentConfiguration } : {})}
      />
    </div>
  );
}
