import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { CatalogPreviewPriceBlock } from '@/components/product/catalog-preview-price-block';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductCardImageConditionBadge } from '@/components/product/product-card-image-condition-badge';
import {
  PRODUCT_CARD_IMAGE_CLASS,
  ProductCardHoverImage,
} from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { useProductCompare } from '@/context/product-compare-context';
import { useWishlist } from '@/context/wishlist-context';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { featuredToWishlistItem } from '@/lib/wishlist-product';
import type { FeaturedProduct } from '@/data/featured-products';
import { featuredToCompareItem } from '@/lib/compare-product';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { productPath } from '@/lib/product-path';
import { resolveProductCardConditionLabel } from '@/lib/product-card-condition';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

export { DualPrice } from '@/components/product/product-dual-price';

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  if (reviews <= 0) return null;

  const fullStars = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Valoración ${rating} de 5, ${reviews} reseñas`}
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < fullStars ? 'fill-red-600 text-red-600' : 'fill-neutral-200 text-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400">({reviews})</span>
    </div>
  );
}

export function ProductShowcaseCard({
  product,
  brandTone = 'default',
  variant = 'default',
  imageSize = 'default',
}: {
  product: FeaturedProduct;
  brandTone?: 'default' | 'accent';
  /** Destacados del inicio: imagen cuadrada y tipografía de precio ampliada. */
  variant?: 'default' | 'featured';
  /** Imagen más grande dentro del recuadro (ofertas relámpago). */
  imageSize?: 'default' | 'large';
}) {
  const isFeatured = variant === 'featured';
  const isLargeImage = imageSize === 'large';
  const { isSelected, toggle } = useProductCompare();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const catalogProduct = getCatalogProductById(product.id);
  const priceSource = useMemo(() => {
    const prices = product.prices ?? catalogProduct?.prices;
    return {
      price: product.price,
      ...(prices ? { prices } : {}),
      ...(product.price_role ? { price_role: product.price_role } : {}),
    };
  }, [catalogProduct?.prices, product.price, product.price_role, product.prices]);
  const displayPrice = useCatalogDisplayPrice(priceSource);
  const imageSource = useMemo(() => buildProductCardImageSource({
    id: product.id,
    code: product.code ?? catalogProduct?.code ?? null,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    image_url: product.image ?? catalogProduct?.image_url ?? null,
    gallery: catalogProduct?.gallery ?? null,
  }), [catalogProduct, product]);
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(imageSource), [imageSource]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(imageSource),
    [imageSource],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(imageSource), [imageSource]);
  const compareSelected = isSelected(product.id);
  const wishlistSelected = isWishlisted(product.id);
  const badgeSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
  };
  const hasConditionBadge = Boolean(resolveProductCardConditionLabel(badgeSource));
  const stock = catalogProduct?.stock ?? 10;
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
    code: product.code ?? catalogProduct?.code ?? null,
    created_at: catalogProduct?.created_at ?? new Date().toISOString(),
  };

  const whatsAppButton = (
    <ProductWhatsAppButton
      stopPropagation
      accent="outline"
      label="Comprar por WhatsApp"
      quantity={quantity}
      product={{
        id: product.id,
        name: product.name,
        priceUsd: displayPrice.priceUsd,
        category: product.category,
        brand: product.brand ?? catalogProduct?.brand ?? null,
      }}
      className="mt-1.5 h-11 min-h-11 w-full rounded-md px-2 text-[0.625rem] font-semibold normal-case tracking-normal sm:text-xs"
    />
  );

  const detailHref = productPath(product);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-xl bg-white',
        isFeatured
          ? 'border border-border/50 shadow-[0_1px_8px_rgba(15,31,61,0.08)]'
          : 'overflow-hidden shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)]',
      )}
    >
      <div className="relative flex flex-1 flex-col">
        <div className="relative">
          <div className="relative block bg-white">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
            <div
              className={cn(
                'relative overflow-hidden',
                isLargeImage
                  ? 'aspect-square p-0.5 sm:p-1'
                  : isFeatured
                    ? 'aspect-square p-1 sm:p-1.5'
                    : 'aspect-[4/3] p-1 sm:aspect-square sm:p-1.5',
              )}
            >
              <ProductCardImageConditionBadge product={badgeSource} />
              <ProductCardHoverImage
                candidates={imageCandidates}
                storedCandidates={storedImageCandidates}
                hoverSrc={hoverImageSrc}
                alt={product.name}
                className="size-full"
                imageClassName={PRODUCT_CARD_IMAGE_CLASS}
                placeholder={
                  <span className="text-4xl font-bold text-neutral-200" aria-hidden="true">
                    {product.name.charAt(0)}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative z-[2] flex flex-1 flex-col px-4',
            isFeatured ? 'gap-1 px-3 pb-2 pt-1.5 sm:gap-1.5 sm:px-4 sm:pt-2' : 'gap-0.5 px-3 pb-3 pt-1.5 sm:gap-1 sm:px-4 sm:pt-2',
          )}
        >
          <Link
            to={detailHref}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <ProductCardTitle
              product={badgeSource}
              brandTone={brandTone}
              variant={isFeatured ? 'featured' : 'card'}
              {...(isFeatured
                ? {
                    stock,
                    outOfStock: stock <= 0,
                  }
                : {})}
            />
          </Link>

          {!isFeatured ? <Rating rating={product.rating} reviews={product.reviews} /> : null}

          <div className={cn('relative z-[3] mt-auto pointer-events-auto', !isFeatured && 'pt-0.5')}>
            <CatalogPreviewPriceBlock
              productId={product.id}
              displayPrice={displayPrice}
              featured={isFeatured}
              badgeClassName="mb-1"
              {...(product.oldPrice != null ? { oldPriceUsd: product.oldPrice } : {})}
              {...(product.discount != null ? { discountPercent: product.discount } : {})}
            />
          </div>
        </div>

        <ProductCardOverlayActions
          productName={product.name}
          isCompareSelected={compareSelected}
          isWishlisted={wishlistSelected}
          withConditionBadge={hasConditionBadge}
          onWishlist={() => toggleWishlist(featuredToWishlistItem(product))}
          onQuickView={() => setQuickViewOpen(true)}
          onCompare={() => toggle(featuredToCompareItem(product))}
        />
      </div>

      <ProductQuickViewDialog
        snapshot={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />

      {isFeatured ? (
        <div className="relative z-10 shrink-0 border-t border-border/40 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
          <ProductQuantityAddFooter
            product={cartProduct}
            addLabel="Comprar ahora"
            onQuantityChange={setQuantity}
          />
          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">{whatsAppButton}</div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 pointer-events-none">
          <div className="min-h-0 overflow-hidden pointer-events-auto">
            <div className="border-t border-border/40 px-4 pb-3 pt-2">
              <ProductQuantityAddFooter
                product={cartProduct}
                addLabel="Comprar ahora"
                onQuantityChange={setQuantity}
              />
              <div className={whatsappRevealClass}>
                <div className="min-h-0 overflow-hidden">{whatsAppButton}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
