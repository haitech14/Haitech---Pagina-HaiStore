import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, ShoppingCart } from 'lucide-react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardPill } from '@/components/product/product-card-pill';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { type FeaturedProduct } from '@/data/featured-products';
import { STOREFRONT_ORANGE } from '@/data/home-storefront-mockup';
import {
  clipboardPriceFieldsFromDisplay,
  useCatalogDisplayPrice,
} from '@/hooks/use-catalog-display-price';
import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
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
import { featuredToWishlistItem } from '@/lib/wishlist-product';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
// @ts-expect-error shared JS module
import { inferColor, resolveFormatoPapelBadgeLabels } from '../../../shared/catalog-attribute-filters.js';
// @ts-expect-error shared JS module
import { resolveProductSpeedPpm } from '../../../shared/catalog-speed-filter.js';

const ProductCardCopyButton = lazy(() =>
  import('@/components/product/product-card-copy-button').then((m) => ({
    default: m.ProductCardCopyButton,
  })),
);

const ProductCardCopyImageButton = lazy(() =>
  import('@/components/product/product-card-copy-image-button').then((m) => ({
    default: m.ProductCardCopyImageButton,
  })),
);

const ProductWhatsAppButton = lazy(() =>
  import('@/components/product-whatsapp-button').then((m) => ({
    default: m.ProductWhatsAppButton,
  })),
);

const FEATURED_HOVER_BADGES_REVEAL_CLASS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

const FEATURED_CARD_OVERLAY_BUTTON_CLASS =
  'flex size-7 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm transition-colors hover:bg-[#FFF0F1] hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-1';

export type StorefrontCardTitleMode = 'equipment' | 'consumable';

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

function WhatsAppIconFallback() {
  return (
    <span
      className="flex h-9 w-9 min-h-9 max-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2.004C6.486 2.004 2 6.49 2 12.004c0 1.77.463 3.433 1.273 4.883L2.05 21.95l5.2-1.193A9.96 9.96 0 0 0 12 22.004c5.514 0 10-4.486 10-10s-4.486-9.996-10-9.996zm0 18.002a8 8 0 0 1-4.08-1.12l-.292-.173-3.086.708.715-3.01-.19-.31A7.96 7.96 0 0 1 4 12.004c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
      </svg>
    </span>
  );
}

/**
 * Card de vitrina home: núcleo ligero; WhatsApp/copy se montan en intent/idle
 * para no arrastrar PDF/proforma al chunk de rails.
 */
export function HomeStorefrontProductCard({
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
  const [chromeReady, setChromeReady] = useState(false);
  const catalogProduct = useCatalogProductRow(product.id, { loadIfMissing: false });
  const displayPrice = useCatalogDisplayPrice({
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
  });
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(product.oldPrice != null ? { oldPrice: product.oldPrice } : {}),
    ...(product.discount != null ? { discount: product.discount } : {}),
  });

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const warm = () => {
      if (!cancelled) setChromeReady(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(warm, { timeout: 6000 });
    } else {
      timeoutId = window.setTimeout(warm, 2500);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

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

  const warmChrome = () => setChromeReady(true);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(15,31,61,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,31,61,0.09)]"
      onPointerEnter={warmChrome}
      onFocusCapture={warmChrome}
    >
      <div className="relative px-1 pt-2.5 sm:px-1.5 sm:pt-3">
        <div className="absolute right-2 top-2 z-[2] hidden flex-col gap-1 md:flex md:right-2.5 md:top-2.5">
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

          {chromeReady ? (
            <Suspense fallback={null}>
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
            </Suspense>
          ) : null}
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
          {chromeReady ? (
            <Suspense fallback={<WhatsAppIconFallback />}>
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
            </Suspense>
          ) : (
            <button
              type="button"
              aria-label="WhatsApp"
              className="shrink-0"
              onClick={warmChrome}
            >
              <WhatsAppIconFallback />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function FeaturedProductCardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-2.5">
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="mt-2 h-2.5 w-12" />
      <Skeleton className="mt-1.5 h-3 w-full" />
      <Skeleton className="mt-1.5 h-2.5 w-10" />
      <Skeleton className="mt-2 h-4 w-20" />
    </div>
  );
}
