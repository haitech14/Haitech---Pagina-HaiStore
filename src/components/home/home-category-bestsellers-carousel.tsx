import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { DualPrice } from '@/components/product/product-dual-price';
import type { FeaturedProduct } from '@/data/featured-products';
import type { HomeCategorySpotlightConfig } from '@/data/home-category-spotlights';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { catalogRowToFeatured, getCatalogRows } from '@/lib/catalog-featured';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { productPath } from '@/lib/product-path';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
} from '@/lib/product-card-images';
import { cn } from '@/lib/utils';

const ACCENT = '#E30613';
const SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.75rem)/1.35)] sm:flex-[0_0_calc((100%-1.5rem)/2.4)] md:flex-[0_0_calc((100%-2.25rem)/3)] lg:flex-[0_0_calc((100%-3rem)/4)]';

function BestSellerCard({ product }: { product: FeaturedProduct }) {
  const displayPrice = useCatalogDisplayPrice({
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
  });
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const unavailable = stock <= 0;
  const onRequest = isPriceOnRequest(displayPrice.priceUsd);
  const href = productPath({ id: product.id, name: product.name });

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code: product.code ?? null,
        name: product.name,
        category: product.category,
        brand: product.brand ?? null,
        image_url: product.image,
        gallery: product.gallery ?? null,
      }),
    [product],
  );
  const imageSrc = buildProductCardImageCandidates(imageSource)[0] ?? product.image;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(15,31,61,0.05)]">
      <Link to={href} className="flex flex-1 flex-col p-4 sm:p-5" aria-label={product.name}>
        <div className="mx-auto flex h-36 w-full items-center justify-center sm:h-40">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-3 min-h-[3.6rem] text-center text-sm font-medium leading-snug text-[#374151]">
          {product.name}
        </h3>
        {unavailable ? (
          <p className="mt-2 text-center text-sm text-[#6b7280]">No está disponible para venta</p>
        ) : onRequest ? (
          <p className="mt-2 text-center text-xs font-semibold leading-tight text-[#6B7280] sm:text-sm">
            {CONSULTAR_PRECIO_LABEL}
          </p>
        ) : (
          <p
            className="mt-2 text-center text-lg font-bold tabular-nums sm:text-xl"
            style={{ color: ACCENT }}
          >
            <DualPrice usd={displayPrice.priceUsd} className="text-lg font-bold sm:text-xl" />
          </p>
        )}
        <p className="mt-1.5 flex items-center justify-center gap-0.5 text-xs text-[#9ca3af]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-3.5 fill-none stroke-current" aria-hidden="true" />
          ))}
          <span>(0)</span>
        </p>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <Link
          to={href}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-bold text-white',
            'transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          style={{ backgroundColor: ACCENT }}
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
          Ver producto
        </Link>
      </div>
    </article>
  );
}

function resolveBestsellers(config: HomeCategorySpotlightConfig): FeaturedProduct[] {
  const rows = getCatalogRows();
  const fromCatalog = rows
    .filter((row) => {
      const haystack = `${row.category ?? ''} ${row.name ?? ''}`;
      if (!config.categoryMatch.test(haystack)) return false;
      if (/toner|cartucho|repuesto|unidad de|fusor|cilindro|revelador/i.test(row.name ?? '')) {
        return false;
      }
      if (config.id === 'impresoras' && /multifuncional/i.test(haystack)) return false;
      if (config.id === 'multifuncionales' && !/multifuncional/i.test(haystack)) return false;
      if (
        config.id !== 'formato-ancho' &&
        /seminueva|seminuevo|remanufactur/i.test(haystack) &&
        !/nueva|nuevo/i.test(row.name ?? '')
      ) {
        return false;
      }
      return true;
    })
    .map((row) => catalogRowToFeatured(row))
    .sort((a, b) => {
      const stockA = Math.max(0, Number(a.stock) || 0);
      const stockB = Math.max(0, Number(b.stock) || 0);
      if (stockB !== stockA) return stockB - stockA;
      return a.name.localeCompare(b.name, 'es');
    })
    .slice(0, 12);

  return fromCatalog;
}

export function HomeCategoryBestsellersCarousel({
  config,
  className,
}: {
  config: HomeCategorySpotlightConfig;
  className?: string;
}) {
  const { data: bundle } = useHomeCatalogBundle();
  // No calentar inventory-index en home; solo usar filas ya en memoria.
  const catalogWarm = getCatalogRows().length > 0;

  const products = useMemo(() => {
    if (config.catalogFamily && bundle?.sections) {
      const section = bundle.sections.find((entry) => entry.id === config.catalogFamily);
      const fromBundle = section?.productsByCondition?.originales ?? [];
      if (fromBundle.length >= 4) {
        return fromBundle.slice(0, 12);
      }
    }
    if (!catalogWarm) return [];
    return resolveBestsellers(config);
  }, [bundle, catalogWarm, config]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    watchDrag: emblaShouldWatchDrag,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (products.length === 0) return null;

  const titleId = `home-bestsellers-${config.id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn('home-landing-sans bg-white pb-8 pt-2 sm:pb-10 sm:pt-3', className)}
    >
      <div className="container">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10"
              style={{ backgroundColor: ACCENT }}
              aria-hidden="true"
            >
              <Star className="size-4 fill-white text-white sm:size-[1.125rem]" />
            </span>
            <h2
              id={titleId}
              className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl lg:text-2xl"
            >
              {config.bestsellersTitle}
            </h2>
          </div>
          <Link
            to={config.categoryHref}
            className="inline-flex items-center gap-0.5 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
            style={{ color: ACCENT }}
          >
            Ver todos los productos
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex gap-3 sm:gap-4" role="list">
              {products.map((product) => (
                <li key={product.id} className={SLIDE_CLASS}>
                  <BestSellerCard product={product} />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Anterior"
              disabled={!canPrev}
              onClick={() => emblaApi?.scrollPrev()}
              className="flex size-10 items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563] transition-colors hover:bg-[#e5e7eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] disabled:opacity-40"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              disabled={!canNext}
              onClick={() => emblaApi?.scrollNext()}
              className="flex size-10 items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563] transition-colors hover:bg-[#e5e7eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] disabled:opacity-40"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
