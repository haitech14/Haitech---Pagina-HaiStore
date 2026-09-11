import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ServicesCatalogCard } from '@/components/services-storefront/services-catalog-card';
import { VolumeDiscountGuidePopover } from '@/components/product/volume-discount-guide-popover';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { SERVICES_CATALOG_ID } from '@/data/services-catalog';
import {
  filterTechnicalServiceProducts,
  SERVICES_TECHNICAL_SHOWCASE_CATEGORIES,
  SERVICES_TECHNICAL_SHOWCASE_DEFAULT_CATEGORY,
  SERVICES_TECHNICAL_SHOWCASE_FILTERS,
  type ServicesTechnicalFilterId,
  type ServicesTechnicalShowcaseCategoryId,
} from '@/data/services-technical-showcase';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const BRAND = '#E30613';

const CATEGORY_CAROUSEL_GAP = 'gap-3 sm:gap-3.5';
const CATEGORY_SLIDE_CLASS =
  'min-w-0 shrink-0 grow-0 basis-[132px] sm:basis-[148px] md:basis-[156px] lg:basis-[164px] xl:basis-[172px]';

const categoryCarouselArrowClass =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#555] shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition-colors hover:border-[#CFCFCF] hover:text-[#111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-10';

function CategoryCarousel({
  categoryId,
  onSelect,
}: {
  categoryId: ServicesTechnicalShowcaseCategoryId;
  onSelect: (categoryId: ServicesTechnicalShowcaseCategoryId) => void;
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
    if (!emblaApi) return;

    const onSelectSlide = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelectSlide();
    emblaApi.on('select', onSelectSlide);
    emblaApi.on('reInit', onSelectSlide);

    return () => {
      emblaApi.off('select', onSelectSlide);
      emblaApi.off('reInit', onSelectSlide);
    };
  }, [emblaApi]);

  const canScroll = canScrollPrev || canScrollNext;

  return (
    <div className={cn('relative mx-auto max-w-[1280px]', canScroll && 'px-10 sm:px-12')}>
      {canScroll ? (
        <>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'left-0')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'right-0')}
            aria-label="Categorías siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul
          className={cn(
            'flex flex-nowrap',
            CATEGORY_CAROUSEL_GAP,
            !canScroll && 'justify-center',
          )}
          role="list"
          aria-label="Categorías de servicio técnico"
        >
          {SERVICES_TECHNICAL_SHOWCASE_CATEGORIES.map((category) => {
            const active = category.id === categoryId;
            return (
              <li key={category.id} className={CATEGORY_SLIDE_CLASS}>
                <button
                  type="button"
                  onClick={() => onSelect(category.id)}
                  className={cn(
                    'group relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white px-2.5 py-4 text-center sm:px-3 sm:py-5',
                    'shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
                    active
                      ? 'border-2 border-[#E30613] bg-[#FFF5F5]'
                      : 'border-2 border-transparent hover:-translate-y-0.5',
                  )}
                  aria-pressed={active}
                >
                  <img
                    src={category.image}
                    alt=""
                    width={160}
                    height={120}
                    className="h-[72px] w-auto max-w-full object-contain sm:h-[88px] xl:h-[80px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="mt-2.5 text-[12px] font-bold leading-snug text-[#111] sm:mt-3 sm:text-[13px] xl:text-[12px]">
                    {category.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Vitrina estilo Comprar para Servicio Técnico: categorías + filtros + productos. */
export function ServicesTechnicalShowcase({ className }: { className?: string }) {
  const [categoryId, setCategoryId] = useState<ServicesTechnicalShowcaseCategoryId>(
    SERVICES_TECHNICAL_SHOWCASE_DEFAULT_CATEGORY,
  );
  const [filterId, setFilterId] = useState<ServicesTechnicalFilterId>('todos');

  const products = useMemo(
    () => filterTechnicalServiceProducts({ categoryId, filterId }),
    [categoryId, filterId],
  );

  const activeCategory = SERVICES_TECHNICAL_SHOWCASE_CATEGORIES.find((c) => c.id === categoryId);

  return (
    <section
      id={SERVICES_CATALOG_ID}
      className={cn(
        'w-full scroll-mt-20 bg-[#F3F4F6] px-3 pb-10 pt-6 sm:px-4 sm:pb-12 sm:pt-7 lg:px-5 lg:pb-14 lg:pt-8',
        className,
      )}
      aria-labelledby="services-technical-showcase-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-6 text-center sm:mb-8">
          <span className="mx-auto mb-2 block h-[3px] w-7 rounded-sm bg-[#E30613]" aria-hidden="true" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E30613] sm:text-[12px]">
            Categorías
          </p>
          <h2
            id="services-technical-showcase-title"
            className="mt-2 font-[family-name:var(--font-infobox)] text-[26px] font-bold leading-tight text-[#111] sm:text-[32px] lg:text-[36px]"
          >
            Explora nuestro <span style={{ color: BRAND }}>catálogo</span>
          </h2>
        </header>

        <CategoryCarousel
          categoryId={categoryId}
          onSelect={(next) => {
            setCategoryId(next);
            setFilterId('todos');
          }}
        />

        <div
          className={cn(
            'mx-auto mt-7 flex max-w-[1280px] flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-[#F3F4F6] px-4 py-3.5',
            'sm:mt-8 sm:flex-row sm:rounded-full sm:px-5 sm:py-3',
          )}
        >
          <p className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#111] sm:text-[13px]">
            Filtrar
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Filtros de servicio técnico"
          >
            {SERVICES_TECHNICAL_SHOWCASE_FILTERS.map((filter) => {
              const active = filter.id === filterId;
              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilterId(filter.id)}
                  className={cn(
                    'inline-flex h-9 items-center rounded-full border px-4 text-[12px] font-semibold transition-colors sm:h-10 sm:px-5 sm:text-[13px]',
                    active
                      ? 'border-[#E30613] bg-[#E30613] text-white'
                      : 'border-[#E5E7EB] bg-white text-[#444] hover:border-[#CFCFCF] hover:text-[#111]',
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center gap-4 text-center sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <span className="mb-2 block h-[3px] w-7 rounded-sm bg-[#E30613]" aria-hidden="true" />
            <h3 className="font-[family-name:var(--font-infobox)] text-[20px] font-bold tracking-tight text-[#111] sm:text-[24px] lg:text-[26px]">
              Explora nuestros{' '}
              <span style={{ color: BRAND }}>{activeCategory?.label.toLowerCase() ?? 'servicios'}</span>
            </h3>
            <p className="mt-1 text-sm text-[#666]">
              {products.length} servicio{products.length === 1 ? '' : 's'}
            </p>
          </div>
          <VolumeDiscountGuidePopover />
        </div>

        {products.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((item) => (
              <li key={item.slug} className="min-w-0">
                <ServicesCatalogCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-center text-sm text-[#666]">
            No hay servicios con este filtro. Prueba otra categoría o quita el filtro.
          </p>
        )}
      </div>
    </section>
  );
}
