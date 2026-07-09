import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { HomeCategoryShowcaseProductCard } from '@/components/home/home-category-showcase-product-card';
import { Button } from '@/components/ui/button';
import type { HomeCategoryShowcaseConfig } from '@/data/home-category-showcase';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { categoryImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const PRODUCT_CAROUSEL_GAP_CLASS = 'gap-3 sm:gap-4';
const PRODUCT_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-1rem)/3)] lg:flex-[0_0_calc((100%-4rem)/5)]';

function ShowcaseCategoryTile({
  label,
  image,
  href,
  compact = false,
  dense = false,
}: {
  label: string;
  image: string;
  href: string;
  compact?: boolean;
  dense?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(image);
  const showImage = Boolean(image) && !hasError;

  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col overflow-hidden border border-border/60 bg-[#F9FAFB] text-center',
        dense ? 'rounded-md' : compact ? 'rounded-lg' : 'rounded-xl',
        'transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,31,61,0.1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
      )}
      aria-label={label}
    >
      <div
        className={cn(
          'flex items-center justify-center',
          dense
            ? 'h-[2.75rem] p-0.5 sm:h-[3rem]'
            : compact
              ? 'aspect-[4/3] p-1 sm:p-1.5'
              : 'aspect-[5/3] p-1.5 sm:p-2',
        )}
      >
        {showImage ? (
          <picture className="flex size-full items-center justify-center">
            <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
            <img
              src={fallbackSrc}
              alt=""
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              sizes={sizes}
              onError={() => setHasError(true)}
            />
          </picture>
        ) : (
          <span
            className={cn(
              'flex items-center justify-center rounded-full bg-muted font-bold text-muted-foreground',
              dense ? 'size-7 text-xs' : compact ? 'size-9 text-sm' : 'size-12 text-lg',
            )}
            aria-hidden="true"
          >
            {label.charAt(0)}
          </span>
        )}
      </div>
      <p
        className={cn(
          'font-semibold leading-tight text-[#374151]',
          dense
            ? 'line-clamp-1 px-1 pb-1 text-[0.5625rem] sm:text-[0.625rem]'
            : compact
              ? 'px-1.5 pb-1.5 text-[0.625rem] sm:text-[0.6875rem]'
              : 'px-2 pb-2 text-[0.6875rem] sm:text-xs',
        )}
      >
        {label}
      </p>
    </Link>
  );
}

