import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  homeCategoryChipClassName,
  HomeCategoryChipContent,
} from '@/components/home/home-category-chip';
import {
  HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS,
  HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
  type HomeFeaturedEquipmentCategoryFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { resolveHomeEquipmentCategoryImage } from '@/data/home-equipment-category-images';
import { cn } from '@/lib/utils';

const CAROUSEL_GAP = 'gap-2 sm:gap-2.5';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-[0_2px_8px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

type HomeEquipmentCategoryCarouselProps = {
  activeCategory?: HomeFeaturedEquipmentCategoryFilterId;
  onCategoryChange?: (categoryId: HomeFeaturedEquipmentCategoryFilterId) => void;
  className?: string;
};

export function HomeEquipmentCategoryCarousel({
  activeCategory = HOME_FEATURED_EQUIPMENT_DEFAULT_CATEGORY,
  onCategoryChange,
  className,
}: HomeEquipmentCategoryCarouselProps) {
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

  const canScroll = canScrollPrev || canScrollNext;

  return (
    <nav
      aria-label="Accesos rápidos por categoría de equipos"
      className={cn('relative', canScroll && 'px-10 sm:px-12', className)}
    >
      {canScroll ? (
        <>
          <button
            type="button"
            className={cn(carouselArrowClass, 'left-0')}
            aria-label="Categorías de equipos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(carouselArrowClass, 'right-0')}
            aria-label="Categorías de equipos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <div
          className={cn('flex', CAROUSEL_GAP, !canScroll && 'mx-auto w-fit justify-center')}
          role="tablist"
          aria-label="Categorías de equipos"
        >
          {HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS.map((filter) => {
            const isActive = activeCategory === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={homeCategoryChipClassName({
                  layout: 'vertical',
                  size: 'lg',
                  isActive,
                })}
                onClick={() => onCategoryChange?.(filter.id)}
              >
                <HomeCategoryChipContent
                  imageSrc={resolveHomeEquipmentCategoryImage(filter.id)}
                  label={filter.label}
                  layout="vertical"
                  size="lg"
                  isActive={isActive}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
