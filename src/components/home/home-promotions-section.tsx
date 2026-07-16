import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { CarouselDots } from '@/components/ui/carousel-dots';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const JULY_PROMO_SLIDES = [
  {
    id: 'unidad-imagen',
    image: '/promotions/julio-unidad-imagen-sp-c840.png',
    href: '/tienda?search=408034',
    title: 'Ricoh Unidad de Imagen Black SP C840',
    alt: 'Promoción julio: Unidad de imagen Black Ricoh SP C840',
  },
  {
    id: 'unidad-transferencia',
    image: '/promotions/julio-unidad-transferencia-sp-c840.png',
    href: '/tienda?search=408037',
    title: 'Ricoh Unidad de Transferencia SP C840',
    alt: 'Promoción julio: Unidad de transferencia Ricoh SP C840',
  },
  {
    id: 'unidad-fusion',
    image: '/promotions/julio-unidad-fusion-sp-c840.png',
    href: '/tienda?search=408039',
    title: 'Ricoh Unidad de Fusión SP C840',
    alt: 'Promoción julio: Unidad de fusión Ricoh SP C840',
  },
] as const;

type JulyPromoSlide = (typeof JULY_PROMO_SLIDES)[number];

/** Siempre 3 por vista (gap 0.5rem móvil / 0.75rem sm+). */
const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-1rem)/3)] sm:flex-[0_0_calc((100%-1.5rem)/3)]';

const arrowClass =
  'absolute top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#111111] shadow-md transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] disabled:pointer-events-none disabled:opacity-35 sm:size-10';

export function HomePromotionsSection({ className }: { className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: JULY_PROMO_SLIDES.length > 3,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<JulyPromoSlide | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
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
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || scrollSnaps.length <= 1 || previewSlide) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 5500);
    return () => window.clearInterval(timer);
  }, [emblaApi, scrollSnaps.length, previewSlide]);

  const showControls = scrollSnaps.length > 1 || canPrev || canNext;

  return (
    <section
      aria-labelledby="home-promotions-title"
      className={cn('home-landing-sans bg-white py-5 sm:py-7', className)}
    >
      <div className="container">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4">
          <div>
            <h2
              id="home-promotions-title"
              className="home-section-title text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl"
            >
              Promociones exclusivas de julio
            </h2>
          </div>
          <Link
            to="/tienda"
            className="text-sm font-semibold text-[#0f1f3d] underline-offset-4 hover:text-[#E30613] hover:underline"
          >
            Ver todas las ofertas
          </Link>
        </div>

        <div className={cn('relative', showControls && 'px-10 sm:px-12')}>
          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex gap-2 sm:gap-3">
              {JULY_PROMO_SLIDES.map((slide, index) => (
                <li key={slide.id} className={SLIDE_CLASS}>
                  <button
                    type="button"
                    onClick={() => setPreviewSlide(slide)}
                    className={cn(
                      'group block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                    )}
                    aria-label={`Ampliar promoción: ${slide.title}`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      width={1254}
                      height={1003}
                      className="aspect-[5/4] w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {showControls ? (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canPrev}
                aria-label="Promoción anterior"
                className={cn(arrowClass, 'left-0')}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canNext}
                aria-label="Siguiente promoción"
                className={cn(arrowClass, 'right-0')}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          {scrollSnaps.length > 1 ? (
            <div className="mt-3 flex justify-center">
              <CarouselDots
                count={scrollSnaps.length}
                selectedIndex={selectedIndex}
                onSelect={scrollTo}
                ariaLabel="Seleccionar promoción de julio"
                theme="dark"
              />
            </div>
          ) : null}
        </div>
      </div>

      <Dialog
        open={previewSlide != null}
        onOpenChange={(open) => {
          if (!open) setPreviewSlide(null);
        }}
      >
        <DialogContent className="max-h-[92vh] w-[min(96vw,56rem)] max-w-4xl overflow-y-auto p-3 sm:p-4">
          {previewSlide ? (
            <>
              <DialogHeader className="pr-8 text-left">
                <DialogTitle>{previewSlide.title}</DialogTitle>
                <DialogDescription className="sr-only">{previewSlide.alt}</DialogDescription>
              </DialogHeader>
              <img
                src={previewSlide.image}
                alt={previewSlide.alt}
                width={1254}
                height={1254}
                className="mx-auto max-h-[min(78vh,52rem)] w-full rounded-lg object-contain"
                decoding="async"
              />
              <div className="flex justify-end pt-1">
                <Link
                  to={previewSlide.href}
                  className="text-sm font-semibold text-[#E30613] underline-offset-4 hover:underline"
                  onClick={() => setPreviewSlide(null)}
                >
                  Ver en tienda
                </Link>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
