import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';

import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { FeaturedProduct } from '@/data/featured-products';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

export function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="font-normal text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
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

export function ProductShowcaseCard({ product }: { product: FeaturedProduct }) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      description: null,
      price: product.price,
      currency: 'USD',
      image_url: product.image,
      stock: 10,
      category: product.category,
      created_at: new Date().toISOString(),
    });
  };

  const detailHref = productPath(product.id);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div className="relative">
        <Link
          to={detailHref}
          className="relative block bg-neutral-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
        >
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
          <span className="sr-only">Ver ficha de {product.name}</span>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3">
          {product.discount != null ? (
            <span className="inline-flex rounded-md bg-red-600 px-2 py-0.5 text-[0.7rem] font-bold text-white">
              -{product.discount}%
            </span>
          ) : product.isNew ? (
            <span className="inline-flex rounded-md bg-neutral-900 px-2 py-0.5 text-[0.7rem] font-bold text-white">
              Nuevo
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={`Añadir ${product.name} a favoritos`}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <Heart className="size-4 fill-none" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-1">
        <Link
          to={detailHref}
          className="flex flex-1 flex-col gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-neutral-400">
            {product.category}
          </p>
          <h3 className="text-sm font-bold leading-snug text-neutral-900 sm:text-[0.95rem]">
            {product.name}
          </h3>
          <ProductAttributeBadges
            product={{
              id: product.id,
              name: product.name,
              category: product.category,
              brand: product.brand ?? null,
              attributes: product.attributes ?? [],
            }}
            compact
          />
          <Rating rating={product.rating} reviews={product.reviews} />

          <div className="mt-1 space-y-0.5">
            <p className="text-base font-bold text-neutral-900">
              <DualPrice usd={product.price} />
            </p>
            {product.oldPrice != null && (
              <p className="text-sm font-normal text-neutral-400 line-through decoration-neutral-400">
                <DualPrice usd={product.oldPrice} />
              </p>
            )}
          </div>
        </Link>

        <div className="mt-auto flex gap-2">
          <Button
            type="button"
            onClick={handleAdd}
            className="h-10 min-h-11 flex-1 gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Añadir al carrito
          </Button>
          <ProductWhatsAppButton
            product={{
              id: product.id,
              name: product.name,
              priceUsd: product.price,
              category: product.category,
            }}
          />
        </div>
      </div>
    </article>
  );
}
