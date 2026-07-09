import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  homeCategoryChipClassName,
  HomeCategoryChipContent,
  type HomeCategoryChipLayout,
} from '@/components/home/home-category-chip';
import { HomeLandingProductCard } from '@/components/home/home-landing-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { resolveHomeConsumablesCategoryImage } from '@/data/home-consumables-category-images';
import { resolveHomeEquipmentCategoryImage } from '@/data/home-equipment-category-images';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import {
  HOME_FEATURED_CONSUMABLES_CATEGORY_FILTERS,
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  HOME_FEATURED_CONSUMABLES_DEFAULT_CATEGORY,
  HOME_FEATURED_CONSUMABLES_DEFAULT_CONDITION,
  type HomeFeaturedConsumablesCategoryFilterId,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import {
  HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS,
  HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS,
  HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
  HOME_FEATURED_EQUIPMENT_DEFAULT_CONDITION,
  type HomeFeaturedEquipmentCategoryFilterId,
  type HomeFeaturedEquipmentConditionFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { catalogRowToFeatured, getCatalogRows } from '@/lib/catalog-featured';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import {
  compareHomeFeaturedConsumablesProducts,
  compareHomeFeaturedEquipmentProducts,
  isHomeFeaturedConsumableProduct,
  isHomeFeaturedEquipmentProduct,
  matchesHomeFeaturedConsumablesFilters,
  matchesHomeFeaturedEquipmentFilters,
} from '@/lib/home-featured-product-filter';
import { openHeroQuoteWhatsApp } from '@/lib/hero-whatsapp-message';
import { productToFeatured } from '@/lib/store-products';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const FEATURED_CATEGORY_CAROUSEL_GAP = 'gap-2 sm:gap-2.5';

const CONSUMABLES_CATEGORY_CAROUSEL_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_9.75rem] sm:flex-[0_0_11.5rem] md:flex-[0_0_calc((100%-1.25rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/7)]';

const featuredCategoryCarouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-[0_2px_8px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

const FEATURED_DISPLAY_LIMIT = 12;
const FEATURED_POOL_LIMIT = 64;

const FEATURED_PRODUCTS_CAROUSEL_GAP = 'gap-3 sm:gap-3.5 xl:gap-4';
/** 2 móvil · 3 md · 4 lg · 5 xl visibles por vista. */
const FEATURED_PRODUCT_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-1.75rem)/3)] lg:flex-[0_0_calc((100%-2.625rem)/4)] xl:flex-[0_0_calc((100%-4rem)/5)]';

const EQUIPMENT_SECTION_IDS = new Set(['multifuncionales', 'impresoras']);
const CONSUMABLES_SECTION_IDS = new Set(['toner-suministros', 'repuestos']);

export const HOME_CONSUMABLES_ADVISORY = {
  message: '¿No sabes qué consumible elegir? Te asesoramos por WhatsApp.',
  campaign: 'home-consumibles-oferta',
  description:
    'Completa tus datos y te conectaremos con un asesor para ayudarte a elegir el tóner o consumible ideal.',
} as const;

type FeaturedVariant = 'equipment' | 'consumables';

type FeaturedVariantConfig =
  | {
      variant: 'equipment';
      title: string;
      catalogLink: string;
      catalogLinkLabel: string;
      emptyMessage: string;
      advisoryMessage: string;
      whatsAppCampaign: string;
      whatsAppDescription: string;
      conditionFilters: typeof HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS;
      categoryFilters: typeof HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS;
      defaultCondition: HomeFeaturedEquipmentConditionFilterId;
      defaultCategory: HomeFeaturedEquipmentCategoryFilterId;
      sectionIds: Set<string>;
      isPoolProduct: (product: FeaturedProduct) => boolean;
      matchesFilters: (
        product: FeaturedProduct,
        condition: HomeFeaturedEquipmentConditionFilterId,
        category: HomeFeaturedEquipmentCategoryFilterId,
      ) => boolean;
      compareProducts: (a: FeaturedProduct, b: FeaturedProduct) => number;
      resolveCategoryImage: (filterId: HomeFeaturedEquipmentCategoryFilterId) => string;
    }
  | {
      variant: 'consumables';
      title: string;
      catalogLink: string;
      catalogLinkLabel: string;
      emptyMessage: string;
      advisoryMessage: string;
      whatsAppCampaign: string;
      whatsAppDescription: string;
      conditionFilters: typeof HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS;
      categoryFilters: typeof HOME_FEATURED_CONSUMABLES_CATEGORY_FILTERS;
      defaultCondition: HomeFeaturedConsumablesConditionFilterId;
      defaultCategory: HomeFeaturedConsumablesCategoryFilterId;
      sectionIds: Set<string>;
      isPoolProduct: (product: FeaturedProduct) => boolean;
      matchesFilters: (
        product: FeaturedProduct,
        condition: HomeFeaturedConsumablesConditionFilterId,
        category: HomeFeaturedConsumablesCategoryFilterId,
      ) => boolean;
      compareProducts: (a: FeaturedProduct, b: FeaturedProduct) => number;
      resolveCategoryImage: (filterId: HomeFeaturedConsumablesCategoryFilterId) => string;
    };

