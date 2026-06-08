import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Heart,
  ImageOff,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';

import { AddToCartButton, getAddToCartLabel, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { useWishlist } from '@/context/wishlist-context';
import {
  CATALOG_VOLUME_TIERS,
  formatCatalogVolumePricePen,
  getCatalogCardRating,
  getCatalogCardSubtitle,
  getCatalogColorBadge,
  productShowsBestPriceBadge,
  productShowsExpressDelivery,
  productShowsNuevoBadge,
} from '@/lib/product-catalog-card-meta';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

function CatalogRating({
  rating,
  reviews,
  soldCount,
}: {
  rating: number;
  reviews: number;
  soldCount: number;
}) {
  const fullStars = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs"
      aria-label={`Valoración ${rating} de 5, ${reviews} reseñas, ${soldCount} vendidos`}
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < fullStars ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="font-medium text-foreground">{rating}</span>
      <span className="text-muted-foreground">({reviews})</span>
      <span className="text-muted-foreground" aria-hidden="true">
        |
      </span>
      <span className="text-muted-foreground">{soldCount} vendidos</span>
    </div>
  );
}

function CatalogDualPrice({ productId, priceUsd }: { productId: string; priceUsd: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-600">USD</p>
        <AdminRolePricesTooltip productId={productId} displayUsd={priceUsd}>
          <p className="text-xl font-bold tabular-nums leading-none text-red-600 sm:text-2xl">
            {formatUsd(priceUsd)}
          </p>
        </AdminRolePricesTooltip>
      </div>
      <div className="min-w-0 border-l border-border/50 pl-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-600">PEN</p>
        <p className="text-xl font-bold tabular-nums leading-none text-red-600 sm:text-2xl">
          {formatPenFromUsd(priceUsd)}
        </p>
      </div>
    </div>
  );
}

function CatalogVolumePricing({ priceUsd }: { priceUsd: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted-foreground">
        Precios por volumen (Desde 3 unidades)
      </p>
      <ul className="mt-2 space-y-1">
        {CATALOG_VOLUME_TIERS.map((tier) => (
          <li key={tier.range} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{tier.range}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatCatalogVolumePricePen(priceUsd, tier.discountPercent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CatalogTopBadges({ product }: { product: Product }) {
  const color = getCatalogColorBadge(product);
  const showNuevo = productShowsNuevoBadge(product);
  const showBestPrice = productShowsBestPriceBadge(product);

  if (!color && !showNuevo && !showBestPrice) return null;

  return (
    <ul className="flex flex-wrap gap-1" aria-label="Etiquetas del producto">
      {color ? (
        <li>
          <span className="inline-flex rounded-md bg-neutral-900 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            {color}
          </span>
        </li>
      ) : null}
      {showNuevo ? (
        <li>
          <span className="inline-flex rounded-md bg-violet-600 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            Nuevo
          </span>
        </li>
      ) : null}
      {showBestPrice ? (
        <li>
          <span className="inline-flex rounded-md bg-orange-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            Mejor precio
          </span>
        </li>
      ) : null}
    </ul>
  );
}

interface ProductCatalogCardProps {
  product: Product;
}

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product.id);
  const imageUrl = resolveProductImageUrl(product);
  const subtitle = getCatalogCardSubtitle(product);
  const { rating, reviews, soldCount } = getCatalogCardRating(product);
  const wishlistSelected = isWishlisted(product.id);
  const stockQty = outOfStock ? 0 : Math.max(product.stock, 1);
  const showExpress = productShowsExpressDelivery(product, !outOfStock);
  const displayTitle = formatProductCardTitle(product);
  const cartLabel = outOfStock ? 'Comprar' : getAddToCartLabel(product);

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(stockQty || 99, current + delta)));
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_4px_18px_rgba(15,23,42,0.08)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <div className="relative px-3 pb-2 pt-3">
        <div className="mb-2 min-h-[1.25rem] pr-10">
          <CatalogTopBadges product={product} />
        </div>

        <button
          type="button"
          aria-pressed={wishlistSelected}
          aria-label={
            wishlistSelected
              ? `Quitar ${product.name} de favoritos`
              : `Añadir ${product.name} a favoritos`
          }
          className={cn(
            'absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border bg-card shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            wishlistSelected
              ? 'border-red-600 bg-red-50 text-red-600'
              : 'border-border text-muted-foreground hover:border-red-200 hover:text-red-600',
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(productToWishlistItem(product));
          }}
        >
          <Heart
            className={cn('size-4', wishlistSelected && 'fill-red-600 text-red-600')}
            aria-hidden="true"
          />
        </button>

        <Link
          to={detailHref}
          className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:aspect-square"
          aria-label={`Ver ficha de ${product.name}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="text-xs font-medium">Imagen no disponible</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3">
        {subtitle ? (
          <p className="text-[0.7rem] font-medium text-red-800/90 sm:text-xs">{subtitle}</p>
        ) : null}

        <Link
          to={detailHref}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-3 text-pretty text-sm font-bold leading-snug text-foreground sm:text-[0.9375rem]">
            {displayTitle}
          </h3>
        </Link>

        <CatalogRating rating={rating} reviews={reviews} soldCount={soldCount} />

        <CatalogDualPrice productId={product.id} priceUsd={product.price} />

        <CatalogVolumePricing priceUsd={product.price} />

        <div className="space-y-1.5 text-xs">
          <p
            className={cn(
              'flex items-center gap-1.5 font-semibold',
              outOfStock ? 'text-orange-600' : 'text-emerald-700',
            )}
          >
            <span
              className={cn(
                'flex size-4 items-center justify-center rounded-full text-[0.65rem]',
                outOfStock ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700',
              )}
              aria-hidden="true"
            >
              {outOfStock ? '!' : <Check className="size-2.5" />}
            </span>
            {outOfStock ? 'A pedido (3 - 5 días)' : `En stock (${product.stock} unidades)`}
          </p>

          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
            Envíos a todo el Perú
          </p>

          {showExpress ? (
            <p className="flex items-center gap-1.5 font-medium text-orange-600">
              <Zap className="size-3.5 shrink-0" aria-hidden="true" />
              Entrega en 24 horas
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-stretch gap-2 pt-1">
          <div className="flex shrink-0 items-center rounded-lg border border-border bg-muted/30">
            <button
              type="button"
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
              className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span
              className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-foreground"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => adjustQuantity(1)}
              disabled={quantity >= (stockQty || 99)}
              aria-label="Aumentar cantidad"
              className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          <AddToCartButton
            product={product}
            addOptions={{ quantity }}
            className="min-h-10 flex-1 rounded-lg bg-red-600 px-2 text-xs font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:text-sm"
          >
            {outOfStock ? (
              <Zap className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            )}
            {cartLabel}
          </AddToCartButton>

          <ProductWhatsAppButton
            className="size-10 min-h-10 shrink-0 rounded-lg"
            product={{
              id: product.id,
              name: product.name,
              priceUsd: product.price,
              category: product.category,
              brand: product.brand ?? null,
            }}
          />
        </div>
      </div>
    </article>
  );
}
