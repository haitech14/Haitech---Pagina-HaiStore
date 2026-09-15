import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

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

  return (
    <article
      className={cn(
        'group relative flex h-[420px] w-full max-w-[240px] min-w-0 flex-col overflow-hidden rounded-[14px] bg-white',
        'shadow-[0_6px_16px_rgba(100,0,10,0.12)] transition-shadow duration-200',
        'hover:shadow-[0_10px_22px_rgba(100,0,10,0.16)]',
      )}
    >
      <div className="relative">
        <button
          type="button"
          aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorited}
          onClick={() => onToggleFavorite(product.id)}
          className="absolute right-3 top-3 z-[2] text-[#ed0016] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/40"
        >
          <Star
            className="size-[18px]"
            strokeWidth={2}
            fill={favorited ? '#ed0016' : 'none'}
            aria-hidden="true"
          />
        </button>
        <Link
          to={href}
          className="relative mx-auto flex h-[210px] w-full items-center justify-center px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/35"
        >
        {imgError ? (
          <div className="flex size-full items-center justify-center bg-[#F7F7F7] text-xs font-bold text-[#999]">
            {product.model}
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.model}
            className="max-h-[195px] max-w-[88%] object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
      </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-0.5">
        <Link to={href} className="outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/35">
          <p className="font-[family-name:var(--font-infobox)] text-[12px] font-medium leading-snug text-[#181818]">
            {product.subtitle}
          </p>
          <h3 className="mt-0.5 font-[family-name:var(--font-infobox)] text-[16px] font-bold leading-tight tracking-tight text-[#17191F]">
            {product.model}
          </h3>
        </Link>

        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              className="font-price text-[23px] font-bold leading-none tabular-nums tracking-[-0.03em] text-[#ed0016]"
              style={{ fontFamily: 'var(--font-price)' }}
            >
              {formatFlashOfferPen(product.pricePen)}
            </p>
            <span className="inline-flex items-center rounded-full bg-[#ffe5e8] px-2.5 py-1 text-[10px] font-bold uppercase leading-none text-[#e60012]">
              OFERTA
            </span>
          </div>
          <p className="mt-1 text-[14px] font-normal tabular-nums text-[#747b87]">
            {formatFlashOfferUsd(product.priceUsd)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className={cn(
            'mt-auto flex h-[42px] w-full items-center justify-center gap-1.5 rounded-lg',
            'bg-[#ed0016] font-[family-name:var(--font-infobox)] text-[13px] font-bold text-white',
            'transition duration-200 ease-out',
            'hover:-translate-y-px hover:bg-[#c90012]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed0016]/50 focus-visible:ring-offset-2',
          )}
        >
          <ShoppingCart className="size-4" strokeWidth={2.25} aria-hidden="true" />
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
