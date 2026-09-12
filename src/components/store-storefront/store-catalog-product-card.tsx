import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardFeaturedStar } from '@/components/product/product-card-featured-star';
import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPromoBadges } from '@/components/product/product-card-promo-badges';
import { ProductCardStatsLine } from '@/components/product/product-card-stats-line';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import {
  clipboardPriceFieldsFromDisplay,
  useCatalogDisplayPrice,
} from '@/hooks/use-catalog-display-price';
import { useLiveProductCardMedia } from '@/hooks/use-live-product-card-media';
import { catalogRowToFeatured } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { inferColor } from '@/lib/category-catalog-filters';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { ProductCardSplitBrandTitle } from '@/components/product/product-card-title';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { buildProductCardQuickSpecsLine } from '@/lib/product-card-quick-specs';
import { productHasOfferAttribute } from '@/lib/product-detail-badges';
import { productPath } from '@/lib/product-path';
import { productToFeatured } from '@/lib/store-products';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface StoreCatalogProductCardProps {
  product: Product;
  imageLoading?: 'lazy' | 'eager';
  imagePriority?: boolean;
  /** Carrusel home: marca/condición arriba, CTA Agregar al carrito + WhatsApp debajo. */
  variant?: 'catalog' | 'carousel';
  /** Reduce padding e imagen (p. ej. franja «Solo por horas»). */
  density?: 'default' | 'compact';
}

function formatCardConditionBadge(label: string): string {
  if (/oferta/i.test(label)) return 'OFERTA';
  if (/nuev/i.test(label) && !/semi/i.test(label)) return 'NUEVO';
  return label.toUpperCase();
}

function isNewConditionBadge(label: string): boolean {
  return /nuev/i.test(label) && !/semi/i.test(label);
}

function isOfferConditionBadge(label: string): boolean {
  return /oferta/i.test(label);
}

function ProductCardBrandConditionRow({
  brand,
  condition,
  className,
}: {
  brand?: string | null;
  condition?: string | null;
  className?: string;
}) {
  if (!brand && !condition) return null;

  return (
    <div className={cn('flex min-w-0 items-center justify-between gap-2', className)}>
      {brand ? (
        <p className="min-w-0 truncate text-[0.6875rem] font-bold uppercase tracking-wide text-[#E30613] sm:text-xs">
          {brand}
        </p>
      ) : (
        <span className="min-w-0" aria-hidden="true" />
      )}
      {condition ? (
        <span
          className={cn(
            'inline-flex h-[18px] shrink-0 items-center justify-center rounded-full px-2.5',
            'text-[9px] font-bold uppercase leading-none tracking-[0.08em]',
            isOfferConditionBadge(condition)
              ? 'bg-[#E30613] text-white'
              : isNewConditionBadge(condition) || /original/i.test(condition)
                ? 'bg-[#111111] text-white'
                : 'border border-[#555] bg-white text-[#555]',
          )}
        >
          {formatCardConditionBadge(condition)}
        </span>
      ) : null}
    </div>
  );
}

