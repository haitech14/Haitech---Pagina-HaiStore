import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { StoreCatalogProductCard } from '@/components/store-storefront/store-catalog-product-card';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  CATALOG_INDEX_UPDATED_EVENT,
  loadCatalogIndex,
} from '@/lib/catalog-featured';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { getSecondsUntilLimaMidnight } from '@/lib/flash-deals';
import { listHoursDealOfferStoreProducts } from '@/lib/hours-deal-offer-products';
import { HAITECH_PRODUCT_CAROUSEL_ARROW } from '@/lib/haitech-product-carousel-layout';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

function HoursDealCountdown() {
  const [remaining, setRemaining] = useState(() => getSecondsUntilLimaMidnight());

  useEffect(() => {
    const tick = () => setRemaining(getSecondsUntilLimaMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const units = [
    { value: padTwo(days), label: 'Días' },
    { value: padTwo(hours), label: 'Hrs' },
    { value: padTwo(minutes), label: 'Min' },
    { value: padTwo(seconds), label: 'Seg' },
  ] as const;

  return (
    <div
      className="flex items-start gap-1.5 sm:gap-2"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Oferta disponible por ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`}
    >
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-start gap-1.5 sm:gap-2">
          {index > 0 ? (
            <span
              className="pt-2 text-xl font-bold leading-none text-white sm:pt-2.5 sm:text-2xl"
              aria-hidden="true"
            >
              :
            </span>
          ) : null}
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[20px] font-bold tabular-nums text-[#111111] sm:h-12 sm:w-12 sm:text-[22px]">
              {unit.value}
            </span>
            <span className="text-[11px] font-medium leading-none text-white sm:text-[12px]">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-2.25rem)/4)]';

export function HaitechHomeFavoritesSection({ className }: { className?: string }) {
  const [products, setProducts] = useState<Product[]>(() => listHoursDealOfferStoreProducts());

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (!cancelled) setProducts(listHoursDealOfferStoreProducts());
    };

    void loadCatalogIndex().then(refresh);
    if (typeof window === 'undefined') return () => {
      cancelled = true;
    };

    window.addEventListener(CATALOG_INDEX_UPDATED_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(CATALOG_INDEX_UPDATED_EVENT, refresh);
    };
  }, []);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const showNav = products.length > 2;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

  return (
    <section
      id="productos-destacados"
      className={cn('w-full bg-white', className)}
      aria-labelledby="haitech-favorites-title"
    >
      <div
        className="mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-5 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
      >
        <div className="flex flex-col gap-4 rounded-[28px] bg-[#E30613] px-3 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:gap-6 lg:px-6 lg:py-5">
          <div className="shrink-0 lg:w-[230px] xl:w-[250px]">
            <h2
              id="haitech-favorites-title"
              className="font-[family-name:var(--font-infobox)] text-[28px] font-semibold leading-[0.95] text-white sm:text-[32px] lg:text-[36px]"
            >
              Solo
              <span className="mt-0.5 block text-[30px] font-extrabold uppercase tracking-wide sm:text-[34px] lg:text-[38px]">
                POR HORAS
              </span>
            </h2>
            <p className="mt-4 text-[13px] font-medium text-white sm:text-[14px]">
              Oferta disponible hasta:
            </p>
            <div className="mt-3">
              <HoursDealCountdown />
            </div>
          </div>

          {products.length > 0 ? (
            <div className="relative min-w-0 flex-1 px-7 sm:px-9">
              {showNav ? (
                <>
                  <button
                    type="button"
                    className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, 'left-0')}
                    aria-label="Productos anteriores"
                    disabled={!canScrollPrev}
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, 'right-0')}
                    aria-label="Productos siguientes"
                    disabled={!canScrollNext}
                    onClick={scrollNext}
                  >
                    <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <div className="overflow-hidden" ref={emblaRef}>
                <ul
                  className="flex touch-pan-y gap-3"
                  role="list"
                  aria-label="Ofertas solo por horas"
                >
                  {products.map((product) => (
                    <li key={product.id} className={SLIDE_CLASS}>
                      <StoreCatalogProductCard product={product} variant="carousel" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-10 text-center">
              <p className="text-sm text-white/80">No hay ofertas por horas por el momento.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
