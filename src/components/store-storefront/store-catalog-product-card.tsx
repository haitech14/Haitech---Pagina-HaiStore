import { lazy, memo, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardFeaturedStar } from '@/components/product/product-card-featured-star';
import { ProductCardOverlayActions } from '@/components/product/product-card-overlay-actions';
import { ProductCardPromoBadges } from '@/components/product/product-card-promo-badges';
import { ProductCardStatsLine } from '@/components/product/product-card-stats-line';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';

const ProductQuickViewDialog = lazy(() =>
  import('@/components/product/product-quick-view-dialog').then((m) => ({
    default: m.ProductQuickViewDialog,
  })),
);
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import {
  clipboardPriceFieldsFromDisplay,
  useCatalogDisplayPrice,
} from '@/hooks/use-catalog-display-price';
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

interface StoreCatalogProductCardProps {
  product: Product;
  imageLoading?: 'lazy' | 'eager';
  imagePriority?: boolean;
}

export const StoreCatalogProductCard = memo(function StoreCatalogProductCard({
  product,
  imageLoading = 'lazy',
  imagePriority = false,
}: StoreCatalogProductCardProps) {
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
          className="relative block aspect-[4/5] w-full overflow-hidden bg-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset md:aspect-square md:p-3"
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
            loading={imageLoading}
            {...(imagePriority ? { fetchPriority: 'high' as const } : {})}
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
            ...clipboardPriceFieldsFromDisplay(displayPrice),
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

      <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1.5 md:px-3 md:pb-3 md:pt-2">
        <ProductCardBrandLine brand={brand} />

        <Link
          to={detailHref}
          className="mt-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-2 text-pretty text-[0.75rem] font-bold leading-snug text-[#111111] sm:text-sm">
            {title}
          </h3>
        </Link>

        <ProductCardPromoBadges product={titleProduct} className="mt-2 max-md:hidden" />

        <ProductCardStatsLine
          product={titleProduct}
          stock={stockCount}
          outOfStock={outOfStock}
          code={code}
          className="mt-2.5 max-md:hidden"
        />

        <div className="mt-2 h-px w-full bg-[#eceff4] md:mt-3" aria-hidden="true" />

        <div className="mt-2 md:mt-3">
          <ProductCardFeaturedPricing
            productId={product.id}
            currentUsd={pricing.currentUsd}
            compareUsd={pricing.compareUsd}
            showAccentBar={false}
          />
        </div>

        <div className="relative z-[2] mt-auto pt-2 md:pt-3">
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            revealQuantityOnHover
            quantityPlacement="above"
            addLabel={buyNowLabel}
            onQuantityChange={setQuantity}
            quantityClassName="h-9 rounded-lg md:h-10"
            addButtonClassName={cn(
              'h-9 min-h-9 max-h-9 min-w-0 flex-1 rounded-lg bg-[#E30613] px-2 text-[0.6875rem] font-semibold text-white shadow-none hover:bg-[#c90511] md:h-10 md:min-h-10 md:max-h-10 md:px-3 md:text-sm',
              outOfStock && 'font-semibold',
            )}
            endAdornment={
              <ProductWhatsAppButton
                stopPropagation
                skipDialogIfComplete
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayPrice.priceUsd,
                  category: product.category,
                  brand: product.brand ?? catalogProduct?.brand ?? null,
                }}
                className="h-10 w-10 min-h-10 max-h-10 min-w-10 shrink-0 rounded-lg border-0 bg-[#25D366] p-0 text-white shadow-none hover:bg-[#20bd5a] hover:text-white focus-visible:ring-[#25D366]"
              />
            }
          />
        </div>
      </div>

      {quickViewOpen ? (
        <Suspense fallback={null}>
          <ProductQuickViewDialog
            snapshot={quickViewSnapshot}
            open={quickViewOpen}
            onOpenChange={setQuickViewOpen}
          />
        </Suspense>
      ) : null}
    </article>
  );
});
