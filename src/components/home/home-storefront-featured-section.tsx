import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Package, ShoppingCart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardPill } from '@/components/product/product-card-pill';
import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import {
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import type { HomeFeaturedEquipmentConditionFilterId } from '@/data/home-featured-quick-filters-equipment';
import { STOREFRONT_ORANGE } from '@/data/home-storefront-mockup';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import {
  resolveFormatoPapelBadgeLabels,
  resolveProductSpeedPpm,
  inferColor,
} from '@/lib/category-catalog-filters';
import { categoryLandingPath } from '@/lib/category-path';
import {
  catalogRowToFeatured,
  getCatalogRows,
  loadCatalogIndex,
} from '@/lib/catalog-featured';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  compareHomeFeaturedConsumablesProducts,
  compareHomeFeaturedEquipmentProducts,
  matchesHomeFeaturedConsumablesConditionFilter,
  matchesHomeFeaturedEquipmentCategoryFilter,
  matchesHomeFeaturedEquipmentConditionFilter,
} from '@/lib/home-featured-product-filter';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { productHasSpdf } from '@/lib/product-card-pill-badges';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { productPath } from '@/lib/product-path';
import { productToFeatured } from '@/lib/store-products';
import { featuredToWishlistItem } from '@/lib/wishlist-product';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const FEATURED_CAROUSEL_GAP_CLASS = 'gap-2.5 sm:gap-3';
/** 2 móvil · 3 tablet · 5 desktop visibles por vista. */
const FEATURED_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.625rem)/2)] sm:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-3rem)/5)]';

const STOREFRONT_FEATURED_DISPLAY_LIMIT = 15;
/** Pool amplio: incluye inventory-index (escáneres, impresoras, etc.). */
const STOREFRONT_FEATURED_POOL_LIMIT = 2000;

const FEATURED_HOVER_BADGES_REVEAL_CLASS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

