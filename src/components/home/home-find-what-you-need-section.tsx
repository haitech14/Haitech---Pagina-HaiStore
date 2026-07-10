import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  homeCategoryChipClassName,
  HomeCategoryChipContent,
} from '@/components/home/home-category-chip';
import { HomeLandingProductCard } from '@/components/home/home-landing-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import {
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  HOME_FEATURED_CONSUMABLES_DEFAULT_CATEGORY,
  HOME_FEATURED_CONSUMABLES_DEFAULT_CONDITION,
  type HomeFeaturedConsumablesCategoryFilterId,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import {
  HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS,
  HOME_FEATURED_EQUIPMENT_DEFAULT_CONDITION,
  type HomeFeaturedEquipmentCategoryFilterId,
  type HomeFeaturedEquipmentConditionFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import {
  HOME_FIND_CATALOG_LINKS,
  HOME_FIND_CONSUMABLES_CATEGORIES,
  HOME_FIND_DEFAULT_TAB,
  HOME_FIND_EQUIPMENT_CATEGORIES,
  HOME_FIND_MAIN_TABS,
  HOME_FIND_PRODUCT_DISPLAY_LIMIT,
  HOME_FIND_SECTION_TITLE,
  HOME_FIND_SPARE_PARTS_CATEGORIES,
  HOME_FIND_VISIBLE_CATEGORY_LIMIT,
  type HomeFindConsumablesCategoryId,
  type HomeFindEquipmentCategoryId,
  type HomeFindMainTabId,
  type HomeFindSparePartsCategoryId,
  type HomeFindSparePartsFilterId,
} from '@/data/home-find-what-you-need';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { catalogRowToFeatured, getCatalogRows } from '@/lib/catalog-featured';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  compareHomeFeaturedConsumablesProducts,
  compareHomeFeaturedEquipmentProducts,
  isHomeFeaturedConsumableProduct,
  isHomeFeaturedEquipmentProduct,
  matchesHomeFeaturedConsumablesCategoryFilter,
  matchesHomeFeaturedConsumablesFilters,
  matchesHomeFeaturedEquipmentFilters,
} from '@/lib/home-featured-product-filter';
import {
  compareHomeFindSparePartsProducts,
  isHomeFeaturedSparePartsProduct,
  matchesHomeFindSparePartsFilters,
} from '@/lib/home-spare-parts-product-filter';
import {
  resolveHomeFindConsumablesCategoryImage,
  resolveHomeFindEquipmentCategoryImage,
  resolveHomeFindSparePartsCategoryIcon,
  resolveHomeFindSparePartsCategoryImage,
} from '@/lib/home-find-category-visuals';
import { productToFeatured } from '@/lib/store-products';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const FEATURED_POOL_LIMIT = 64;

const PRODUCTS_CAROUSEL_GAP = 'gap-3 sm:gap-3.5 xl:gap-4';
const PRODUCT_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/1.8)] md:flex-[0_0_calc((100%-1.75rem)/3)] lg:flex-[0_0_calc((100%-3.5rem)/5)] xl:flex-[0_0_calc((100%-4rem)/5)]';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-[0_2px_8px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

const EQUIPMENT_SECTION_IDS = new Set(['multifuncionales', 'impresoras']);
const CONSUMABLES_SECTION_IDS = new Set(['toner-suministros']);
const SPARE_PARTS_SECTION_IDS = new Set(['repuestos']);

const SPARE_PARTS_FILTERS: ReadonlyArray<{ id: HomeFindSparePartsFilterId; label: string }> = [
  { id: 'originales', label: 'Originales' },
  { id: 'compatibles', label: 'Compatibles' },
  { id: 'disponibles', label: 'Disponibles' },
  { id: 'a-pedido', label: 'A pedido' },
];

function matchesHomeFindConsumablesCategory(
  product: FeaturedProduct,
  categoryId: HomeFindConsumablesCategoryId,
): boolean {
  if (!isHomeFeaturedConsumableProduct(product) || isHomeFeaturedSparePartsProduct(product)) {
    return false;
  }

  return matchesHomeFeaturedConsumablesCategoryFilter(
    product,
    categoryId as HomeFeaturedConsumablesCategoryFilterId,
  );
}

