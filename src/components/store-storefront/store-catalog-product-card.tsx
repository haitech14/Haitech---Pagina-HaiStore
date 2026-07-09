import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { catalogRowToFeatured, getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { resolveProductCardConditionLabel } from '@/lib/product-card-condition';
import { PRODUCT_CARD_CODE_CLASS, PRODUCT_CARD_STOCK_CLASS } from '@/lib/product-card-title';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToFeatured } from '@/lib/store-products';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface StoreCatalogProductCardProps {
  product: Product;
}

export function StoreCatalogProductCard({ product }: StoreCatalogProductCardProps) {
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product);
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const catalogProduct = getCatalogProductById(product.id);
  const catalogFeatured = useMemo(
    () => (catalogProduct ? catalogRowToFeatured(catalogProduct) : null),
    [catalogProduct],
  );
  const quickViewSnapshot = useMemo(() => productToFeatured(product), [product]);
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(product), [product]);
  const storedImageCandidates = useMemo(
    () => buildProductCardStoredImageCandidates(product),
    [product],
  );
  const hoverImageSrc = useMemo(() => resolveProductCardHoverImageFromProduct(product), [product]);
  const displayPrice = useCatalogDisplayPrice(product);

  const titleProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes ?? [],
  };
  const { brand, code, title } = getProductCardTitleContent(titleProduct);
  const conditionLabel = resolveProductCardConditionLabel(titleProduct);
  const buyNowLabel = outOfStock ? 'Reservar Ahora' : 'Comprar Ahora';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm transition-shadow hover:border-red-600/25 hover:shadow-md">
      <div className="relative">
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

        <ProductCardOverlayActions
          productName={product.name}
          isCompareSelected={false}
          isWishlisted={isWishlisted(product.id)}
          revealOnHover
          secondaryAction="buy"
          onWishlist={() => toggleWishlist(productToWishlistItem(product))}
          onQuickView={() => setQuickViewOpen(true)}
          onCompare={() => undefined}
          onBuy={() => addItem(product)}
        />
      </div>

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
            {code ? (
              <span className={cn(PRODUCT_CARD_CODE_CLASS, 'inline font-normal')}> ({code})</span>
            ) : null}
          </h3>
        </Link>

        {conditionLabel ? (
          <div className="mt-1 flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProductConditionBadge label={conditionLabel} size="card" />
          </div>
        ) : null}

        <div className="mt-1 flex min-w-0 justify-end">
          <span className={PRODUCT_CARD_STOCK_CLASS}>
            {outOfStock ? 'A pedido' : `${Math.max(0, Math.floor(product.stock))} unids.`}
          </span>
        </div>

        <div className="mt-2">
          <ProductCardPricing
            productId={product.id}
            priceUsd={displayPrice.priceUsd}
            {...(catalogFeatured?.oldPrice != null ? { oldPriceUsd: catalogFeatured.oldPrice } : {})}
            {...(catalogFeatured?.discount != null ? { discountPercent: catalogFeatured.discount } : {})}
          />
        </div>

        <div className="mt-auto pt-3">
          <p
            className={cn(
              'mb-1 text-[0.625rem] font-medium text-muted-foreground opacity-0 transition-opacity duration-200 ease-out motion-reduce:opacity-100 motion-reduce:transition-none',
              'group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100',
            )}
          >
            Cantidad
          </p>
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            revealQuantityOnHover
            addLabel={buyNowLabel}
            addButtonClassName={cn(
              'h-9 min-h-9 rounded-md px-2 shadow-none sm:px-2.5',
              outOfStock && 'font-semibold',
            )}
          />
        </div>
      </div>

      <ProductQuickViewDialog
        snapshot={quickViewSnapshot}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
}
