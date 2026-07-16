import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardFeaturedStar } from '@/components/product/product-card-featured-star';
import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPromoBadges } from '@/components/product/product-card-promo-badges';
import { ProductCardStatsLine } from '@/components/product/product-card-stats-line';
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
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { ProductCardBrandLine } from '@/components/product/product-card-title';
import { inferColor } from '@/lib/category-catalog-filters';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { getProductCardTitleContent } from '@/lib/product-card-title';
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
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(catalogFeatured?.oldPrice != null ? { oldPrice: catalogFeatured.oldPrice } : {}),
    ...(catalogFeatured?.discount != null ? { discount: catalogFeatured.discount } : {}),
  });

  const titleProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code: product.code ?? catalogProduct?.code ?? null,
    attributes: product.attributes ?? [],
  };
  const { brand, code, title } = getProductCardTitleContent(titleProduct);
  const buyNowLabel = outOfStock ? 'Reservar' : 'Comprar';
  const clipboardCondition = resolveProductCardBadgeLabel(titleProduct);
  const clipboardIsColor = inferColor(titleProduct) === 'Color';
  const clipboardImageUrl = imageCandidates[0] ?? product.image_url ?? null;
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const isFeatured = product.is_featured === true || catalogProduct?.is_featured === true;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-shadow',
        isFeatured
          ? 'border border-[#E30613] shadow-[0_2px_14px_rgba(227,6,19,0.08)]'
          : 'border border-[#e6e8ee] shadow-[0_2px_14px_rgba(15,31,61,0.06)] hover:shadow-md',
      )}
    >
      <div className="relative">
        <Link
          to={detailHref}
          className="relative block aspect-square w-full overflow-hidden bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset"
          aria-label={`Ver ficha de ${product.name}`}
        >
          {isFeatured ? <ProductCardFeaturedStar /> : null}

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
          withConditionBadge={isFeatured}
          secondaryAction="buy"
          clipboard={{
            title,
            stock: product.stock,
            priceUsd: displayPrice.priceUsd,
            productId: product.id,
            productPath: detailHref,
            isColorProduct: clipboardIsColor,
            ...(code != null ? { code } : {}),
            ...(clipboardCondition != null ? { condition: clipboardCondition } : {}),
            ...(product.category != null ? { category: product.category } : {}),
            ...(product.volume_role_prices != null
              ? { volumeRolePrices: product.volume_role_prices }
              : {}),
            ...(product.delivery_time != null
              ? { deliveryTime: product.delivery_time }
              : {}),
            ...(clipboardImageUrl != null ? { imageUrl: clipboardImageUrl } : {}),
          }}
          onWishlist={() => toggleWishlist(productToWishlistItem(product))}
          onQuickView={() => setQuickViewOpen(true)}
          onCompare={() => undefined}
          onBuy={() => addItem(product)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
        <ProductCardBrandLine brand={brand} />

        <Link
          to={detailHref}
          className="mt-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-[0.8125rem] font-bold leading-snug text-[#111111] sm:text-sm">
            {title}
          </h3>
        </Link>

        <ProductCardPromoBadges product={titleProduct} className="mt-2" />

        <ProductCardStatsLine
          product={titleProduct}
          stock={stockCount}
          outOfStock={outOfStock}
          className="mt-2.5"
        />

        <div className="mt-3 h-px w-full bg-[#eceff4]" aria-hidden="true" />

        <div className="mt-3">
          <ProductCardFeaturedPricing
            productId={product.id}
            currentUsd={pricing.currentUsd}
            compareUsd={pricing.compareUsd}
            showAccentBar={false}
          />
        </div>

        <div className="relative z-[2] mt-auto flex flex-col gap-0 pt-3 transition-[gap] duration-150 ease-out group-hover:gap-2 group-focus-within:gap-2 max-md:gap-2">
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            revealQuantityOnHover
            addLabel={buyNowLabel}
            onQuantityChange={setQuantity}
            quantityClassName="h-10 rounded-lg"
            addButtonClassName={cn(
              'h-10 min-h-10 min-w-0 flex-1 rounded-lg bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm',
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
                className="h-10 min-h-10 w-full rounded-lg bg-[#25D366] px-3 text-xs font-semibold normal-case tracking-normal text-white shadow-none hover:bg-[#20bd5a] focus-visible:ring-[#25D366] sm:text-sm [&_span]:truncate-none"
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