const VIEW_ALL_PRODUCTS_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E30613] bg-[#E30613] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#C80511] hover:border-[#C80511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-sm';

const FEATURED_CARD_OVERLAY_BUTTON_CLASS =
  'flex size-7 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm transition-colors hover:bg-[#FFF0F1] hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-1';

function buildStorefrontHoverSpecBadges(
  product: ProductBadgeSource,
): Array<{ id: string; label: string }> {
  const badges: Array<{ id: string; label: string }> = [];

  const ppm = resolveProductSpeedPpm(product);
  if (ppm != null) badges.push({ id: 'velocidad', label: `${ppm} ppm` });

  for (const [index, label] of resolveFormatoPapelBadgeLabels(product).entries()) {
    badges.push({
      id: index === 0 ? 'formato' : `formato-${label.toLowerCase()}`,
      label,
    });
  }

  if (productHasSpdf(product)) {
    badges.push({ id: 'spdf', label: 'SPDF' });
  }

  return badges;
}

const STOREFRONT_EQUIPMENT_CONDITION_TABS: ReadonlyArray<{
  id: HomeFeaturedEquipmentConditionFilterId;
  label: string;
}> = [
  { id: 'nuevas', label: 'Nueva' },
  { id: 'seminuevas', label: 'Seminueva' },
  { id: 'remanufacturadas', label: 'Remanufacturada' },
];

const STOREFRONT_CONSUMABLES_CONDITION_TABS = HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS.filter(
  (filter) => filter.id !== 'recargas',
);

type StorefrontCardTitleMode = 'equipment' | 'consumable';

type StorefrontCatalogKind =
  | 'multifuncionales'
  | 'impresoras'
  | 'escaneres'
  | 'toner'
  | 'repuestos';

const STOREFRONT_SECTION_DIVIDER_CLASS = 'h-px w-full bg-[#E5E7EB]';

const STOREFRONT_CATALOG_RAILS: ReadonlyArray<{
  kind: StorefrontCatalogKind;
  titleId: string;
  title: string;
  subtitle: string;
  viewAllHref: string;
  paginationLabel: string;
}> = [
  {
    kind: 'multifuncionales',
    titleId: 'home-storefront-featured-title',
    title: 'Impresora Multifuncional Laser',
    subtitle: 'Equipos listos para oficina, con stock y garantía',
    viewAllHref: categoryLandingPath('multifuncionales'),
    paginationLabel: 'impresoras multifuncionales',
  },
  {
    kind: 'impresoras',
    titleId: 'home-storefront-impresoras-title',
    title: 'Impresoras',
    subtitle: 'Impresoras láser y de tinta para oficina',
    viewAllHref: categoryLandingPath('impresoras'),
    paginationLabel: 'impresoras',
  },
  {
    kind: 'escaneres',
    titleId: 'home-storefront-escaneres-title',
    title: 'Escáneres',
    subtitle: 'Digitalización rápida para documentos y oficina',
    viewAllHref: categoryLandingPath('escaneres'),
    paginationLabel: 'escáneres',
  },
  {
    kind: 'toner',
    titleId: 'home-storefront-toner-title',
    title: 'Toner',
    subtitle: 'Tóner original y compatible con stock disponible',
    viewAllHref: HOME_LANDING_LINKS.tonerCatalog,
    paginationLabel: 'toner',
  },
  {
    kind: 'repuestos',
    titleId: 'home-storefront-repuestos-title',
    title: 'Repuestos',
    subtitle: 'Repuestos para mantenimiento y servicio técnico',
    viewAllHref: HOME_LANDING_LINKS.sparePartsCatalog,
    paginationLabel: 'repuestos',
  },
];

/** Títulos de vitrina: Impresora Multifuncional Laser {condición} {marca} {modelo}. */
function formatStorefrontProductTitle(
  title: string,
  brand: string | null,
  condition: string | null,
): string {
  let next = title
    .replace(/\bB\/N\b/gi, ' ')
    .replace(/\bColor\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  next = next
    .replace(/^Impresora Multifuncional L[aá]ser\s+/i, '')
    .replace(/^Fotocopiadora\s+/i, '')
    .replace(/^Impresora Multifuncional\s+/i, '')
    .replace(/^Multifuncional\s+/i, '')
    .replace(/^\(|\)$/g, '')
    .trim();

  if (condition?.trim()) {
    const escaped = condition.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    next = next.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), ' ');
  }
  if (brand?.trim()) {
    const escaped = brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    next = next.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), ' ');
  }

  const model = next.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();

  const parts = ['Impresora Multifuncional Laser'];
  if (condition?.trim()) parts.push(condition.trim());
  if (brand?.trim()) parts.push(brand.trim());
  if (model) parts.push(model);

  return parts.join(' ');
}

function matchesFotocopiadorasSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'multifuncionales');
}

function matchesFotocopiadorasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'multifuncionales',
  );
}

function matchesImpresorasSection(product: FeaturedProduct): boolean {
  return (
    matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-laser') ||
    matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-tinta') ||
    matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-termica') ||
    matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-matricial')
  );
}

function matchesImpresorasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'impresora-laser',
  );
}

function matchesEscaneresSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'escaneres');
}

function matchesEscaneresCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(product, equipmentCondition, 'escaneres');
}

