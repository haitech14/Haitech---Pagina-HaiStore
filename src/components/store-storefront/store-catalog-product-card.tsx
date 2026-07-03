import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { catalogRowToFeatured, getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsdDisplay } from '@/lib/utils';
import type { Product } from '@/types/product';

interface StoreCatalogProductCardProps {
  product: Product;
}

export function StoreCatalogProductCard({ product }: StoreCatalogProductCardProps) {
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product);
  const catalogProduct = getCatalogProductById(product.id);
  const catalogFeatured = useMemo(
    () => (catalogProduct ? catalogRowToFeatured(catalogProduct) : null),
    [catalogProduct],
  );
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(product), [product]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(product),
    [product],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(product), [product]);
  const displayPrice = useCatalogDisplayPrice(product);
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(catalogFeatured?.oldPrice != null ? { oldPrice: catalogFeatured.oldPrice } : {}),
    ...(catalogFeatured?.discount != null ? { discount: catalogFeatured.discount } : {}),
  });
  const showDiscount =
    Number.isFinite(pricing.discountPercent) &&
    pricing.discountPercent > 0 &&
    pricing.compareUsd > pricing.currentUsd;

  const titleProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes ?? [],
  };
  const { brand, code, title } = getProductCardTitleContent(titleProduct);
  const priceCategory = product.category ?? catalogProduct?.category ?? null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm transition-shadow hover:border-red-600/25 hover:shadow-md">
      <Link
        to={detailHref}
        className="relative block aspect-square w-full overflow-hidden bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
        aria-label={`Ver ficha de ${product.name}`}
      >
        <ProductCardHoverImage
          candidates={imageCandidates}
          storedCandidates={storedImageCandidates}
          hoverSrc={hoverImageSrc}
          alt={product.name}
          className="size-full"
          imageClassName="size-full object-contain"
        />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
        {brand ? (
          <p className="truncate text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[0.6875rem]">
            {brand}
          </p>
        ) : null}

        <Link
          to={detailHref}
          className="mt-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-[0.8125rem] font-bold leading-snug text-foreground sm:text-sm">
            {title}
          </h3>
        </Link>

        <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
          {code ? (
            <p className="min-w-0 truncate font-mono text-[0.625rem] text-muted-foreground sm:text-[0.6875rem]">
              {code}
            </p>
          ) : (
            <span className="min-w-0" aria-hidden="true" />
          )}
          <span
            className={cn(
              'shrink-0 rounded-md px-1.5 py-0.5 text-[0.625rem] font-semibold sm:text-[0.6875rem]',
              outOfStock
                ? 'bg-foreground text-background'
                : 'bg-emerald-50 font-semibold text-emerald-700',
            )}
          >
            {outOfStock ? 'A pedido' : `${Math.max(0, Math.floor(product.stock))} unids.`}
          </span>
        </div>

        <div className="mt-2 space-y-0.5">
          <p className="text-base font-bold tabular-nums text-foreground sm:text-[1.0625rem]">
            {formatPenFromUsdDisplay(pricing.currentUsd, priceCategory)}
          </p>
          {showDiscount ? (
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <p className="text-[0.6875rem] tabular-nums text-muted-foreground line-through sm:text-xs">
                {formatPenFromUsdDisplay(pricing.compareUsd, priceCategory)}
              </p>
              <span className="text-[0.6875rem] font-semibold text-green-600 sm:text-xs">
                {pricing.discountPercent}% DSCTO
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto pt-3">
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            showBuyNow
            hideQuantity
            addLabel="Añadir"
            buyNowLabel="Compr"
            addButtonClassName={cn(
              'h-9 min-h-9 rounded-md border border-border bg-background text-foreground shadow-none hover:bg-muted',
              outOfStock && 'font-semibold',
            )}
            buyNowButtonClassName="h-9 min-h-9 rounded-md bg-red-600 text-white shadow-none hover:bg-red-500"
          />
        </div>
      </div>
    </article>
  );
}
