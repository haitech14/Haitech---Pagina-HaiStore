import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Zap } from 'lucide-react';

import { ProductShowcaseCard } from '@/components/product-showcase-card';
import { FlashDealsCountdown } from '@/components/flash-deals/flash-deals-countdown';
import { useProducts } from '@/hooks/use-products';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  chunkFlashDealProducts,
  FLASH_DEALS_LIMIT,
  FLASH_DEALS_PER_VIEW,
  MIN_FLASH_DEALS,
  resolveFlashDealProducts,
} from '@/lib/flash-deals';
import { cn } from '@/lib/utils';

/** Cuatro tarjetas por fila (gap-4 = 1rem × 3 huecos entre 4 columnas). */
const FLASH_DEAL_PAGE_ITEM_CLASS =
  'min-w-0 w-full sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] lg:max-w-[calc((100%-3rem)/4)] lg:flex-[0_0_calc((100%-3rem)/4)]';

export function FlashDealsSection() {
  const { data: storeProducts } = useProducts();
  const products = useMemo(
    () => resolveFlashDealProducts(storeProducts, FLASH_DEALS_LIMIT),
    [storeProducts],
  );
  const pages = useMemo(() => chunkFlashDealProducts(products), [products]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

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
    emblaApi.reInit();
    emblaApi.scrollTo(0);
    setSelectedIndex(0);
  }, [emblaApi, pages]);

  if (products.length < MIN_FLASH_DEALS) {
    return null;
  }

  const showDots = pages.length > 1;

  return (
    <section aria-labelledby="flash-deals-heading" className="w-full">
      <div
        className={cn(
          'overflow-hidden rounded-lg',
          'grid grid-cols-1',
          showDots
            ? 'lg:grid-cols-[min(100%,24rem)_1fr] lg:grid-rows-[1fr_auto]'
            : 'lg:grid-cols-[min(100%,24rem)_1fr] lg:grid-rows-1',
        )}
      >
        {/* Panel promo: misma altura que la fila de tarjetas (no incluye los bullets) */}
        <aside
          className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-8 text-center max-lg:rounded-t-lg sm:px-8 sm:py-10 lg:col-start-1 lg:row-start-1 lg:justify-center lg:rounded-l-lg lg:px-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.22),transparent_55%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(234,179,8,0.12),transparent_45%)]"
          />

          <div className="relative z-10 flex w-full max-w-[16rem] flex-col items-center gap-4 sm:max-w-[18rem] sm:gap-5">
            <div className="flex flex-col items-center gap-3">
              <Zap
                className="size-10 shrink-0 fill-amber-400 text-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.75)] sm:size-12"
                aria-hidden="true"
              />
              <h2
                id="flash-deals-heading"
                className="text-balance text-xl font-black uppercase leading-[1.05] tracking-wide text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.35)] sm:text-2xl lg:text-[1.75rem]"
              >
                <span className="block">Ofertas</span>
                <span className="block">relámpago</span>
              </h2>
            </div>

            <p className="rounded-full border border-amber-400/35 bg-amber-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-amber-50 sm:text-sm">
              ¡Por tiempo limitado!
            </p>

            <FlashDealsCountdown />

            <Link
              to="/tienda"
              className="text-base font-bold text-amber-400 underline decoration-amber-400/50 decoration-2 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Ver todas las ofertas
            </Link>
          </div>
        </aside>

        {/* Carrusel: define la altura de la fila junto al panel negro */}
        <div
          className={cn(
            'flex min-w-0 flex-col bg-background p-4 sm:p-5',
            showDots ? 'max-lg:pb-2 lg:col-start-2 lg:row-start-1 lg:rounded-tr-lg' : 'max-lg:rounded-b-lg lg:rounded-r-lg',
          )}
        >
          <div className="min-h-0 flex-1 overflow-hidden" ref={emblaRef}>
            <ul className="flex touch-pan-y">
              {pages.map((page, pageIndex) => (
                <li key={pageIndex} className="min-w-0 shrink-0 flex-[0_0_100%]">
                  <ul className="flex flex-wrap gap-4 lg:flex-nowrap lg:items-stretch">
                    {page.map((product) => (
                      <li key={product.id} className={FLASH_DEAL_PAGE_ITEM_CLASS}>
                        <ProductShowcaseCard product={product} imageSize="large" />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {showDots ? (
          <div
            className="flex items-center justify-center gap-1 bg-background px-4 pb-4 pt-1 max-lg:rounded-b-lg sm:px-5 sm:pb-5 lg:col-start-2 lg:row-start-2 lg:rounded-br-lg"
            role="tablist"
            aria-label="Páginas del carrusel de ofertas relámpago"
          >
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Ir a la vista ${index + 1} de ${pages.length} (ofertas ${index * FLASH_DEALS_PER_VIEW + 1} a ${Math.min((index + 1) * FLASH_DEALS_PER_VIEW, products.length)} de ${products.length})`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2.5 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  selectedIndex === index
                    ? 'bg-red-600'
                    : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
