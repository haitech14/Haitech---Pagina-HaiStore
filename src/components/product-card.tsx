import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CatalogPreviewPriceBlock } from '@/components/product/catalog-preview-price-block';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductCardImageConditionBadge } from '@/components/product/product-card-image-condition-badge';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductCardHoverImage, PRODUCT_CARD_IMAGE_CLASS } from '@/components/product/product-card-hover-image';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const cartRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const detailHref = productPath(product);
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(product), [product]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(product),
    [product],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(product), [product]);
  const displayPrice = useCatalogDisplayPrice(product);

  const cartActions = (
    <div className="space-y-2">
      <ProductQuantityAddFooter
        product={product}
        addLabel="Comprar ahora"
        revealQuantityOnHover={false}
      />
      <ProductWhatsAppButton
        accent="outline"
        label="Comprar por WhatsApp"
        className="h-11 min-h-11 w-full rounded-lg px-2 text-xs font-semibold"
        product={{
          id: product.id,
          name: product.name,
          priceUsd: displayPrice.priceUsd,
          category: product.category,
          brand: product.brand ?? null,
        }}
      />
    </div>
  );

  if (layout === 'list') {
    return (
      <article className="group relative flex w-full flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:gap-5">
        <div className="relative mx-auto w-full max-w-[11rem] shrink-0 sm:mx-0 sm:max-w-none sm:w-36">
          <div className="relative">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
            <div
              className="relative flex aspect-square items-center justify-center rounded-lg bg-muted/50 p-2.5 sm:p-3"
            >
              <ProductCardImageConditionBadge product={product} />
              <ProductCardHoverImage
                candidates={imageCandidates}
                storedCandidates={storedImageCandidates}
                hoverSrc={hoverImageSrc}
                alt={product.name}
                className="size-full"
                imageClassName={PRODUCT_CARD_IMAGE_CLASS}
                watermarkClassName={PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              to={detailHref}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <ProductCardTitle
                product={product}
                stock={product.stock}
                outOfStock={outOfStock}
                showConditionBadge
              />
            </Link>
            <div className="relative z-[3] pointer-events-auto">
              <CatalogPreviewPriceBlock
                productId={product.id}
                displayPrice={displayPrice}
                badgeClassName="mb-1"
              />
            </div>
          </div>

          <div className="relative z-10 shrink-0 sm:w-auto">{cartActions}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_4px_18px_rgba(15,23,42,0.1)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)]">
      <div className="relative flex flex-1 flex-col">
        <div className="relative px-4 pt-4">
          <div className="relative">
            <Link
              to={detailHref}
              className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label={`Ver ficha de ${product.name}`}
            >
              <span className="sr-only">Ver ficha de {product.name}</span>
            </Link>
            <div
              className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-muted/50 p-2.5 sm:aspect-square sm:p-3"
            >
              <ProductCardImageConditionBadge product={product} />
              <ProductCardHoverImage
                candidates={imageCandidates}
                storedCandidates={storedImageCandidates}
                hoverSrc={hoverImageSrc}
                alt={product.name}
                className="size-full"
                imageClassName={PRODUCT_CARD_IMAGE_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-1.5 sm:gap-1 sm:px-4 sm:pt-2">
          <Link
            to={detailHref}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <ProductCardTitle
              product={product}
              stock={product.stock}
              outOfStock={outOfStock}
              showConditionBadge
            />
          </Link>

          <div className="relative z-[3] mt-auto space-y-1 pt-0.5">
            <CatalogPreviewPriceBlock productId={product.id} displayPrice={displayPrice} />
          </div>
        </div>
      </div>

      <div className={cn('relative z-10', cartRevealClass)}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-3 pt-1">{cartActions}</div>
        </div>
      </div>
    </article>
  );
}
