import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { catalogRowToFeatured, getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductCardImageCandidates,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { ProductCardBrandLine } from '@/components/product/product-card-title';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import {
  getProductCardTitleContent,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_STOCK_CLASS,
} from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { productToFeatured } from '@/lib/store-products';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

interface StoreCatalogProductCardProps {
  product: Product;
}

export function StoreCatalogProductCard({ product }: StoreCatalogProductCardProps) {
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product);
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
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
  const badgeLabel = resolveProductCardBadgeLabel(titleProduct);
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
        <ProductCardBrandLine brand={brand} conditionLabel={badgeLabel} />

        <Link
          to={detailHref}
          className="mt-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-[0.8125rem] font-semibold leading-snug text-foreground sm:text-sm">
            {title}
          </h3>
        </Link>

        <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
          {code ? <span className={PRODUCT_CARD_CODE_CLASS}>{code}</span> : <span className="min-w-0" />}
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

        <div className="relative z-[2] mt-auto flex flex-col gap-0 pt-3 transition-[gap] duration-150 ease-out group-hover:gap-2 group-focus-within:gap-2 max-md:gap-2">
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
            onQuantityChange={setQuantity}
            addButtonClassName={cn(
              'h-9 min-h-9 rounded-md px-2 shadow-none sm:px-2.5',
              outOfStock && 'font-semibold',
            )}
          />
          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayPrice.priceUsd,
                  category: product.category,
                  brand: product.brand ?? catalogProduct?.brand ?? null,
                }}
                className="h-9 min-h-9 w-full rounded-md bg-[#25D366] px-2 text-[0.625rem] font-semibold normal-case tracking-normal text-white shadow-none hover:bg-[#20bd5a] focus-visible:ring-[#25D366] sm:px-2.5 sm:text-xs [&_span]:truncate-none"
                label="Cotizar por WhatsApp"
              />
            </div>
          </div>
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
