import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useProductCompare } from '@/context/product-compare-context';
import { useWishlist } from '@/context/wishlist-context';
import { featuredToWishlistItem } from '@/lib/wishlist-product';
import type { FeaturedProduct } from '@/data/featured-products';
import { featuredToCompareItem } from '@/lib/compare-product';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';

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

const cartRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100';

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
  const [imageError, setImageError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
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
  const cartProduct = {
    id: product.id,
    name: product.name,
    description: null,
    price: product.price,
    currency: 'USD',
    image_url: product.image,
    stock: 10,
    category: product.category,
    created_at: new Date().toISOString(),
  };

  const detailHref = productPath(product.id);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)]',
      )}
    >
      <div className="relative flex flex-1 flex-col">
        <div className="relative">
          <div className="relative block bg-neutral-50/80">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
              <div
                className={cn(
                  'flex items-center justify-center overflow-hidden',
                  isLargeImage
                    ? 'aspect-square p-1 sm:p-1.5'
                    : isFeatured
                      ? 'aspect-square p-2 sm:p-3'
                      : 'aspect-[4/3] p-2 sm:aspect-square sm:p-3',
                )}
              >
                {!imageError && product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className={cn(
                      'object-contain object-center',
                      isLargeImage ? 'size-full' : 'max-h-full max-w-full',
                    )}
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-4xl font-bold text-neutral-200" aria-hidden="true">
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
        </div>

        <div
          className={cn(
            'relative z-[2] flex flex-1 flex-col px-4',
            isFeatured ? 'gap-1 px-3 pb-4 pt-1.5 sm:gap-1.5 sm:px-4 sm:pt-2' : 'gap-0.5 px-3 pb-3 pt-1.5 sm:gap-1 sm:px-4 sm:pt-2',
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
            />
          </Link>

          {!isFeatured ? <Rating rating={product.rating} reviews={product.reviews} /> : null}

          <div className={cn('relative z-[3] mt-auto pointer-events-auto', !isFeatured && 'pt-0.5')}>
            <ProductCardPricing
              productId={product.id}
              priceUsd={product.price}
              featured={isFeatured}
              {...(product.oldPrice != null ? { oldPriceUsd: product.oldPrice } : {})}
              {...(product.discount != null ? { discountPercent: product.discount } : {})}
            />
          </div>
        </div>

        <ProductCardOverlayActions
          productName={product.name}
          isCompareSelected={compareSelected}
          isWishlisted={wishlistSelected}
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

      <div className={cn('relative z-10 pointer-events-none', cartRevealClass)}>
        <div className="min-h-0 overflow-hidden pointer-events-auto">
          <div className="flex items-stretch gap-2 px-4 pb-3 pt-1">
            <AddToCartButton
              product={cartProduct}
              className="h-10 min-h-11 flex-1 rounded-lg bg-red-600 px-2 text-xs font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:text-sm lg:px-2.5"
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
              {getAddToCartLabel(cartProduct)}
            </AddToCartButton>
            <ProductWhatsAppButton
              className="h-10 min-h-11 w-10 rounded-lg"
              product={{
                id: product.id,
                name: product.name,
                priceUsd: product.price,
                category: product.category,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