function HomeStorefrontProductCard({
  product,
  priority = false,
  titleMode = 'equipment',
}: {
  product: FeaturedProduct;
  priority?: boolean;
  titleMode?: StorefrontCardTitleMode;
}) {
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const catalogProduct = useCatalogProductRow(product.id);
  const displayPrice = useCatalogDisplayPrice({
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
  });
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(product.oldPrice != null ? { oldPrice: product.oldPrice } : {}),
    ...(product.discount != null ? { discount: product.discount } : {}),
  });

  const code = product.code ?? catalogProduct?.code ?? null;
  const stock = catalogProduct?.stock ?? product.stock ?? 0;
  const stockCount = Math.max(0, Math.floor(Number(stock) || 0));
  const outOfStock = stockCount <= 0;
  const buyNowLabel = outOfStock ? 'Reservar' : 'Comprar';
  const productSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    attributes: product.attributes ?? catalogProduct?.attributes ?? [],
  };
  const { brand, code: displayCode, title: rawProductTitle } = getProductCardTitleContent(productSource);
  const conditionLabel = resolveProductCardBadgeLabel(productSource);
  const productTitle =
    titleMode === 'equipment'
      ? formatStorefrontProductTitle(rawProductTitle, brand, conditionLabel)
      : rawProductTitle;
  const hoverSpecBadges = buildStorefrontHoverSpecBadges(productSource);
  const productCodeLabel = (displayCode ?? code)?.trim() || null;
  const stockHoverLabel = outOfStock
    ? PRODUCT_ON_REQUEST_STOCK_LABEL
    : String(Math.max(0, Math.floor(stockCount)));
  const wishlistSelected = isWishlisted(product.id);

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code,
        name: product.name,
        category: product.category,
        brand: product.brand ?? catalogProduct?.brand ?? null,
        image_url: product.image ?? catalogProduct?.image_url ?? null,
        gallery: [...(product.gallery ?? []), ...(catalogProduct?.gallery ?? [])],
      }),
    [catalogProduct, code, product],
  );
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(imageSource), [imageSource]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(imageSource),
    [imageSource],
  );
  const hoverImageSrc = useMemo(
    () => resolveProductCardHoverImageFromProduct(imageSource),
    [imageSource],
  );

  const detailPath = useMemo(() => {
    const slug = catalogProduct?.slug?.trim();
    if (slug) return productPath({ id: product.id, name: product.name, slug });
    return productPath(product);
  }, [catalogProduct?.slug, product]);

  const showPriceOnRequest = isPriceOnRequest(displayPrice.priceUsd);
  const clipboardImageUrl = imageCandidates[0] ?? null;
  const clipboardIsColor = inferColor(productSource) === 'Color';

  const cartProduct: Product = {
    id: product.id,
    name: product.name,
    description: catalogProduct?.description ?? null,
    price: displayPrice.priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    created_at: catalogProduct?.created_at ?? new Date().toISOString(),
    attributes: product.attributes ?? catalogProduct?.attributes ?? [],
  };

  const handleAdd = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(cartProduct, { quantity: 1 });
  };

  const handleWishlist = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(featuredToWishlistItem(product));
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(15,31,61,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,31,61,0.09)]">
      <div className="relative px-1 pt-2.5 sm:px-1.5 sm:pt-3">
        <div
          className={cn(
            'absolute right-2 top-2 z-[2] flex flex-col gap-1 sm:right-2.5 sm:top-2.5',
          )}
        >
          <button
            type="button"
            aria-pressed={wishlistSelected}
            aria-label={
              wishlistSelected
                ? `Quitar ${product.name} de favoritos`
                : `Añadir ${product.name} a favoritos`
            }
            onClick={handleWishlist}
            className={cn(
              FEATURED_CARD_OVERLAY_BUTTON_CLASS,
              'text-[#E30613]',
              wishlistSelected && 'border-[#E30613]/40 bg-[#FFF0F1]',
            )}
          >
            <Heart
              className={cn('size-3.5', wishlistSelected && 'fill-[#E30613]')}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          <div
            className={cn(
              'flex flex-col gap-1 opacity-0 transition-opacity duration-200 ease-out',
              'group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100',
              'motion-reduce:opacity-100 motion-reduce:transition-none',
            )}
          >
            {clipboardImageUrl ? (
              <ProductCardCopyImageButton
                productName={product.name}
                imageUrl={clipboardImageUrl}
                className={FEATURED_CARD_OVERLAY_BUTTON_CLASS}
              />
            ) : null}
            <ProductCardCopyButton
              productName={product.name}
              title={productTitle}
              stock={stockCount}
              priceUsd={displayPrice.priceUsd}
              productId={product.id}
              productPath={detailPath}
              isColorProduct={clipboardIsColor}
              {...(productCodeLabel != null ? { code: productCodeLabel } : {})}
              {...(conditionLabel != null ? { condition: conditionLabel } : {})}
              {...(product.category != null ? { category: product.category } : {})}
              {...(catalogProduct?.volume_role_prices != null
                ? { volumeRolePrices: catalogProduct.volume_role_prices }
                : {})}
              className={FEATURED_CARD_OVERLAY_BUTTON_CLASS}
            />
          </div>
        </div>

        <Link
          to={detailPath}
          className="relative mx-auto flex aspect-square max-h-[210px] w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:max-h-[230px] lg:max-h-[220px]"
          aria-label={`Ver ficha de ${product.name}`}
        >
          <ProductCardHoverImage
            candidates={imageCandidates}
            storedCandidates={storedImageCandidates}
            hoverSrc={hoverImageSrc}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="size-full max-h-[200px] max-w-[200px] sm:max-h-[220px] sm:max-w-[220px] lg:max-h-[208px] lg:max-w-[208px]"
            imageClassName="size-full max-h-[200px] max-w-[200px] object-contain object-center sm:max-h-[220px] sm:max-w-[220px] lg:max-h-[208px] lg:max-w-[208px]"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-1 sm:px-3 sm:pb-3">
        {brand || conditionLabel ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {brand ? (
              <p className="min-w-0 truncate text-[0.6875rem] font-bold uppercase tracking-wide text-[#E30613] sm:text-xs">
                {brand}
              </p>
            ) : null}
            {conditionLabel ? (
              <p className="shrink-0 text-[0.625rem] font-semibold leading-none text-[#4B5563] sm:text-[0.6875rem]">
                {conditionLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        <Link
          to={detailPath}
          className={cn(
            'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
            brand || conditionLabel ? 'mt-0.5' : null,
          )}
        >
          <h3 className="line-clamp-2 text-[0.75rem] font-bold leading-snug text-[#111111] sm:text-[0.8125rem]">
            {productTitle}
          </h3>
        </Link>

        <div className={FEATURED_HOVER_BADGES_REVEAL_CLASS}>
          <div className="min-h-0 overflow-hidden">
            <div
              className="mt-1.5 flex min-w-0 items-center gap-1.5"
              aria-label="Código, stock y especificaciones"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {productCodeLabel ? (
                  <span className="shrink-0 text-[0.625rem] font-medium tabular-nums leading-none text-[#6B7280] sm:text-[0.6875rem]">
                    {productCodeLabel}
                  </span>
                ) : null}
                {hoverSpecBadges.map((badge) => (
                  <ProductCardPill key={badge.id} label={badge.label} variant="secondary" />
                ))}
              </div>
              <span
                className={cn(
                  'ml-auto inline-flex shrink-0 items-center gap-1 text-[0.625rem] font-medium tabular-nums leading-none sm:text-[0.6875rem]',
                  outOfStock ? 'text-[#6B7280]' : 'text-emerald-700',
                )}
                title={outOfStock ? PRODUCT_ON_REQUEST_STOCK_LABEL : `Stock ${stockHoverLabel}`}
              >
                {!outOfStock ? (
                  <Package className="size-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                ) : null}
                <span>{stockHoverLabel}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2.5">
          {showPriceOnRequest ? (
            <p className="text-xs font-semibold text-[#6B7280] sm:text-sm">{CONSULTAR_PRECIO_LABEL}</p>
          ) : (
            <ProductCardFeaturedPricing
              productId={product.id}
              currentUsd={pricing.currentUsd}
              compareUsd={pricing.compareUsd}
              showAccentBar={false}
            />
          )}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-9 min-h-9 max-h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg text-[0.6875rem] font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-1 sm:text-xs"
            style={{ backgroundColor: STOREFRONT_ORANGE }}
          >
            {!outOfStock ? (
              <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
            ) : null}
            <span className="truncate">{buyNowLabel}</span>
          </button>
          <ProductWhatsAppButton
            stopPropagation
            skipDialogIfComplete
            product={{
              id: cartProduct.id,
              name: cartProduct.name,
              priceUsd: pricing.currentUsd,
              category: cartProduct.category,
              brand: cartProduct.brand ?? null,
            }}
            className="h-9 w-9 min-h-9 max-h-9 min-w-9 shrink-0 rounded-lg border-0 bg-[#25D366] p-0 text-white shadow-none hover:bg-[#20BD5A] hover:text-white focus-visible:ring-[#25D366]"
          />
        </div>
      </div>
    </article>
  );
}

function FeaturedSkeleton() {
  return (
    <ul className={cn('flex', FEATURED_CAROUSEL_GAP_CLASS)} role="list">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className={FEATURED_SLIDE_CLASS}>
          <div className="rounded-lg bg-white p-2.5">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="mt-2 h-2.5 w-12" />
            <Skeleton className="mt-1.5 h-3 w-full" />
            <Skeleton className="mt-1.5 h-2.5 w-10" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StorefrontFilterTabs<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  ariaLabel,
}: {
  filters: ReadonlyArray<{ id: T; label: string }>;
  activeFilter: T;
  onFilterChange: (filterId: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="mb-4 flex justify-center overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-5 [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-1.5 sm:gap-2" role="tablist" aria-label={ariaLabel}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors sm:px-4 sm:py-2 sm:text-[0.9375rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                isActive
                  ? 'border-[#E30613] bg-[#E30613] text-white'
                  : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
              )}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeaturedProductsCarousel({
  products,
  viewAllHref,
  paginationLabel,
  titleMode = 'equipment',
}: {
  products: FeaturedProduct[];
  viewAllHref: string;
  paginationLabel: string;
  titleMode?: StorefrontCardTitleMode;
}) {
  const productIdsKey = products.map((product) => product.id).join('|');
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: true,
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

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
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
    setAutoplayPaused(false);
  }, [emblaApi, productIdsKey]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || products.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, products.length]);

  return (
    <div
      className="relative"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', FEATURED_CAROUSEL_GAP_CLASS)} role="list">
          {products.map((product, index) => (
            <li key={product.id} className={FEATURED_SLIDE_CLASS}>
              <HomeStorefrontProductCard
                product={product}
                priority={index < 5}
                titleMode={titleMode}
              />
            </li>
          ))}
        </ul>
      </div>

      {scrollSnaps.length > 1 ? (
        <div
          className="mt-4 flex items-center justify-center gap-0 sm:mt-5"
          role="tablist"
          aria-label={`Paginación de ${paginationLabel}`}
        >
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Ir al grupo ${index + 1} de ${paginationLabel}`}
              onClick={() => scrollTo(index)}
              className="flex size-3.5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1"
            >
              <span
                className={cn(
                  'size-2 rounded-full transition-colors',
                  index === selectedIndex ? 'bg-neutral-900' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className={cn('flex justify-center', scrollSnaps.length > 1 ? 'mt-2.5' : 'mt-3')}>
        <Link to={viewAllHref} className={VIEW_ALL_PRODUCTS_BUTTON_CLASS}>
          Ver todos los productos
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function StorefrontCatalogRail({
  rail,
  productPool,
  isLoading,
  showSeparator,
}: {
  rail: (typeof STOREFRONT_CATALOG_RAILS)[number];
  productPool: FeaturedProduct[];
  isLoading: boolean;
  showSeparator: boolean;
}) {
  const [equipmentCondition, setEquipmentCondition] =
    useState<HomeFeaturedEquipmentConditionFilterId>('nuevas');
  const [consumablesCondition, setConsumablesCondition] =
    useState<HomeFeaturedConsumablesConditionFilterId>('originales');

  const isEquipmentRail =
    rail.kind === 'multifuncionales' ||
    rail.kind === 'impresoras' ||
    rail.kind === 'escaneres';

  const products = useMemo(() => {
    if (rail.kind === 'multifuncionales') {
      return [...productPool]
        .filter(
          (product) =>
            matchesFotocopiadorasSection(product) &&
            matchesFotocopiadorasCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    if (rail.kind === 'impresoras') {
      return [...productPool]
        .filter(
          (product) =>
            matchesImpresorasSection(product) &&
            matchesImpresorasCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    if (rail.kind === 'escaneres') {
      return [...productPool]
        .filter(
          (product) =>
            matchesEscaneresSection(product) &&
            matchesEscaneresCondition(product, equipmentCondition),
        )
        .sort(compareHomeFeaturedEquipmentProducts)
        .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
    }

    const categoryId = rail.kind === 'toner' ? 'toner' : 'repuestos-cat';
    return [...productPool]
      .filter((product) =>
        matchesHomeFeaturedConsumablesConditionFilter(product, consumablesCondition, categoryId),
      )
      .sort(compareHomeFeaturedConsumablesProducts)
      .slice(0, STOREFRONT_FEATURED_DISPLAY_LIMIT);
  }, [consumablesCondition, equipmentCondition, productPool, rail.kind]);

  const titleMode: StorefrontCardTitleMode =
    rail.kind === 'multifuncionales' ? 'equipment' : 'consumable';

  return (
    <>
      {showSeparator ? (
        <div className="container" aria-hidden="true">
          <div className={STOREFRONT_SECTION_DIVIDER_CLASS} />
        </div>
      ) : null}

      <section aria-labelledby={rail.titleId}>
        <div className="container pb-5 pt-5 sm:pb-7 sm:pt-6">
          <div className="mb-4 flex flex-col items-center text-center sm:mb-5">
            <h2
              id={rail.titleId}
              className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl lg:text-[2.125rem]"
            >
              {rail.title}
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-[#6B7280] sm:text-base">{rail.subtitle}</p>
          </div>

          {isEquipmentRail ? (
            <StorefrontFilterTabs
              filters={STOREFRONT_EQUIPMENT_CONDITION_TABS}
              activeFilter={equipmentCondition}
              onFilterChange={setEquipmentCondition}
              ariaLabel="Condición de equipos"
            />
          ) : (
            <StorefrontFilterTabs
              filters={STOREFRONT_CONSUMABLES_CONDITION_TABS}
              activeFilter={consumablesCondition}
              onFilterChange={setConsumablesCondition}
              ariaLabel={rail.kind === 'toner' ? 'Tipo de toner' : 'Tipo de repuesto'}
            />
          )}

          {isLoading && products.length === 0 ? (
            <FeaturedSkeleton />
          ) : products.length === 0 ? (
            <div className="space-y-3 text-center">
              <p className="rounded-lg border border-dashed border-[#D9DEE7] bg-white px-4 py-7 text-sm text-[#666666]">
                No hay productos para este filtro.
              </p>
              <Link to={rail.viewAllHref} className={VIEW_ALL_PRODUCTS_BUTTON_CLASS}>
                Ver todos los productos
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <FeaturedProductsCarousel
              products={products}
              viewAllHref={rail.viewAllHref}
              paginationLabel={rail.paginationLabel}
              titleMode={titleMode}
            />
          )}
        </div>
      </section>
    </>
  );
}

export function HomeStorefrontFeaturedSection() {
  const { data: catalogBundle, isLoading: bundleLoading } = useHomeCatalogBundle();
  const [catalogReady, setCatalogReady] = useState(() => getCatalogRows().length > 0);

  useEffect(() => {
    if (catalogReady) return;
    let cancelled = false;
    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) setCatalogReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogReady]);

  const productPool = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seen = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= STOREFRONT_FEATURED_POOL_LIMIT) return;
      seen.add(item.id);
      merged.push(enrichFeaturedFromCatalog(item));
    };

    for (const product of catalogBundle?.featured ?? []) {
      pushUnique(productToFeatured(product));
    }

    for (const section of catalogBundle?.sections ?? []) {
      for (const products of Object.values(section.productsByCondition)) {
        for (const item of products) {
          pushUnique(item);
        }
      }
    }

    // Sincroniza inventario completo (p. ej. Escáneres que no vienen en el home-bundle).
    for (const row of getCatalogRows()) {
      pushUnique(catalogRowToFeatured(row));
    }

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    return merged;
  }, [catalogBundle?.featured, catalogBundle?.sections, catalogReady]);

  const isLoading = bundleLoading || !catalogReady;

  return (
    <div className="bg-[#FAFBFC]">
      {STOREFRONT_CATALOG_RAILS.map((rail, index) => (
        <StorefrontCatalogRail
          key={rail.kind}
          rail={rail}
          productPool={productPool}
          isLoading={isLoading}
          showSeparator={index > 0}
        />
      ))}
    </div>
  );
}
