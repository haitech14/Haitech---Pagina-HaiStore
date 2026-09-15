import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Headphones, ShieldCheck, Timer, Truck } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { OfferCountdown } from '@/components/haitech-home/flash-offers/offer-countdown';
import {
  FlashOfferProductCard,
  handleAddToCart,
} from '@/components/haitech-home/flash-offers/flash-offer-product-card';
import {
  RICOH_FLASH_OFFER_PRODUCTS,
  type RicohFlashOfferProduct,
} from '@/data/ricoh-flash-offers';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { useCart } from '@/context/cart-context';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn, uniqueById } from '@/lib/utils';

/** 1 en móvil; 2 desde sm; 4 en desktop para que no asome un quinto. */
const FLASH_SLIDE_CLASS =
  'flex min-w-0 shrink-0 justify-center flex-[0_0_100%] sm:flex-[0_0_calc((100%-1rem)/2)] lg:flex-[0_0_calc((100%-3rem)/4)]';

const AUTOPLAY_MS = 3200;

const BENEFITS = [
  { id: 'envio', label: 'Envío\nrápido', Icon: Truck },
  { id: 'compra', label: 'Compra\nsegura', Icon: ShieldCheck },
  { id: 'soporte', label: 'Soporte\nespecializado', Icon: Headphones },
] as const;

function FlashOfferPromoBlock() {
  return (
    <div
      className={cn(
        'relative flex min-h-[340px] flex-col overflow-hidden px-8 py-6 sm:px-10 sm:py-7',
        'lg:min-h-[440px] lg:w-[26%] lg:min-w-[260px] lg:max-w-[340px] lg:shrink-0 lg:px-10 lg:py-8',
      )}
      style={{
        background: 'linear-gradient(135deg, #d90012 0%, #ed0016 55%, #ff2435 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(118deg, transparent 0 30px, rgba(255,255,255,0.07) 30px 60px)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-6 bottom-12 opacity-[0.12] lg:bottom-16"
        aria-hidden="true"
      >
        <Timer className="size-[160px] text-white sm:size-[190px]" strokeWidth={1} />
      </div>
      <div
        className="pointer-events-none absolute -left-8 top-16 h-28 w-28 rounded-full bg-white/5 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-[1] flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-white" aria-hidden="true" />
          <p className="font-[family-name:var(--font-infobox)] text-[10px] font-medium uppercase tracking-[5px] text-white sm:text-[11px]">
            OFERTAS RICOH
          </p>
        </div>

        <h2
          id="haitech-favorites-title"
          className="mt-3.5 font-[family-name:var(--font-infobox)] text-[32px] font-bold leading-[0.95] tracking-tight text-white sm:text-[40px] lg:text-[48px]"
        >
          Solo por
          <br />
          horas
        </h2>

        <p className="mt-3 max-w-[15rem] font-[family-name:var(--font-infobox)] text-[14px] font-medium leading-[1.35] text-white sm:text-[16px]">
          Tecnología que impulsa
          <br />
          tu negocio, a un precio único.
        </p>

        <div className="mt-5">
          <OfferCountdown />
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 pt-6 lg:pt-7">
          {BENEFITS.map(({ id, label, Icon }) => (
            <div key={id} className="flex flex-col items-start gap-1.5">
              <Icon className="size-5 text-white sm:size-[22px]" strokeWidth={1.75} aria-hidden="true" />
              <p className="whitespace-pre-line font-[family-name:var(--font-infobox)] text-[11px] font-medium leading-snug text-white sm:text-[12px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCarousel({
  products,
  favorites,
  onToggleFavorite,
  onAddToCart,
}: {
  products: readonly RicohFlashOfferProduct[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: RicohFlashOfferProduct) => void;
}) {
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const slides = useMemo(() => uniqueById(products).slice(0, 4), [products]);
  const [fitsInView, setFitsInView] = useState(false);
  const canLoop = slides.length >= 2 && !fitsInView;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: canLoop,
    containScroll: canLoop ? false : 'trimSnaps',
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) emblaApi.scrollNext();
    else emblaApi.scrollTo(0);
  }, [emblaApi]);

  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateFit = () => {
      const viewport = emblaApi.rootNode();
      const firstSlide = emblaApi.containerNode().children[0] as HTMLElement | undefined;
      if (!firstSlide || slides.length === 0 || firstSlide.offsetWidth < 8) {
        setFitsInView(false);
        return;
      }
      const styles = window.getComputedStyle(emblaApi.containerNode());
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      const total = slides.length * firstSlide.offsetWidth + Math.max(0, slides.length - 1) * gap;
      setFitsInView(total <= viewport.clientWidth + 1);
    };

    updateFit();
    emblaApi.on('reInit', updateFit);
    emblaApi.on('resize', updateFit);

    return () => {
      emblaApi.off('reInit', updateFit);
      emblaApi.off('resize', updateFit);
    };
  }, [emblaApi, slides.length]);

  useEffect(() => {
    emblaApi?.reInit({
      align: 'start',
      loop: canLoop,
      containScroll: canLoop ? false : 'trimSnaps',
      slidesToScroll: 1,
      watchDrag: emblaShouldWatchDrag,
    });
  }, [canLoop, emblaApi]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || fitsInView || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, fitsInView, slides.length]);

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 items-center py-3 lg:py-3.5"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onFocusCapture={pauseAutoplay}
      onBlurCapture={resumeAutoplay}
    >
      <button
        type="button"
        aria-label="Productos anteriores"
        disabled={slides.length < 2}
        onClick={scrollPrev}
        className={cn(
          'absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center',
          'rounded-full bg-white text-[#ed0016] shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
          'transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
          'disabled:pointer-events-none disabled:opacity-35',
        )}
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Productos siguientes"
        disabled={slides.length < 2}
        onClick={scrollNext}
        className={cn(
          'absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center',
          'rounded-full bg-white text-[#ed0016] shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
          'transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
          'disabled:pointer-events-none disabled:opacity-35',
        )}
      >
        <ChevronRight className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </button>

      <div ref={emblaRef} className="w-full overflow-hidden px-12 pb-1 sm:px-14">
        <div className={cn('flex gap-2 sm:gap-3', fitsInView && 'justify-center')}>
          {slides.map((product) => (
            <div key={product.id} data-flash-card className={FLASH_SLIDE_CLASS}>
              <FlashOfferProductCard
                product={product}
                favorited={favorites.has(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FlashOfferSection({ className }: { className?: string }) {
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const onToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onAddToCart = (product: RicohFlashOfferProduct) => {
    handleAddToCart(product, addItem);
  };

  return (
    <section
      id="productos-destacados"
      aria-labelledby="haitech-favorites-title"
      className={cn('w-full bg-white', className)}
    >
      <div
        className={cn(
          'mx-auto mt-2 overflow-hidden rounded-[16px] bg-[#ed0016]',
          'w-[calc(100%-24px)] shadow-[0_10px_28px_rgba(180,0,20,0.2)]',
          'sm:mt-2.5 sm:w-[calc(100%-40px)] lg:mt-3 lg:w-[calc(100%-48px)]',
          'min-h-[400px] lg:min-h-[440px]',
        )}
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <FlashOfferPromoBlock />
          <ProductCarousel
            products={RICOH_FLASH_OFFER_PRODUCTS}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>
    </section>
  );
}
