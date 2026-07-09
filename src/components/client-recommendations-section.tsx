import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  clientRecommendations,
  type ClientRecommendation,
} from '@/data/client-recommendations';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { recommendationImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const CAROUSEL_GAP_CLASS = 'gap-3';
/** 2 móvil · 3 md · 4 lg · 5 xl visibles por vista. */
const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-2.25rem)/4)] xl:flex-[0_0_calc((100%-3rem)/5)]';

const carouselArrowClass =
  'absolute top-[38%] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:size-9';

function StarRating({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex justify-center gap-0.5" aria-label="5 estrellas">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'fill-red-600 text-red-600',
            compact ? 'size-2.5 sm:size-3' : 'size-3 sm:size-3.5',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function RecommendationCard({
  item,
  onOpen,
  className,
  compact = false,
}: {
  item: ClientRecommendation;
  onOpen: (item: ClientRecommendation) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white text-left shadow-[0_2px_16px_rgba(15,31,61,0.08)]',
        'transition-shadow hover:shadow-[0_4px_24px_rgba(15,31,61,0.12)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          compact ? 'aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[4/5]',
        )}
      >
        {(() => {
          const { webpSrc, fallbackSrc } = recommendationImageSources(item.image);
          return (
            <picture className="block size-full">
              <source type="image/webp" srcSet={webpSrc} />
              <img
                src={fallbackSrc}
                alt=""
                width={compact ? 240 : 320}
                height={compact ? 300 : 400}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </picture>
          );
        })()}
        <span
          className={cn(
            'absolute left-2.5 top-2.5 flex items-center justify-center rounded-full bg-red-600 font-bold leading-none text-white shadow-md',
            compact
              ? 'size-7 text-base lg:size-6 lg:text-sm'
              : 'left-3 top-3 size-8 text-lg',
          )}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/0 transition-colors',
            'group-hover:bg-black/20 group-focus-visible:bg-black/20',
          )}
          aria-hidden="true"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn className="size-5" strokeWidth={2} />
          </span>
        </span>
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col gap-2',
          compact ? 'px-2.5 pb-3 pt-2.5 lg:gap-1.5 lg:px-2 lg:pb-3 lg:pt-2' : 'px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-3.5',
        )}
      >
        <StarRating compact={compact} />
        <h3
          className={cn(
            'text-balance text-center font-bold leading-snug text-[#0f1f3d]',
            compact ? 'text-[0.6875rem] lg:text-[0.65rem] xl:text-xs' : 'text-xs sm:text-sm',
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn(
            'flex-1 text-pretty text-center italic leading-relaxed text-muted-foreground',
            compact
              ? 'line-clamp-3 text-[0.625rem] lg:text-[0.6rem] xl:text-[0.6875rem]'
              : 'line-clamp-4 text-[0.6875rem] sm:text-xs',
          )}
        >
          &ldquo;{item.quote}&rdquo;
        </p>
        <p
          className={cn(
            'text-center',
            compact ? 'text-[0.625rem] lg:text-[0.6rem] xl:text-[0.6875rem]' : 'text-[0.6875rem] sm:text-xs',
          )}
        >
          <span className="font-bold text-[#0f1f3d]">{item.customerName}</span>
          <span className="text-muted-foreground"> · {item.customerCity}</span>
        </p>
      </div>
      <span className="sr-only">Ver imagen ampliada: {item.imageAlt}</span>
    </button>
  );
}

function RecommendationLightbox({
  item,
  onClose,
}: {
  item: ClientRecommendation | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={item != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[min(56rem,calc(100vw-2rem))] gap-3 border-none bg-neutral-950/95 p-3 sm:p-4"
        overlayClassName="bg-black/80"
      >
        {item ? (
          <>
            <DialogTitle className="text-center text-sm font-bold text-white sm:text-base">
              {item.title}
            </DialogTitle>
            <DialogDescription className="sr-only">{item.imageAlt}</DialogDescription>
            <div className="flex max-h-[min(85dvh,52rem)] items-center justify-center overflow-hidden rounded-lg bg-black/40">
              <img
                src={item.image}
                alt={item.imageAlt}
                className="max-h-[min(85dvh,52rem)] w-full object-contain"
              />
            </div>
            <p className="text-center text-xs italic text-neutral-300 sm:text-sm">
              &ldquo;{item.quote}&rdquo; —{' '}
              <span className="font-semibold text-white">{item.customerName}</span>
              {', '}
              {item.customerCity}
            </p>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ClientRecommendationsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<ClientRecommendation | null>(null);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
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

  return (
    <section
      id="testimonios"
      aria-labelledby="clientes-recomiendan-titulo"
      className="home-landing-sans relative overflow-hidden py-5 sm:py-6"
    >
      <div className="container relative">
        <header className="mx-auto mb-4 max-w-3xl text-center sm:mb-5">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Testimonios reales
            </p>
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="clientes-recomiendan-titulo"
            className="home-section-title mt-2 text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:mt-3 sm:text-2xl lg:text-[1.75rem]"
          >
            Nuestros clientes nos{' '}
            <span className="text-red-600">recomiendan</span>
          </h2>

          <p className="mx-auto mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-2">
            Experiencias de compra, entrega y soporte. Toca una foto para verla en grande.
          </p>
        </header>

        <div className={cn('relative', scrollSnaps.length > 1 && 'px-9 sm:px-11')}>
          {scrollSnaps.length > 1 ? (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={cn(carouselArrowClass, 'left-0')}
                aria-label="Testimonio anterior"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={cn(carouselArrowClass, 'right-0')}
                aria-label="Testimonio siguiente"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className="overflow-hidden" ref={emblaRef}>
            <ul className={cn('flex touch-pan-y', CAROUSEL_GAP_CLASS)}>
              {clientRecommendations.map((item) => (
                <li key={item.id} className={SLIDE_CLASS}>
                  <RecommendationCard item={item} onOpen={setLightboxItem} compact />
                </li>
              ))}
            </ul>
          </div>

          {scrollSnaps.length > 1 ? (
            <div
              className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5"
              role="tablist"
              aria-label="Paginación de testimonios"
            >
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Ir al grupo ${index + 1} de testimonios`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                    index === selectedIndex ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            to="#clientes"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-600/30 bg-white px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Ver más entregas reales
          </Link>
        </div>
      </div>

      <RecommendationLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </section>
  );
}
