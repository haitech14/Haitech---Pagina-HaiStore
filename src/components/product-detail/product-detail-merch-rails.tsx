import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { HOME_HERO_WHATSAPP_LINK } from '@/data/home-hero-slides';
import { categoryPath } from '@/lib/category-path';
import { CONSULTAR_PRECIO_LABEL, formatPenUsdParenthetical, isPriceOnRequest } from '@/lib/display-price';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import type { EquipmentSkuVariant, EquipmentSkuVariantId } from '@/lib/equipment-sku-variants';
import {
  HAITECH_PRODUCT_CAROUSEL_ARROW,
  HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT,
  HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT,
} from '@/lib/haitech-product-carousel-layout';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailMerchRailsProps {
  product: Product;
  skuVariants?: EquipmentSkuVariant[];
  selectedSkuVariantId?: EquipmentSkuVariantId;
  onSkuVariantSelect?: (variantId: EquipmentSkuVariantId) => void;
  complementProducts: Product[];
  className?: string;
}

function VariantRailCard({
  variant,
  brand,
  selected,
  onSelect,
  compact = false,
  className,
}: {
  variant: EquipmentSkuVariant;
  brand: string | null;
  selected: boolean;
  onSelect: (variantId: EquipmentSkuVariantId) => void;
  compact?: boolean;
  className?: string;
}) {
  const image = variant.image?.trim();

  return (
    <li className={cn('min-w-0', className)}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(variant.id)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl border bg-white text-left transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]',
          compact ? 'px-2 py-2' : 'px-2.5 py-2.5',
          selected ? 'border-[#E31B23] ring-1 ring-[#E31B23]' : 'border-neutral-200',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50',
            compact ? 'size-12 sm:size-14' : 'size-14 sm:size-16',
          )}
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="max-h-full max-w-full object-contain object-center"
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-bold text-neutral-200">{variant.title.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {brand ? (
            <p className="truncate text-[10px] font-bold uppercase leading-none tracking-wide text-[#E31B23]">
              {brand}
            </p>
          ) : null}
          <p className="mt-0.5 truncate text-[0.75rem] font-bold leading-tight text-neutral-900 sm:text-[0.8125rem]">
            {variant.title}
          </p>
          {variant.id === 'pack-emprendedor' ? (
            <p className="mt-0.5 truncate font-mono text-[10px] text-neutral-500">{variant.code}</p>
          ) : null}
          <p className="mt-0.5 truncate text-[10px] leading-tight text-neutral-500 sm:text-[11px]">
            {variant.subtitle}
          </p>
        </div>
      </button>
    </li>
  );
}

function ComplementRailCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const title = product.name.trim() || getProductCardTitleContent(product).title;
  const image = product.image_url?.trim();
  const synthetic = product.id.startsWith('complement-merch-');
  const canOpenProduct = !synthetic && (Boolean(product.slug) || Boolean(product.id));
  const href = canOpenProduct ? productPath(product) : undefined;
  const priceUsd = product.price;

  const media = image ? (
    <img src={image} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
  ) : (
    <span className="text-2xl font-bold text-neutral-200">{title.charAt(0)}</span>
  );

  return (
    <li className={cn('min-w-0', className)}>
      <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-2.5">
        {href ? (
          <Link
            to={href}
            className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23] sm:h-24"
          >
            {media}
          </Link>
        ) : (
          <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 sm:h-24">
            {media}
          </div>
        )}
        <h3 className="mt-2 line-clamp-2 min-h-[2.1rem] text-[11px] font-semibold leading-snug text-neutral-900 sm:text-xs">
          {href ? (
            <Link to={href} className="hover:text-[#E31B23] focus-visible:outline-none">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="mt-1 text-sm font-bold tabular-nums text-[#E31B23]">
          {isPriceOnRequest(priceUsd) ? CONSULTAR_PRECIO_LABEL : formatPenUsdParenthetical(priceUsd)}
        </p>
        <div className="mt-auto pt-3">
          <AddToCartButton
            product={product}
            className="h-auto min-h-9 w-full justify-center gap-1.5 rounded-full px-2.5 py-2 text-[10px] font-bold leading-tight sm:min-h-9 sm:px-3 sm:text-[11px]"
          >
            <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 text-center whitespace-normal">Agregar al carrito</span>
          </AddToCartButton>
        </div>
      </article>
    </li>
  );
}

function ComplementProductsCarousel({ products }: { products: Product[] }) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
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

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, products]);

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div className="relative mt-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <ul
          className="flex touch-pan-x gap-3 sm:gap-3.5"
          role="list"
          aria-label="Accesorios recomendados"
        >
          {products.map((item) => (
            <ComplementRailCard
              key={item.id}
              product={item}
              className="shrink-0 flex-[0_0_10.5rem] sm:flex-[0_0_12rem]"
            />
          ))}
        </ul>
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT)}
            aria-label="Accesorios anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT)}
            aria-label="Accesorios siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function RailHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: { href: string; label: string; external?: boolean };
}) {
  const actionClassName =
    'shrink-0 text-xs font-semibold text-[#E31B23] transition-colors hover:text-[#c41820] sm:text-sm';

  return (
    <header className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-neutral-900 sm:text-lg">{title}</h2>
        <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">{subtitle}</p>
      </div>
      {action.external ? (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClassName}
        >
          {action.label}
        </a>
      ) : (
        <Link to={action.href} className={actionClassName}>
          {action.label}
        </Link>
      )}
    </header>
  );
}

