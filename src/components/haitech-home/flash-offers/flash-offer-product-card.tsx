import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

import { ProductCardSplitBrandTitle } from '@/components/product/product-card-title';
import {
  formatFlashOfferPen,
  formatFlashOfferUsd,
  type RicohFlashOfferProduct,
} from '@/data/ricoh-flash-offers';
import { useCart } from '@/context/cart-context';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

function toCartProduct(item: RicohFlashOfferProduct): Product {
  return {
    id: item.id,
    name: item.model,
    description: item.subtitle,
    price: item.priceUsd,
    currency: 'USD',
    image_url: item.image,
    stock: 10,
    category: 'Equipos',
    brand: item.brand,
    created_at: new Date().toISOString(),
    attributes: [{ id: 'oferta', name: 'Oferta', value: 'Sí' }],
  };
}

interface FlashOfferProductCardProps {
  product: RicohFlashOfferProduct;
  favorited: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: RicohFlashOfferProduct) => void;
}

export function FlashOfferProductCard({
  product,
  favorited,
  onToggleFavorite,
  onAddToCart,
}: FlashOfferProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const href = productPath(product.slug);
  const title = `${product.subtitle} ${product.model}`;

  return (
    <article
      className={cn(
        'group relative flex w-full max-w-[240px] min-w-0 flex-col overflow-hidden rounded-xl bg-white',
        'border border-[#E8E8E8] shadow-[0_2px_10px_rgba(15,23,42,0.08)]',
        'transition-shadow duration-200 hover:shadow-[0_10px_22px_rgba(100,0,10,0.16)]',
      )}
    >
      <div className="relative">
        <button
          type="button"
          aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorited}
          onClick={() => onToggleFavorite(product.id)}
          className="absolute right-2 top-2 z-[2] flex size-7 items-center justify-center text-[#E30613] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/40"
        >
          <Star
            className="size-5"
            strokeWidth={2}
            fill={favorited ? '#E30613' : 'none'}
            aria-hidden="true"
          />
        </button>
        <Link
          to={href}
          className="relative mx-auto flex h-[140px] w-full items-center justify-center px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/35 sm:h-[150px] sm:px-2.5"
        >
          {imgError ? (
            <div className="flex size-full items-center justify-center bg-[#F7F7F7] text-xs font-bold text-[#999]">
              {product.model}
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.model}
              className="max-h-full max-w-[92%] object-contain object-center"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center px-2 pb-2 pt-0.5 text-center">
        <Link
          to={href}
          className="w-full outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/35"
        >
          <h3 className="text-[0.6875rem] font-bold leading-snug text-[#111111] sm:text-[0.75rem]">
            <ProductCardSplitBrandTitle title={title} brand={product.brand} align="center" />
          </h3>
        </Link>

        <div className="mt-1 w-full space-y-0.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <p
              className="text-sm font-bold tabular-nums leading-tight tracking-[-0.03em] text-[#E30613] sm:text-[0.9375rem]"
              style={{ fontFamily: 'var(--font-price)' }}
            >
              {formatFlashOfferPen(product.pricePen)}
            </p>
            {product.offer ? (
              <span className="inline-flex items-center rounded-full bg-[#E30613] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]">
                Oferta
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium tabular-nums leading-tight text-[#6B7280] sm:text-sm">
            {formatFlashOfferUsd(product.priceUsd)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className={cn(
            'mt-1.5 inline-flex h-8 min-h-8 max-h-8 w-auto min-w-0 items-center justify-center gap-1.5',
            'rounded-md bg-[#E30613] px-2.5 font-semibold text-white',
            'text-[0.625rem] sm:text-[0.6875rem]',
            'transition duration-200 ease-out',
            'hover:bg-[#c90511]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/50 focus-visible:ring-offset-2',
          )}
        >
          <ShoppingCart className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

export function handleAddToCart(
  product: RicohFlashOfferProduct,
  addItem: ReturnType<typeof useCart>['addItem'],
): void {
  addItem(toCartProduct(product), { quantity: 1, openDrawer: true });
}
