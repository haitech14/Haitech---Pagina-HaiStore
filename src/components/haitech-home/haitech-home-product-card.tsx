import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCart } from '@/context/cart-context';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { penToUsd, cn } from '@/lib/utils';
import type { Product } from '@/types/product';

function toCartProduct(product: HaitechShopProduct): Product {
  const priceUsd = Math.round(penToUsd(product.price) * 100) / 100;
  return {
    id: product.id,
    name: product.name,
    description: product.name,
    price: priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock: 1,
    category: 'Equipos',
    brand: 'RICOH',
    created_at: new Date().toISOString(),
  };
}

function formatHaitechUsd(usd: number): string {
  return `US$ ${usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Infobox de producto (favoritos / lo último) — layout tipo captura ecommerce. */
export function HaitechHomeProductCard({
  product,
  className,
}: {
  product: HaitechShopProduct;
  className?: string;
}) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const usdApprox = penToUsd(product.price);

  const body = (
    <>
      <div className="flex h-[168px] w-full shrink-0 items-center justify-center overflow-hidden bg-white">
        {!imgError ? (
          <img
            src={product.image}
            alt=""
            width={220}
            height={168}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center rounded-lg bg-[#F0F0F0] text-sm font-bold text-[#999]"
            aria-hidden="true"
          >
            {product.name.slice(0, 1)}
          </div>
        )}
      </div>

      <h3
        className="mt-2.5 line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-snug text-black sm:text-[15px]"
        title={product.name}
      >
        {product.name}
      </h3>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {product.compareAt != null ? (
          <span className="text-[12px] text-[#B0B0B0] line-through sm:text-[13px]">
            {formatHaitechPen(product.compareAt)}
          </span>
        ) : null}
        {product.discountLabel ? (
          <span className="text-[12px] font-semibold sm:text-[13px]" style={{ color: HAITECH_SHOP.brand }}>
            {product.discountLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-0.5 text-[19px] font-bold leading-tight text-black sm:text-[20px]">
        {formatHaitechPen(product.price)}
      </p>
      {usdApprox > 0 ? (
        <p className="mt-0.5 text-[12px] font-medium text-[#8A8A8A] sm:text-[13px]">
          {formatHaitechUsd(usdApprox)}
        </p>
      ) : null}
    </>
  );

  return (
    <article
      className={cn(
        'flex h-[390px] w-full flex-col rounded-[15px] border bg-white p-4 shadow-[0_2px_10px_rgba(15,31,61,0.06)]',
        className,
      )}
      style={{ borderColor: HAITECH_SHOP.cardBorder }}
    >
      {product.href ? (
        <Link to={product.href} className="flex min-h-0 flex-1 flex-col outline-none">
          {body}
        </Link>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-3">
        <button
          type="button"
          onClick={() => addItem(toCartProduct(product), { openDrawer: true })}
          className={cn(
            'inline-flex h-[36px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2.5',
            'text-[12px] font-semibold text-white',
            'transition-colors hover:bg-[#c90511]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
          )}
          style={{ backgroundColor: HAITECH_SHOP.brand }}
        >
          <ShoppingCart className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
          Añadir al carrito
        </button>
        <button
          type="button"
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#9A9A9A] transition-colors hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <Heart
            className="size-5"
            strokeWidth={1.75}
            fill={liked ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
