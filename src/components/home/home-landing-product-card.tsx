import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductCardPromoBadges } from '@/components/product/product-card-promo-badges';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import type { FeaturedProduct } from '@/data/featured-products';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { formatConsumableProductSpecLabel } from '@/lib/format-consumable-product-spec-label';
import { buildProductCardQuickSpecsLine } from '@/lib/product-card-quick-specs';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { formatProductCodeCardDisplay } from '@/lib/format-product-code-display';
import { resolveProductCardEstadoLabel } from '@/lib/product-card-condition';
import { resolveHomeLandingProductBadges } from '@/lib/home-landing-product-badges';
import { formatHomeLandingProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

const LOW_STOCK_THRESHOLD = 8;

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

export function HomeLandingProductCard({ product }: { product: FeaturedProduct }) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const catalogProduct = getCatalogProductById(product.id);
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
  const displayCode = code ? formatProductCodeCardDisplay(code) : null;
  const stock = catalogProduct?.stock ?? 0;
  const outOfStock = isProductOutOfStock({
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
  });
  const stockCount = Math.max(0, Math.floor(stock));

  const productSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    attributes: product.attributes ?? catalogProduct?.attributes ?? [],
  };

  const showDiscountBadge = pricing.discountPercent >= 5;
  const showLimitedStockBadge = !outOfStock && stockCount <= LOW_STOCK_THRESHOLD;
  const topBadgeLabel = showDiscountBadge
    ? `Oferta -${pricing.discountPercent}%`
    : showLimitedStockBadge
      ? 'Últimas unidades'
      : null;

  const displayTitle = formatHomeLandingProductCardTitle({
    ...productSource,
    attributes: productSource.attributes,
  });

  const promoBadges = resolveHomeLandingProductBadges({
    product,
    priceUsd: pricing.currentUsd,
    catalogProduct,
  });
  const estadoLabel = resolveProductCardEstadoLabel(productSource);

  const specsLine =
    formatConsumableProductSpecLabel(productSource) ??
    buildProductCardQuickSpecsLine(productSource);

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code,
        name: product.name,
        category: product.category,
        brand: product.brand ?? catalogProduct?.brand ?? null,
        image_url: product.image ?? catalogProduct?.image_url ?? null,
        gallery: catalogProduct?.gallery ?? null,
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
  const hasValidImage = imageCandidates.length > 0;
  const showPriceOnRequest =
    !Number.isFinite(displayPrice.priceUsd) || displayPrice.priceUsd <= 0;

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
    attributes: productSource.attributes,
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
      <div className="relative">
        <Link
          to={productPath(product)}
          className={cn(
            'relative block aspect-square p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:p-3',
            hasValidImage ? 'bg-white' : 'bg-muted/35',
          )}
          aria-label={`Ver ficha de ${product.name}`}
        >
          {topBadgeLabel ? (
            <span
              className={cn(
                'absolute left-2 top-2 z-[2] rounded px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white sm:left-2.5 sm:top-2.5 sm:text-[0.625rem]',
                showDiscountBadge ? 'bg-[#E30613]' : 'bg-[#F59E0B]',
              )}
            >
              {topBadgeLabel}
            </span>
          ) : null}

          <ProductCardHoverImage
            candidates={imageCandidates}
            storedCandidates={storedImageCandidates}
            hoverSrc={hoverImageSrc}
            alt={product.name}
            className="size-full"
            imageClassName="size-full object-contain"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5 sm:px-3.5 sm:pb-3.5 sm:pt-2">
        <ProductCardPromoBadges badges={promoBadges} estadoLabel={estadoLabel} className="mb-1" />
        <Link
          to={productPath(product)}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-left text-sm font-semibold leading-snug text-[#111111]">
            {displayTitle}
            {displayCode ? (
              <span className="font-normal text-[#888888]" title={code ?? undefined}>
                {' '}
                ({displayCode})
              </span>
            ) : null}
          </h3>
        </Link>

        {specsLine ? (
          <p className="mt-1 line-clamp-1 text-[0.6875rem] text-[#666666] sm:text-xs">{specsLine}</p>
        ) : (
          <span className="mt-1 block min-h-4" aria-hidden="true" />
        )}

        <div className="mt-0.5 flex min-h-4 justify-end">
          <p
            className={cn(
              'shrink-0 text-right text-[0.6875rem] font-medium sm:text-xs',
              outOfStock ? 'text-[#888888]' : 'text-[#16A34A]',
            )}
          >
            {outOfStock ? 'A pedido' : `${stockCount} en stock`}
          </p>
        </div>

        <div
          className={cn(
            'mt-2',
            !showPriceOnRequest && showUsd && showPen
              ? 'flex flex-nowrap items-baseline gap-2'
              : 'space-y-0.5',
          )}
        >
          {showPriceOnRequest ? (
            <p className="text-sm font-bold leading-tight text-[#111111] sm:text-base">Consultar Precio</p>
          ) : showPen ? (
            <p className="text-base font-bold tabular-nums leading-tight text-red-600 sm:text-lg">
              {formatPenFromUsd(pricing.currentUsd)}
            </p>
          ) : null}
          {!showPriceOnRequest && showUsd && showPen ? (
            <p className="text-[0.6875rem] tabular-nums text-[#888888] sm:text-xs">
              {formatUsd(pricing.currentUsd)}
            </p>
          ) : !showPriceOnRequest && showUsd ? (
            <p className="text-base font-bold tabular-nums leading-tight text-[#111111] sm:text-lg">
              {formatUsd(pricing.currentUsd)}
            </p>
          ) : null}
        </div>

        <div className="relative z-[2] mt-auto flex flex-col gap-0 pt-3 transition-[gap] duration-150 ease-out group-hover:gap-2 group-focus-within:gap-2">
          <ProductQuantityAddFooter
            product={cartProduct}
            size="sm"
            addLabel="Comprar ahora"
            hideQuantity
            addButtonClassName="h-10 min-h-10 w-full rounded-lg bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm"
          />
          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                product={{
                  id: cartProduct.id,
                  name: cartProduct.name,
                  priceUsd: pricing.currentUsd,
                  category: cartProduct.category,
                  brand: cartProduct.brand ?? null,
                }}
                className="h-10 min-h-10 w-full rounded-lg bg-[#25D366] px-3 text-xs font-semibold normal-case tracking-normal text-white shadow-none hover:bg-[#20bd5a] focus-visible:ring-[#25D366] sm:text-sm [&_span]:truncate-none"
                label="Cotizar por WhatsApp"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
