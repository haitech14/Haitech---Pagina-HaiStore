import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Heart,
} from 'lucide-react';

import { isProductOutOfStock, ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import { ProductRating } from '@/components/product/product-rating';
import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useWishlist } from '@/context/wishlist-context';
import { formatVolumeUnitPrice } from '@/lib/display-price';
import {
  CATALOG_VOLUME_TIERS,
  getCatalogCardPricing,
  getCatalogCardRating,
  getCatalogCardSpecLines,
} from '@/lib/product-catalog-card-meta';
import { PRODUCT_CARD_DISCOUNT_CLASS } from '@/lib/product-card-title';
import { ProductCardHoverImage, PRODUCT_CARD_IMAGE_CLASS } from '@/components/product/product-card-hover-image';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ViewAsRoleBadge } from '@/components/product/view-as-role-badge';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

function CatalogCardPricing({ product }: { product: Product }) {
  const displayPrice = useCatalogDisplayPrice(product);
  const pricing = getCatalogCardPricing({ ...product, price: displayPrice.priceUsd });
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const showUsd = displayCurrency !== 'PEN';
  const showPen = displayCurrency !== 'USD';
  const penFirst = dualPriceOrder === 'pen-usd';

  const compareParts =
    penFirst
      ? [
          ...(showPen ? [formatPenFromUsd(pricing.compareUsd)] : []),
          ...(showUsd ? [formatUsd(pricing.compareUsd)] : []),
        ]
      : [
          ...(showUsd ? [formatUsd(pricing.compareUsd)] : []),
          ...(showPen ? [formatPenFromUsd(pricing.compareUsd)] : []),
        ];

  const usdColumn = showUsd ? (
    <div className={cn('min-w-0', showPen && penFirst && 'border-l border-border/50 pl-2')}>
      <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">USD</p>
      <AdminRolePricesTooltip productId={product.id} displayUsd={pricing.currentUsd}>
        <p className="text-base font-bold tabular-nums leading-tight text-foreground xl:text-lg">
          {formatUsd(pricing.currentUsd)}
        </p>
      </AdminRolePricesTooltip>
    </div>
  ) : null;

  const penColumn = showPen ? (
    <div className={cn('min-w-0', showUsd && !penFirst && 'border-l border-border/50 pl-2')}>
      <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">PEN</p>
      <p className="text-base font-bold tabular-nums leading-tight text-red-600 xl:text-lg">
        {formatPenFromUsd(pricing.currentUsd)}
      </p>
    </div>
  ) : null;

  return (
    <div className="space-y-1">
      {displayPrice.viewAsRolePrices.length > 1 ? (
        <>
          <ViewAsRoleBadge labels={displayPrice.viewAsRolePrices.map((line) => line.label)} />
          <div className="rounded-md border border-border/60 bg-muted/15 px-2 py-1.5">
            <ViewAsRolePrices rolePrices={displayPrice.viewAsRolePrices} compact />
          </div>
        </>
      ) : (
        <>
          {displayPrice.viewAsLabel ? <ViewAsRoleBadge label={displayPrice.viewAsLabel} /> : null}
          <div className="rounded-md border border-border/60 bg-muted/15 px-2 py-1.5">
            <div className={cn('grid gap-2', showUsd && showPen ? 'grid-cols-2' : 'grid-cols-1')}>
              {penFirst ? (
                <>
                  {penColumn}
                  {usdColumn}
                </>
              ) : (
                <>
                  {usdColumn}
                  {penColumn}
                </>
              )}
            </div>
          </div>
        </>
      )}
      {pricing.discountPercent > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-0.5">
          <p className="text-[0.65rem] tabular-nums text-muted-foreground line-through sm:text-xs">
            {compareParts.join(' · ')}
          </p>
          <span className={PRODUCT_CARD_DISCOUNT_CLASS} aria-label={`Ahorra ${pricing.discountPercent} por ciento`}>
            -{pricing.discountPercent}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

function CatalogVolumePricing({ priceUsd }: { priceUsd: number }) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();

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
              {formatVolumeUnitPrice(priceUsd, tier.discountPercent, displayCurrency, dualPriceOrder)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CatalogCardSpecList({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null;

  return (
    <ul className="space-y-0.5" aria-label="Especificaciones del producto">
      {lines.map((line) => {
        const isCodeLine = line.startsWith('Código:');
        return (
          <li
            key={line}
            className="flex items-start gap-1.5 text-[0.65rem] leading-snug text-muted-foreground sm:text-xs"
          >
            <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" aria-hidden="true" />
            <span
              className={cn(
                'text-pretty',
                isCodeLine && 'break-all font-mono text-[0.62rem] sm:text-[0.6875rem]',
              )}
            >
              {line}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function CatalogCardStockLine({
  outOfStock,
  stock,
}: {
  outOfStock: boolean;
  stock: number;
}) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-tight sm:text-sm',
        !outOfStock && 'text-emerald-700',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold',
          outOfStock ? ON_REQUEST_STOCK_BADGE_CLASS : 'text-emerald-700',
        )}
      >
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
        {outOfStock ? 'A pedido' : `Stock: ${stock}`}
      </span>
    </p>
  );
}

interface ProductCatalogCardProps {
  product: Product;
}

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product);
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(product), [product]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(product),
    [product],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(product), [product]);
  const wishlistSelected = isWishlisted(product.id);
  const displayTitle = formatProductCardTitle(product);
  const rating = getCatalogCardRating(product);
  const specLines = getCatalogCardSpecLines(product);
  const displayPrice = useCatalogDisplayPrice(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative px-2 pb-1.5 pt-2">
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
          className="relative block aspect-square w-full overflow-hidden rounded-md bg-muted/35 p-2.5 sm:p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={`Ver ficha de ${product.name}`}
        >
          <ProductCardHoverImage
            candidates={imageCandidates}
            storedCandidates={storedImageCandidates}
            hoverSrc={hoverImageSrc}
            alt={product.name}
            className="size-full"
            imageClassName={PRODUCT_CARD_IMAGE_CLASS}
          />
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

        {rating ? (
          <ProductRating rating={rating.rating} reviews={rating.reviews} className="-mt-0.5" />
        ) : null}

        <CatalogCardStockLine outOfStock={outOfStock} stock={product.stock} />

        <div
          className={cn(
            'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200',
            'group-hover:grid-rows-[1fr] group-hover:opacity-100',
            'group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
            'motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <CatalogCardSpecList lines={specLines} />
          </div>
        </div>

        <CatalogCardPricing product={product} />

        <div
          className={cn(
            'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200',
            'group-hover:grid-rows-[1fr] group-hover:opacity-100',
            'group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
            'motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <CatalogVolumePricing priceUsd={displayPrice.priceUsd} />
          </div>
        </div>

        <div className="mt-auto border-t border-border/50 pt-2">
          <ProductQuantityAddFooter product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
