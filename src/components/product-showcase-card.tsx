import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductNuevoCornerBadge } from '@/components/product/product-nuevo-corner-badge';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useProductCompare } from '@/context/product-compare-context';
import type { FeaturedProduct } from '@/data/featured-products';
import { featuredToCompareItem } from '@/lib/compare-product';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

export function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="font-normal text-neutral-400">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

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

export function ProductShowcaseCard({ product }: { product: FeaturedProduct }) {
  const { isSelected, toggle } = useProductCompare();
  const [imageError, setImageError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const compareSelected = isSelected(product.id);
  const badgeSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
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
  const showNuevoCorner =
    product.isNew === true || productHasNuevoCornerBadge(badgeSource);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div className="relative flex flex-1 flex-col">
        <Link
          to={detailHref}
          className="absolute inset-0 z-[1] rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={`Ver ficha de ${product.name}`}
        >
          <span className="sr-only">Ver ficha de {product.name}</span>
        </Link>

        <div className="pointer-events-none relative z-0 flex flex-1 flex-col">
          <div className="relative">
            <div className="relative block bg-neutral-50/50">
              <div className="flex aspect-[4/3] items-center justify-center p-5 sm:aspect-square sm:p-6">
                {!imageError && product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="max-h-full max-w-full object-contain"
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

            <div className="pointer-events-none absolute left-3 top-3 z-[2]">
              {showNuevoCorner ? <ProductNuevoCornerBadge /> : null}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 pt-2">
            <ProductCardTitle product={badgeSource} />

            <Rating rating={product.rating} reviews={product.reviews} />

            <div className="mt-auto pb-3 pt-1">
              <ProductCardPricing
                productId={product.id}
                priceUsd={product.price}
                {...(product.oldPrice != null ? { oldPriceUsd: product.oldPrice } : {})}
                {...(product.discount != null ? { discountPercent: product.discount } : {})}
              />
            </div>
          </div>
        </div>

        <ProductCardOverlayActions
          productName={product.name}
          isCompareSelected={compareSelected}
          onQuickView={() => setQuickViewOpen(true)}
          onCompare={() => toggle(featuredToCompareItem(product))}
        />
      </div>

      <ProductQuickViewDialog
        snapshot={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />

      <div className={cn('relative z-10', cartRevealClass)}>
        <div className="min-h-0 overflow-hidden">
          <div className="flex items-stretch gap-2 border-t border-neutral-200/80 px-4 pb-4 pt-3">
            <AddToCartButton
              product={cartProduct}
              className="h-10 min-h-11 flex-1 rounded-lg bg-red-600 px-2 text-xs font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:text-sm lg:px-2.5"
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
              Añadir al carrito
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