function getVariantConfig(variant: FeaturedVariant): FeaturedVariantConfig {
  if (variant === 'consumables') {
    return {
      variant: 'consumables',
      title: 'Explora nuestras categorías de Consumibles y Repuestos',
      catalogLink: HOME_LANDING_LINKS.tonerCatalog,
      catalogLinkLabel: 'Ver catálogo de tóner',
      emptyMessage: 'No hay consumibles en esta categoría por ahora.',
      advisoryMessage: HOME_CONSUMABLES_ADVISORY.message,
      whatsAppCampaign: HOME_CONSUMABLES_ADVISORY.campaign,
      whatsAppDescription: HOME_CONSUMABLES_ADVISORY.description,
      conditionFilters: HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
      categoryFilters: HOME_FEATURED_CONSUMABLES_CATEGORY_FILTERS,
      defaultCondition: HOME_FEATURED_CONSUMABLES_DEFAULT_CONDITION,
      defaultCategory: HOME_FEATURED_CONSUMABLES_DEFAULT_CATEGORY,
      sectionIds: CONSUMABLES_SECTION_IDS,
      isPoolProduct: isHomeFeaturedConsumableProduct,
      matchesFilters: matchesHomeFeaturedConsumablesFilters,
      compareProducts: compareHomeFeaturedConsumablesProducts,
      resolveCategoryImage: resolveHomeConsumablesCategoryImage,
    };
  }

  return {
    variant: 'equipment',
    title: 'Equipos en oferta para tu empresa',
    catalogLink: HOME_LANDING_LINKS.allProducts,
    catalogLinkLabel: 'Ver todos los productos',
    emptyMessage: 'No hay equipos en esta categoría por ahora.',
    advisoryMessage: '¿No sabes qué equipo elegir? Te asesoramos por WhatsApp.',
    whatsAppCampaign: 'home-equipos-oferta',
    whatsAppDescription:
      'Completa tus datos y te conectaremos con un asesor para ayudarte a elegir el equipo ideal.',
    conditionFilters: HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS,
    categoryFilters: HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS,
    defaultCondition: HOME_FEATURED_EQUIPMENT_DEFAULT_CONDITION,
    defaultCategory: HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
    sectionIds: EQUIPMENT_SECTION_IDS,
    isPoolProduct: isHomeFeaturedEquipmentProduct,
    matchesFilters: matchesHomeFeaturedEquipmentFilters,
    compareProducts: compareHomeFeaturedEquipmentProducts,
    resolveCategoryImage: resolveHomeEquipmentCategoryImage,
  };
}

