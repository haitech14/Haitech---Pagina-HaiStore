import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductNuevoCornerBadge } from '@/components/product/product-nuevo-corner-badge';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const cartRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const detailHref = productPath(product.id);
  const imageUrl = resolveProductImageUrl(product);
  const showNuevoCorner = productHasNuevoCornerBadge(product);

  const cartActions = (
    <div className="flex items-stretch gap-2">
      <AddToCartButton
        product={product}
        disabled={outOfStock}
        className="min-h-11 flex-1 rounded-lg bg-red-600 px-2 text-xs font-semibold hover:bg-red-500 sm:min-w-[10.5rem] sm:text-sm lg:px-2.5"
      >
        <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
        Añadir al carrito
      </AddToCartButton>
      <ProductWhatsAppButton
        className="size-11 shrink-0 rounded-lg"
        product={{
          id: product.id,
          name: product.name,
          priceUsd: product.price,
          category: product.category,
          brand: product.brand ?? null,
        }}
      />
    </div>
  );

  if (layout === 'list') {
    return (
      <article className="group relative flex w-full flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:gap-5">
        <div className="relative mx-auto w-full max-w-[11rem] shrink-0 sm:mx-0 sm:max-w-none sm:w-36">
          <div className="relative">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
            {showNuevoCorner ? (
              <div className="pointer-events-none absolute left-2 top-2 z-[2]">
                <ProductNuevoCornerBadge />
              </div>
            ) : null}
            <div
              className="flex aspect-square items-center justify-center rounded-lg bg-muted/50"
              aria-hidden={imageUrl ? undefined : true}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain p-1.5"
                  loading="lazy"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              to={detailHref}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <ProductCardTitle product={product} />
            </Link>
            <div className="relative z-[3] pointer-events-auto">
              <ProductCardPricing productId={product.id} priceUsd={product.price} />
              <p className={cn('mt-1 text-xs', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
                {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0 sm:w-auto">{cartActions}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)]">
      <div className="relative flex flex-1 flex-col">
        <div className="relative px-4 pt-4">
          <div className="relative">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
            {showNuevoCorner ? (
              <div className="pointer-events-none absolute left-3 top-3 z-[2]">
                <ProductNuevoCornerBadge />
              </div>
            ) : null}
            <div
              className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted/50 sm:aspect-square"
              aria-hidden={imageUrl ? undefined : true}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain p-1.5 sm:p-2"
                  loading="lazy"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex flex-1 flex-col gap-1 px-4 pb-3 pt-2">
          <Link
            to={detailHref}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <ProductCardTitle product={product} />
          </Link>

          <div className="relative z-[3] mt-auto space-y-1 pt-0.5">
            <ProductCardPricing productId={product.id} priceUsd={product.price} />
            <p className={cn('text-xs', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>
        </div>
      </div>

      <div className={cn('relative z-10', cartRevealClass)}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-3 pt-1">{cartActions}</div>
        </div>
      </div>
    </article>
  );
}
