import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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
/** 2 móvil · 4 desde sm (por vista). */
const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-2.25rem)/4)]';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:size-9';

function RecommendationCard({
  item,
  onOpen,
  className,
}: {
  item: ClientRecommendation;
  onOpen: (item: ClientRecommendation) => void;
  className?: string;
}) {
  const { webpSrc, fallbackSrc } = recommendationImageSources(item.image);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted aspect-[4/5]',
        'shadow-[0_2px_16px_rgba(15,31,61,0.08)] transition-shadow hover:shadow-[0_4px_24px_rgba(15,31,61,0.12)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        className,
      )}
    >
      <picture className="block size-full">
        <source type="image/webp" srcSet={webpSrc} />
        <img
          src={fallbackSrc}
          alt=""
          width={320}
          height={400}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </picture>
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

export function ClientRecommendationsSection({ embedded = false }: { embedded?: boolean }) {
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

  const visibleRecommendations = embedded
    ? clientRecommendations.slice(0, 6)
    : clientRecommendations;

  return (
    <section
      id="testimonios"
      aria-labelledby={embedded ? undefined : 'clientes-recomiendan-titulo'}
      className={cn(
        'home-landing-sans relative overflow-hidden',
        embedded ? 'py-3 sm:py-4' : 'py-5 sm:py-6',
      )}
    >
      <div className="container relative">
        {embedded ? null : (
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
        )}

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
              {visibleRecommendations.map((item) => (
                <li key={item.id} className={SLIDE_CLASS}>
                  <RecommendationCard item={item} onOpen={setLightboxItem} />
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

        {embedded ? null : (
          <div className="mt-4 flex justify-center">
            <Link
              to="#clientes"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-600/30 bg-white px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Ver más entregas reales
            </Link>
          </div>
        )}
      </div>

      <RecommendationLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </section>
  );
}
