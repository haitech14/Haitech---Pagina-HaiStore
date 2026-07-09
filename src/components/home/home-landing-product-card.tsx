import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCart } from '@/context/cart-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import type { FeaturedProduct } from '@/data/featured-products';
import { getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { resolveProductCardConditionLabel } from '@/lib/product-card-condition';
import { buildProductCardQuickSpecsLine } from '@/lib/product-card-quick-specs';
import { getHomeLandingProductCardLines } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { cn, formatUsd, usdToPen } from '@/lib/utils';
import type { Product } from '@/types/product';

const LOW_STOCK_THRESHOLD = 8;
const LANDING_IMAGE_BOX_PX = 220;

const cardHoverRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

const whatsappRevealClass = cardHoverRevealClass;

const imageOverlayButtonClass =
  'flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#333333] shadow-[0_2px_8px_rgba(15,31,61,0.14)] backdrop-blur-[1px] transition-colors hover:bg-white hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2';

function formatHomeLandingPenPrice(usd: number): string {
  return `S/ ${usdToPen(usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatHomeLandingUsdApprox(usd: number): string {
  const rounded = Math.round(usd);
  return `Aprox. US$ ${rounded.toLocaleString('en-US')}`;
}

export function HomeLandingProductCard({ product }: { product: FeaturedProduct }) {
  const { displayCurrency } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
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

  const { headline, subtitle } = getHomeLandingProductCardLines(productSource);
  const quickSpecsLine = buildProductCardQuickSpecsLine(productSource);
  const conditionLabel = resolveProductCardConditionLabel(productSource);
  const stockLabel = outOfStock ? 'A pedido' : `${stockCount} unids.`;

  const catalogGallery = catalogProduct?.gallery ?? null;
  const catalogGalleryKey = catalogGallery?.join('|') ?? '';
  const catalogImageUrl = catalogProduct?.image_url ?? null;
  const catalogBrand = catalogProduct?.brand ?? null;
  const productBrand = product.brand ?? catalogBrand ?? null;
  const productImage = product.image ?? catalogImageUrl ?? null;
  const productCode = code ?? '';

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code,
        name: product.name,
        category: product.category,
        brand: productBrand,
        image_url: productImage,
        gallery: catalogGallery,
      }),
    [
      catalogGalleryKey,
      productCode,
      product.category,
      product.id,
      product.name,
      productBrand,
      productImage,
    ],
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

  const handleQuickBuy = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(cartProduct, { quantity: 1 });
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
      <div className="relative px-3 pt-3 sm:px-3.5 sm:pt-3.5">
        <div className="relative mx-auto w-full max-w-[220px]">
          <Link
            to={productPath(product)}
            className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
            aria-label={`Ver ficha de ${product.name}`}
          >
            <div
              className={cn(
                'relative mx-auto flex items-center justify-center overflow-hidden rounded-lg bg-[#F8F9FB]',
                hasValidImage ? 'bg-[#F8F9FB]' : 'bg-muted/35',
              )}
              style={{ width: LANDING_IMAGE_BOX_PX, height: LANDING_IMAGE_BOX_PX, maxWidth: '100%' }}
            >
              {topBadgeLabel ? (
                <span
                  className={cn(
                    'absolute left-2 top-2 z-[2] rounded px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white sm:text-[0.625rem]',
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
                className="size-full max-h-[196px] max-w-[196px]"
                imageClassName="size-full max-h-[196px] max-w-[196px] object-contain object-center"
              />
            </div>
          </Link>

          <div
            className={cn(
              'pointer-events-none absolute right-1.5 top-1/2 z-[3] flex -translate-y-1/2 flex-col gap-1.5 opacity-0 transition-opacity duration-200 ease-out',
              'group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
              'max-md:pointer-events-auto max-md:opacity-100',
            )}
          >
            <button
              type="button"
              className={imageOverlayButtonClass}
              aria-label={`Vista rápida de ${product.name}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setQuickViewOpen(true);
              }}
            >
              <Eye className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(imageOverlayButtonClass, 'hover:text-[#E30613]')}
              aria-label={`Comprar ${product.name}`}
              onClick={handleQuickBuy}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5 sm:px-3.5 sm:pb-3.5 sm:pt-2">
        {conditionLabel ? (
          <div className="mb-1.5">
            <ProductConditionBadge label={conditionLabel} size="card" />
          </div>
        ) : null}

        <Link
          to={productPath(product)}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-left text-sm font-bold leading-snug text-[#111111]">
            {headline}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-2 text-pretty text-left text-xs font-normal leading-snug text-[#666666]">
              {subtitle}
            </p>
          ) : null}
        </Link>

        <div className="mt-1 min-h-4">
          {quickSpecsLine ? (
            <div className={cardHoverRevealClass}>
              <div className="min-h-0 overflow-hidden">
                <p className="line-clamp-1 text-[0.6875rem] leading-snug text-[#666666] sm:text-xs">
                  {quickSpecsLine}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            {showPriceOnRequest ? (
              <p className="text-sm font-bold leading-tight text-[#111111] sm:text-base">Consultar Precio</p>
            ) : showPen && showUsd ? (
              <>
                <p className="text-base font-bold tabular-nums leading-tight text-[#E30613] sm:text-lg">
                  {formatHomeLandingPenPrice(pricing.currentUsd)}
                </p>
                <p className="text-[0.6875rem] tabular-nums text-[#888888] sm:text-xs">
                  {formatHomeLandingUsdApprox(pricing.currentUsd)}
                </p>
              </>
            ) : showPen ? (
              <p className="text-base font-bold tabular-nums leading-tight text-[#E30613] sm:text-lg">
                {formatHomeLandingPenPrice(pricing.currentUsd)}
              </p>
            ) : (
              <p className="text-base font-bold tabular-nums leading-tight text-[#111111] sm:text-lg">
                {formatUsd(pricing.currentUsd)}
              </p>
            )}
          </div>
          <p
            className={cn(
              'shrink-0 text-right text-[0.625rem] font-medium tabular-nums sm:text-[0.6875rem]',
              outOfStock ? 'text-[#888888]' : 'text-[#16A34A]',
            )}
          >
            {stockLabel}
          </p>
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

      <ProductQuickViewDialog
        snapshot={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
}
