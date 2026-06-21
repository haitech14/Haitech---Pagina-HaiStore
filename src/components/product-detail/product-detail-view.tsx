import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';

import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { ProductQuoteDialog } from '@/components/product-detail/product-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductDetailAdvisorBanner } from '@/components/product-detail/product-detail-advisor-banner';
import { ProductDetailCombo } from '@/components/product-detail/product-detail-combo';
import { ProductDetailComparison } from '@/components/product-detail/product-detail-comparison';
import { ProductDetailConsumables } from '@/components/product-detail/product-detail-consumables';
import { ProductDetailConsumablesStrip } from '@/components/product-detail/product-detail-consumables-strip';
import { ProductDetailDescription } from '@/components/product-detail/product-detail-description';
import { ProductDetailDescriptionPanel } from '@/components/product-detail/product-detail-description-panel';
import { ProductDetailDescriptionVisual } from '@/components/product-detail/product-detail-description-visual';
import { ProductDetailEquipmentConfig } from '@/components/product-detail/product-detail-equipment-config';
import { ProductDetailGallery } from '@/components/product-detail/product-detail-gallery';
import { ProductDetailHeroInfo } from '@/components/product-detail/product-detail-hero-info';
import { ProductDetailMobilePurchaseBar } from '@/components/product-detail/product-detail-mobile-purchase-bar';
import { ProductDetailRentalBanner } from '@/components/product-detail/product-detail-rental-banner';
import { ProductDetailRelated } from '@/components/product-detail/product-detail-related';
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
  buildInitialEquipmentSelection,
  computeEquipmentExtrasPen,
  resolveSelectedEquipmentOptions,
} from '@/lib/equipment-config-selection';
import { resolveFrequentlyBoughtItems } from '@/lib/product-compatible-toners';
import { resolveEquipmentComparison } from '@/lib/product-equipment-comparison';
import {
  resolveEquipmentConsumables,
} from '@/lib/product-equipment-consumables';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProductConsumables } from '@/hooks/use-product-consumables';
import { useProducts } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';
import type { CartConfigurationLine } from '@/types/product';
import type { FeaturedProduct } from '@/data/featured-products';
import type { Product } from '@/types/product';

type DetailTab =
  | 'description'
  | 'specs'
  | 'configuration'
  | 'consumables'
  | 'options'
  | 'resources'
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

