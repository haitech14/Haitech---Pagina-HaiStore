import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { NUESTRAS_SOLUCIONES_ITEMS, type NuestraSolucionItem } from '@/data/nuestras-soluciones';
import type { ServiceLandingSlug } from '@/data/service-landings';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { CATEGORY_STRIP_TRACK_WRAPPER_CLASS } from '@/lib/category-strip-layout';
import { categoryImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const SERVICE_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.5rem)/2.5)] sm:flex-[0_0_calc((100%-0.75rem)/4)] md:flex-[0_0_calc((100%-1rem)/5)] lg:flex-[0_0_calc((100%-1.25rem)/6)] xl:flex-[0_0_calc((100%-1.25rem)/6)]';

interface ServiceCategoryStripProps {
  activeSection: ServiceLandingSlug;
  onSelect: (section: ServiceLandingSlug) => void;
}

function ServiceCategoryImage({
  item,
  priority,
}: {
  item: NuestraSolucionItem;
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const Icon = item.icon;
  const showImage = Boolean(item.image) && !hasError;

  return (
    <div className="flex size-[6.25rem] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] ring-1 ring-border/50 sm:size-36 md:size-40 lg:size-44">
      {showImage ? (
        (() => {
          const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(item.image);
          return (
            <picture className="flex size-[88%] items-center justify-center">
              <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
              <img
                src={fallbackSrc}
                alt=""
                width={176}
                height={176}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading={priority ? 'eager' : 'lazy'}
                {...(priority ? { fetchPriority: 'high' as const } : {})}
                sizes={sizes}
                onError={() => setHasError(true)}
              />
            </picture>
          );
        })()
      ) : (
        <div className="flex size-[70%] items-center justify-center rounded-full bg-neutral-300/60">
          <Icon
            className="size-10 text-muted-foreground/50 transition-colors group-hover:text-red-600/40 sm:size-12"
            aria-hidden="true"
            strokeWidth={1.25}
          />
        </div>
      )}
    </div>
  );
}

function ServiceCategoryCard({
  item,
  isActive,
  onSelect,
  priority,
}: {
  item: NuestraSolucionItem;
  isActive: boolean;
  onSelect: () => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        'group flex w-full flex-col items-center gap-1.5 rounded-lg py-1 text-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'sm:gap-2',
      )}
      aria-label={`Ver servicios de ${item.title}`}
    >
      <div
        className={cn(
          'rounded-full transition-shadow',
          isActive
            ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-background'
            : 'group-hover:ring-2 group-hover:ring-red-600/40 group-hover:ring-offset-2 group-hover:ring-offset-background',
        )}
      >
        <ServiceCategoryImage item={item} {...(priority ? { priority: true } : {})} />
      </div>

      <p
        className={cn(
          'line-clamp-2 text-balance text-xs font-medium leading-snug sm:text-sm',
          isActive ? 'text-red-700' : 'text-foreground',
        )}
      >
        {item.title}
      </p>
    </button>
  );
}

export function ServiceCategoryStrip({ activeSection, onSelect }: ServiceCategoryStripProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  const arrowClass = cn(
    'absolute top-[38%] z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm',
    'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
    'hidden sm:flex',
  );

  return (
    <section aria-labelledby="servicios-categorias-titulo">
      <div className="container pb-4 pt-3 sm:pb-5 sm:pt-4">
        <header className="mx-auto mb-5 max-w-3xl text-center sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="servicios-categorias-titulo"
              className="text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl"
            >
              Explora nuestros servicios
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Selecciona una categoría para ver soluciones, beneficios y opciones de contacto.
          </p>
        </header>

        <div className={CATEGORY_STRIP_TRACK_WRAPPER_CLASS}>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(arrowClass, '-left-1 lg:-left-3')}
            aria-label="Servicios anteriores"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div ref={emblaRef} className="overflow-hidden px-0.5">
            <ul className="flex gap-1 sm:gap-1.5 lg:gap-2" role="list" aria-label="Categorías de servicios">
              {NUESTRAS_SOLUCIONES_ITEMS.map((item, index) => (
                <li key={item.slug} className={SERVICE_SLIDE_CLASS}>
                  <ServiceCategoryCard
                    item={item}
                    isActive={activeSection === item.slug}
                    onSelect={() => onSelect(item.slug)}
                    {...(index < 4 ? { priority: true as const } : {})}
                  />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(arrowClass, '-right-1 lg:-right-3')}
            aria-label="Servicios siguientes"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
