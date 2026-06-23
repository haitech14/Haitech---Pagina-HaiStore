import { useEffect, useState } from 'react';
import { Box, Play, ShieldCheck, ZoomIn } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductDetailFeatureBar } from '@/components/product-detail/product-detail-feature-bar';
import { ProductDetailHeroFeatures } from '@/components/product-detail/product-detail-hero-features';
import { youtubeThumbnailUrl } from '@/lib/product-media';
import { cn } from '@/lib/utils';
import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import type { ProductDescriptionHighlight } from '@/types/product-detail';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductDetailGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
  showOriginalBadge?: boolean;
  brandLabel?: string;
  featureBar?: ProductDescriptionHighlight[];
  secondaryFeatureBar?: ProductDescriptionHighlight[];
  viewer3dUrl?: string | null;
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

function GalleryMainMedia({
  item,
  productName,
  onImageError,
  imageError,
}: {
  item: ProductGalleryItem;
  productName: string;
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
        className="max-h-[min(62vh,580px)] w-full max-w-full rounded-md bg-black object-contain"
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
      <img
        src={item.src}
        alt={item.alt ?? productName}
        className="max-h-[min(62vh,580px)] w-full max-w-full object-contain object-center"
        loading="eager"
        onError={onImageError}
      />
    </ProductImageWatermarkOverlay>
  );
}

export function ProductDetailGallery({
  items,
  productName,
  showOriginalBadge = false,
  brandLabel = '',
  featureBar = [],
  secondaryFeatureBar = [],
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
      ? { src: activeItem.src, alt: activeItem.alt ?? productName }
      : null;

  useEffect(() => {
    setImageError(false);
  }, [safeIndex, activeItem?.type === 'image' ? activeItem.src : null]);

  const featureBarItems = featureBar;
  const secondaryFeatureBarItems =
    featureBarItems.length > 0 ? [] : secondaryFeatureBar.slice(0, 4);

  if (galleryItems.length === 0) {
    return (
        <div className="flex min-h-[260px] flex-col">
        <div className="flex min-h-[260px] flex-1 items-center justify-center rounded-lg border border-border/60 bg-white p-4 sm:min-h-[320px]">
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground">Sin Imagen</p>
          </div>
        </div>
        {featureBarItems.length > 0 ? (
          <ProductDetailFeatureBar items={featureBarItems} columns={6} className="mt-3" />
        ) : null}
        {secondaryFeatureBarItems.length > 0 ? (
          <ProductDetailHeroFeatures
            highlights={secondaryFeatureBarItems}
            className="mt-2 rounded-lg border border-border/60 bg-muted/15 px-3 py-3 sm:px-4"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-white">
        <div className="flex min-h-[260px] items-stretch sm:min-h-[320px] lg:min-h-[420px]">
          <ul
            className="flex w-[4.25rem] shrink-0 flex-col gap-2 overflow-y-auto border-r border-border/60 bg-muted/10 p-2 sm:w-20 md:w-24 lg:max-h-[min(62vh,580px)] [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1"
            aria-label={`Miniaturas de ${productName}`}
          >
            {galleryItems.map((item, index) => {
              const isActive = index === safeIndex;
              const isVideo = item.type === 'video' || item.type === 'video-file';

              return (
                <li key={getItemKey(item)} className="shrink-0">
                  <button
                    type="button"
                    className={cn(
                      'relative aspect-square w-full overflow-hidden rounded-md border-2 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                      isActive ? 'border-red-600' : 'border-border/70 hover:border-border',
                    )}
                    onClick={() => setActiveIndex(index)}
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
                      <img
                        src={getThumbnailSrc(item)}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </ProductImageWatermarkOverlay>
                    {isVideo ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <Play className="size-4 text-white" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative min-w-0 flex-1">
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

            <div
              className={cn(
                'flex h-full min-h-[inherit] items-center justify-center bg-white p-3 sm:p-4 lg:p-5',
              )}
            >
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
                      onImageError={() => setImageError(true)}
                      imageError={imageError}
                    />
                  </button>
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <GalleryMainMedia
                      item={activeItem}
                      productName={productName}
                      onImageError={() => setImageError(true)}
                      imageError={imageError}
                    />
                  </div>
                )
              ) : null}
            </div>

            {activeImage ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-white/95 px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-white hover:text-[#0f1f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:bottom-4 sm:right-4"
                aria-label={`Ampliar imagen de ${productName}`}
              >
                <ZoomIn className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                Ampliar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-none bg-transparent p-2 shadow-none sm:p-4">
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <DialogDescription className="sr-only">Vista ampliada del producto</DialogDescription>
          {activeImage ? (
            <ProductImageWatermarkOverlay src={activeImage.src}>
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="mx-auto max-h-[85vh] w-full object-contain"
              />
            </ProductImageWatermarkOverlay>
          ) : null}
        </DialogContent>
      </Dialog>

      {featureBarItems.length > 0 ? (
        <ProductDetailFeatureBar items={featureBarItems} columns={6} className="mt-3" />
      ) : null}
      {secondaryFeatureBarItems.length > 0 ? (
        <ProductDetailHeroFeatures
          highlights={secondaryFeatureBarItems}
          className="mt-2 rounded-lg border border-border/60 bg-muted/15 px-3 py-3 sm:px-4"
        />
      ) : null}
    </div>
  );
}
