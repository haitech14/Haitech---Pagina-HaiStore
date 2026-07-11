import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CatalogPreviewPriceBlock } from '@/components/product/catalog-preview-price-block';
import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import {
  PRODUCT_CARD_IMAGE_CLASS,
  ProductCardHoverImage,
} from '@/components/product/product-card-hover-image';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductCardImageConditionBadge } from '@/components/product/product-card-image-condition-badge';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { catalogRowToFeatured, getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

interface ProductHighlightCardProps {
  product: Product;
  variant?: 'default' | 'storefront';
}

export function ProductHighlightCard({ product, variant = 'default' }: ProductHighlightCardProps) {
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
  const [quantity, setQuantity] = useState(1);
  const displayPrice = useCatalogDisplayPrice(product);

  const titleProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes ?? [],
  };

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden',
        variant === 'storefront'
          ? 'rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:border-red-600/30 hover:shadow-md'
          : 'rounded-xl border border-border/50 bg-white shadow-[0_1px_6px_rgba(15,31,61,0.06)]',
      )}
    >
      <Link
        to={detailHref}
        className="relative block aspect-square w-full overflow-hidden bg-white p-1 sm:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-label={`Ver ficha de ${product.name}`}
      >
        <ProductCardImageConditionBadge product={titleProduct} />
        <ProductCardHoverImage
          candidates={imageCandidates}
          storedCandidates={storedImageCandidates}
          hoverSrc={hoverImageSrc}
          alt={product.name}
          className="size-full"
          imageClassName={PRODUCT_CARD_IMAGE_CLASS}
        />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col items-start gap-1 px-2.5 pb-2.5 pt-1 text-left sm:gap-1.5 sm:px-3 sm:pb-3 sm:pt-1.5">
        <Link
          to={detailHref}
          className="w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <ProductCardTitle
            product={titleProduct}
            variant="featured"
            brandTone="accent"
            stock={product.stock}
            outOfStock={outOfStock}
          />
        </Link>

        <CatalogPreviewPriceBlock
          productId={product.id}
          displayPrice={displayPrice}
          featured
          badgeClassName="mb-1"
          {...(catalogFeatured?.oldPrice != null ? { oldPriceUsd: catalogFeatured.oldPrice } : {})}
          {...(catalogFeatured?.discount != null ? { discountPercent: catalogFeatured.discount } : {})}
        />

        <div className="mt-auto w-full pt-1.5 sm:pt-2">
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            addLabel="Comprar ahora"
            onQuantityChange={setQuantity}
          />

          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                accent="outline"
                label="Comprar por WhatsApp"
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayPrice.priceUsd,
                  category: product.category,
                  brand: product.brand ?? null,
                }}
                className="mt-1.5 h-11 min-h-11 w-full rounded-md px-2 text-[0.625rem] font-semibold normal-case tracking-normal sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