function HomeFeaturedProductsSkeleton() {
  return (
    <div className="overflow-hidden">
      <ul className={cn('flex', FEATURED_PRODUCTS_CAROUSEL_GAP)} role="list">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className={FEATURED_PRODUCT_SLIDE_CLASS}>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-white p-3 shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="mt-2.5 h-4 w-full" />
              <Skeleton className="mt-1.5 h-3 w-28" />
              <Skeleton className="mt-2 h-5 w-24" />
              <Skeleton className="mt-3 h-10 w-full rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomeFeaturedProductsCarousel({ products }: { products: FeaturedProduct[] }) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const productIdsKey = useMemo(() => products.map((product) => product.id).join('|'), [products]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, productIdsKey]);

  const canScroll = canScrollPrev || canScrollNext;

  return (
    <div className={cn('relative', canScroll && 'px-10 sm:px-12')}>
      {canScroll ? (
        <>
          <button
            type="button"
            className={cn(featuredCategoryCarouselArrowClass, 'left-0')}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(featuredCategoryCarouselArrowClass, 'right-0')}
            aria-label="Productos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', FEATURED_PRODUCTS_CAROUSEL_GAP)} role="list">
          {products.map((product) => (
            <li key={product.id} className={cn(FEATURED_PRODUCT_SLIDE_CLASS, 'flex')}>
              <HomeLandingProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HomeFeaturedConditionFilters<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  ariaLabel = 'Filtros por condición',
  size = 'default',
}: {
  filters: ReadonlyArray<{ id: T; label: string }>;
  activeFilter: T;
  onFilterChange: (filterId: T) => void;
  ariaLabel?: string;
  size?: 'default' | 'compact';
}) {
  const isCompact = size === 'compact';

  return (
    <div className="mb-4 flex justify-center overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-5 [&::-webkit-scrollbar]:hidden">
      <div
        className={cn('flex', isCompact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-2.5')}
        role="tablist"
        aria-label={ariaLabel}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full border font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                isCompact
                  ? 'px-2.5 py-1 text-[0.6875rem] sm:px-3 sm:py-1.5 sm:text-xs'
                  : 'px-3.5 py-2 text-xs sm:px-4 sm:text-sm',
                isActive
                  ? 'border-[#E30613] bg-[#E30613] text-white'
                  : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
              )}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type HomeFeaturedCategoryFilterItem<T extends string> = {
  id: T;
  label: string;
  labelLines?: [string, string];
  wide?: boolean;
};

function HomeFeaturedCategoryFilters<T extends string>({
  filters,
  filterRows,
  activeFilter,
  onFilterChange,
  resolveImage,
  chipSize = 'sm',
  layout = 'horizontal',
  fullWidthCarousel = false,
  carouselSlideClass,
}: {
  filters?: ReadonlyArray<HomeFeaturedCategoryFilterItem<T>>;
  filterRows?: ReadonlyArray<ReadonlyArray<HomeFeaturedCategoryFilterItem<T>>>;
  activeFilter: T;
  onFilterChange: (filterId: T) => void;
  resolveImage: (filterId: T) => string;
  chipSize?: 'sm' | 'compact' | 'lg' | 'xl';
  layout?: HomeCategoryChipLayout;
  fullWidthCarousel?: boolean;
  carouselSlideClass?: string;
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || filterRows) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, filterRows]);

  const resolvedFilters = filters ?? [];
  const filtersKey = resolvedFilters.map((filter) => filter.id).join('|');

  useEffect(() => {
    if (!emblaApi || filterRows) return;
    emblaApi.reInit();
  }, [emblaApi, filterRows, filtersKey, chipSize, fullWidthCarousel, carouselSlideClass]);

  const renderChip = (filter: HomeFeaturedCategoryFilterItem<T>, chipClassName?: string) => {
    const isActive = activeFilter === filter.id;
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        className={cn(
          homeCategoryChipClassName({
            layout,
            size: chipSize,
            isActive,
            wide: filter.wide,
          }),
          fullWidthCarousel && 'w-full min-w-0',
          chipClassName,
        )}
        onClick={() => onFilterChange(filter.id)}
      >
        <HomeCategoryChipContent
          imageSrc={resolveImage(filter.id)}
          label={filter.label}
          labelLines={filter.labelLines}
          layout={layout}
          size={chipSize}
          isActive={isActive}
          wide={filter.wide}
        />
      </button>
    );
  };

  if (filterRows) {
    return (
      <div className="mb-5 flex flex-col gap-2.5 sm:mb-6 sm:gap-3">
        {filterRows.map((rowFilters, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              'flex flex-wrap justify-center',
              FEATURED_CATEGORY_CAROUSEL_GAP,
              rowIndex === 1 && 'max-w-4xl mx-auto sm:grid sm:grid-cols-2 lg:grid-cols-4',
            )}
            role="tablist"
            aria-label={
              rowIndex === 0 ? 'Categorías de consumibles' : 'Unidades y componentes de impresión'
            }
          >
            {rowFilters.map((filter) => (
              <div key={filter.id}>
                {renderChip(
                  filter,
                  rowIndex === 1
                    ? 'w-full min-w-0 sm:min-w-[9.5rem] lg:min-w-[11rem]'
                    : undefined,
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const canScroll = canScrollPrev || canScrollNext;
  const showCarouselChrome = canScroll || (fullWidthCarousel && resolvedFilters.length > 3);

  return (
    <div className={cn('relative mb-5 w-full sm:mb-6', showCarouselChrome && 'px-10 sm:px-12')}>
      {showCarouselChrome ? (
        <>
          <button
            type="button"
            className={cn(featuredCategoryCarouselArrowClass, 'left-0')}
            aria-label="Filtros de categoría anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(featuredCategoryCarouselArrowClass, 'right-0')}
            aria-label="Filtros de categoría siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div
          className={cn(
            'flex w-full',
            FEATURED_CATEGORY_CAROUSEL_GAP,
            !fullWidthCarousel && !canScroll && 'mx-auto w-fit justify-center',
          )}
          role="tablist"
          aria-label="Filtros por categoría"
        >
          {resolvedFilters.map((filter) => (
            <div
              key={filter.id}
              className={cn(
                carouselSlideClass,
                !carouselSlideClass && 'shrink-0',
              )}
            >
              {renderChip(filter)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeFeaturedAdvisoryCta({
  campaign,
  description,
}: {
  campaign: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const { contact, saveContact, isSaving } = useWhatsAppContact();

  const handleSubmit = async (nextContact: WhatsAppContact) => {
    await saveContact(nextContact);
    const opened = openHeroQuoteWhatsApp(nextContact, { campaign });
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-full border border-[#E30613] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#E30613] transition-colors hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:text-sm"
      >
        Recibir asesoría
      </button>

      <WhatsAppContactDialog
        open={open}
        onOpenChange={setOpen}
        initial={contact ?? undefined}
        isSubmitting={isSaving}
        showQuoteCheckbox={false}
        title="Asesoría por WhatsApp"
        description={description}
        submitLabel="Continuar a WhatsApp"
        onSubmit={handleSubmit}
      />
    </>
  );
}

export function HomeFeaturedAdvisoryRow({
  message,
  campaign,
  description,
  className,
}: {
  message: string;
  campaign: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3',
        className,
      )}
    >
      <p className="text-sm text-[#666666]">{message}</p>
      <HomeFeaturedAdvisoryCta campaign={campaign} description={description} />
    </div>
  );
}

type HomeFeaturedProductsSectionProps = {
  /** Suffix for heading id when multiple instances render on the same page. */
  instanceId?: string;
  variant?: FeaturedVariant;
  /** Dónde mostrar la fila de asesoría WhatsApp; `none` la oculta. */
  advisoryPlacement?: 'top' | 'bottom' | 'none';
};

export function HomeFeaturedProductsSection({
  instanceId,
  variant = 'equipment',
  advisoryPlacement = 'bottom',
}: HomeFeaturedProductsSectionProps = {}) {
  const config = getVariantConfig(variant);
  const titleId = instanceId
    ? `home-featured-products-${instanceId}-title`
    : 'home-featured-products-title';
  const { data: catalogBundle, isLoading } = useHomeCatalogBundle();
  const [activeCondition, setActiveCondition] = useState(config.defaultCondition);
  const [activeCategory, setActiveCategory] = useState(config.defaultCategory);

  const productPool = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seen = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= FEATURED_POOL_LIMIT) return;
      const enriched = enrichFeaturedFromCatalog(item);
      if (!config.isPoolProduct(enriched)) return;
      seen.add(item.id);
      merged.push(enriched);
    };

    for (const product of catalogBundle?.featured ?? []) {
      pushUnique(productToFeatured(product));
    }

    for (const section of catalogBundle?.sections ?? []) {
      if (!config.sectionIds.has(section.id)) continue;
      for (const products of Object.values(section.productsByCondition)) {
        for (const item of products) {
          pushUnique(item);
        }
      }
    }

    for (const row of getCatalogRows()) {
      const publicPrice = row.prices?.public ?? 0;
      if (row.stock <= 0 || publicPrice <= 0) continue;
      pushUnique(catalogRowToFeatured(row));
    }

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    return merged;
  }, [catalogBundle, config]);

  const products = useMemo(() => {
    return productPool
      .filter((product) =>
        config.variant === 'equipment'
          ? matchesHomeFeaturedEquipmentFilters(
              product,
              activeCondition as HomeFeaturedEquipmentConditionFilterId,
              activeCategory as HomeFeaturedEquipmentCategoryFilterId,
            )
          : matchesHomeFeaturedConsumablesFilters(
              product,
              activeCondition as HomeFeaturedConsumablesConditionFilterId,
              activeCategory as HomeFeaturedConsumablesCategoryFilterId,
            ),
      )
      .sort(config.compareProducts)
      .slice(0, FEATURED_DISPLAY_LIMIT);
  }, [activeCategory, activeCondition, config, productPool]);

  if (!isLoading && productPool.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className="home-landing-sans bg-white">
      <div className="container pb-6 pt-5 sm:pb-8 sm:pt-7">
        {advisoryPlacement === 'top' ? (
          <HomeFeaturedAdvisoryRow
            className="mb-5 sm:mb-6"
            message={config.advisoryMessage}
            campaign={config.whatsAppCampaign}
            description={config.whatsAppDescription}
          />
        ) : null}

        <div className="mb-5 grid grid-cols-1 gap-2 sm:mb-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <span className="hidden sm:block" aria-hidden="true" />
          <h2
            id={titleId}
            className="home-section-title text-center text-xl font-bold tracking-tight text-[#111111] sm:text-2xl lg:text-[1.75rem] lg:leading-none"
          >
            {config.title}
          </h2>

          <Link
            to={config.catalogLink}
            className="inline-flex min-h-9 items-center justify-center gap-1 self-center text-sm font-semibold text-[#E30613] transition-colors hover:text-[#ff4d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:justify-self-end sm:self-auto"
          >
            {config.catalogLinkLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {config.variant === 'equipment' ? (
          <>
            <HomeFeaturedConditionFilters
              filters={config.conditionFilters}
              activeFilter={activeCondition as HomeFeaturedEquipmentConditionFilterId}
              onFilterChange={setActiveCondition}
            />
            <HomeFeaturedCategoryFilters
              filters={config.categoryFilters}
              activeFilter={activeCategory as HomeFeaturedEquipmentCategoryFilterId}
              onFilterChange={setActiveCategory}
              resolveImage={config.resolveCategoryImage}
              layout="vertical"
            />
          </>
        ) : (
          <>
            <HomeFeaturedCategoryFilters
              filters={config.categoryFilters}
              activeFilter={activeCategory as HomeFeaturedConsumablesCategoryFilterId}
              onFilterChange={setActiveCategory}
              resolveImage={config.resolveCategoryImage}
              layout="vertical"
              chipSize="xl"
              fullWidthCarousel
              carouselSlideClass={CONSUMABLES_CATEGORY_CAROUSEL_SLIDE_CLASS}
            />
            <HomeFeaturedConditionFilters
              filters={config.conditionFilters}
              activeFilter={activeCondition as HomeFeaturedConsumablesConditionFilterId}
              onFilterChange={setActiveCondition}
              size="compact"
            />
          </>
        )}

        {isLoading && products.length === 0 ? (
          <HomeFeaturedProductsSkeleton />
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/80 bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#666666]">
            {config.emptyMessage} Prueba otro filtro o{' '}
            <Link to={config.catalogLink} className="font-semibold text-[#E30613] hover:underline">
              explora todo el catálogo
            </Link>
            .
          </p>
        ) : (
          <HomeFeaturedProductsCarousel products={products} />
        )}

        {advisoryPlacement === 'bottom' ? (
          <HomeFeaturedAdvisoryRow
            className="mt-5 sm:mt-6"
            message={config.advisoryMessage}
            campaign={config.whatsAppCampaign}
            description={config.whatsAppDescription}
          />
        ) : null}
      </div>
    </section>
  );
}
