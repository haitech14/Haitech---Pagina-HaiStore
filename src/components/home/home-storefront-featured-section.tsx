import {
  startTransition,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  HomeStorefrontProductCard,
  type StorefrontCardTitleMode,
} from '@/components/home/home-storefront-product-card';
import { LazyHomeSection } from '@/components/home/lazy-home-section';
import { Skeleton } from '@/components/ui/skeleton';
import { type FeaturedProduct } from '@/data/featured-products';
import { useIsMobile } from '@/hooks/use-media-query';
import {
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import type { HomeFeaturedEquipmentConditionFilterId } from '@/data/home-featured-quick-filters-equipment';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import {
  catalogRowToFeatured,
  getCatalogRows,
  loadCatalogIndex,
  type CatalogRow,
} from '@/lib/catalog-featured';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  compareHomeFeaturedConsumablesProducts,
  compareHomeFeaturedEquipmentProducts,
  matchesHomeFeaturedConsumablesConditionFilter,
  matchesHomeFeaturedEquipmentCategoryFilter,
  matchesHomeFeaturedEquipmentConditionFilter,
} from '@/lib/home-featured-product-filter';
import { productToFeatured } from '@/lib/store-products';
import { cn } from '@/lib/utils';

const HomeEquiposHeroBanner = lazy(() =>
  import('@/components/home/home-equipos-hero-banner').then((m) => ({
    default: m.HomeEquiposHeroBanner,
  })),
);

const HomeTonerRepuestosHeroBanner = lazy(() =>
  import('@/components/home/home-toner-repuestos-hero-banner').then((m) => ({
    default: m.HomeTonerRepuestosHeroBanner,
  })),
);

const TonerPartnerBrandsSection = lazy(() =>
  import('@/components/layout/footer-brands-section').then((m) => ({
    default: m.TonerPartnerBrandsSection,
  })),
);

const FEATURED_CAROUSEL_GAP_CLASS = 'gap-2.5 sm:gap-3';
/** 2 móvil · 3 tablet · 5 desktop visibles por vista. */
const FEATURED_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.625rem)/2)] sm:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-3rem)/5)]';

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
  const haystack = normalizeStorefrontHaystack(`${row.category ?? ''} ${row.name}`);
  return (
    haystack.includes('escan') ||
    haystack.includes('scanner') ||
    haystack.includes('scansnap') ||
    haystack.includes('impresor') ||
    haystack.includes('multifunc') ||
    haystack.includes('fotocop') ||
    haystack.includes('toner') ||
    haystack.includes('tonner') ||
    haystack.includes('repuesto')
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

const STOREFRONT_CONSUMABLES_CONDITION_TABS = HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS.filter(
  (filter) => filter.id !== 'recargas',
);

type StorefrontCatalogKind =
  | 'multifuncionales'
  | 'impresoras'
  | 'impresoras-termicas'
  | 'escaneres'
  | 'toner'
  | 'repuestos';

const STOREFRONT_CATALOG_RAILS: ReadonlyArray<{
  kind: StorefrontCatalogKind;
  titleId: string;
  title: string;
  paginationLabel: string;
}> = [
  {
    kind: 'multifuncionales',
    titleId: 'home-storefront-featured-title',
    title: 'Impresora Multifuncional Laser',
    paginationLabel: 'impresoras multifuncionales',
  },
  {
    kind: 'impresoras',
    titleId: 'home-storefront-impresoras-title',
    title: 'Impresoras Láser',
    paginationLabel: 'impresoras láser',
  },
  {
    kind: 'impresoras-termicas',
    titleId: 'home-storefront-impresoras-termicas-title',
    title: 'Impresoras térmicas',
    paginationLabel: 'impresoras térmicas',
  },
  {
    kind: 'escaneres',
    titleId: 'home-storefront-escaneres-title',
    title: 'Escáneres',
    paginationLabel: 'escáneres',
  },
  {
    kind: 'toner',
    titleId: 'home-storefront-toner-title',
    title: 'Toner',
    paginationLabel: 'toner',
  },
  {
    kind: 'repuestos',
    titleId: 'home-storefront-repuestos-title',
    title: 'Repuestos',
    paginationLabel: 'repuestos',
  },
];

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

function matchesImpresorasSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-laser');
}

function matchesImpresorasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'impresora-laser',
  );
}

function matchesImpresorasTermicasSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-termica');
}

function matchesImpresorasTermicasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'impresora-termica',
  );
}

function matchesEscaneresSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'escaneres');
}

function matchesEscaneresCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(product, equipmentCondition, 'escaneres');
}

