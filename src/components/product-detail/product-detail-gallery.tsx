import { useEffect, useState } from 'react';
import { Play, ZoomIn } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { youtubeThumbnailUrl } from '@/lib/product-media';
import { cn } from '@/lib/utils';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductDetailGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
  showNewBadge?: boolean;
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
        className="aspect-video w-full max-w-[92%] rounded-md border-0"
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
        className="max-h-[min(50vh,460px)] w-full max-w-[92%] rounded-md bg-black object-contain"
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
    <img
      src={item.src}
      alt={item.alt ?? productName}
      className="max-h-[min(50vh,460px)] w-full max-w-[92%] object-contain object-center"
      loading="eager"
      onError={onImageError}
    />
  );
}

export function ProductDetailGallery({
  items,
  productName,
  showNewBadge = false,
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

  if (galleryItems.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-border/60 bg-white p-5 sm:min-h-[280px]">
        <span className="text-5xl font-bold text-muted-foreground/30" aria-hidden="true">
          {productName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
      {galleryItems.length > 1 ? (
        <ul
          className="flex shrink-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-[4.5rem] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0 [&::-webkit-scrollbar]:hidden"
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
                    'relative size-14 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:size-16',
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
                  <img
                    src={getThumbnailSrc(item)}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  {isVideo ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Play className="size-4 text-white sm:size-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-white">
          {showNewBadge ? (
            <span className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:text-xs">
              Nuevo
            </span>
          ) : null}
          <div
            className={cn(
              'flex min-h-[220px] items-center justify-center bg-white p-5 sm:min-h-[280px] sm:p-6 lg:min-h-[340px]',
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
              className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full border border-border/80 bg-white/95 text-muted-foreground shadow-sm transition-colors hover:bg-white hover:text-[#0f1f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Ampliar imagen de ${productName}`}
            >
              <ZoomIn className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-none bg-transparent p-2 shadow-none sm:p-4">
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <DialogDescription className="sr-only">Vista ampliada del producto</DialogDescription>
          {activeImage ? (
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="mx-auto max-h-[85vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