function SkuVariantCardsCarousel({
  variants,
  brand,
  selectedSkuVariantId,
  onSelect,
  compact = false,
}: {
  variants: EquipmentSkuVariant[];
  brand: string | null;
  selectedSkuVariantId: EquipmentSkuVariantId;
  onSelect: (variantId: EquipmentSkuVariantId) => void;
  compact?: boolean;
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
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

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, variants]);

  const showArrows = canScrollPrev || canScrollNext;
  const slideClass = compact
    ? 'shrink-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-1rem)/3)]'
    : 'shrink-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-2.25rem)/4)]';

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <ul
          className={cn('flex touch-pan-y', compact ? 'gap-2' : 'gap-3')}
          role="list"
          aria-label="Variantes de producto"
        >
          {variants.map((variant) => (
            <VariantRailCard
              key={variant.id}
              variant={variant}
              brand={brand}
              selected={variant.id === selectedSkuVariantId}
              onSelect={onSelect}
              compact={compact}
              className={slideClass}
            />
          ))}
        </ul>
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT)}
            aria-label="Variantes anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT)}
            aria-label="Variantes siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

export function ProductDetailSkuVariantRail({
  product,
  skuVariants,
  selectedSkuVariantId = 'base',
  onSkuVariantSelect,
  className,
  compact = false,
  asAccordion = false,
  hideHeader = false,
  expanded,
  onExpandedChange,
}: {
  product: Product;
  skuVariants: EquipmentSkuVariant[];
  selectedSkuVariantId?: EquipmentSkuVariantId;
  onSkuVariantSelect: (variantId: EquipmentSkuVariantId) => void;
  className?: string;
  compact?: boolean;
  asAccordion?: boolean;
  /** Oculta el subtítulo/CTA (cuando el padre ya muestra el encabezado). */
  hideHeader?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  if (skuVariants.length === 0) return null;

  const brand = getProductCardTitleContent(product).brand;
  const cards = (
    <SkuVariantCardsCarousel
      variants={skuVariants}
      brand={brand}
      selectedSkuVariantId={selectedSkuVariantId}
      onSelect={onSkuVariantSelect}
      compact={compact || asAccordion}
    />
  );

  if (asAccordion) {
    return (
      <ProductDetailHeroCollapsibleSection
        title="Variantes de producto"
        panelAriaLabel="Variantes de producto"
        className={className}
        {...(expanded !== undefined ? { expanded } : {})}
        {...(onExpandedChange ? { onExpandedChange } : {})}
      >
        <div className="space-y-2">
          {!hideHeader ? (
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <p className="text-[0.625rem] text-neutral-500">
                Elige el combinado que mejor se ajuste a tu necesidad
              </p>
              <a
                href={HOME_HERO_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.625rem] font-semibold text-[#E31B23] hover:text-[#c41820]"
              >
                Consulta a un asesor
              </a>
            </div>
          ) : null}
          {cards}
        </div>
      </ProductDetailHeroCollapsibleSection>
    );
  }

  if (compact) {
    return (
      <section aria-label="Variantes de producto" className={className}>
        {!hideHeader ? (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="text-[0.625rem] leading-snug text-neutral-500">
              Elige el combinado que mejor se ajuste a tu necesidad
            </p>
            <a
              href={HOME_HERO_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[0.625rem] font-semibold text-[#E31B23] hover:text-[#c41820]"
            >
              Consulta a un asesor
            </a>
          </div>
        ) : null}
        {cards}
      </section>
    );
  }

  return (
    <section aria-labelledby="variantes-producto-titulo" className={className}>
      <RailHeader
        title="Variantes de producto"
        subtitle="Elige el combinado que mejor se ajuste a tu necesidad"
        action={{ href: HOME_HERO_WHATSAPP_LINK, label: 'Consulta a un asesor', external: true }}
      />
      <span id="variantes-producto-titulo" className="sr-only">
        Variantes de producto
      </span>
      <div className="mt-3">{cards}</div>
    </section>
  );
}

export function ProductDetailMerchRails({
  product,
  skuVariants = [],
  selectedSkuVariantId = 'base',
  onSkuVariantSelect,
  complementProducts,
  className,
}: ProductDetailMerchRailsProps) {
  const modelLabel =
    getProductCardTitleContent(product).title.replace(/^impresora\s+/i, '') || product.name;
  const showVariants = skuVariants.length > 0 && Boolean(onSkuVariantSelect);
  const showComplement = complementProducts.length > 0;

  if (!showVariants && !showComplement) return null;

  return (
    <div className={cn('space-y-6 sm:space-y-7', className)}>
      {showVariants && onSkuVariantSelect ? (
        <ProductDetailSkuVariantRail
          product={product}
          skuVariants={skuVariants}
          selectedSkuVariantId={selectedSkuVariantId}
          onSkuVariantSelect={onSkuVariantSelect}
        />
      ) : null}

      {showComplement ? (
        <section aria-labelledby="complementa-compra-titulo">
          <RailHeader
            title="Complementa tu compra"
            subtitle={`Accesorios recomendados para ${modelLabel}`}
            action={{ href: categoryPath('accesorios'), label: 'Ver todo en accesorios' }}
          />
          <span id="complementa-compra-titulo" className="sr-only">
            Complementa tu compra
          </span>
          <ComplementProductsCarousel products={complementProducts} />
        </section>
      ) : null}
    </div>
  );
}
