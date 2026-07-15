import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { HomeEquipmentCategoryCarousel } from '@/components/home/home-equipment-category-carousel';
import { HomeLandingProductCard } from '@/components/home/home-landing-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import {
  HOME_EQUIPMENT_DEFAULT_SUBCATEGORY,
  getHomeEquipmentSubcategories,
  homeEquipmentSubcategoriesVisible,
  type HomeEquipmentSubcategory,
  type HomeEquipmentSubcategoryId,
} from '@/data/home-equipment-category-subcategories';
import {
  HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS,
  HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
  type HomeFeaturedEquipmentCategoryFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { catalogRowToFeatured, getCatalogRows } from '@/lib/catalog-featured';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  compareHomeFeaturedEquipmentProducts,
  isHomeFeaturedEquipmentProduct,
  matchesHomeFeaturedEquipmentCategoryFilter,
  matchesHomeFeaturedEquipmentConditionFilter,
} from '@/lib/home-featured-product-filter';
import { homeEquipmentCategoryLandingPath } from '@/lib/home-equipment-category-links';
import { productToFeatured } from '@/lib/store-products';
import { cn } from '@/lib/utils';

const EQUIPMENT_SECTION_IDS = new Set(['multifuncionales', 'impresoras']);
const FEATURED_DISPLAY_LIMIT = 12;
const FEATURED_POOL_LIMIT = 64;

const PRODUCTS_CAROUSEL_GAP = 'gap-3 sm:gap-3.5 xl:gap-4';
/** ~1.8 móvil · 3 md · 5 lg/xl visibles por vista */
const PRODUCT_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/1.8)] md:flex-[0_0_calc((100%-1.75rem)/3)] lg:flex-[0_0_calc((100%-3.5rem)/5)] xl:flex-[0_0_calc((100%-4rem)/5)]';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-[0_2px_8px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

function matchesHomeEquipmentExplorerFilters(
  product: FeaturedProduct,
  categoryId: HomeFeaturedEquipmentCategoryFilterId,
  subcategoryId: HomeEquipmentSubcategoryId,
): boolean {
  if (!matchesHomeFeaturedEquipmentCategoryFilter(product, categoryId)) return false;

  return matchesHomeFeaturedEquipmentConditionFilter(product, subcategoryId, categoryId);
}

