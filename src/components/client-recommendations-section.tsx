import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ZoomIn } from 'lucide-react';
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
import { recommendationImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const SLIDE_CLASS =
  'min-w-0 flex-[0_0_88%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_24%] xl:flex-[0_0_16.666%]';

function StarRating() {
  return (
    <div className="flex justify-center gap-0.5" aria-label="5 estrellas">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="size-3 fill-red-600 text-red-600 sm:size-3.5"
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
}: {
  item: ClientRecommendation;
  onOpen: (item: ClientRecommendation) => void;
  className?: string;
}) {
  return (
    <li className={cn(SLIDE_CLASS, 'pl-3 first:pl-0 sm:pl-4', className)}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white text-left shadow-[0_2px_16px_rgba(15,31,61,0.08)]',
          'transition-shadow hover:shadow-[0_4px_24px_rgba(15,31,61,0.12)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {(() => {
            const { webpSrc, fallbackSrc } = recommendationImageSources(item.image);
            return (
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
            );
          })()}
          <span
            className="absolute bottom-3 left-3 flex size-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold leading-none text-white shadow-md"
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

        <div className="flex flex-1 flex-col gap-2 px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-3.5">
          <StarRating />
          <h3 className="text-balance text-center text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
            {item.title}
          </h3>
          <p className="line-clamp-4 flex-1 text-pretty text-center text-[0.6875rem] italic leading-relaxed text-muted-foreground sm:text-xs">
            &ldquo;{item.quote}&rdquo;
          </p>
          <p className="text-center text-[0.6875rem] sm:text-xs">
            <span className="font-bold text-[#0f1f3d]">{item.customerName}</span>
            <span className="text-muted-foreground"> · {item.customerCity}</span>
          </p>
        </div>
        <span className="sr-only">Ver imagen ampliada: {item.imageAlt}</span>
      </button>
    </li>
  );
}

export function ClientRecommendationsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
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
      aria-labelledby="clientes-recomiendan-titulo"
      className="relative overflow-hidden border-t border-border/60 bg-white py-8 sm:py-10"
    >
      <div className="container relative">
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xs">
              Testimonios reales
            </p>
            <span className="h-px w-8 bg-red-600/70 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="clientes-recomiendan-titulo"
            className="mt-3 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:mt-4 sm:text-3xl lg:text-[2rem]"
          >
            Nuestros clientes nos{' '}
            <span className="text-red-600">recomiendan</span>
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
            Experiencias de compra, entrega y soporte. Toca una foto para verla en grande.
          </p>
        </header>

        <div className="relative">
          {canScrollPrev ? (
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute -left-1 top-[32%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-left-3"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              type="button"
              onClick={scrollNext}
              className="absolute -right-1 top-[32%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:-right-3"
              aria-label="Testimonio siguiente"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          ) : null}

          <div className="-mx-3 overflow-hidden px-3 sm:-mx-4 sm:px-4" ref={emblaRef}>
            <ul className="flex touch-pan-y">
              {clientRecommendations.map((item) => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  onOpen={setLightboxItem}
                />
              ))}
            </ul>
          </div>
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

      <Dialog open={lightboxItem != null} onOpenChange={(open) => !open && setLightboxItem(null)}>
        <DialogContent
          className="max-w-[min(56rem,calc(100vw-2rem))] gap-3 border-none bg-neutral-950/95 p-3 sm:p-4"
          overlayClassName="bg-black/80"
        >
          {lightboxItem ? (
            <>
              <DialogTitle className="text-center text-sm font-bold text-white sm:text-base">
                {lightboxItem.title}
              </DialogTitle>
              <DialogDescription className="sr-only">{lightboxItem.imageAlt}</DialogDescription>
              <div className="flex max-h-[min(85dvh,52rem)] items-center justify-center overflow-hidden rounded-lg bg-black/40">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.imageAlt}
                  className="max-h-[min(85dvh,52rem)] w-full object-contain"
                />
              </div>
              <p className="text-center text-xs italic text-neutral-300 sm:text-sm">
                &ldquo;{lightboxItem.quote}&rdquo; —{' '}
                <span className="font-semibold text-white">{lightboxItem.customerName}</span>
                {', '}
                {lightboxItem.customerCity}
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
