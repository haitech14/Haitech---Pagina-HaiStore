import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, ZoomIn } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductDetailGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
}

function getItemThumb(item: ProductGalleryItem): string {
  if (item.type === 'image') return item.src;
  return item.poster ?? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
}

function getItemLabel(item: ProductGalleryItem, index: number, productName: string): string {
  if (item.type === 'video') {
    return `Ver video ${index + 1} de ${productName}`;
  }
  return `Ver imagen ${index + 1} de ${productName}`;
}

export function ProductDetailGallery({
  items,
  productName,
}: ProductDetailGalleryProps) {
  const galleryItems = items.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];
  const showThumbnails = galleryItems.length > 1;
  const canScrollPrev = activeIndex > 0;
  const canScrollNext = activeIndex < galleryItems.length - 1;
  const activeIsVideo = activeItem?.type === 'video';
  const activeImageSrc = activeItem?.type === 'image' ? activeItem.src : null;

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(galleryItems.length - 1, i + 1));

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className={cn(
          'flex w-full gap-2',
          showThumbnails ? 'flex-col lg:flex-row lg:items-stretch' : 'flex-col',
        )}
      >
        {showThumbnails ? (
          <div className="order-2 flex items-center justify-center gap-1.5 lg:order-1 lg:w-[4.5rem] lg:shrink-0 lg:flex-col lg:justify-start">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canScrollPrev}
              aria-label="Elemento anterior"
              className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 lg:flex"
            >
              <ChevronUp className="size-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goPrev}
              disabled={!canScrollPrev}
              aria-label="Elemento anterior"
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 lg:hidden"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            </button>

            <ul className="flex flex-row justify-center gap-1.5 lg:flex-col">
              {galleryItems.map((item, index) => {
                const isVideo = item.type === 'video';
                const thumbSrc = getItemThumb(item);

                return (
                  <li key={`${item.type}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={getItemLabel(item, index, productName)}
                      aria-current={activeIndex === index ? 'true' : undefined}
                      className={cn(
                        'relative flex size-14 items-center justify-center overflow-hidden rounded-md bg-white p-1 transition-colors lg:size-[4rem]',
                        activeIndex === index
                          ? 'border-2 border-red-600'
                          : 'border border-border hover:border-red-400',
                      )}
                    >
                      {!imageError[index] ? (
                        <img
                          src={thumbSrc}
                          alt=""
                          className="size-full object-contain object-center"
                          loading="lazy"
                          onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                      {isVideo ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center bg-black/25"
                        >
                          <span className="flex size-6 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm">
                            <Play className="ml-0.5 size-3 fill-current" aria-hidden="true" />
                          </span>
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={goNext}
              disabled={!canScrollNext}
              aria-label="Siguiente elemento"
              className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 lg:flex"
            >
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canScrollNext}
              aria-label="Siguiente elemento"
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 lg:hidden"
            >
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="relative order-1 min-w-0 flex-1 lg:order-2">
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border border-border/60 bg-white',
              activeIsVideo ? 'aspect-[4/3] lg:aspect-video' : '',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center bg-white',
                activeIsVideo ? 'size-full p-0' : 'min-h-[220px] p-5 sm:min-h-[280px] sm:p-6 lg:min-h-[340px]',
              )}
            >
              {activeItem?.type === 'video' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeItem.youtubeId}?rel=0`}
                  title={activeItem.title ?? `Video de ${productName}`}
                  className="size-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : !imageError[activeIndex] && activeItem?.type === 'image' ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="relative flex size-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  aria-label={`Ampliar imagen de ${productName}`}
                >
                  <img
                    src={activeItem.src}
                    alt={activeItem.alt ?? productName}
                    className="max-h-[min(50vh,460px)] w-full max-w-[92%] object-contain object-center"
                    loading="eager"
                    onError={() => setImageError((prev) => ({ ...prev, [activeIndex]: true }))}
                  />
                </button>
              ) : (
                <span className="text-5xl font-bold text-muted-foreground/30" aria-hidden="true">
                  {productName.charAt(0)}
                </span>
              )}
            </div>

            {!activeIsVideo && activeImageSrc ? (
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
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-none bg-transparent p-2 shadow-none sm:p-4">
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <DialogDescription className="sr-only">Vista ampliada del producto</DialogDescription>
          {activeImageSrc ? (
            <img
              src={activeImageSrc}
              alt={productName}
              className="mx-auto max-h-[85vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