function matchesHomeFindConsumablesFilters(
  product: FeaturedProduct,
  conditionFilter: HomeFeaturedConsumablesConditionFilterId,
  categoryFilter: HomeFindConsumablesCategoryId,
): boolean {
  if (!matchesHomeFindConsumablesCategory(product, categoryFilter)) return false;

  return matchesHomeFeaturedConsumablesFilters(
    product,
    conditionFilter,
    categoryFilter as HomeFeaturedConsumablesCategoryFilterId,
  );
}

function HomeFindProductsSkeleton() {
  return (
    <div className="overflow-hidden">
      <ul className={cn('flex', PRODUCTS_CAROUSEL_GAP)} role="list">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className={PRODUCT_SLIDE_CLASS}>
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

function HomeFindProductsCarousel({ products }: { products: FeaturedProduct[] }) {
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
            className={cn(carouselArrowClass, 'left-0')}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(carouselArrowClass, 'right-0')}
            aria-label="Productos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', PRODUCTS_CAROUSEL_GAP)} role="list">
          {products.map((product) => (
            <li key={product.id} className={cn(PRODUCT_SLIDE_CLASS, 'flex')}>
              <HomeLandingProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HomeFindFilterPills<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  ariaLabel,
  className,
}: {
  filters: ReadonlyArray<{ id: T; label: string }>;
  activeFilter: T;
  onFilterChange: (filterId: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div
        className="flex flex-wrap justify-center gap-1 sm:gap-1.5"
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
                'inline-flex shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 sm:py-1.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
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

function HomeFindCategoryPills<T extends string>({
  categories,
  activeCategory,
  onCategoryChange,
  allCategoriesHref,
  ariaLabel,
  resolveImage,
  resolveIcon,
}: {
  categories: ReadonlyArray<{ id: T; label: string }>;
  activeCategory: T;
  onCategoryChange: (categoryId: T) => void;
  allCategoriesHref: string;
  ariaLabel: string;
  resolveImage?: (categoryId: T) => string | undefined;
  resolveIcon?: (categoryId: T) => LucideIcon | undefined;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, HOME_FIND_VISIBLE_CATEGORY_LIMIT);

  const hasHiddenCategories = categories.length > HOME_FIND_VISIBLE_CATEGORY_LIMIT;

  return (
    <div className="mb-3 flex w-full justify-center overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-4 [&::-webkit-scrollbar]:hidden">
      <div
        className="flex flex-wrap justify-center gap-2 sm:gap-3"
        role="tablist"
        aria-label={ariaLabel}
      >
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const imageSrc = resolveImage?.(category.id);
          const Icon = !imageSrc ? resolveIcon?.(category.id) : undefined;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={homeCategoryChipClassName({
                layout: 'vertical',
                size: 'lg',
                isActive,
              })}
              onClick={() => onCategoryChange(category.id)}
            >
              <HomeCategoryChipContent
                icon={Icon}
                imageSrc={imageSrc}
                label={category.label}
                layout="vertical"
                size="lg"
                isActive={isActive}
              />
            </button>
          );
        })}

        {hasHiddenCategories && !showAllCategories ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-dashed border-[#E30613]/50 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#E30613] transition-colors hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:px-3 sm:py-2"
            onClick={() => setShowAllCategories(true)}
          >
            Ver todas las categorías
          </button>
        ) : null}

        {hasHiddenCategories && showAllCategories ? (
          <Link
            to={allCategoriesHref}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#E30613]/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#E30613] transition-colors hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:px-3 sm:py-2"
          >
            Ver catálogo completo
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function HomeFindMainTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: HomeFindMainTabId;
  onTabChange: (tabId: HomeFindMainTabId) => void;
}) {
  return (
    <div
      className="mb-4 flex flex-wrap justify-center gap-1.5 sm:mb-5 sm:gap-2"
      role="tablist"
      aria-label="Explorar por tipo de producto"
    >
      {HOME_FIND_MAIN_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-xs font-bold transition-colors sm:min-h-10 sm:px-5 sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              isActive
                ? 'border-[#E30613] bg-[#E30613] text-white shadow-[0_4px_14px_rgba(227,6,19,0.25)]'
                : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function HomeFindCatalogLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      to={href}
      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 text-sm font-semibold text-[#E30613] transition-colors hover:text-[#ff4d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {label}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

export function HomeFindWhatYouNeedSection() {
  const { data: catalogBundle, isLoading } = useHomeCatalogBundle();
  const [activeTab, setActiveTab] = useState<HomeFindMainTabId>(HOME_FIND_DEFAULT_TAB);
  const [activeEquipmentCategory, setActiveEquipmentCategory] =
    useState<HomeFindEquipmentCategoryId>('multifuncionales');
  const [activeEquipmentCondition, setActiveEquipmentCondition] =
    useState<HomeFeaturedEquipmentConditionFilterId>(HOME_FEATURED_EQUIPMENT_DEFAULT_CONDITION);
  const [activeConsumablesCategory, setActiveConsumablesCategory] =
    useState<HomeFindConsumablesCategoryId>(
      HOME_FEATURED_CONSUMABLES_DEFAULT_CATEGORY as HomeFindConsumablesCategoryId,
    );
  const [activeConsumablesCondition, setActiveConsumablesCondition] =
    useState<HomeFeaturedConsumablesConditionFilterId>(HOME_FEATURED_CONSUMABLES_DEFAULT_CONDITION);
  const [activeSparePartsCategory, setActiveSparePartsCategory] =
    useState<HomeFindSparePartsCategoryId>('kit-mantenimiento');
  const [activeSparePartsFilter, setActiveSparePartsFilter] =
    useState<HomeFindSparePartsFilterId>('originales');

  const handleTabChange = useCallback((tabId: HomeFindMainTabId) => {
    setActiveTab(tabId);
  }, []);

  const productPool = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seen = new Set<string>();

    const sectionIds =
      activeTab === 'equipos'
        ? EQUIPMENT_SECTION_IDS
        : activeTab === 'consumibles'
          ? CONSUMABLES_SECTION_IDS
          : SPARE_PARTS_SECTION_IDS;

    const isPoolProduct = (item: FeaturedProduct) => {
      if (activeTab === 'equipos') return isHomeFeaturedEquipmentProduct(item);
      if (activeTab === 'consumibles') {
        return isHomeFeaturedConsumableProduct(item) && !isHomeFeaturedSparePartsProduct(item);
      }
      return isHomeFeaturedSparePartsProduct(item);
    };

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= FEATURED_POOL_LIMIT) return;
      const enriched = enrichFeaturedFromCatalog(item);
      if (!isPoolProduct(enriched)) return;
      seen.add(item.id);
      merged.push(enriched);
    };

    for (const product of catalogBundle?.featured ?? []) {
      pushUnique(productToFeatured(product));
    }

    for (const section of catalogBundle?.sections ?? []) {
      if (!sectionIds.has(section.id)) continue;
      for (const products of Object.values(section.productsByCondition)) {
        for (const item of products) {
          pushUnique(item);
        }
      }
    }

    for (const row of getCatalogRows()) {
      const publicPrice = row.prices?.public ?? 0;
      if (publicPrice <= 0) continue;
      if (activeTab !== 'repuestos' && row.stock <= 0) continue;
      pushUnique(catalogRowToFeatured(row));
    }

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    return merged;
  }, [activeTab, catalogBundle]);

  const products = useMemo(() => {
    if (activeTab === 'equipos') {
      return productPool
        .filter((product) =>
          matchesHomeFeaturedEquipmentFilters(
            product,
            activeEquipmentCondition,
            activeEquipmentCategory as HomeFeaturedEquipmentCategoryFilterId,
          ),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, HOME_FIND_PRODUCT_DISPLAY_LIMIT);
    }

    if (activeTab === 'consumibles') {
      return productPool
        .filter((product) =>
          matchesHomeFindConsumablesFilters(
            product,
            activeConsumablesCondition,
            activeConsumablesCategory,
          ),
        )
        .sort(compareHomeFeaturedConsumablesProducts)
        .slice(0, HOME_FIND_PRODUCT_DISPLAY_LIMIT);
    }

    return productPool
      .filter((product) =>
        matchesHomeFindSparePartsFilters(
          product,
          activeSparePartsFilter,
          activeSparePartsCategory,
        ),
      )
      .sort(compareHomeFindSparePartsProducts)
      .slice(0, HOME_FIND_PRODUCT_DISPLAY_LIMIT);
  }, [
    activeConsumablesCategory,
    activeConsumablesCondition,
    activeEquipmentCategory,
    activeEquipmentCondition,
    activeSparePartsCategory,
    activeSparePartsFilter,
    activeTab,
    productPool,
  ]);

  const catalogLink = HOME_FIND_CATALOG_LINKS[activeTab];
  const emptyMessage =
    activeTab === 'equipos'
      ? 'No hay equipos en esta selección por ahora.'
      : activeTab === 'consumibles'
        ? 'No hay consumibles en esta selección por ahora.'
        : 'No hay repuestos en esta selección por ahora.';

  return (
    <section aria-labelledby="home-find-what-you-need-title" className="home-landing-sans bg-white">
      <div className="container pb-6 pt-4 sm:pb-8 sm:pt-5">
        <h2
          id="home-find-what-you-need-title"
          className="home-section-title mb-4 text-center text-xl font-bold tracking-tight text-[#111111] sm:mb-5 sm:text-2xl lg:text-[1.75rem] lg:leading-none"
        >
          {HOME_FIND_SECTION_TITLE}
        </h2>

        <HomeFindMainTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'equipos' ? (
          <>
            <HomeFindCategoryPills
              categories={HOME_FIND_EQUIPMENT_CATEGORIES}
              activeCategory={activeEquipmentCategory}
              onCategoryChange={setActiveEquipmentCategory}
              allCategoriesHref={catalogLink.allCategoriesHref}
              ariaLabel="Categorías de equipos"
              resolveImage={resolveHomeFindEquipmentCategoryImage}
            />
            <HomeFindFilterPills
              filters={HOME_FEATURED_EQUIPMENT_CONDITION_FILTERS}
              activeFilter={activeEquipmentCondition}
              onFilterChange={setActiveEquipmentCondition}
              ariaLabel="Condición de equipos"
              className="mb-4 justify-center sm:mb-5"
            />
          </>
        ) : null}

        {activeTab === 'consumibles' ? (
          <>
            <HomeFindCategoryPills
              categories={HOME_FIND_CONSUMABLES_CATEGORIES}
              activeCategory={activeConsumablesCategory}
              onCategoryChange={setActiveConsumablesCategory}
              allCategoriesHref={catalogLink.allCategoriesHref}
              ariaLabel="Categorías de consumibles"
              resolveImage={resolveHomeFindConsumablesCategoryImage}
            />
            <HomeFindFilterPills
              filters={HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS}
              activeFilter={activeConsumablesCondition}
              onFilterChange={setActiveConsumablesCondition}
              ariaLabel="Tipo de consumibles"
              className="mb-4 justify-center sm:mb-5"
            />
          </>
        ) : null}

        {activeTab === 'repuestos' ? (
          <>
            <HomeFindCategoryPills
              categories={HOME_FIND_SPARE_PARTS_CATEGORIES}
              activeCategory={activeSparePartsCategory}
              onCategoryChange={setActiveSparePartsCategory}
              allCategoriesHref={catalogLink.allCategoriesHref}
              ariaLabel="Categorías de repuestos"
              resolveImage={resolveHomeFindSparePartsCategoryImage}
              resolveIcon={resolveHomeFindSparePartsCategoryIcon}
            />
            <HomeFindFilterPills
              filters={SPARE_PARTS_FILTERS}
              activeFilter={activeSparePartsFilter}
              onFilterChange={setActiveSparePartsFilter}
              ariaLabel="Filtros de repuestos"
              className="mb-4 justify-center sm:mb-5"
            />
          </>
        ) : null}

        {isLoading && products.length === 0 ? (
          <HomeFindProductsSkeleton />
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/80 bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#666666]">
            {emptyMessage}{' '}
            <Link to={catalogLink.href} className="font-semibold text-[#E30613] hover:underline">
              Explorar catálogo
            </Link>
            .
          </p>
        ) : (
          <HomeFindProductsCarousel products={products} />
        )}

        <div className="mt-4 flex justify-end sm:mt-5">
          <HomeFindCatalogLink href={catalogLink.href} label={catalogLink.label} />
        </div>
      </div>
    </section>
  );
}
