import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import type { HomeCategoryShowcaseProduct } from '@/data/home-category-showcase';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { getCatalogUrgencyLabel } from '@/lib/product-catalog-card-meta';
import { ProductCardImageConditionBadge } from '@/components/product/product-card-image-condition-badge';
import { isPrinterProduct } from '@/lib/product-detail-badges';
import { ProductCardBrandLine } from '@/components/product/product-card-title';
import {
  formatProductCardTitle,
  getProductCardTitleContent,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_STOCK_CLASS,
} from '@/lib/product-card-title';
import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const LOW_STOCK_THRESHOLD = 8;

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

function resolveShowcasePricing(product: HomeCategoryShowcaseProduct) {
  const catalog = product.catalogId ? getCatalogProductById(product.catalogId) : null;
  const currentUsd = catalog?.prices?.public ?? product.price;
  const compareUsd =
    catalog?.compare_at_price_usd && catalog.compare_at_price_usd > currentUsd
      ? catalog.compare_at_price_usd
      : product.oldPrice != null && product.oldPrice > currentUsd
        ? product.oldPrice
        : currentUsd;
  const discountPercent =
    compareUsd > currentUsd
      ? Math.round(((compareUsd - currentUsd) / compareUsd) * 100)
      : product.discountPercent ?? 0;

  return { currentUsd, compareUsd, discountPercent };
}

function toCartProduct(product: HomeCategoryShowcaseProduct, priceUsd: number): Product {
  const catalog = product.catalogId ? getCatalogProductById(product.catalogId) : null;

  return {
    id: catalog?.id ?? product.catalogId ?? product.id,
    name: catalog?.name ?? product.name,
    description: catalog?.description ?? null,
    price: priceUsd,
    currency: 'USD',
    image_url: catalog?.image_url ?? product.image,
    stock: catalog?.stock ?? 0,
    category: catalog?.category ?? product.category ?? 'Equipos',
    brand: catalog?.brand ?? product.brand ?? null,
    code: catalog?.code ?? null,
    created_at: catalog?.created_at ?? new Date().toISOString(),
    attributes: catalog?.attributes ?? [],
  };
}

export function HomeCategoryShowcaseProductCard({
  product,
}: {
  product: HomeCategoryShowcaseProduct;
}) {
  const pricing = useMemo(() => resolveShowcasePricing(product), [product]);
  const catalog = product.catalogId ? getCatalogProductById(product.catalogId) : null;
  const cartProduct = useMemo(
    () => toCartProduct(product, pricing.currentUsd),
    [product, pricing.currentUsd],
  );

  const productSource = {
    id: cartProduct.id,
    name: cartProduct.name,
    category: cartProduct.category,
    brand: cartProduct.brand ?? null,
    code: cartProduct.code ?? null,
    attributes: cartProduct.attributes ?? [],
  };

  const isEquipment =
    isPrinterProduct(productSource) && !isTonerOrRepuestosCategory(cartProduct.category);
  const stockCount = Math.max(0, Math.floor(cartProduct.stock ?? 0));
  const outOfStock = stockCount <= 0;
  const urgencyLabel = getCatalogUrgencyLabel(cartProduct);
  const showLimitedStock = stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD;

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: cartProduct.id,
        code: cartProduct.code ?? null,
        name: cartProduct.name,
        category: cartProduct.category,
        brand: cartProduct.brand ?? null,
        image_url: catalog?.image_url ?? product.image ?? null,
        gallery: catalog?.gallery ?? null,
      }),
    [cartProduct, catalog, product.image],
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
  const displayTitle = formatProductCardTitle(productSource);
  const { brand, code: cardCode } = getProductCardTitleContent(productSource);

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
          {product.bestSeller ? (
            <span className="absolute left-2 top-2 z-[2] rounded bg-[#E30613] px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white sm:left-2.5 sm:top-2.5 sm:text-[0.625rem]">
              Más cotizado
            </span>
          ) : null}

          {showLimitedStock ? (
            <span className="absolute right-2 top-2 z-[2] rounded bg-[#F59E0B] px-1 py-px text-[0.5625rem] font-bold text-white sm:right-2.5 sm:top-2.5 sm:text-[0.625rem]">
              {urgencyLabel ?? 'Stock limitado'}
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

          <ProductCardImageConditionBadge product={productSource} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5 sm:px-3.5 sm:pb-3.5 sm:pt-2">
        <ProductCardBrandLine brand={brand} />

        <Link
          to={product.href}
          className={cn(
            'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
            brand && 'mt-0.5',
            !brand && 'mt-1',
          )}
        >
          <h3 className="line-clamp-2 min-h-[2rem] text-pretty text-left text-[0.8125rem] font-bold leading-snug text-[#111111] sm:min-h-[2.25rem] sm:text-sm">
            {displayTitle}
          </h3>
        </Link>

        <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          {cardCode ? <span className={PRODUCT_CARD_CODE_CLASS}>{cardCode}</span> : <span className="min-w-0" />}
          <span className={PRODUCT_CARD_STOCK_CLASS}>
            {outOfStock ? 'A pedido' : `${stockCount} unids.`}
          </span>
        </div>

        <ProductCardFeaturedPricing
          className="mt-2"
          productId={cartProduct.id}
          currentUsd={pricing.currentUsd}
          compareUsd={pricing.compareUsd}
        />

        <div className="relative z-[2] mt-auto space-y-1.5 pt-3">
          {isEquipment ? (
            <>
              <AddToCartButton
                product={cartProduct}
                addOptions={{ quantity: 1 }}
                className="h-10 min-h-10 w-full rounded-lg border-0 bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm"
              >
                Comprar Ahora
              </AddToCartButton>
              <div className={whatsappRevealClass}>
                <div className="min-h-0 overflow-hidden">
                  <ProductWhatsAppButton
                    stopPropagation
                    accent="outline"
                    label="Cotizar por WhatsApp"
                    quantity={1}
                    product={{
                      id: cartProduct.id,
                      name: cartProduct.name,
                      priceUsd: pricing.currentUsd,
                      category: cartProduct.category,
                      brand: cartProduct.brand ?? null,
                    }}
                    className="h-10 min-h-10 w-full rounded-lg border-[#25D366] bg-white px-2 text-[0.6875rem] font-semibold normal-case tracking-normal text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white sm:text-xs"
                  />
                </div>
              </div>
            </>
          ) : (
            <AddToCartButton
              product={cartProduct}
              addOptions={{ quantity: 1 }}
              className={cn(
                'h-10 min-h-10 w-full rounded-lg border-0 bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none',
                'hover:bg-[#c90511]',
                'focus-visible:ring-[#2563EB]',
              )}
            >
              Comprar
            </AddToCartButton>
          )}
        </div>
      </div>
    </article>
  );
}
