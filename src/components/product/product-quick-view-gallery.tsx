import { useEffect, useMemo, useState } from 'react';

import { ProductImageWatermarkOverlay } from '@/components/product/product-image-watermark-overlay';
import { cn } from '@/lib/utils';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductQuickViewGalleryProps {
  items: ProductGalleryItem[];
  productName: string;
  className?: string;
}

function toImageSrc(item: ProductGalleryItem): string | null {
  if (item.type === 'image') return item.src;
  if (item.type === 'video') return item.poster ?? null;
  return item.poster ?? item.src;
}

export function ProductQuickViewGallery({
  items,
  productName,
  className,
}: ProductQuickViewGalleryProps) {
  const imageItems = useMemo(
    () => items.map((item) => ({ item, src: toImageSrc(item) })).filter((row) => Boolean(row.src)),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [imageItems.length, imageItems[0]?.src]);

  const safeIndex = imageItems.length > 0 ? Math.min(activeIndex, imageItems.length - 1) : 0;
  const active = imageItems[safeIndex];

  if (!active?.src) {
    return (
      <div
        className={cn(
          'flex min-h-[220px] items-center justify-center bg-muted/20 sm:min-h-[280px] lg:min-h-full',
          className,
        )}
      >
        <span className="text-5xl font-bold text-muted-foreground" aria-hidden="true">
          {productName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[220px] flex-col bg-muted/20 sm:min-h-[280px] lg:min-h-full',
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <ProductImageWatermarkOverlay
          src={active.src}
          className="flex max-h-56 w-full items-center justify-center lg:max-h-[min(52vh,420px)]"
        >
          <img
            src={active.src}
            alt={active.item.type === 'image' ? active.item.alt ?? productName : productName}
            className="max-h-56 w-full object-contain drop-shadow-md lg:max-h-[min(52vh,420px)]"
          />
        </ProductImageWatermarkOverlay>
      </div>

      {imageItems.length > 1 ? (
        <div
          className="flex justify-center gap-1.5 pb-4 pt-1"
          role="tablist"
          aria-label="Vistas del producto"
        >
          {imageItems.map((row, index) => (
            <button
              key={row.src}
              type="button"
              role="tab"
              aria-selected={index === safeIndex}
              aria-label={`Vista ${index + 1} de ${imageItems.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index === safeIndex ? 'bg-primary' : 'bg-muted-foreground/35 hover:bg-muted-foreground/55',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
