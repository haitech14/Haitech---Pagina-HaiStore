import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, ShoppingCart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardPill } from '@/components/product/product-card-pill';
import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { HomeEquiposHeroBanner } from '@/components/home/home-equipos-hero-banner';
import { HomeTonerRepuestosHeroBanner } from '@/components/home/home-toner-repuestos-hero-banner';
import { TonerPartnerBrandsSection } from '@/components/layout/footer-brands-section';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import { useIsMobile } from '@/hooks/use-media-query';
import {
  HOME_FEATURED_CONSUMABLES_CONDITION_FILTERS,
  type HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import type { HomeFeaturedEquipmentConditionFilterId } from '@/data/home-featured-quick-filters-equipment';
import { STOREFRONT_ORANGE } from '@/data/home-storefront-mockup';
import {
  clipboardPriceFieldsFromDisplay,
  useCatalogDisplayPrice,
} from '@/hooks/use-catalog-display-price';
import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { useHomeCatalogBundle } from '@/hooks/use-home-catalog-bundle';
import {
  resolveFormatoPapelBadgeLabels,
  resolveProductSpeedPpm,
  inferColor,
} from '@/lib/category-catalog-filters';
import {
  catalogRowToFeatured,
  getCatalogRows,
  loadCatalogIndex,
  type CatalogRow,
} from '@/lib/catalog-featured';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
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
/** Pool desde home-bundle + candidatos del índice (no bloquear UI por el JSON completo). */
const STOREFRONT_FEATURED_POOL_LIMIT = 2000;

function normalizeStorefrontHaystack(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Evita meter ~todo el inventario en el pool: solo filas útiles para los rails. */
function isStorefrontCatalogCandidate(row: CatalogRow): boolean {
  const haystack = normalizeStorefrontHaystack(`${row.category ?? ''} ${row.name}`);
  return (
    haystack.includes('escan') ||
    haystack.includes('scanner') ||
    haystack.includes('scansnap') ||
    haystack.includes('impresor') ||
    haystack.includes('multifunc') ||
    haystack.includes('fotocop') ||
    haystack.includes('toner') ||
    haystack.includes('tonner') ||
    haystack.includes('repuesto')
  );
}

const FEATURED_HOVER_BADGES_REVEAL_CLASS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

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
  | 'impresoras-termicas'
  | 'escaneres'
  | 'toner'
  | 'repuestos';

const STOREFRONT_CATALOG_RAILS: ReadonlyArray<{
  kind: StorefrontCatalogKind;
  titleId: string;
  title: string;
  paginationLabel: string;
}> = [
  {
    kind: 'multifuncionales',
    titleId: 'home-storefront-featured-title',
    title: 'Impresora Multifuncional Laser',
    paginationLabel: 'impresoras multifuncionales',
  },
  {
    kind: 'impresoras',
    titleId: 'home-storefront-impresoras-title',
    title: 'Impresoras Láser',
    paginationLabel: 'impresoras láser',
  },
  {
    kind: 'impresoras-termicas',
    titleId: 'home-storefront-impresoras-termicas-title',
    title: 'Impresoras térmicas',
    paginationLabel: 'impresoras térmicas',
  },
  {
    kind: 'escaneres',
    titleId: 'home-storefront-escaneres-title',
    title: 'Escáneres',
    paginationLabel: 'escáneres',
  },
  {
    kind: 'toner',
    titleId: 'home-storefront-toner-title',
    title: 'Toner',
    paginationLabel: 'toner',
  },
  {
    kind: 'repuestos',
    titleId: 'home-storefront-repuestos-title',
    title: 'Repuestos',
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
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-laser');
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

function matchesImpresorasTermicasSection(product: FeaturedProduct): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, 'impresora-termica');
}

function matchesImpresorasTermicasCondition(
  product: FeaturedProduct,
  equipmentCondition: HomeFeaturedEquipmentConditionFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(
    product,
    equipmentCondition,
    'impresora-termica',
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
            'absolute right-2 top-2 z-[2] hidden flex-col gap-1 md:flex md:right-2.5 md:top-2.5',
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
              'group-hover:opacity-100 group-focus-within:opacity-100',
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
              {...clipboardPriceFieldsFromDisplay(displayPrice)}
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

        <div className="mt-auto flex items-center gap-1.5 pt-2">
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
  className,
}: {
  filters: ReadonlyArray<{ id: T; label: string }>;
  activeFilter: T;
  onFilterChange: (filterId: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex max-w-full justify-end overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div className="flex gap-1 sm:gap-1.5" role="tablist" aria-label={ariaLabel}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors sm:px-3.5 sm:py-1.5 sm:text-sm',
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
  paginationLabel,
  titleMode = 'equipment',
}: {
  products: FeaturedProduct[];
  paginationLabel: string;
  titleMode?: StorefrontCardTitleMode;
}) {
  const productIdsKey = products.map((product) => product.id).join('|');
  const isMobile = useIsMobile();
  const slidesToScroll = isMobile ? 2 : 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: true,
    slidesToScroll,
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
    emblaApi.reInit({ slidesToScroll });
    emblaApi.scrollTo(0);
    setAutoplayPaused(false);
  }, [emblaApi, productIdsKey, slidesToScroll]);

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
          className="mt-2.5 flex items-center justify-center gap-0.5 opacity-80 sm:mt-2.5 sm:opacity-40"
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
              className="flex size-4 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 sm:size-3"
            >
              <span
                className={cn(
                  'rounded-full transition-colors size-2 sm:size-1.5',
                  index === selectedIndex ? 'bg-neutral-700' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StorefrontCatalogRail({
  rail,
  productPool,
  isLoading,
  catalogIndexReady,
}: {
  rail: (typeof STOREFRONT_CATALOG_RAILS)[number];
  productPool: FeaturedProduct[];
  isLoading: boolean;
  catalogIndexReady: boolean;
}) {
  const [equipmentCondition, setEquipmentCondition] =
    useState<HomeFeaturedEquipmentConditionFilterId>('nuevas');
  const [consumablesCondition, setConsumablesCondition] =
    useState<HomeFeaturedConsumablesConditionFilterId>('originales');

  const isEquipmentRail =
    rail.kind === 'multifuncionales' ||
    rail.kind === 'impresoras' ||
    rail.kind === 'impresoras-termicas' ||
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

    if (rail.kind === 'impresoras-termicas') {
      return [...productPool]
        .filter(
          (product) =>
            matchesImpresorasTermicasSection(product) &&
            matchesImpresorasTermicasCondition(product, equipmentCondition),
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

  // Escáneres suelen venir del inventory-index; no bloquear el resto de rails.
  const showSkeleton =
    (isLoading && products.length === 0) ||
    (rail.kind === 'escaneres' && !catalogIndexReady && products.length === 0);

  return (
    <section aria-labelledby={rail.titleId} className="pt-1 sm:pt-2">
      <div className="container pb-4 pt-3 sm:pb-7 sm:pt-5">
        <header className="mb-2.5 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2
            id={rail.titleId}
            className="min-w-0 shrink text-left text-base font-bold tracking-tight text-[#111111] sm:text-xl lg:text-[1.375rem]"
          >
            {rail.title}
          </h2>
          {isEquipmentRail ? (
            <StorefrontFilterTabs
              filters={STOREFRONT_EQUIPMENT_CONDITION_TABS}
              activeFilter={equipmentCondition}
              onFilterChange={setEquipmentCondition}
              ariaLabel="Condición de equipos"
              className="sm:ml-auto"
            />
          ) : (
            <StorefrontFilterTabs
              filters={STOREFRONT_CONSUMABLES_CONDITION_TABS}
              activeFilter={consumablesCondition}
              onFilterChange={setConsumablesCondition}
              ariaLabel={rail.kind === 'toner' ? 'Tipo de toner' : 'Tipo de repuesto'}
              className="sm:ml-auto"
            />
          )}
        </header>

        {showSkeleton ? (
          <FeaturedSkeleton />
        ) : products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#D9DEE7] bg-white px-4 py-7 text-center text-sm text-[#666666]">
            No hay productos para este filtro.
          </p>
        ) : (
          <FeaturedProductsCarousel
            products={products}
            paginationLabel={rail.paginationLabel}
            titleMode={titleMode}
          />
        )}
      </div>
    </section>
  );
}

export function HomeStorefrontFeaturedSection() {
  const { data: catalogBundle, isLoading: bundleLoading } = useHomeCatalogBundle();
  const [catalogReady, setCatalogReady] = useState(() => getCatalogRows().length > 0);

  useEffect(() => {
    // No esperar el defer de 8s de la home: arrancar el índice en cuanto monta la vitrina.
    preloadCatalogIndexNow();
    if (catalogReady) return;
    let cancelled = false;
    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) startTransition(() => setCatalogReady(true));
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setCatalogReady(true));
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

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    // Enriquecer en background cuando el índice ya está en memoria (escáneres, etc.).
    if (catalogReady) {
      for (const row of getCatalogRows()) {
        if (!isStorefrontCatalogCandidate(row)) continue;
        pushUnique(catalogRowToFeatured(row));
      }
    }

    return merged;
  }, [catalogBundle?.featured, catalogBundle?.sections, catalogReady]);

  // Mostrar productos del home-bundle de inmediato; el índice no debe bloquear la UI.
  const isLoading = bundleLoading;

  return (
    <div className="bg-[#FAFBFC]">
      {STOREFRONT_CATALOG_RAILS.map((rail, index) => (
        <div key={rail.kind}>
          {index === 0 ? <HomeEquiposHeroBanner /> : null}
          {rail.kind === 'toner' ? (
            <>
              <HomeTonerRepuestosHeroBanner />
              <TonerPartnerBrandsSection />
            </>
          ) : null}
          <StorefrontCatalogRail
            rail={rail}
            productPool={productPool}
            isLoading={isLoading}
            catalogIndexReady={catalogReady}
          />
        </div>
      ))}
    </div>
  );
}