function HomeEquipmentProductsSkeleton() {
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

function HomeEquipmentProductsCarousel({ products }: { products: FeaturedProduct[] }) {
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

function HomeEquipmentSubcategoryPills({
  subcategories,
  activeSubcategory,
  onSubcategoryChange,
  storeLinkHref,
  storeLinkLabel,
}: {
  subcategories: HomeEquipmentSubcategory[];
  activeSubcategory: HomeEquipmentSubcategoryId;
  onSubcategoryChange: (subcategoryId: HomeEquipmentSubcategoryId) => void;
  storeLinkHref?: string;
  storeLinkLabel?: string;
}) {
  const hasStoreLink = Boolean(storeLinkHref && storeLinkLabel);
  const scrollClass =
    'overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  const pills = (
    <div
      className="flex flex-wrap justify-center gap-1 sm:gap-1.5"
      role="tablist"
      aria-label="Subcategorías de equipos"
    >
      {subcategories.map((subcategory) => {
        const isActive = activeSubcategory === subcategory.id;
        return (
          <button
            key={subcategory.id}
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
            onClick={() => onSubcategoryChange(subcategory.id)}
          >
            {subcategory.label}
          </button>
        );
      })}
    </div>
  );

  if (!hasStoreLink) {
    return (
      <div className={cn('mb-4 flex justify-center sm:mb-5', scrollClass)}>{pills}</div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-1 items-center gap-y-2 sm:mb-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-4">
      <span className="hidden sm:block" aria-hidden="true" />
      <div className={cn('col-span-full sm:col-span-1 sm:col-start-2', scrollClass)}>{pills}</div>
      <Link
        to={storeLinkHref!}
        className="col-span-full shrink-0 justify-self-end text-right text-xs font-semibold text-[#E30613] transition-colors hover:text-[#ff4d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:col-span-1 sm:col-start-3 sm:w-auto sm:text-sm"
      >
        Ver {storeLinkLabel} en tienda →
      </Link>
    </div>
  );
}

export function HomeEquipmentCategoryExplorer() {
  const { data: catalogBundle, isLoading } = useHomeCatalogBundle();
  const [activeCategory, setActiveCategory] = useState<HomeFeaturedEquipmentCategoryFilterId>(
    HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
  );
  const [activeSubcategory, setActiveSubcategory] =
    useState<HomeEquipmentSubcategoryId>(HOME_EQUIPMENT_DEFAULT_SUBCATEGORY);

  const subcategories = useMemo(
    () => getHomeEquipmentSubcategories(activeCategory),
    [activeCategory],
  );

  const showSubcategories = homeEquipmentSubcategoriesVisible(activeCategory);

  const handleCategoryChange = useCallback(
    (categoryId: HomeFeaturedEquipmentCategoryFilterId) => {
      setActiveCategory(categoryId);
      setActiveSubcategory(HOME_EQUIPMENT_DEFAULT_SUBCATEGORY);
    },
    [],
  );

  const productPool = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seen = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= FEATURED_POOL_LIMIT) return;
      const enriched = enrichFeaturedFromCatalog(item);
      if (!isHomeFeaturedEquipmentProduct(enriched)) return;
      seen.add(item.id);
      merged.push(enriched);
    };

    for (const product of catalogBundle?.featured ?? []) {
      pushUnique(productToFeatured(product));
    }

    for (const section of catalogBundle?.sections ?? []) {
      if (!EQUIPMENT_SECTION_IDS.has(section.id)) continue;
      for (const products of Object.values(section.productsByCondition)) {
        for (const item of products) {
          pushUnique(item);
        }
      }
    }

    for (const row of getCatalogRows()) {
      const publicPrice = row.prices?.public ?? 0;
      // Incluye stock 0 («A pedido»); getCatalogRows ya excluye borrador/inactiva.
      if (publicPrice <= 0) continue;
      pushUnique(catalogRowToFeatured(row));
    }

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    return merged;
  }, [catalogBundle]);

  const products = useMemo(() => {
    return productPool
      .filter((product) =>
        matchesHomeEquipmentExplorerFilters(product, activeCategory, activeSubcategory),
      )
      .sort(compareHomeFeaturedEquipmentProducts)
      .slice(0, FEATURED_DISPLAY_LIMIT);
  }, [activeCategory, activeSubcategory, productPool]);

  const categoryLabel =
    HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS.find((filter) => filter.id === activeCategory)
      ?.label ?? 'equipos';

  const activeSubcategoryDef = subcategories.find(
    (subcategory) => subcategory.id === activeSubcategory,
  );

  return (
    <div>
      <HomeEquipmentCategoryCarousel
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        className="mb-4 sm:mb-5"
      />

      {showSubcategories ? (
        <HomeEquipmentSubcategoryPills
          subcategories={subcategories}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={setActiveSubcategory}
          storeLinkHref={activeSubcategoryDef?.href}
          storeLinkLabel={activeSubcategoryDef?.label.toLowerCase()}
        />
      ) : null}

      {isLoading && products.length === 0 ? (
        <HomeEquipmentProductsSkeleton />
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#666666]">
          No hay {categoryLabel.toLowerCase()} en esta selección por ahora.{' '}
          <Link
            to={homeEquipmentCategoryLandingPath(activeCategory)}
            className="font-semibold text-[#E30613] hover:underline"
          >
            Ver catálogo completo
          </Link>
          .
        </p>
      ) : (
        <HomeEquipmentProductsCarousel products={products} />
      )}
    </div>
  );
}
