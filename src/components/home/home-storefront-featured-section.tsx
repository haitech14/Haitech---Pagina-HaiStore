import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { type StorefrontCardTitleMode } from '@/components/home/home-storefront-product-card';
import { StoreCatalogProductCard } from '@/components/store-storefront/store-catalog-product-card';
import { LazyHomeSection } from '@/components/home/lazy-home-section';
import { Skeleton } from '@/components/ui/skeleton';
import { featuredToProduct, type FeaturedProduct } from '@/data/featured-products';
import {
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  HAITECH_SHOP_LATEST_PRODUCTS,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import {
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  type HomeFeaturedConsumablesCategoryFilterId,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import type { HomeFeaturedEquipmentConditionFilterId } from '@/data/home-featured-quick-filters-equipment';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import {
  HAITECH_PRODUCT_CAROUSEL_ARROW,
  HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT,
  HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT,
  HAITECH_PRODUCT_CAROUSEL_GAP,
  HAITECH_PRODUCT_CAROUSEL_SLIDE,
} from '@/lib/haitech-product-carousel-layout';
import {
  catalogRowToFeatured,
  getCatalogActiveRows,
  isCatalogIndexLoaded,
  loadCatalogIndex,
  type CatalogRow,
} from '@/lib/catalog-featured';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  compareHomeFeaturedConsumablesProducts,
  compareHomeFeaturedEquipmentProducts,
  matchesHomeFeaturedConsumablesCategoryFilter,
  matchesHomeFeaturedConsumablesFilters,
  matchesHomeFeaturedEquipmentCategoryFilter,
  matchesHomeFeaturedEquipmentConditionFilter,
} from '@/lib/home-featured-product-filter';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import { categoryLandingPath } from '@/lib/category-path';
import { productToFeatured } from '@/lib/store-products';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import { cn } from '@/lib/utils';

const STOREFRONT_FEATURED_DISPLAY_LIMIT = 15;
/** Pool desde home-bundle + candidatos del índice (no bloquear UI por el JSON completo). */
const STOREFRONT_FEATURED_POOL_LIMIT = 2000;

function normalizeStorefrontHaystack(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Evita meter ~todo el inventario en el pool: solo filas útiles para los rails. */
function isStorefrontCatalogCandidate(row: CatalogRow): boolean {
  if (isTonerOrRepuestosCategory(row.category)) return true;
  const haystack = normalizeStorefrontHaystack(`${row.category ?? ''} ${row.name}`);
  return (
    haystack.includes('multifunc') ||
    haystack.includes('fotocop') ||
    haystack.includes('toner') ||
    haystack.includes('cartucho') ||
    haystack.includes('repuesto') ||
    haystack.includes('cilindro') ||
    haystack.includes('fusor') ||
    haystack.includes('unidad de imagen') ||
    haystack.includes('unidad fusora') ||
    haystack.includes('laptop') ||
    haystack.includes('optiplex') ||
    haystack.includes('computadora') ||
    haystack.includes('monitor') ||
    haystack.includes('plotter') ||
    haystack.includes('accesorio') ||
    haystack.includes('mueble') ||
    haystack.includes('casetera')
  );
}

const STOREFRONT_EQUIPMENT_CONDITION_TABS: ReadonlyArray<{
  id: HomeFeaturedEquipmentConditionFilterId;
  label: string;
}> = [
  { id: 'nuevas', label: 'Nueva' },
  { id: 'seminuevas', label: 'Seminueva' },
  { id: 'remanufacturadas', label: 'Remanufacturada' },
];

type StorefrontCatalogKind = 'multifuncionales' | 'toner' | 'repuestos';

const STOREFRONT_CATALOG_RAILS: ReadonlyArray<{
  kind: StorefrontCatalogKind;
  titleId: string;
  title: string;
  paginationLabel: string;
  viewAllHref: string;
  viewAllLabel: string;
}> = [
  {
    kind: 'multifuncionales',
    titleId: 'home-storefront-featured-title',
    title: 'Multifuncionales',
    paginationLabel: 'multifuncionales',
    viewAllHref: storeShowcasePath({ categoryId: 'multifuncionales' }),
    viewAllLabel: 'Ver todos los multifuncionales',
  },
  {
    kind: 'toner',
    titleId: 'home-storefront-toner-title',
    title: 'Tóner',
    paginationLabel: 'tóner',
    viewAllHref: categoryLandingPath('toner-suministros'),
    viewAllLabel: 'Ver todo el tóner',
  },
  {
    kind: 'repuestos',
    titleId: 'home-storefront-repuestos-title',
    title: 'Repuestos',
    paginationLabel: 'repuestos',
    viewAllHref: categoryLandingPath('repuestos'),
    viewAllLabel: 'Ver todos los repuestos',
  },
];

const STOREFRONT_CONSUMABLE_CONDITION_TABS = HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS.filter(
  (filter) => filter.id !== 'recargas',
);

function shopProductToFeatured(product: HaitechShopProduct): FeaturedProduct {
  const category = product.toner
    ? 'Toner y Suministros'
    : /repuesto|unidad de imagen|cilindro|fusor|rodillo/i.test(product.name) ||
        product.href?.includes('/categoria/repuestos')
      ? 'Repuestos'
      : 'Multifuncionales';

  return {
    id: product.id,
    name: product.name,
    category,
    ...(product.brand ? { brand: product.brand } : {}),
    ...(product.code ? { code: product.code } : {}),
    price: product.price,
    ...(product.compareAt != null && product.compareAt > product.price
      ? { oldPrice: product.compareAt }
      : {}),
    image: product.image,
    ...(product.stock != null ? { stock: product.stock } : {}),
    rating: product.rating ?? 5,
    reviews: product.reviewCount ?? 0,
  };
}

function shopConsumableFallbackProducts(): FeaturedProduct[] {
  return [...HAITECH_SHOP_FAVORITE_PRODUCTS, ...HAITECH_SHOP_LATEST_PRODUCTS]
    .filter((product) => Boolean(product.toner) || product.tabIds.includes('toner') || product.tabIds.includes('accesorios'))
    .map(shopProductToFeatured);
}

function matchesFotocopiadorasSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'multifuncionales');
}

function matchesFotocopiadorasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'multifuncionales',
  );
}

function pickConsumableRailProducts(
  productPool: readonly FeaturedProduct[],
  categoryFilter: HomeFeaturedConsumablesCategoryFilterId,
  condition: HomeFeaturedConsumablesConditionFilterId,
): FeaturedProduct[] {
  const filtered = productPool
    .filter((product) => matchesHomeFeaturedConsumablesFilters(product, condition, categoryFilter))
    .sort(compareHomeFeaturedConsumablesProducts);

  if (filtered.length > 0) {
    return filtered.slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
  }

  return [...productPool]
    .filter((product) => matchesHomeFeaturedConsumablesCategoryFilter(product, categoryFilter))
    .sort(compareHomeFeaturedConsumablesProducts)
    .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
}

function FeaturedSkeleton() {
  return (
    <ul className={cn('flex', HAITECH_PRODUCT_CAROUSEL_GAP)} role="list">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className={HAITECH_PRODUCT_CAROUSEL_SLIDE}>
          <div className="rounded-2xl border border-[#E8E8E8] bg-white p-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.08)]">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="mt-2 h-2.5 w-12" />
            <Skeleton className="mt-1.5 h-3 w-full" />
            <Skeleton className="mt-1.5 h-2.5 w-10" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StorefrontFilterTabs<T extends string>({
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
        'flex max-w-full justify-end overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div className="flex gap-1 sm:gap-1.5" role="tablist" aria-label={ariaLabel}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors sm:px-3.5 sm:py-1.5 sm:text-sm',
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

function FeaturedProductsCarousel({
  products,
  paginationLabel,
  eagerImageCount = 0,
}: {
  products: FeaturedProduct[];
  paginationLabel: string;
  titleMode?: StorefrontCardTitleMode;
  /** Solo el primer rail debería pasar 2–3 para LCP de cards. */
  eagerImageCount?: number;
}) {
  const slides = useMemo(() => {
    const seen = new Set<string>();
    const unique: Array<{ product: FeaturedProduct; storeProduct: ReturnType<typeof featuredToProduct> }> =
      [];
    for (const product of products) {
      const storeProduct = featuredToProduct(product);
      if (seen.has(storeProduct.id)) continue;
      seen.add(storeProduct.id);
      unique.push({ product, storeProduct });
    }
    return unique;
  }, [products]);
  const productIdsKey = slides.map((slide) => slide.storeProduct.id).join('|');
  const showNav = slides.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: true,
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

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
    emblaApi.reInit({ slidesToScroll: 1 });
    emblaApi.scrollTo(0);
    setAutoplayPaused(false);
  }, [emblaApi, productIdsKey]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, slides.length]);

  return (
    <div
      className="relative"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      {showNav ? (
        <>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT)}
            aria-label={`Anterior: ${paginationLabel}`}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT)}
            aria-label={`Siguiente: ${paginationLabel}`}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', HAITECH_PRODUCT_CAROUSEL_GAP)} role="list">
          {slides.map(({ storeProduct }, index) => (
            <li key={storeProduct.id} className={HAITECH_PRODUCT_CAROUSEL_SLIDE}>
              <StoreCatalogProductCard
                product={storeProduct}
                variant="carousel"
                imageLoading={index < eagerImageCount ? 'eager' : 'lazy'}
                imagePriority={index < eagerImageCount}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StorefrontCatalogRail({
  rail,
  productPool,
  isLoading,
  eagerImageCount = 0,
}: {
  rail: (typeof STOREFRONT_CATALOG_RAILS)[number];
  productPool: FeaturedProduct[];
  isLoading: boolean;
  eagerImageCount?: number;
}) {
  const [equipmentCondition, setEquipmentCondition] =
    useState<HomeFeaturedEquipmentConditionFilterId>('nuevas');
  const [consumableCondition, setConsumableCondition] =
    useState<HomeFeaturedConsumablesConditionFilterId>('originales');

  const isConsumableRail = rail.kind === 'toner' || rail.kind === 'repuestos';

  const products = useMemo(() => {
    if (rail.kind === 'toner') {
      return pickConsumableRailProducts(productPool, 'toner', consumableCondition);
    }

    if (rail.kind === 'repuestos') {
      return pickConsumableRailProducts(productPool, 'repuestos-cat', consumableCondition);
    }

    return [...productPool]
      .filter(
        (product) =>
          matchesFotocopiadorasSection(product) &&
          matchesFotocopiadorasCondition(product, equipmentCondition),
      )
      .sort(compareHomeFeaturedEquipmentProducts)
      .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
  }, [consumableCondition, equipmentCondition, productPool, rail.kind]);

  const titleMode: StorefrontCardTitleMode = isConsumableRail ? 'consumable' : 'equipment';

  const showSkeleton = isLoading && products.length === 0;

  return (
    <section aria-labelledby={rail.titleId} className="bg-[#F5F5F5]">
      <div className="container py-4 sm:py-5 lg:py-6">
        <header className="mb-3 flex flex-col gap-2 sm:mb-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h2
              id={rail.titleId}
              className="min-w-0 shrink text-left text-base font-bold tracking-tight text-[#111111] sm:text-xl lg:text-[1.375rem]"
            >
              {rail.title}
            </h2>
            <Link
              to={rail.viewAllHref}
              className="shrink-0 text-xs font-semibold text-[#E30613] transition-colors hover:text-[#C10510] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:text-sm"
            >
              Ver todos
              <span className="sr-only">: {rail.viewAllLabel}</span>
            </Link>
          </div>
          {isConsumableRail ? (
            <StorefrontFilterTabs
              filters={STOREFRONT_CONSUMABLE_CONDITION_TABS}
              activeFilter={consumableCondition}
              onFilterChange={setConsumableCondition}
              ariaLabel={`Origen de ${rail.paginationLabel}`}
              className="sm:ml-auto"
            />
          ) : (
            <StorefrontFilterTabs
              filters={STOREFRONT_EQUIPMENT_CONDITION_TABS}
              activeFilter={equipmentCondition}
              onFilterChange={setEquipmentCondition}
              ariaLabel="Condición de equipos"
              className="sm:ml-auto"
            />
          )}
        </header>

        {showSkeleton ? (
          <FeaturedSkeleton />
        ) : products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#D9DEE7] bg-white px-4 py-7 text-center text-sm text-[#666666]">
            No hay productos para este filtro.
          </p>
        ) : (
          <FeaturedProductsCarousel
            products={products}
            paginationLabel={rail.paginationLabel}
            titleMode={titleMode}
            eagerImageCount={eagerImageCount}
          />
        )}
      </div>
    </section>
  );
}

export function HomeStorefrontFeaturedSection() {
  const { data: catalogBundle, isLoading: bundleLoading } = useHomeCatalogBundle();
  const [catalogReady, setCatalogReady] = useState(() => isCatalogIndexLoaded());

  useEffect(() => {
    if (catalogReady) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const run = () => {
      void loadCatalogIndex()
        .then(() => {
          if (!cancelled) startTransition(() => setCatalogReady(true));
        })
        .catch(() => {
          if (!cancelled) startTransition(() => setCatalogReady(true));
        });
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 1_500 });
    } else {
      timeoutId = window.setTimeout(run, 800);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [catalogReady]);

  const productPool = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (merged.length >= STOREFRONT_FEATURED_POOL_LIMIT) return;
      const next = catalogReady ? enrichFeaturedFromCatalog(item) : item;
      if (seenIds.has(item.id) || seenIds.has(next.id)) return;
      const code = next.code?.trim().toUpperCase() || item.code?.trim().toUpperCase();
      if (code && seenCodes.has(code)) return;
      seenIds.add(item.id);
      seenIds.add(next.id);
      if (code) seenCodes.add(code);
      merged.push(next);
    };

    for (const product of catalogBundle?.featured ?? []) {
      pushUnique(productToFeatured(product));
    }

    for (const section of catalogBundle?.sections ?? []) {
      for (const products of Object.values(section.productsByCondition)) {
        for (const item of products) {
          pushUnique(item);
        }
      }
    }

    // Curados primero (p. ej. unidad de imagen), luego el índice activo.
    for (const product of shopConsumableFallbackProducts()) {
      pushUnique(product);
    }

    if (catalogReady) {
      // Incluye tóner/repuestos activos (ocultos de /tienda pero visibles en rails home).
      for (const row of getCatalogActiveRows()) {
        if (!isStorefrontCatalogCandidate(row)) continue;
        pushUnique(catalogRowToFeatured(row));
      }
    }

    return merged;
  }, [catalogBundle?.featured, catalogBundle?.sections, catalogReady]);

  const isLoading = bundleLoading && !catalogBundle;

  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      {STOREFRONT_CATALOG_RAILS.map((rail, index) => {
        const railBlock = (
          <StorefrontCatalogRail
            rail={rail}
            productPool={productPool}
            isLoading={isLoading}
            eagerImageCount={index === 0 ? 3 : 0}
          />
        );

        if (index === 0) {
          return <div key={rail.kind}>{railBlock}</div>;
        }

        return (
          <LazyHomeSection key={rail.kind} minHeight="520px" className="bg-[#F5F5F5]">
            {railBlock}
          </LazyHomeSection>
        );
      })}
    </div>
  );
}
