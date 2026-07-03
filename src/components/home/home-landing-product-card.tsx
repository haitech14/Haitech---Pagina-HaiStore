import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import type { FeaturedProduct } from '@/data/featured-products';
import { getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { formatProductCardTitle } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { formatPenFromUsdDisplay } from '@/lib/utils';
import type { Product } from '@/types/product';

const WHATSAPP_REVEAL_CLASS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

export function HomeLandingProductCard({
  product,
  index,
}: {
  product: FeaturedProduct;
  index: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const catalogProduct = getCatalogProductById(product.id);
  const displayPrice = useCatalogDisplayPrice({
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
  });
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(product.oldPrice != null ? { oldPrice: product.oldPrice } : {}),
    ...(product.discount != null ? { discount: product.discount } : {}),
  });
  const showBestSellerBadge = index === 0;
  const showDiscountBadge = pricing.discountPercent >= 5;
  const categoryLabel = product.category?.trim() || catalogProduct?.category?.trim() || null;
  const priceCategory = product.category ?? catalogProduct?.category ?? null;
  const displayTitle = formatProductCardTitle({
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes ?? [],
  });

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code: product.code ?? catalogProduct?.code ?? null,
        name: product.name,
        category: product.category,
        brand: product.brand ?? catalogProduct?.brand ?? null,
        image_url: product.image ?? catalogProduct?.image_url ?? null,
        gallery: catalogProduct?.gallery ?? null,
      }),
    [catalogProduct, product],
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

  const cartProduct: Product = {
    id: product.id,
    name: product.name,
    description: catalogProduct?.description ?? null,
    price: displayPrice.priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock: catalogProduct?.stock ?? 10,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    created_at: catalogProduct?.created_at ?? new Date().toISOString(),
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
      <div className="relative">
        <Link
          to={productPath(product)}
          className="relative block aspect-square bg-white p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 sm:p-3"
          aria-label={`Ver ficha de ${product.name}`}
        >
          {showBestSellerBadge ? (
            <span className="absolute left-2 top-2 z-[2] rounded bg-[#E30613] px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white sm:left-2.5 sm:top-2.5 sm:text-[0.6875rem]">
              Más vendido
            </span>
          ) : null}

          {showDiscountBadge ? (
            <span className="absolute right-2 top-2 z-[2] rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-[#666666] sm:right-2.5 sm:top-2.5 sm:text-xs">
              -{pricing.discountPercent}%
            </span>
          ) : null}

          <ProductCardHoverImage
            candidates={imageCandidates}
            storedCandidates={storedImageCandidates}
            hoverSrc={hoverImageSrc}
            alt={product.name}
            className="size-full"
            imageClassName="size-full object-contain"
            placeholder={
              <span className="text-4xl font-bold text-neutral-200" aria-hidden="true">
                {product.name.charAt(0)}
              </span>
            }
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2 sm:px-3.5 sm:pb-3.5">
        <Link
          to={productPath(product)}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 min-h-[2.5rem] text-pretty text-left text-[0.8125rem] font-bold leading-snug text-[#111111] sm:min-h-[2.75rem] sm:text-sm">
            {displayTitle}
          </h3>
        </Link>

        <p className="mt-1 min-h-[1rem] line-clamp-1 text-left text-[0.6875rem] font-normal text-[#666666] sm:min-h-[1.125rem] sm:text-xs">
          {categoryLabel ?? '\u00a0'}
        </p>

        <div className="mt-2 flex min-h-[1.375rem] flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:min-h-[1.5rem]">
          <p className="text-base font-bold text-[#111111] sm:text-[1.0625rem]">
            {formatPenFromUsdDisplay(pricing.currentUsd, priceCategory)}
          </p>
          {pricing.compareUsd > pricing.currentUsd ? (
            <p className="text-[0.6875rem] font-normal text-[#888888] line-through sm:text-xs">
              {formatPenFromUsdDisplay(pricing.compareUsd, priceCategory)}
            </p>
          ) : null}
        </div>

        <div className="relative z-[2] mt-auto space-y-1.5 pt-3">
          <ProductQuantityAddFooter
            product={cartProduct}
            size="sm"
            revealQuantityOnHover
            addLabel="Agregar al carrito"
            onQuantityChange={setQuantity}
            addButtonClassName="h-10 min-h-10 rounded-lg bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm"
          />

          <div className={WHATSAPP_REVEAL_CLASS}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                accent="outline"
                label="Cotizar por WhatsApp"
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayPrice.priceUsd,
                  category: product.category,
                  brand: product.brand ?? catalogProduct?.brand ?? null,
                }}
                className="h-10 min-h-10 w-full rounded-lg border-[#25D366] bg-white px-2 text-[0.6875rem] font-semibold normal-case tracking-normal text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