export function ProductDetailView({ product, featuredMeta }: ProductDetailViewProps) {
  const { data: rentalPlansRaw = [] } = useRentalPlans({ activeOnly: true });
  const { data: companySettings } = useCompanySettings();
  const rentalPlansFromApi = useMemo(
    () =>
      rentalPlansRaw.map((plan) => ({
        pagesPerMonth: plan.pagesPerMonth,
        monthlyPricePen: plan.monthlyPricePen,
      })),
    [rentalPlansRaw],
  );
  const bulkDiscountTiers = companySettings?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS;
  const detail = useMemo(
    () => buildProductDetail(product, featuredMeta, rentalPlansFromApi, bulkDiscountTiers),
    [product, featuredMeta, rentalPlansFromApi, bulkDiscountTiers],
  );
  const { data: catalogProducts = [], isLoading: catalogLoading } = useProducts({
    enabled: detail.isPrinterEquipment,
  });
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

  const equipmentSteps = useMemo(
    () => resolveEquipmentConfigSteps(detail.equipmentConfigSteps, catalogProducts, product),
    [detail.equipmentConfigSteps, catalogProducts, product],
  );

  const comparison = useMemo(
    () =>
      detail.isPrinterEquipment
        ? resolveEquipmentComparison(product, catalogProducts, detail.specs)
        : null,
    [detail.isPrinterEquipment, product, catalogProducts, detail.specs],
  );

  const consumableGroups = useMemo(
    () =>
      consumableGroupsFromApi.length > 0
        ? consumableGroupsFromApi
        : resolveEquipmentConsumables(product, catalogProducts),
    [consumableGroupsFromApi, product, catalogProducts],
  );

  const showConsumablesTab = detail.isPrinterEquipment;
  const useRicohTabs = detail.isPrinterEquipment;

  const tabs = useMemo(() => {
    if (useRicohTabs) {
      return [
        { id: 'description' as const, label: 'Descripción' },
        { id: 'specs' as const, label: 'Especificaciones técnicas' },
        { id: 'consumables' as const, label: 'Consumibles / Relacionados' },
        { id: 'resources' as const, label: 'Documentación' },
      ];
    }

    const items: { id: DetailTab; label: string }[] = [
      { id: 'description', label: 'Descripción' },
      { id: 'specs', label: 'Especificaciones' },
    ];

    if (equipmentSteps.length > 0) {
      items.push({ id: 'configuration', label: 'Configuración' });
    }

    if (showConsumablesTab) {
      items.push({ id: 'consumables', label: 'Consumibles' });
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

  const equipmentConfiguration = useMemo<CartConfigurationLine | undefined>(() => {
    if (selectedEquipmentOptions.length === 0) return undefined;
    return {
      options: selectedEquipmentOptions,
      extrasPen: computeEquipmentExtrasPen(selectedEquipmentOptions),
    };
  }, [selectedEquipmentOptions]);

  const showComboSection =
    detail.isPrinterEquipment && (catalogLoading || frequentlyBought.length > 0);

  const comboSection = showComboSection ? (
    catalogLoading ? (
      <div
        className="min-w-0"
        role="status"
        aria-live="polite"
        aria-label="Cargando complementos"
      >
        <div className="h-5 w-44 animate-pulse rounded bg-muted sm:h-6" />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[7.5rem] min-w-0 animate-pulse rounded-lg border border-border/40 bg-muted/50 sm:min-h-[8.5rem]"
            />
          ))}
        </div>
      </div>
    ) : frequentlyBought.length > 0 ? (
      <ProductDetailCombo
        items={frequentlyBought}
        mainProduct={product}
        catalogProducts={catalogProducts}
        title="Complementa tu equipo"
        layout="complement"
      />
    ) : null
  ) : null;

  const heroGridClass =
    'grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] xl:gap-7';

  return (
    <div className="bg-white pb-20 lg:pb-0">
      <div className="container py-3 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <ProductDetailBreadcrumbs items={breadcrumbs} className="mb-0" />
        </div>

        <div className={heroGridClass}>
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <ProductDetailGallery
              items={detail.gallery}
              productName={product.name}
            />

            {detail.isPrinterEquipment && detail.rentalPlans.length > 0 ? (
              <ProductDetailRentalBanner
                product={product}
                plans={detail.rentalPlans}
                displayTitle={detail.displayTitle}
                sku={detail.sku}
                brandLabel={detail.brandLabel}
              />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
            <ProductDetailHeroInfo
              product={product}
              detail={detail}
              onQuoteClick={() => setQuoteOpen(true)}
              comboSlot={showComboSection ? comboSection : null}
              quantity={quantity}
              onQuantityChange={setQuantity}
              purchaseActionsRef={purchaseActionsRef}
            />
          </div>
        </div>

        <section
          className="mt-10 border-t border-border/60 pt-6 sm:mt-12"
          aria-label="Información del producto"
        >
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
                    onViewAllSpecs={() => setActiveTab('specs')}
                  />

                  <ProductDetailDescription
                    content={detail.descriptionContent}
                    omitPanelSummary
                  />

                  {detail.descriptionVisual ? (
                    <ProductDetailDescriptionVisual
                      visual={detail.descriptionVisual}
                      variant="bar"
                    />
                  ) : null}

                  {equipmentSteps.length > 0 ? (
                    <div>
                      <h3 className="mb-4 text-base font-bold text-[#0f1f3d]">
                        Configuración del equipo
                      </h3>
                      {catalogLoading ? (
                        <div
                          className="space-y-2"
                          role="status"
                          aria-live="polite"
                          aria-label="Cargando configuración"
                        >
                          <div className="h-6 w-52 animate-pulse rounded bg-muted" />
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div
                              key={index}
                              className="h-11 animate-pulse rounded-md bg-[#0f1f3d]/80"
                            />
                          ))}
                        </div>
                      ) : (
                        <ProductDetailEquipmentConfig
                          hideTitle
                          steps={equipmentSteps}
                          selection={equipmentSelection}
                          onSelectionChange={setEquipmentSelection}
                        />
                      )}
                    </div>
                  ) : null}

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
                    <ProductDetailSpecsTable specs={detail.specs} />
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
                  <ProductDetailSpecsTable specs={detail.specs} />
                </div>
              )
            ) : null}

            {activeTab === 'specs' ? (
              <div className="max-w-3xl space-y-4">
                <h3 className="text-lg font-bold text-[#0f1f3d]">Especificaciones técnicas</h3>
                <ProductDetailSpecsTable specs={detail.specs} />
                <ProductDetailAdvisorBanner />
              </div>
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
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-11 animate-pulse rounded-md bg-[#0f1f3d]/80" />
                    ))}
                  </div>
                ) : (
                  <ProductDetailEquipmentConfig
                    hideTitle
                    steps={equipmentSteps}
                    selection={equipmentSelection}
                    onSelectionChange={setEquipmentSelection}
                  />
                )}
              </div>
            ) : null}

            {activeTab === 'consumables' ? (
              <div className="max-w-5xl space-y-6">
                {catalogLoading ? (
                  <div className="space-y-6" role="status" aria-live="polite" aria-label="Cargando consumibles">
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
        </section>

        {comparison ? <ProductDetailComparison data={comparison} /> : null}

        <ProductDetailRelated product={product} />
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
      />
    </div>
  );
}
