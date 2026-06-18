import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react';

import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { AddToCartButton, getAddToCartLabel, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductNuevoCornerBadge } from '@/components/product/product-nuevo-corner-badge';
import { formatHighlightProductTitle } from '@/lib/product-card-title';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const HIGHLIGHT_TEXT = '#0f1f3d';

interface ProductHighlightCardProps {
  product: Product;
  layout?: 'card' | 'strip';
}

export function ProductHighlightCard({ product, layout = 'card' }: ProductHighlightCardProps) {
  const isStrip = layout === 'strip';
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product.id);
  const imageCandidates = useMemo(() => buildProductImageCandidates(product), [product]);
  const [imageIndex, setImageIndex] = useState(0);
  const [imagesExhausted, setImagesExhausted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const imageUrl = imagesExhausted ? null : (imageCandidates[imageIndex] ?? null);
  const cartLabel = outOfStock ? getAddToCartLabel(product) : 'Añadir';
  const maxQuantity = outOfStock ? 1 : Math.max(1, product.stock);

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(maxQuantity, current + delta)));
  };

  const handleImageError = () => {
    if (imageIndex + 1 < imageCandidates.length) {
      setImageIndex((current) => current + 1);
      return;
    }
    setImagesExhausted(true);
  };

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden bg-white',
        isStrip
          ? 'rounded-xl border border-border/50 shadow-[0_2px_12px_rgba(15,31,61,0.08)] xl:rounded-none xl:border-0 xl:shadow-none'
          : 'rounded-xl border border-border/50 shadow-[0_2px_12px_rgba(15,31,61,0.08)]',
      )}
    >
      <Link
        to={detailHref}
        className="relative flex aspect-square w-full items-center justify-center bg-white px-2 pt-2 sm:px-3 sm:pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-label={`Ver ficha de ${product.name}`}
      >
        <div className="pointer-events-none absolute right-1.5 top-1.5 z-10 flex flex-col items-end gap-1 sm:right-2 sm:top-2">
          <ProductNuevoCornerBadge variant="highlight" />
          {isStrip && !outOfStock ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.625rem] font-semibold leading-none shadow-sm sm:text-[0.6875rem]',
                product.stock <= 3
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800',
              )}
            >
              {product.stock <= 3 ? 'Últimas unidades' : 'En stock'}
            </span>
          ) : null}
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="max-h-[88%] max-w-[88%] object-contain object-center"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <ImageOff className="size-10 text-muted-foreground/40" aria-hidden="true" />
        )}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col items-start px-2.5 pb-2.5 pt-0 text-left sm:px-3 sm:pb-3">
        <div className="flex w-full flex-1 flex-col gap-1">
          <Link
            to={detailHref}
            className="w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <h3
              className="line-clamp-3 min-h-[2.75rem] w-full text-pretty text-[0.6875rem] font-bold normal-case leading-snug sm:min-h-[3.25rem] sm:text-[0.8125rem] sm:leading-snug"
              style={{ color: HIGHLIGHT_TEXT }}
            >
              {formatHighlightProductTitle(product.name)}
            </h3>
          </Link>

          <AdminRolePricesTooltip productId={product.id} displayUsd={product.price}>
            <DualPrice
              alwaysBoth
              className="min-h-[1.25rem] whitespace-nowrap text-[0.8125rem] font-bold tabular-nums text-[#0f1f3d] sm:min-h-[1.375rem] sm:text-sm"
              usd={product.price}
            />
          </AdminRolePricesTooltip>
        </div>

        <div className="mt-auto w-full pt-1.5 sm:pt-2">
          <div className="flex w-full items-stretch gap-1 sm:gap-1.5">
            <div
              className="flex shrink-0 items-center rounded-md border border-border bg-white"
              role="group"
              aria-label={`Cantidad de ${product.name}`}
            >
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                disabled={outOfStock || quantity <= 1}
                aria-label="Disminuir cantidad"
                className="flex size-7 shrink-0 items-center justify-center text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40 sm:size-8"
              >
                <Minus className="size-3.5" aria-hidden="true" />
              </button>
              <span
                className="min-w-[0.875rem] text-center text-[0.6875rem] font-semibold tabular-nums text-neutral-900 sm:text-xs"
                aria-live="polite"
                aria-atomic="true"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                disabled={outOfStock || quantity >= maxQuantity}
                aria-label="Aumentar cantidad"
                className="flex size-7 shrink-0 items-center justify-center text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40 sm:size-8"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <AddToCartButton
              product={product}
              addOptions={{ quantity }}
              className={cn(
                'h-7 min-h-7 min-w-0 flex-1 gap-1 rounded-md px-1.5 text-[0.625rem] font-semibold sm:h-8 sm:min-h-8 sm:px-2 sm:text-xs',
                outOfStock
                  ? 'border border-[#0d1b3d]/25 bg-white text-[#0f1f3d] hover:bg-neutral-50 focus-visible:ring-[#0d1b3d]'
                  : 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
              )}
            >
              {!outOfStock ? <ShoppingCart className="size-3 shrink-0" aria-hidden="true" /> : null}
              {cartLabel}
            </AddToCartButton>
          </div>

          <ProductWhatsAppButton
            stopPropagation
            accent="outline"
            label="Solicitar por Whatsapp"
            quantity={quantity}
            product={{
              id: product.id,
              name: product.name,
              priceUsd: product.price,
              category: product.category,
              brand: product.brand ?? null,
            }}
            className="mt-1.5 h-11 min-h-11 w-full rounded-md px-2 text-[0.625rem] font-semibold normal-case tracking-normal sm:text-xs"
          />
        </div>
      </div>
    </article>
  );
}
