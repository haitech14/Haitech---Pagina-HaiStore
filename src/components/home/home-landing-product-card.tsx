import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';

import { ProductCardFeaturedPricing } from '@/components/product/product-card-featured-pricing';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuickViewDialog } from '@/components/product/product-quick-view-dialog';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { useCart } from '@/context/cart-context';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import type { FeaturedProduct } from '@/data/featured-products';
import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { productQualifiesForBestSeller } from '@/lib/home-landing-product-badges';
import {
  buildProductCardImageCandidates,
  buildProductCardImageSource,
  buildProductCardStoredImageCandidates,
  resolveProductCardHoverImageFromProduct,
} from '@/lib/product-card-images';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { ProductCardBrandLine } from '@/components/product/product-card-title';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import {
  formatProductCardTitle,
  getProductCardTitleContent,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_STOCK_CLASS,
} from '@/lib/product-card-title';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const LANDING_IMAGE_BOX_PX = 220;

const cardHoverRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

const whatsappRevealClass = cardHoverRevealClass;

const imageOverlayButtonClass =
  'flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#333333] shadow-[0_2px_8px_rgba(15,31,61,0.14)] backdrop-blur-[1px] transition-colors hover:bg-white hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2';

export function HomeLandingProductCard({ product }: { product: FeaturedProduct }) {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const catalogProduct = useCatalogProductRow(product.id);
  const displayPrice = useCatalogDisplayPrice({
    price: product.price,
    ...(product.prices ? { prices: product.prices } : {}),
    ...(product.price_role ? { price_role: product.price_role } : {}),
  });
  const pricing = resolveProductCardPricing(product.id, displayPrice.priceUsd, {
    ...(product.oldPrice != null ? { oldPrice: product.oldPrice } : {}),
    ...(product.discount != null ? { discount: product.discount } : {}),
  });

  const code = product.code ?? catalogProduct?.code ?? null;
  const stock = catalogProduct?.stock ?? product.stock ?? 0;
  const stockCount = Math.max(0, Math.floor(Number(stock) || 0));

  const productSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    attributes: product.attributes ?? catalogProduct?.attributes ?? [],
  };

  const showBestSellerBadge = productQualifiesForBestSeller(product, catalogProduct);
  const productTitle = formatProductCardTitle(productSource);
  const { brand, code: cardCode } = getProductCardTitleContent(productSource);
  const badgeLabel = resolveProductCardBadgeLabel(productSource);
  const outOfStock = stockCount <= 0;

  const catalogGallery = catalogProduct?.gallery ?? null;
  const catalogGalleryKey = catalogGallery?.join('|') ?? '';
  const catalogImageUrl = catalogProduct?.image_url ?? null;
  const catalogBrand = catalogProduct?.brand ?? null;
  const productBrand = product.brand ?? catalogBrand ?? null;
  const productImage = product.image ?? catalogImageUrl ?? null;
  const productCode = code ?? '';

  const detailPath = useMemo(() => {
    const slug = catalogProduct?.slug?.trim();
    if (slug) {
      return productPath({ id: product.id, name: product.name, slug });
    }
    return productPath(product);
  }, [catalogProduct?.slug, product]);

  const imageSource = useMemo(
    () =>
      buildProductCardImageSource({
        id: product.id,
        code,
        name: product.name,
        category: product.category,
        brand: productBrand,
        image_url: productImage,
        gallery: catalogGallery,
      }),
    [
      catalogGalleryKey,
      productCode,
      product.category,
      product.id,
      product.name,
      productBrand,
      productImage,
    ],
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
  const showPriceOnRequest =
    !Number.isFinite(displayPrice.priceUsd) || displayPrice.priceUsd <= 0;

  const cartProduct: Product = {
    id: product.id,
    name: product.name,
    description: catalogProduct?.description ?? null,
    price: displayPrice.priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock,
    category: product.category,
    brand: product.brand ?? catalogProduct?.brand ?? null,
    code,
    created_at: catalogProduct?.created_at ?? new Date().toISOString(),
    attributes: productSource.attributes,
  };

  const handleQuickBuy = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(cartProduct, { quantity: 1 });
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
      <div className="relative px-3 pt-3 sm:px-3.5 sm:pt-3.5">
        <div className="relative mx-auto w-full max-w-[220px]">
          <Link
            to={detailPath}
            className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
            aria-label={`Ver ficha de ${product.name}`}
          >
            <div
              className={cn(
                'relative mx-auto flex items-center justify-center overflow-hidden rounded-lg bg-[#F8F9FB]',
                hasValidImage ? 'bg-[#F8F9FB]' : 'bg-muted/35',
              )}
              style={{ width: LANDING_IMAGE_BOX_PX, height: LANDING_IMAGE_BOX_PX, maxWidth: '100%' }}
            >
              {showBestSellerBadge ? (
                <span className="absolute left-2 top-2 z-[2] rounded bg-[#E30613] px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white sm:text-[0.625rem]">
                  MÁS VENDIDO
                </span>
              ) : null}

              <ProductCardHoverImage
                candidates={imageCandidates}
                storedCandidates={storedImageCandidates}
                hoverSrc={hoverImageSrc}
                alt={product.name}
                className="size-full max-h-[196px] max-w-[196px]"
                imageClassName="size-full max-h-[196px] max-w-[196px] object-contain object-center"
              />
            </div>
          </Link>

          <div
            className={cn(
              'pointer-events-none absolute right-1.5 top-1/2 z-[3] flex -translate-y-1/2 flex-col gap-1.5 opacity-0 transition-opacity duration-200 ease-out',
              'group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
              'max-md:pointer-events-auto max-md:opacity-100',
            )}
          >
            <button
              type="button"
              className={imageOverlayButtonClass}
              aria-label={`Vista rápida de ${product.name}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setQuickViewOpen(true);
              }}
            >
              <Eye className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(imageOverlayButtonClass, 'hover:text-[#E30613]')}
              aria-label={`Agregar ${product.name} al carrito`}
              onClick={handleQuickBuy}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5 sm:px-3.5 sm:pb-3.5 sm:pt-2">
        <ProductCardBrandLine brand={brand} conditionLabel={badgeLabel} />

        <Link
          to={detailPath}
          className={cn(
            'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            (brand || badgeLabel) && 'mt-0.5',
          )}
        >
          <h3 className="line-clamp-2 text-pretty text-left text-sm font-semibold leading-snug text-[#111111]">
            {productTitle}
          </h3>
        </Link>

        <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
          {cardCode ? <span className={PRODUCT_CARD_CODE_CLASS}>{cardCode}</span> : <span className="min-w-0" />}
          <span className={PRODUCT_CARD_STOCK_CLASS}>
            {outOfStock ? 'A pedido' : `${stockCount} unids.`}
          </span>
        </div>

        <div className="mt-2">
          {showPriceOnRequest ? (
            <p className="text-sm font-bold leading-tight text-[#111111] sm:text-base">Consultar Precio</p>
          ) : (
            <ProductCardFeaturedPricing
              productId={product.id}
              currentUsd={pricing.currentUsd}
              compareUsd={pricing.compareUsd}
              showAccentBar={false}
            />
          )}
        </div>

        <div className="relative z-[2] mt-auto flex flex-col gap-0 pt-3 transition-[gap] duration-150 ease-out group-hover:gap-2 group-focus-within:gap-2">
          <ProductQuantityAddFooter
            product={cartProduct}
            size="sm"
            addLabel="Agregar al carrito"
            addLabelHover="Agregar"
            revealQuantityOnHover
            quantityClassName="h-10 rounded-lg"
            addButtonClassName="h-10 min-h-10 min-w-0 flex-1 rounded-lg bg-[#E30613] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#c90511] sm:text-sm"
          />
          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                product={{
                  id: cartProduct.id,
                  name: cartProduct.name,
                  priceUsd: pricing.currentUsd,
                  category: cartProduct.category,
                  brand: cartProduct.brand ?? null,
                }}
                className="h-10 min-h-10 w-full rounded-lg bg-[#25D366] px-3 text-xs font-semibold normal-case tracking-normal text-white shadow-none hover:bg-[#20bd5a] focus-visible:ring-[#25D366] sm:text-sm [&_span]:truncate-none"
                label="Cotizar por WhatsApp"
              />
            </div>
          </div>
        </div>
      </div>

      <ProductQuickViewDialog
        snapshot={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
}
