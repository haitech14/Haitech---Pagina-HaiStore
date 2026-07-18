import { useEffect, useMemo, useState } from 'react';
import { Box, Play, ShieldCheck, ZoomIn } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import { clipboardPriceFieldsFromDisplay, useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { inferColor } from '@/lib/category-catalog-filters';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import { youtubeThumbnailUrl } from '@/lib/product-media';
import { productPath } from '@/lib/product-path';
import {
  productDetailMainImageSources,
  productDetailThumbnailSources,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { resolveStorefrontUi } from '@/lib/product-storefront-detail';
import { extractProductModel } from '@/lib/seo';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { ProductGalleryItem } from '@/types/product-detail';

const galleryCopyButtonClass =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-white/95 px-3 text-xs font-medium text-foreground shadow-sm backdrop-blur-[1px] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

interface ProductDetailGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
  product?: Product;
  showOriginalBadge?: boolean;
  brandLabel?: string;
  viewer3dUrl?: string | null;
}

function resolveProductImageAlt(
  productName: string,
  product: Pick<Product, 'name' | 'attributes' | 'brand' | 'category'> | undefined,
  index: number,
  itemAlt?: string | null,
): string {
  if (itemAlt?.trim()) return itemAlt.trim();
  const model = product ? extractProductModel(product) : null;
  const viewSuffix = index > 0 ? ` — vista ${index + 1}` : '';
  if (model) return `${productName} (${model})${viewSuffix}`;
  return `${productName}${viewSuffix}`;
}

function getItemKey(item: ProductGalleryItem): string {
  if (item.type === 'image') return item.src;
  if (item.type === 'video') return `youtube:${item.youtubeId}`;
  return item.src;
}

function getThumbnailSrc(item: ProductGalleryItem): string {
  if (item.type === 'image') return item.src;
  if (item.type === 'video') return item.poster ?? youtubeThumbnailUrl(item.youtubeId);
  return item.poster ?? item.src;
}

function GalleryResponsiveImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes,
  variant = 'main',
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  variant?: 'main' | 'thumb';
  onError?: () => void;
}) {
  const [forcePlain, setForcePlain] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const responsive = supportsResponsiveProductImage(src) && !forcePlain;
  const sources = responsive
    ? variant === 'thumb'
      ? productDetailThumbnailSources(src)
      : productDetailMainImageSources(src)
    : null;

  useEffect(() => {
    setForcePlain(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    if (responsive) {
      setForcePlain(true);
      return;
    }
    onError?.();
  };

  const imageClass = cn(
    className,
    'transition-opacity duration-300',
    loaded ? 'opacity-100' : 'opacity-0',
  );

  if (sources) {
    return (
      <picture className="flex size-full items-center justify-center bg-muted/40">
        <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes ?? sources.sizes} />
        <img
          src={sources.fallbackSrc}
          alt={alt}
          className={imageClass}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(imageClass, 'bg-muted/40')}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
    />
  );
}

function GalleryMainMedia({
  item,
  productName,
  product,
  imageIndex,
  onImageError,
  imageError,
}: {
  item: ProductGalleryItem;
  productName: string;
  product?: Pick<Product, 'name' | 'attributes' | 'brand' | 'category'>;
  imageIndex: number;
  onImageError: () => void;
  imageError: boolean;
}) {
  if (item.type === 'video') {
    return (
      <iframe
        title={item.title ?? `Vídeo de ${productName}`}
        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
        className="aspect-video w-full max-w-full rounded-md border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (item.type === 'video-file') {
    return (
      <video
        src={item.src}
        controls
        className="max-h-[min(72vh,680px)] w-full max-w-full rounded-md bg-black object-contain"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    );
  }

  if (imageError) {
    return (
      <span className="text-5xl font-bold text-muted-foreground/30" aria-hidden="true">
        {productName.charAt(0)}
      </span>
    );
  }

  return (
    <ProductImageWatermarkOverlay src={item.src} className="flex size-full items-center justify-center">
      <GalleryResponsiveImage
        src={item.src}
        alt={resolveProductImageAlt(productName, product, imageIndex, item.alt)}
        className="max-h-[min(72vh,680px)] w-full max-w-full object-contain object-center"
        loading="eager"
        variant="main"
        onError={onImageError}
      />
    </ProductImageWatermarkOverlay>
  );
}

function GalleryThumbnailButton({
  item,
  index,
  productName,
  isActive,
  onSelect,
}: {
  item: ProductGalleryItem;
  index: number;
  productName: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const isVideo = item.type === 'video' || item.type === 'video-file';

  return (
    <li className="shrink-0">
      <button
        type="button"
        className={cn(
          'relative overflow-hidden rounded-md border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
          'aspect-square w-16 sm:w-[4.25rem]',
          'max-sm:w-[4.5rem]',
          isActive ? 'border-neutral-800' : 'border-neutral-200 hover:border-neutral-400',
        )}
        onClick={onSelect}
        aria-label={
          isVideo
            ? `Ver vídeo ${index + 1} de ${productName}`
            : `Ver imagen ${index + 1} de ${productName}`
        }
        aria-current={isActive}
      >
        <ProductImageWatermarkOverlay
          src={item.type === 'image' ? item.src : ''}
          className="size-full"
        >
          {item.type === 'image' ? (
            <GalleryResponsiveImage
              src={item.src}
              alt=""
              className="size-full object-cover"
              variant="thumb"
            />
          ) : (
            <img
              src={getThumbnailSrc(item)}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          )}
        </ProductImageWatermarkOverlay>
        {isVideo ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/35">
            <Play className="size-4 text-white" aria-hidden="true" />
          </span>
        ) : null}
      </button>
    </li>
  );
}

export function ProductDetailGallery({
  items,
  productName,
  product,
  showOriginalBadge = false,
  brandLabel = '',
  viewer3dUrl = null,
}: ProductDetailGalleryProps) {
  const galleryItems = items.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeIndex = galleryItems.length > 0 ? Math.min(activeIndex, galleryItems.length - 1) : 0;
  const activeItem = galleryItems[safeIndex] ?? null;
  const activeImage =
    activeItem?.type === 'image' && !imageError
      ? {
          src: activeItem.src,
          alt: resolveProductImageAlt(productName, product, safeIndex, activeItem.alt),
        }
      : null;

  const storefrontUi = useMemo(
    () => resolveStorefrontUi(product?.storefront_ui),
    [product?.storefront_ui],
  );

  const priceSource = product ?? { price: 0, prices: undefined, price_role: undefined };
  const displayPrice = useCatalogDisplayPrice(priceSource);

  const clipboard = useMemo(() => {
    if (!product || !storefrontUi.showGalleryCopyText) return null;
    const { title } = getProductCardTitleContent(product);
    const condition = resolveProductCardBadgeLabel(product);
    const code = product.code?.trim() || null;
    return {
      title,
      stock: product.stock,
      ...clipboardPriceFieldsFromDisplay(displayPrice),
      productId: product.id,
      productPath: productPath(product),
      isColorProduct: inferColor(product) === 'Color',
      ...(code != null ? { code } : {}),
      ...(condition != null ? { condition } : {}),
      ...(product.category != null ? { category: product.category } : {}),
      ...(product.volume_role_prices != null
        ? { volumeRolePrices: product.volume_role_prices }
        : {}),
      ...(product.delivery_time != null ? { deliveryTime: product.delivery_time } : {}),
    };
  }, [product, storefrontUi.showGalleryCopyText, displayPrice]);

  const showCopyImage = Boolean(activeImage && storefrontUi.showGalleryCopyImage);

  useEffect(() => {
    setImageError(false);
  }, [safeIndex, activeItem?.type === 'image' ? activeItem.src : null]);

  const thumbnailList = (
    <ul
      className={cn(
        'flex gap-2 p-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1',
        'max-sm:order-2 max-sm:overflow-x-auto max-sm:bg-muted/10',
        'sm:w-[4.25rem] sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:bg-neutral-50 md:w-[4.75rem] lg:max-h-[min(68vh,640px)]',
      )}
      aria-label={`Miniaturas de ${productName}`}
    >
      {galleryItems.map((item, index) => (
        <GalleryThumbnailButton
          key={getItemKey(item)}
          item={item}
          index={index}
          productName={productName}
          isActive={index === safeIndex}
          onSelect={() => setActiveIndex(index)}
        />
      ))}
    </ul>
  );

  if (galleryItems.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col">
        <div className="flex min-h-[260px] flex-1 items-center justify-center rounded-lg border border-border/60 bg-white p-4 sm:min-h-[320px]">
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground">Sin Imagen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-white">
        <div className="flex min-h-[280px] flex-col items-stretch max-sm:min-h-0 sm:min-h-[360px] sm:flex-row lg:min-h-[480px]">
          <div className="hidden sm:contents">{thumbnailList}</div>

          <div className="relative min-w-0 flex-1 max-sm:order-1">
            {showOriginalBadge ? (
              <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-[#0f1f3d]/90 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-white shadow-sm sm:left-4 sm:top-4 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[0.65rem]">
                <ShieldCheck className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
                <span>Original</span>
                {brandLabel ? (
                  <span className="font-bold tracking-normal">{brandLabel.toUpperCase()}</span>
                ) : null}
              </span>
            ) : null}

            {viewer3dUrl ? (
              <a
                href={viewer3dUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 z-10 flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-white/95 px-3 text-xs font-medium text-[#0f1f3d] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:right-4 sm:top-4"
              >
                <Box className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                Ver en 3D
              </a>
            ) : null}

            <div className="flex h-full min-h-[240px] items-center justify-center bg-white p-2 sm:min-h-[inherit] sm:p-3 lg:p-4">
              {activeItem ? (
                activeItem.type === 'image' ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="relative flex size-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                    aria-label={`Ampliar imagen de ${productName}`}
                  >
                    <GalleryMainMedia
                      item={activeItem}
                      productName={productName}
                      {...(product ? { product } : {})}
                      imageIndex={safeIndex}
                      onImageError={() => setImageError(true)}
                      imageError={imageError}
                    />
                  </button>
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <GalleryMainMedia
                      item={activeItem}
                      productName={productName}
                      {...(product ? { product } : {})}
                      imageIndex={safeIndex}
                      onImageError={() => setImageError(true)}
                      imageError={imageError}
                    />
                  </div>
                )
              ) : null}
            </div>

            {showCopyImage || clipboard ? (
              <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 sm:bottom-4 sm:left-4">
                {showCopyImage && activeImage ? (
                  <ProductCardCopyImageButton
                    productName={productName}
                    imageUrl={activeImage.src}
                    label="Imagen"
                    className={galleryCopyButtonClass}
                  />
                ) : null}
                {clipboard ? (
                  <ProductCardCopyButton
                    productName={productName}
                    title={clipboard.title}
                    stock={clipboard.stock}
                    priceUsd={clipboard.priceUsd}
                    productId={clipboard.productId}
                    productPath={clipboard.productPath}
                    isColorProduct={clipboard.isColorProduct}
                    {...(clipboard.priceRole != null ? { priceRole: clipboard.priceRole } : {})}
                    {...(clipboard.priceRoleLabel != null
                      ? { priceRoleLabel: clipboard.priceRoleLabel }
                      : {})}
                    {...(clipboard.code != null ? { code: clipboard.code } : {})}
                    {...(clipboard.condition != null ? { condition: clipboard.condition } : {})}
                    {...(clipboard.category != null ? { category: clipboard.category } : {})}
                    {...(clipboard.volumeRolePrices != null
                      ? { volumeRolePrices: clipboard.volumeRolePrices }
                      : {})}
                    {...(clipboard.deliveryTime != null
                      ? { deliveryTime: clipboard.deliveryTime }
                      : {})}
                    label="Texto"
                    className={galleryCopyButtonClass}
                  />
                ) : null}
              </div>
            ) : null}

            {activeImage ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 z-10 flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-white/95 px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-white hover:text-[#0f1f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:bottom-4 sm:right-4"
                aria-label={`Ampliar imagen de ${productName}`}
              >
                <ZoomIn className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                Ampliar
              </button>
            ) : null}
          </div>

          <div className="contents sm:hidden">{thumbnailList}</div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-none bg-transparent p-2 shadow-none sm:p-4">
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <DialogDescription className="sr-only">Vista ampliada del producto</DialogDescription>
          {activeImage ? (
            <ProductImageWatermarkOverlay src={activeImage.src}>
              <GalleryResponsiveImage
                src={activeImage.src}
                alt={activeImage.alt}
                className="mx-auto max-h-[85vh] w-full object-contain"
                loading="eager"
                variant="main"
              />
            </ProductImageWatermarkOverlay>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