function ShowcaseCategoryRowTile({
  label,
  image,
  href,
  compact = false,
}: {
  label: string;
  image: string;
  href: string;
  compact?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(image);
  const showImage = Boolean(image) && !hasError;
  const isSvg = image.endsWith('.svg');

  return (
    <Link
      to={href}
      className={cn(
        'group flex h-full items-center gap-2.5 rounded-lg border border-border/60 bg-white shadow-[0_1px_4px_rgba(15,31,61,0.06)]',
        compact
          ? 'min-h-[3.5rem] px-2 py-1.5 sm:min-h-[3.75rem] sm:gap-3 sm:px-2.5'
          : 'min-h-[3.25rem] px-2 py-1.5 sm:min-h-[3.5rem] sm:gap-2.5 sm:px-2.5',
        'transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(15,31,61,0.1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
      )}
      aria-label={label}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#F9FAFB]',
          compact ? 'size-11 p-1 sm:size-12' : 'size-12 p-1 sm:size-14',
        )}
      >
        {showImage ? (
          isSvg ? (
            <img
              src={image}
              alt=""
              className="size-full object-contain object-center"
              loading="lazy"
              onError={() => setHasError(true)}
            />
          ) : (
            <picture className="flex size-full items-center justify-center">
              <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
              <img
                src={fallbackSrc}
                alt=""
                className="size-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.04]"
                loading="lazy"
                sizes={sizes}
                onError={() => setHasError(true)}
              />
            </picture>
          )
        ) : (
          <span className="text-xs font-bold text-muted-foreground" aria-hidden="true">
            {label.charAt(0)}
          </span>
        )}
      </span>
      <span
        className={cn(
          'line-clamp-2 min-w-0 flex-1 text-pretty text-left font-semibold leading-snug text-[#374151] text-[0.6875rem] sm:text-xs',
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function ShowcaseWidePromoBanner({
  promo,
}: {
  promo: NonNullable<HomeCategoryShowcaseConfig['promo']>;
}) {
  const gradientFrom = promo.gradientFrom ?? '#312e81';
  const gradientTo = promo.gradientTo ?? '#7c3aed';

  return (
    <div
      className="relative flex min-h-[10.5rem] w-full overflow-hidden rounded-xl sm:min-h-[11.25rem] lg:min-h-[11.5rem]"
      style={{
        background: `linear-gradient(120deg, ${gradientFrom} 0%, ${gradientTo} 58%, #9333ea 100%)`,
      }}
    >
      <img
        src={promo.image}
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] h-full w-[min(52%,13rem)] object-contain object-right p-2 sm:w-[min(48%,14rem)] sm:p-3"
        loading="lazy"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(49,46,129,0.96)_0%,rgba(76,29,149,0.82)_42%,rgba(124,58,237,0.2)_72%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-[2] flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3.5 sm:gap-2 sm:p-4 lg:max-w-[58%]">
        <h3 className="text-balance text-sm font-bold uppercase leading-[1.15] tracking-tight text-white sm:text-base lg:text-[1.125rem]">
          {promo.headline}
        </h3>
        {promo.priceLabel ? (
          <p className="text-[0.8125rem] font-bold uppercase tracking-wide text-white sm:text-sm">
            {promo.priceLabel}
          </p>
        ) : null}
        {promo.subheadline ? (
          <p className="max-w-xs text-[0.6875rem] leading-snug text-white/85 sm:text-xs">
            {promo.subheadline}
          </p>
        ) : null}
      </div>

      <div className="relative z-[2] flex shrink-0 items-center p-3 sm:p-4">
        <Button
          asChild
          className="h-8 rounded-md bg-[#2563EB] px-4 text-[0.6875rem] font-bold uppercase tracking-wide text-white shadow-md hover:bg-[#1d4ed8] sm:h-9 sm:px-5 sm:text-xs"
        >
          <Link to={promo.href}>{promo.ctaLabel ?? 'COMPRAR'}</Link>
        </Button>
      </div>
    </div>
  );
}

function ShowcasePromoBanner({
  promo,
  className,
  layout = 'default',
}: {
  promo: NonNullable<HomeCategoryShowcaseConfig['promo']>;
  className?: string;
  layout?: 'default' | 'split-compact';
}) {
  const gradientFrom = promo.gradientFrom ?? '#1D4ED8';
  const gradientTo = promo.gradientTo ?? '#2563EB';
  const isDark = promo.variant === 'dark' || gradientFrom.toLowerCase().includes('111') || gradientFrom.toLowerCase().includes('1f29');
  const isSplitCompact = layout === 'split-compact';

  return (
    <div
      className={cn(
        'relative flex w-full overflow-hidden rounded-xl',
        isSplitCompact
          ? 'h-[6.5rem] flex-row items-center sm:h-[7.25rem] lg:h-[8.5rem]'
          : 'min-h-[7rem] max-h-[8.75rem] flex-col justify-center self-start sm:min-h-[7.5rem] sm:max-h-[9.25rem]',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <img
        src={promo.image}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-right opacity-40 mix-blend-luminosity"
        loading="lazy"
        aria-hidden="true"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          isDark
            ? 'bg-[linear-gradient(90deg,rgba(17,24,39,0.94)_0%,rgba(31,41,55,0.72)_45%,rgba(17,24,39,0.35)_100%)]'
            : 'bg-[linear-gradient(90deg,rgba(29,78,216,0.92)_0%,rgba(37,99,235,0.55)_55%,rgba(37,99,235,0.25)_100%)]',
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative z-[1] flex flex-1 flex-col justify-center',
          isSplitCompact
            ? 'min-w-0 gap-1 p-2.5 sm:gap-1.5 sm:p-3'
            : 'gap-1.5 p-3 sm:p-3.5',
        )}
      >
        {promo.eyebrow ? (
          <p
            className={cn(
              'font-bold uppercase tracking-wide text-white/80',
              isSplitCompact
                ? 'text-[0.5rem] sm:text-[0.5625rem]'
                : 'text-[0.5625rem] sm:text-[0.625rem]',
            )}
          >
            {promo.eyebrow}
          </p>
        ) : null}
        <h3
          className={cn(
            'max-w-md text-balance font-bold uppercase leading-tight text-white',
            isSplitCompact
              ? 'line-clamp-2 text-[0.6875rem] sm:text-xs lg:text-sm'
              : 'text-sm sm:text-base lg:text-lg',
          )}
        >
          {promo.headline}
        </h3>
        {promo.subheadline ? (
          <p
            className={cn(
              'max-w-sm text-white/90',
              isSplitCompact
                ? 'line-clamp-1 text-[0.5625rem] leading-snug sm:text-[0.625rem]'
                : 'text-[0.625rem] leading-snug sm:text-[0.6875rem]',
            )}
          >
            {promo.subheadline}
          </p>
        ) : null}
        {promo.priceLabel ? (
          <p className="text-[0.6875rem] font-bold text-white sm:text-xs">{promo.priceLabel}</p>
        ) : null}
        {!isSplitCompact ? (
          <div>
            <Button
              asChild
              className="h-8 rounded-md bg-white px-4 text-[0.6875rem] font-bold uppercase tracking-wide text-[#2563EB] shadow-md hover:bg-white/95"
            >
              <Link to={promo.href}>{promo.ctaLabel ?? 'COMPRAR'}</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {isSplitCompact ? (
        <div className="relative z-[1] flex shrink-0 items-center p-2 sm:p-3">
          <Button
            asChild
            className="h-7 rounded-md bg-white px-3 text-[0.625rem] font-bold uppercase tracking-wide text-[#2563EB] shadow-md hover:bg-white/95 sm:h-8 sm:px-4 sm:text-[0.6875rem]"
          >
            <Link to={promo.href}>{promo.ctaLabel ?? 'COMPRAR'}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function HomeCategoryShowcaseSection({ config }: { config: HomeCategoryShowcaseConfig }) {
  const titleId = `home-showcase-${config.id}-title`;
  const isCategoriesGrid = config.showcaseLayout === 'categories-grid';

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  const showCarouselControls = config.products.length > 2;
  const isSplitLayout = config.showcaseLayout === 'split';
  const isSplitCompact = isSplitLayout && config.splitDensity === 'compact';
  const useRowTiles = config.categoryTileVariant === 'row';
  const splitGridClass =
    config.categoryGridColumns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';
  const compactCategoryGrid = !isSplitLayout && config.categoryColumns != null;
  const categoryGridClass =
    config.categoryColumns === 4
      ? 'grid-cols-3 sm:grid-cols-4'
      : config.categoryColumns === 3
        ? 'grid-cols-3'
        : 'grid-cols-2';

  const renderCategoryTiles = (compact: boolean, dense = false) =>
    config.categories.map((category) =>
      useRowTiles ? (
        <ShowcaseCategoryRowTile
          key={category.id}
          label={category.label}
          image={category.image}
          href={category.href}
          compact={dense}
        />
      ) : (
        <ShowcaseCategoryTile
          key={category.id}
          label={category.label}
          image={category.image}
          href={category.href}
          compact={compact}
          dense={dense}
        />
      ),
    );

  return (
    <section aria-labelledby={titleId} className="home-landing-sans bg-[#F5F5F5]">
      <div className="container py-4 sm:py-6">
        <h2
          id={titleId}
          className="home-section-title mb-3 text-lg font-bold text-[#374151] sm:mb-4 sm:text-xl"
        >
          {config.title}
        </h2>

        <div className="overflow-hidden rounded-xl bg-white p-2.5 shadow-[0_4px_24px_rgba(15,31,61,0.08)] sm:p-3 lg:p-4">
          {isCategoriesGrid ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {config.categories.map((category) => (
                <ShowcaseCategoryTile
                  key={category.id}
                  label={category.label}
                  image={category.image}
                  href={category.href}
                />
              ))}
            </div>
          ) : isSplitLayout && config.promo ? (
            <div
              className={cn(
                'grid gap-2 sm:gap-2.5',
                isSplitCompact
                  ? 'lg:grid-cols-[1.45fr_1fr] lg:items-stretch'
                  : 'lg:grid-cols-[1.58fr_1fr] lg:items-stretch',
              )}
            >
              {config.promoVariant === 'wide' ? (
                <ShowcaseWidePromoBanner promo={config.promo} />
              ) : (
                <ShowcasePromoBanner
                  promo={config.promo}
                  layout={isSplitCompact ? 'split-compact' : 'default'}
                  className={
                    isSplitCompact
                      ? 'lg:self-stretch'
                      : 'lg:max-h-none lg:min-h-[11.5rem] lg:self-stretch'
                  }
                />
              )}

              <div
                className={cn(
                  'grid content-stretch gap-1.5 sm:gap-2',
                  isSplitCompact ? 'grid-cols-3 auto-rows-fr' : splitGridClass,
                )}
              >
                {renderCategoryTiles(true, isSplitCompact)}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-2.5 sm:gap-3',
                !compactCategoryGrid && 'lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-4',
              )}
            >
              {config.promo ? <ShowcasePromoBanner promo={config.promo} /> : null}

              <div
                className={cn(
                  'grid gap-1.5 sm:gap-2',
                  categoryGridClass,
                  compactCategoryGrid && 'sm:gap-2',
                )}
              >
                {renderCategoryTiles(compactCategoryGrid)}
              </div>
            </div>
          )}

          <div className="relative mt-3 sm:mt-4">
            {showCarouselControls ? (
              <div className="mb-3 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-white text-[#374151] shadow-sm transition-colors',
                    'hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
                  )}
                  aria-label="Productos anteriores"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-white text-[#374151] shadow-sm transition-colors',
                    'hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
                  )}
                  aria-label="Productos siguientes"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <div ref={emblaRef} className="overflow-hidden">
              <ul className={cn('flex', PRODUCT_CAROUSEL_GAP_CLASS)} role="list">
                {config.products.map((product) => (
                  <li key={product.id} className={PRODUCT_SLIDE_CLASS}>
                    <HomeCategoryShowcaseProductCard product={product} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
