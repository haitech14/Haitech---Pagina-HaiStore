import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';

import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardFeaturedStar } from '@/components/product/product-card-featured-star';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductCardPromoBadges } from '@/components/product/product-card-promo-badges';
import { ProductCardStatsLine } from '@/components/product/product-card-stats-line';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCart } from '@/context/cart-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import type { FeaturedProduct } from '@/data/featured-products';
import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { CONSULTAR_PRECIO_LABEL, isPriceOnRequest } from '@/lib/display-price';
import { productQualifiesForBestSeller } from '@/lib/home-landing-product-badges';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { ProductCardBrandLine } from '@/components/product/product-card-title';
import { inferColor } from '@/lib/category-catalog-filters';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import {
  formatProductCardTitle,
  getProductCardTitleContent,
} from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const LANDING_IMAGE_BOX_PX = 220;

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

const imageOverlayButtonClass =
  'flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#333333] shadow-[0_2px_8px_rgba(15,31,61,0.14)] backdrop-blur-[1px] transition-colors hover:bg-white hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2';

export function HomeLandingProductCard({
  product,
  priority = false,
}: {
  product: FeaturedProduct;
  /** Primeras tarjetas visibles: carga eager de la imagen. */
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
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

  const productSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    attributes: product.attributes ?? catalogProduct?.attributes ?? [],
  };

  const isFeatured = productQualifiesForBestSeller(product, catalogProduct);
  const productTitle = formatProductCardTitle(productSource);
  const { brand, code: cardCode } = getProductCardTitleContent(productSource);
  const clipboardCondition = resolveProductCardBadgeLabel(productSource);
  const clipboardIsColor = inferColor(productSource) === 'Color';
  const clipboardCategory = product.category ?? catalogProduct?.category ?? null;
  const outOfStock = stockCount <= 0;
  const buyNowLabel = outOfStock ? 'Reservar' : 'Comprar';

  const catalogGallery = catalogProduct?.gallery ?? null;
  const productGallery = product.gallery ?? null;
  const galleryKey = [...(productGallery ?? []), ...(catalogGallery ?? [])].join('|');
  const catalogImageUrl = catalogProduct?.image_url ?? null;
  const catalogBrand = catalogProduct?.brand ?? null;
  const productBrand = product.brand ?? catalogBrand ?? null;
  const productImage = product.image ?? catalogImageUrl ?? null;
  const productCode = code ?? '';

  const detailPath = useMemo(() => {
    const slug = catalogProduct?.slug?.trim();
    if (slug) {
      return productPath({ id: product.id, name: product.name, slug });
    }
    return productPath(product);
  }, [catalogProduct?.slug, product]);

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code,
        name: product.name,
        category: product.category,
        brand: productBrand,
        image_url: productImage,
        gallery: [...(productGallery ?? []), ...(catalogGallery ?? [])],
      }),
    [
      galleryKey,
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
  const showPriceOnRequest = isPriceOnRequest(displayPrice.priceUsd);

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
    <article
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white',
        isFeatured
          ? 'border border-[#E30613] shadow-[0_2px_14px_rgba(227,6,19,0.08)]'
          : 'border border-[#e6e8ee] shadow-[0_2px_14px_rgba(15,31,61,0.06)]',
      )}
    >
      <div className="relative px-3 pt-3 sm:px-3.5 sm:pt-3.5">
        <div className="relative mx-auto w-full max-w-[220px]">
          <Link
            to={detailPath}
            className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
            aria-label={`Ver ficha de ${product.name}`}
          >
            <div
              className={cn(
                'relative mx-auto flex items-center justify-center overflow-hidden rounded-xl bg-white',
                !hasValidImage && 'bg-muted/35',
              )}
              style={{ width: LANDING_IMAGE_BOX_PX, height: LANDING_IMAGE_BOX_PX, maxWidth: '100%' }}
            >
              {isFeatured ? <ProductCardFeaturedStar /> : null}

              <ProductCardHoverImage
                candidates={imageCandidates}
                storedCandidates={storedImageCandidates}
                hoverSrc={hoverImageSrc}
                alt={product.name}
                loading={priority ? 'eager' : 'lazy'}
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
              aria-label={`Agregar ${product.name} al carrito`}
              onClick={handleQuickBuy}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
            </button>
            {imageCandidates[0] ? (
              <ProductCardCopyImageButton
                productName={product.name}
                imageUrl={imageCandidates[0]}
                className={cn(imageOverlayButtonClass, 'hover:text-[#E30613]')}
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
              {...(cardCode != null ? { code: cardCode } : {})}
              {...(clipboardCondition != null ? { condition: clipboardCondition } : {})}
              {...(clipboardCategory != null ? { category: clipboardCategory } : {})}
              {...(catalogProduct?.volume_role_prices != null
                ? { volumeRolePrices: catalogProduct.volume_role_prices }
                : {})}
              {...(catalogProduct &&
              'delivery_time' in catalogProduct &&
              typeof catalogProduct.delivery_time === 'string' &&
              catalogProduct.delivery_time.trim()
                ? { deliveryTime: catalogProduct.delivery_time.trim() }
                : product.delivery_time != null
                  ? { deliveryTime: product.delivery_time }
                  : {})}
              className={cn(imageOverlayButtonClass, 'hover:text-[#E30613]')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5 sm:px-3.5 sm:pb-3.5 sm:pt-2">
        <ProductCardBrandLine brand={brand} />

        <Link
          to={detailPath}
          className={cn(
            'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            brand && 'mt-0.5',
          )}
        >
          <h3 className="line-clamp-2 text-pretty text-left text-sm font-bold leading-snug text-[#111111] sm:text-[0.9375rem]">
            {productTitle}
          </h3>
        </Link>

        <ProductCardPromoBadges product={productSource} className="mt-2" />

        <ProductCardStatsLine
          product={productSource}
          stock={stockCount}
          outOfStock={outOfStock}
          className="mt-2.5"
        />

        <div className="mt-3 h-px w-full bg-[#eceff4]" aria-hidden="true" />

        <div className="mt-3">
          {showPriceOnRequest ? (
            <p className="text-base font-bold leading-tight text-[#111111] sm:text-lg">
              {CONSULTAR_PRECIO_LABEL}
            </p>
          ) : (
            <ProductCardFeaturedPricing
              productId={product.id}
              currentUsd={pricing.currentUsd}
              compareUsd={pricing.compareUsd}
              showAccentBar={false}
            />
          )}
        </div>

        <div className="relative z-[2] mt-auto flex flex-col gap-0 pt-3 transition-[gap] duration-150 ease-out group-hover:gap-2 group-focus-within:gap-2">
          <ProductQuantityAddFooter
            product={cartProduct}
            size="sm"
            addLabel={buyNowLabel}
            revealQuantityOnHover
            quantityClassName="h-10 rounded-lg"
            addButtonClassName="h-10 min-h-10 min-w-0 flex-1 rounded-lg bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm"
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
