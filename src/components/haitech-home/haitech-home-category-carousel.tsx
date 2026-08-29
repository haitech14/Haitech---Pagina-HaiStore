import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_HOME_CATEGORY_CAROUSEL } from '@/data/haitech-home-shell';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const COLUMN_GAP = 'gap-3 sm:gap-4 md:gap-5 lg:gap-5';
/** Solapa filas para eliminar el hueco blanco entre la imagen superior e inferior. */
const ROW_OVERLAP = '-mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16 xl:-mt-20';
/** Columnas visibles: ~2 móvil · 2.5 sm · 3 md · 4 lg · 5 xl (todas las categorías en desktop). */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-1.5rem)/2.5)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-4rem)/4)] xl:flex-[0_0_calc((100%-5rem)/5)]';

const ICON_SIZES =
  'size-[180px] sm:size-[200px] md:size-[220px] lg:size-[240px] xl:size-[260px]';

const arrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#333] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

type CategoryItem = (typeof HAITECH_HOME_CATEGORY_CAROUSEL)[number];

function chunkIntoPairs<T>(items: readonly T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i]!, items[i + 1]]);
  }
  return pairs;
}

function CategoryTile({
  item,
  imgErrors,
  onImgError,
  className,
}: {
  item: CategoryItem;
  imgErrors: Record<string, boolean>;
  onImgError: (id: string) => void;
  className?: string;
}) {
  const showImage = Boolean(item.image) && !imgErrors[item.id];

  return (
    <Link
      to={item.to}
      aria-label={`${item.name}. ${item.description}`}
      className={cn(
        'group relative z-0 block w-full outline-none hover:z-[1]',
        'focus-visible:z-[1] focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        className,
      )}
    >
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl',
          ICON_SIZES,
        )}
      >
        {showImage ? (
          <img
            src={item.image}
            alt=""
            width={304}
            height={304}
            className="size-full object-contain transition-transform duration-300 group-hover:scale-[0.92]"
            loading="lazy"
            decoding="async"
            onError={() => onImgError(item.id)}
          />
        ) : (
          <span
            className="font-[family-name:var(--font-infobox)] text-4xl font-bold text-[#B0B0B0] md:text-5xl"
            aria-hidden="true"
          >
            {item.name.charAt(0)}
          </span>
        )}

        <span
          className={cn(
            'absolute inset-0 z-[1] flex items-center justify-center px-2 text-balance text-center uppercase',
            'font-[family-name:var(--font-infobox)] text-[15px] font-extrabold leading-tight tracking-[0.02em] text-white',
            'sm:px-2.5 sm:text-[17px] md:text-[18px] lg:text-[20px] xl:text-[22px]',
            '[text-shadow:0_2px_10px_rgba(0,0,0,0.85),0_0_3px_rgba(0,0,0,0.95)]',
          )}
        >
          {item.name}
        </span>
      </span>
    </Link>
  );
}

/** Carrusel de categorías — 2 filas por columna, título blanco centrado sobre la imagen. */
export function HaitechHomeCategoryCarousel({ className }: { className?: string }) {
  const items = HAITECH_HOME_CATEGORY_CAROUSEL;
  const columns = useMemo(() => chunkIntoPairs(items), [items]);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleImgError = useCallback((id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

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

  const showControls = columns.length > 1;

  return (
    <section
      className={cn('w-full bg-white px-3 pb-2 pt-1 sm:px-4 sm:pb-2 sm:pt-2 lg:px-5', className)}
      aria-labelledby="haitech-category-carousel-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-2 sm:mb-3 md:mb-4">
          <h2
            id="haitech-category-carousel-title"
            className="flex items-center gap-2.5 font-[family-name:var(--font-infobox)] text-[20px] font-bold text-[#111111] sm:text-[24px] lg:text-[26px]"
          >
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Nuestras Categorias
          </h2>
        </header>

        <div className="relative px-0 sm:px-8 lg:px-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className={cn('flex', COLUMN_GAP)} role="list" aria-label="Categorías de productos">
              {columns.map(([top, bottom]) => (
                <li key={`${top.id}-${bottom?.id ?? 'solo'}`} className={SLIDE}>
                  <div className="flex h-full flex-col">
                    <CategoryTile
                      item={top}
                      imgErrors={imgErrors}
                      onImgError={handleImgError}
                    />
                    {bottom ? (
                      <CategoryTile
                        item={bottom}
                        imgErrors={imgErrors}
                        onImgError={handleImgError}
                        className={ROW_OVERLAP}
                      />
                    ) : (
                      <span className="hidden flex-1 sm:block" aria-hidden="true" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {showControls ? (
            <>
              <button
                type="button"
                className={cn(arrowClass, '-left-1 sm:-left-2 lg:-left-3')}
                aria-label="Categorías anteriores"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
              >
                <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(arrowClass, '-right-1 sm:-right-2 lg:-right-3')}
                aria-label="Categorías siguientes"
                disabled={!canScrollNext}
                onClick={scrollNext}
              >
                <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