export const StoreCatalogProductCard = memo(function StoreCatalogProductCard({
  product,
  imageLoading = 'lazy',
  imagePriority = false,
  variant = 'catalog',
  density = 'default',
}: StoreCatalogProductCardProps) {
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product);
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { catalogProduct, image_url: liveImageUrl, gallery: liveGallery, imageVersion } =
    useLiveProductCardMedia(product.id, {
      image_url: product.image_url,
      gallery: product.gallery,
    });
  const catalogFeatured = useMemo(
    () => (catalogProduct ? catalogRowToFeatured(catalogProduct) : null),
    [catalogProduct],
  );
  const quickViewSnapshot = useMemo(() => productToFeatured(product), [product]);
  const imageProduct = useMemo(
    () => ({
      ...product,
      image_url: liveImageUrl,
      gallery: liveGallery,
    }),
    [liveGallery, liveImageUrl, product],
  );
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(imageProduct), [imageProduct]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(imageProduct),
    [imageProduct],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(imageProduct), [imageProduct]);
  const displayPrice = useCatalogDisplayPrice(product);
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    category: product.category,
    ...(catalogFeatured?.oldPrice != null ? { oldPrice: catalogFeatured.oldPrice } : {}),
    ...(catalogFeatured?.discount != null ? { discount: catalogFeatured.discount } : {}),
  });

  const titleProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes?.length
      ? product.attributes
      : (catalogProduct?.attributes ?? []),
  };
  const { brand, code, title } = getProductCardTitleContent(titleProduct);
  const isCarousel = variant === 'carousel';
  const isCompact = density === 'compact';
  const buyNowLabel = 'Agregar al carrito';
  const buyNowLabelHover = 'Agregar';
  const clipboardCondition = productHasOfferAttribute(titleProduct)
    ? 'Oferta'
    : resolveProductCardBadgeLabel(titleProduct);
  const clipboardIsColor = inferColor(titleProduct) === 'Color';
  const clipboardBasicFeatures = buildProductCardQuickSpecsLine(titleProduct);
  const clipboardImageUrl = imageCandidates[0] ?? product.image_url ?? null;
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const isFeatured = product.is_featured === true || catalogProduct?.is_featured === true;
  const whatsappProduct = {
    id: product.id,
    name: product.name,
    priceUsd: displayPrice.priceUsd,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
  };
  const whatsappCta = (
    <ProductWhatsAppButton
      stopPropagation
      skipDialogIfComplete
      accent="outline"
      label="Comprar por WhatsApp"
      quantity={quantity}
      product={whatsappProduct}
      className={cn(
        'w-full rounded-lg px-3 text-xs font-semibold normal-case tracking-normal sm:px-4 sm:text-sm',
        isCarousel
          ? 'h-9 min-h-9 max-h-9 md:h-10 md:min-h-10 md:max-h-10'
          : 'h-10 min-h-10 max-h-10 sm:h-11 sm:min-h-11 sm:max-h-11',
      )}
    />
  );

  return (
    <article
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden transition-shadow',
        isCompact ? 'rounded-xl' : 'rounded-2xl',
        isCarousel
          ? cn(
              'border border-[#E8E8E8] bg-white',
              isCompact
                ? 'shadow-[0_2px_10px_rgba(15,23,42,0.08)]'
                : 'shadow-[0_4px_18px_rgba(15,23,42,0.08)]',
            )
          : isFeatured
            ? 'border border-[#E30613] bg-white shadow-[0_2px_14px_rgba(227,6,19,0.08)]'
            : 'border border-[#e6e8ee] bg-white shadow-[0_2px_14px_rgba(15,31,61,0.06)] hover:shadow-md',
      )}
    >
      {isCarousel ? (
        <ProductCardBrandConditionRow
          brand={brand}
          condition={clipboardCondition}
          className={isCompact ? 'px-2 pt-2' : 'px-2.5 pt-2.5 md:px-3 md:pt-3'}
        />
      ) : null}

      <div className="relative">
        <Link
          to={detailHref}
          className={cn(
            'relative block w-full overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
            isCarousel
              ? isCompact
                ? 'aspect-[5/4] p-1.5 sm:p-2'
                : 'aspect-square p-2 md:p-2.5'
              : 'aspect-[4/5] p-2 md:aspect-square md:p-3',
          )}
          aria-label={`Ver ficha de ${product.name}`}
        >
          {isFeatured ? <ProductCardFeaturedStar /> : null}

          <div className={cn('size-full', isCarousel && 'scale-[1.08]')}>
            <ProductCardHoverImage
              candidates={imageCandidates}
              storedCandidates={storedImageCandidates}
              hoverSrc={hoverImageSrc}
              alt={product.name}
              className="size-full"
              imageClassName="size-full object-contain object-center"
              overlayClassName="size-full bg-white"
              loading={imageLoading}
              imageVersion={imageVersion}
              {...(imagePriority ? { fetchPriority: 'high' as const } : {})}
            />
          </div>
        </Link>

        <ProductCardOverlayActions
          productName={product.name}
          isCompareSelected={false}
          isWishlisted={isWishlisted(product.id)}
          revealOnHover
          withConditionBadge={isFeatured && !isCarousel}
          secondaryAction="buy"
          clipboard={{
            title,
            stock: product.stock,
            ...clipboardPriceFieldsFromDisplay(displayPrice),
            productId: product.id,
            productPath: detailHref,
            isColorProduct: clipboardIsColor,
            ...(code != null ? { code } : {}),
            ...(clipboardCondition != null ? { condition: clipboardCondition } : {}),
            ...(clipboardBasicFeatures != null
              ? { basicFeatures: clipboardBasicFeatures }
              : {}),
            ...(product.category != null ? { category: product.category } : {}),
            ...(product.volume_role_prices != null
              ? { volumeRolePrices: product.volume_role_prices }
              : {}),
            ...(product.delivery_time != null
              ? { deliveryTime: product.delivery_time }
              : {}),
            ...(clipboardImageUrl != null ? { imageUrl: clipboardImageUrl } : {}),
          }}
          onWishlist={() => toggleWishlist(productToWishlistItem(product))}
          onQuickView={() => setQuickViewOpen(true)}
          onCompare={() => undefined}
          onBuy={() => addItem(product)}
        />
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col',
          isCompact ? 'px-2 pb-2 pt-1' : 'px-2 pb-2 pt-1.5 md:px-3 md:pb-3 md:pt-2',
        )}
      >
        {isCarousel ? null : (
          <ProductCardBrandConditionRow brand={brand} condition={clipboardCondition} />
        )}

        <Link
          to={detailHref}
          className={cn(
            'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            !isCarousel && (brand || clipboardCondition) ? 'mt-1.5' : null,
          )}
        >
          <h3
            className={cn(
              'font-bold leading-snug text-[#111111]',
              isCompact
                ? 'text-[0.6875rem] sm:text-[0.75rem]'
                : 'text-[0.75rem] sm:text-sm',
              isCarousel ? 'text-center' : 'text-pretty break-words',
            )}
          >
            <ProductCardSplitBrandTitle
              title={title}
              brand={brand}
              align={isCarousel ? 'center' : 'left'}
            />
          </h3>
        </Link>

        {isCarousel ? null : (
          <>
            <ProductCardPromoBadges product={titleProduct} className="mt-2 max-md:hidden" />

            <div
              className={cn(
                'grid grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,margin,opacity] duration-200 ease-out',
                'group-hover:mt-2.5 group-hover:grid-rows-[1fr] group-hover:opacity-100',
                'group-focus-within:mt-2.5 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
                'motion-reduce:mt-2.5 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100',
                'max-md:hidden',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <ProductCardStatsLine
                  product={titleProduct}
                  stock={stockCount}
                  outOfStock={outOfStock}
                  code={code}
                />
              </div>
            </div>
          </>
        )}

        <div className={cn(isCompact ? 'mt-1' : 'mt-1.5 md:mt-2')}>
          <ProductCardFeaturedPricing
            productId={product.id}
            currentUsd={pricing.currentUsd}
            compareUsd={pricing.compareUsd}
            showAccentBar={false}
            accentUsd
            showOfferLabel={productHasOfferAttribute(titleProduct)}
            size={isCarousel && !isCompact ? 'lg' : 'default'}
            align={isCarousel ? 'center' : 'start'}
            category={product.category}
            wholesaleUsd={product.prices?.mayorista}
          />
        </div>

        <div
          className={cn(
            'relative z-[2] mt-auto',
            isCompact ? 'pt-1.5' : 'pt-2 md:pt-2.5',
            isCarousel && 'flex justify-center',
          )}
        >
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            revealQuantityOnHover
            quantityPlacement="inline"
            addLabel={buyNowLabel}
            {...(buyNowLabelHover ? { addLabelHover: buyNowLabelHover } : {})}
            onQuantityChange={setQuantity}
            quantityClassName={isCompact ? 'h-8 rounded-md' : 'h-9 rounded-lg md:h-10'}
            addButtonClassName={cn(
              isCarousel
                ? isCompact
                  ? 'h-8 min-h-8 max-h-8 w-auto min-w-0 flex-none justify-center whitespace-nowrap rounded-md px-2.5 text-[0.625rem] font-semibold text-white shadow-none sm:text-[0.6875rem]'
                  : 'h-9 min-h-9 max-h-9 w-auto min-w-0 flex-none justify-center whitespace-nowrap rounded-lg px-3.5 text-[0.625rem] font-semibold text-white shadow-none sm:text-[0.6875rem] md:h-10 md:min-h-10 md:max-h-10 md:px-4 md:text-xs'
                : 'h-9 min-h-9 max-h-9 min-w-0 flex-1 justify-center whitespace-nowrap rounded-lg px-2 text-[0.625rem] font-semibold text-white shadow-none sm:text-[0.6875rem] md:h-10 md:min-h-10 md:max-h-10 md:px-3 md:text-xs group-hover:flex-none group-hover:px-2.5 md:group-hover:px-3',
              'bg-[#E30613] hover:bg-[#c90511]',
            )}
            {...(isCarousel
              ? {
                  centeredActions: true,
                }
              : {
                  endAdornment: (
                    <ProductWhatsAppButton
                      stopPropagation
                      skipDialogIfComplete
                      quantity={quantity}
                      product={whatsappProduct}
                      className="h-9 w-9 min-h-9 max-h-9 min-w-9 shrink-0 rounded-lg border-0 bg-[#25D366] p-0 text-white shadow-none hover:bg-[#20bd5a] hover:text-white focus-visible:ring-[#25D366] md:h-10 md:w-10 md:min-h-10 md:max-h-10 md:min-w-10"
                    />
                  ),
                  belowOnHover: whatsappCta,
                })}
          />
        </div>
      </div>

      <ProductQuickViewDialog
        snapshot={quickViewSnapshot}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
});