function FeaturedSkeleton() {
  return (
    <ul className={cn('flex', FEATURED_CAROUSEL_GAP_CLASS)} role="list">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className={FEATURED_SLIDE_CLASS}>
          <div className="rounded-lg bg-white p-2.5">
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
  titleMode = 'equipment',
  eagerImageCount = 0,
}: {
  products: FeaturedProduct[];
  paginationLabel: string;
  titleMode?: StorefrontCardTitleMode;
  /** Solo el primer rail debería pasar 2–3 para LCP de cards. */
  eagerImageCount?: number;
}) {
  const productIdsKey = products.map((product) => product.id).join('|');
  const isMobile = useIsMobile();
  const slidesToScroll = isMobile ? 2 : 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: true,
    slidesToScroll,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSnaps();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateSnaps);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateSnaps);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ slidesToScroll });
    emblaApi.scrollTo(0);
    setAutoplayPaused(false);
  }, [emblaApi, productIdsKey, slidesToScroll]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || products.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, products.length]);

  return (
    <div
      className="relative"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', FEATURED_CAROUSEL_GAP_CLASS)} role="list">
          {products.map((product, index) => (
            <li key={product.id} className={FEATURED_SLIDE_CLASS}>
              <HomeStorefrontProductCard
                product={product}
                priority={index < eagerImageCount}
                titleMode={titleMode}
              />
            </li>
          ))}
        </ul>
      </div>

      {scrollSnaps.length > 1 ? (
        <div
          className="mt-2.5 flex items-center justify-center gap-0.5 opacity-80 sm:mt-2.5 sm:opacity-40"
          role="tablist"
          aria-label={`Paginación de ${paginationLabel}`}
        >
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Ir al grupo ${index + 1} de ${paginationLabel}`}
              onClick={() => scrollTo(index)}
              className="flex size-4 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 sm:size-3"
            >
              <span
                className={cn(
                  'rounded-full transition-colors size-2 sm:size-1.5',
                  index === selectedIndex ? 'bg-neutral-700' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : null}
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
  const [consumablesCondition, setConsumablesCondition] =
    useState<HomeFeaturedConsumablesConditionFilterId>('originales');

  const isEquipmentRail =
    rail.kind === 'multifuncionales' ||
    rail.kind === 'impresoras' ||
    rail.kind === 'impresoras-termicas' ||
    rail.kind === 'escaneres';

  const products = useMemo(() => {
    if (rail.kind === 'multifuncionales') {
      return [...productPool]
        .filter(
          (product) =>
            matchesFotocopiadorasSection(product) &&
            matchesFotocopiadorasCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    if (rail.kind === 'impresoras') {
      return [...productPool]
        .filter(
          (product) =>
            matchesImpresorasSection(product) &&
            matchesImpresorasCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    if (rail.kind === 'impresoras-termicas') {
      return [...productPool]
        .filter(
          (product) =>
            matchesImpresorasTermicasSection(product) &&
            matchesImpresorasTermicasCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    if (rail.kind === 'escaneres') {
      return [...productPool]
        .filter(
          (product) =>
            matchesEscaneresSection(product) &&
            matchesEscaneresCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    const categoryId = rail.kind === 'toner' ? 'toner' : 'repuestos-cat';
    return [...productPool]
      .filter((product) =>
        matchesHomeFeaturedConsumablesConditionFilter(product, consumablesCondition, categoryId),
      )
      .sort(compareHomeFeaturedConsumablesProducts)
      .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
  }, [consumablesCondition, equipmentCondition, productPool, rail.kind]);

  const titleMode: StorefrontCardTitleMode =
    rail.kind === 'multifuncionales' ? 'equipment' : 'consumable';

  const showSkeleton = isLoading && products.length === 0;

  return (
    <section aria-labelledby={rail.titleId} className="pt-1 sm:pt-2">
      <div className="container pb-4 pt-3 sm:pb-7 sm:pt-5">
        <header className="mb-2.5 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2
            id={rail.titleId}
            className="min-w-0 shrink text-left text-base font-bold tracking-tight text-[#111111] sm:text-xl lg:text-[1.375rem]"
          >
            {rail.title}
          </h2>
          {isEquipmentRail ? (
            <StorefrontFilterTabs
              filters={STOREFRONT_EQUIPMENT_CONDITION_TABS}
              activeFilter={equipmentCondition}
              onFilterChange={setEquipmentCondition}
              ariaLabel="Condición de equipos"
              className="sm:ml-auto"
            />
          ) : (
            <StorefrontFilterTabs
              filters={STOREFRONT_CONSUMABLES_CONDITION_TABS}
              activeFilter={consumablesCondition}
              onFilterChange={setConsumablesCondition}
              ariaLabel={rail.kind === 'toner' ? 'Tipo de toner' : 'Tipo de repuesto'}
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
  const [catalogReady, setCatalogReady] = useState(() => getCatalogRows().length > 0);

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
      idleId = window.requestIdleCallback(run, { timeout: 12_000 });
    } else {
      timeoutId = window.setTimeout(run, 5000);
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
    const seen = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= STOREFRONT_FEATURED_POOL_LIMIT) return;
      seen.add(item.id);
      merged.push(catalogReady ? enrichFeaturedFromCatalog(item) : item);
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

    if (catalogReady) {
      for (const row of getCatalogRows()) {
        if (!isStorefrontCatalogCandidate(row)) continue;
        pushUnique(catalogRowToFeatured(row));
      }
    }

    return merged;
  }, [catalogBundle?.featured, catalogBundle?.sections, catalogReady]);

  const isLoading = bundleLoading && !catalogBundle;

  return (
    <div className="bg-[#FAFBFC]">
      {STOREFRONT_CATALOG_RAILS.map((rail, index) => {
        const railBlock = (
          <>
            {index === 0 ? (
              <Suspense fallback={<div className="min-h-[120px]" aria-hidden="true" />}>
                <HomeEquiposHeroBanner />
              </Suspense>
            ) : null}
            {rail.kind === 'toner' ? (
              <Suspense fallback={<div className="min-h-[160px]" aria-hidden="true" />}>
                <HomeTonerRepuestosHeroBanner />
                <TonerPartnerBrandsSection />
              </Suspense>
            ) : null}
            <StorefrontCatalogRail
              rail={rail}
              productPool={productPool}
              isLoading={isLoading}
              eagerImageCount={index === 0 ? 3 : 0}
            />
          </>
        );

        if (index === 0) {
          return <div key={rail.kind}>{railBlock}</div>;
        }

        return (
          <LazyHomeSection key={rail.kind} minHeight="520px">
            {railBlock}
          </LazyHomeSection>
        );
      })}
    </div>
  );
}
