import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Heart,
  ImageOff,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';

import { AddToCartButton, getAddToCartLabel, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { useWishlist } from '@/context/wishlist-context';
import {
  CATALOG_VOLUME_TIERS,
  formatCatalogVolumePricePen,
  getCatalogColorBadge,
  productShowsBestPriceBadge,
  productShowsNuevoBadge,
} from '@/lib/product-catalog-card-meta';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

function CatalogDualPrice({ productId, priceUsd }: { productId: string; priceUsd: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/15 px-2 py-1.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-red-600/90">USD</p>
          <AdminRolePricesTooltip productId={productId} displayUsd={priceUsd}>
            <p className="text-base font-bold tabular-nums leading-tight text-red-600 xl:text-lg">
              {formatUsd(priceUsd)}
            </p>
          </AdminRolePricesTooltip>
        </div>
        <div className="min-w-0 border-l border-border/50 pl-2">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-red-600/90">PEN</p>
          <p className="text-base font-bold tabular-nums leading-tight text-red-600 xl:text-lg">
            {formatPenFromUsd(priceUsd)}
          </p>
        </div>
      </div>
    </div>
  );
}

function CatalogVolumePricing({ priceUsd }: { priceUsd: number }) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/30 px-2 py-1.5">
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted-foreground">
        Precios por volumen (desde 3 u.)
      </p>
      <ul className="mt-1 space-y-0.5">
        {CATALOG_VOLUME_TIERS.map((tier) => (
          <li key={tier.range} className="flex items-center justify-between gap-1 text-[0.65rem]">
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
          <span className="inline-flex rounded-md bg-neutral-900 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
            {color}
          </span>
        </li>
      ) : null}
      {showNuevo ? (
        <li>
          <span className="inline-flex rounded-md bg-neutral-900 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
            Nuevo
          </span>
        </li>
      ) : null}
      {showBestPrice ? (
        <li>
          <span className="inline-flex rounded-md bg-orange-500 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
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
  const wishlistSelected = isWishlisted(product.id);
  const stockQty = outOfStock ? 0 : Math.max(product.stock, 1);
  const displayTitle = formatProductCardTitle(product);
  const productCode = product.code?.trim() || null;
  const cartLabel = outOfStock ? 'Comprar' : getAddToCartLabel(product);

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(stockQty || 99, current + delta)));
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative px-2 pb-1.5 pt-2">
        <div className="mb-1 min-h-[1.1rem] pr-8">
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
            'absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm transition-colors',
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
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={`Ver ficha de ${product.name}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="size-full object-contain object-center p-0.5"
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

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2 pb-2">
        <Link
          to={detailHref}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-sm font-bold leading-snug text-foreground sm:text-base">
            {displayTitle}
          </h3>
        </Link>

        <p
          className={cn(
            '-mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.65rem] leading-tight',
            outOfStock ? 'text-orange-600' : 'text-emerald-700',
          )}
        >
          <span className="inline-flex items-center gap-1 font-semibold">
            <Check className="size-3 shrink-0" aria-hidden="true" />
            {outOfStock ? 'A pedido' : `Stock: ${product.stock}`}
          </span>
          {productCode ? (
            <>
              <span className="text-muted-foreground" aria-hidden="true">
                ·
              </span>
              <span className="font-mono font-medium text-muted-foreground">{productCode}</span>
            </>
          ) : null}
        </p>

        <CatalogDualPrice productId={product.id} priceUsd={product.price} />

        <div
          className={cn(
            'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200',
            'group-hover:grid-rows-[1fr] group-hover:opacity-100',
            'group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
            'motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <CatalogVolumePricing priceUsd={product.price} />
          </div>
        </div>

        <div
          className={cn(
            'mt-auto grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-200',
            'sm:grid-rows-[0fr] sm:opacity-0',
            'sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100',
            'sm:group-focus-within:grid-rows-[1fr] sm:group-focus-within:opacity-100',
            'motion-reduce:sm:grid-rows-[1fr] motion-reduce:sm:opacity-100 motion-reduce:sm:transition-none',
          )}
        >
          <div className="min-h-0 overflow-hidden pt-1">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-1">
              <div className="flex items-center rounded-md border border-border bg-muted/30">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Minus className="size-3" aria-hidden="true" />
                </button>
                <span
                  className="min-w-[1.5rem] text-center text-xs font-semibold tabular-nums text-foreground"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= (stockQty || 99)}
                  aria-label="Aumentar cantidad"
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Plus className="size-3" aria-hidden="true" />
                </button>
              </div>

              <AddToCartButton
                product={product}
                addOptions={{ quantity }}
                className="min-h-9 gap-1 rounded-md bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 xl:text-xs"
              >
                <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{cartLabel}</span>
              </AddToCartButton>

              <ProductWhatsAppButton
                className="size-9 min-h-9 shrink-0 rounded-md border-[#25D366] bg-[#25D366] text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
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
        </div>
      </div>
    </article>
  );
}
