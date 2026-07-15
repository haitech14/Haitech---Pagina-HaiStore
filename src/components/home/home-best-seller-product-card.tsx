import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import type { HomeBestSellerProduct } from '@/data/home-best-sellers';
import { getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const BEST_SELLER_ORANGE = '#F97316';
const BEST_SELLER_GREEN = '#16A34A';

function toCartProduct(item: HomeBestSellerProduct): Product {
  return {
    id: item.id,
    name: item.name,
    description: null,
    price: item.price,
    currency: 'USD',
    image_url: item.image,
    stock: 10,
    category: 'Equipos',
    brand: item.brand,
    code: null,
    created_at: new Date().toISOString(),
  };
}

export function HomeBestSellerProductCard({
  product,
  showBestSellerBadge = true,
  buttonVariant = 'link',
}: {
  product: HomeBestSellerProduct;
  showBestSellerBadge?: boolean;
  buttonVariant?: 'link' | 'grey';
}) {
  const catalog = getCatalogProductById(product.id);
  const cartProduct = toCartProduct(product);
  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code: catalog?.code ?? null,
        name: product.name,
        category: catalog?.category ?? 'Equipos',
        brand: product.brand ?? catalog?.brand ?? null,
        image_url: product.image ?? catalog?.image_url ?? null,
        gallery: catalog?.gallery ?? null,
      }),
    [catalog, product],
  );
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(imageSource), [imageSource]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(imageSource),
    [imageSource],
  );
  const hoverImageSrc = useMemo(
    () => resolveProductCardHoverImageFromProduct(imageSource),
    [imageSource],
  );
  const hasValidImage = imageCandidates.length > 0;
  const displayTitle = formatProductCardTitle({
    id: product.id,
    name: product.name,
    category: catalog?.category ?? 'Equipos',
    brand: product.brand ?? catalog?.brand ?? null,
  });

  return (
    <article className="group flex h-full w-full min-w-[9.5rem] flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-[0_2px_14px_rgba(15,31,61,0.07)] sm:min-w-0">
      <div className="relative">
        <Link
          to={product.href}
          className={cn(
            'relative block aspect-square p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 sm:p-3',
            hasValidImage ? 'bg-white' : 'bg-muted/35',
          )}
          aria-label={`Ver ficha de ${product.name}`}
        >
          {showBestSellerBadge ? (
            <span
              className="absolute left-2 top-2 z-[2] rounded px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white sm:left-2.5 sm:top-2.5 sm:text-[0.6875rem]"
              style={{ backgroundColor: BEST_SELLER_ORANGE }}
            >
              Más vendido
            </span>
          ) : null}

          <ProductCardHoverImage
            candidates={imageCandidates}
            storedCandidates={storedImageCandidates}
            hoverSrc={hoverImageSrc}
            alt={product.name}
            className="size-full"
            imageClassName="size-full object-contain"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2 sm:px-3.5 sm:pb-3.5">
        <Link
          to={product.href}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 min-h-[2.5rem] text-pretty text-left text-[0.8125rem] font-semibold leading-snug text-[#111111] sm:min-h-[2.75rem] sm:text-sm">
            {displayTitle}
          </h3>
        </Link>

        <ProductCardFeaturedPricing
          className="mt-2"
          currentUsd={product.price}
          compareUsd={product.oldPrice > product.price ? product.oldPrice : product.price}
        />

        {product.discountPercent >= 5 ? (
          <span
            className="mt-1.5 inline-flex w-fit rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white sm:text-xs"
            style={{ backgroundColor: BEST_SELLER_GREEN }}
          >
            {product.discountPercent}% OFF
          </span>
        ) : null}

        <div className="relative z-[2] mt-auto pt-3">
          <AddToCartButton
            product={cartProduct}
            addOptions={{ quantity: 1 }}
            variant={buttonVariant === 'grey' ? 'default' : 'link'}
            size="sm"
            className={cn(
              buttonVariant === 'grey'
                ? 'h-10 min-h-10 w-full rounded-lg border border-border/80 bg-[#F1F5F9] px-3 text-sm font-semibold text-[#334155] shadow-none hover:bg-[#E2E8F0] hover:text-[#1E293B]'
                : 'h-auto min-h-0 p-0 text-sm font-semibold text-[#2563EB] underline-offset-2 hover:text-[#1D4ED8] hover:underline',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
            )}
          >
            Comprar
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
