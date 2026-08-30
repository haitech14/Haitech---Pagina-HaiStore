import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Headphones,
  Lock,
  Monitor,
  Package,
  Printer,
  ShieldCheck,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { HaitechHomeProductCarousel } from '@/components/haitech-home/haitech-home-product-carousel';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  HAITECH_SHOP,
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  HAITECH_SHOP_PRODUCT_TABS,
  HAITECH_SHOP_TRUST_ITEMS,
  type HaitechShopProductTabId,
} from '@/data/haitech-home-shop';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const TAB_ICONS: Record<(typeof HAITECH_SHOP_PRODUCT_TABS)[number]['icon'], LucideIcon> = {
  star: Star,
  chart: BarChart3,
  printer: Printer,
  monitor: Monitor,
  droplet: Droplets,
  package: Package,
};

const TRUST_ICONS: Record<(typeof HAITECH_SHOP_TRUST_ITEMS)[number]['icon'], LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  headset: Headphones,
  lock: Lock,
};

function productsForTab(tab: HaitechShopProductTabId) {
  const filtered = HAITECH_SHOP_FAVORITE_PRODUCTS.filter((p) => p.tabIds.includes(tab));
  return filtered.length > 0 ? filtered : HAITECH_SHOP_FAVORITE_PRODUCTS;
}

const TRUST_SLIDE =
  'min-w-0 shrink-0 flex-[0_0_78%] sm:flex-[0_0_52%] md:flex-[0_0_38%] lg:flex-[0_0_25%]';

function HaitechShopTrustCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    watchDrag: emblaShouldWatchDrag,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
    <div className="relative min-w-0 flex-1">
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-3 sm:gap-4" role="list">
          {HAITECH_SHOP_TRUST_ITEMS.map((item) => {
            const TrustIcon = TRUST_ICONS[item.icon];
            return (
              <li key={item.id} className={TRUST_SLIDE}>
                <div className="flex h-full items-start gap-2.5 rounded-lg bg-white/70 px-3 py-3 sm:px-3.5">
                  <TrustIcon
                    className="mt-0.5 size-[18px] shrink-0"
                    style={{ color: HAITECH_SHOP.brand }}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-bold text-[#111] sm:text-[13px]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#7A7A7A] sm:text-[12px]">
                      {item.subtitle}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Ventaja anterior"
        className="absolute -left-1 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8D8D8] bg-white text-[#333] shadow-sm transition hover:border-[#E30613]/30 hover:text-[#E30613] disabled:pointer-events-none disabled:opacity-0 lg:hidden"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Ventaja siguiente"
        className="absolute -right-1 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8D8D8] bg-white text-[#333] shadow-sm transition hover:border-[#E30613]/30 hover:text-[#E30613] disabled:pointer-events-none disabled:opacity-0 lg:hidden"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Productos destacados — carrusel con tabs y barra de confianza.
 */
export function HaitechHomeFavoritesSection({ className }: { className?: string }) {
  const [active, setActive] = useState<HaitechShopProductTabId>('ofertas');
  const products = useMemo(() => productsForTab(active), [active]);

  return (
    <section
      id="productos-destacados"
      className={cn('w-full', className)}
      style={{ backgroundColor: HAITECH_SHOP.grayBg }}
      aria-labelledby="haitech-favorites-title"
    >
      <div
        className="mx-auto px-3 pb-4 pt-5 sm:px-4 sm:pb-5 sm:pt-6 lg:px-5 lg:pb-6 lg:pt-7 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
      >
        <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="haitech-favorites-title"
            className="flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-infobox)] text-[20px] font-bold text-[#111111] sm:text-[24px] lg:text-[26px]"
          >
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Nuestros Productos Más Vendidos
          </h2>

          <div
            className="flex items-center justify-end gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-4 sm:shrink-0 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Categorías de productos destacados"
          >
            {HAITECH_SHOP_PRODUCT_TABS.map((tab) => {
              const isActive = tab.id === active;
              const TabIcon = TAB_ICONS[tab.icon];
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 text-[12px] font-semibold transition-colors duration-200 sm:h-10 sm:px-4 sm:text-[13px]',
                    isActive
                      ? 'border-[#E30613] text-[#E30613]'
                      : 'border-[#D8D8D8] text-[#666] hover:border-[#BDBDBD]',
                  )}
                >
                  <TabIcon
                    className={cn(
                      'size-3.5',
                      isActive ? 'text-[#E30613]' : 'text-[#888]',
                      isActive && tab.icon === 'star' && 'fill-[#E30613]',
                    )}
                    strokeWidth={isActive && tab.icon === 'star' ? 0 : 1.75}
                    aria-hidden="true"
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <HaitechHomeProductCarousel
          products={products}
          ariaLabel="Productos destacados"
        />

        <div className="mt-8 rounded-xl bg-[#ECECEC] px-4 py-5 sm:mt-10 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            <HaitechShopTrustCarousel />

            <div className="flex shrink-0 items-center justify-center border-t border-[#D8D8D8] pt-4 lg:w-[140px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <img
                src="/brands/ricoh.png"
                alt="RICOH — imagine. change."
                width={120}
                height={36}
                className="h-8 w-auto object-contain sm:h-9"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
