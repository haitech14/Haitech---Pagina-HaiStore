import { useState } from 'react';
import { Check } from 'lucide-react';

import type { SoftwareCatalogItem } from '@/types/software-catalog';
import { cn } from '@/lib/utils';

interface SoftwareDetailGalleryProps {
  item: SoftwareCatalogItem;
  className?: string;
}

export function SoftwareDetailGallery({ item, className }: SoftwareDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = item.images.length > 0 ? item.images : [''];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted/20">
        <img
          src={images[activeIndex]}
          alt={item.imageAlt}
          className="size-full object-cover"
          fetchPriority="high"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                activeIndex === index ? 'border-red-600' : 'border-border/70',
              )}
            >
              <img src={image} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SoftwareDetailInclusionsProps {
  items: readonly string[];
  className?: string;
}

export function SoftwareDetailInclusions({ items, className }: SoftwareDetailInclusionsProps) {
  return (
    <ul className={cn('grid gap-2 sm:grid-cols-2', className)}>
      {items.map((inclusion) => (
        <li key={inclusion} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{inclusion}</span>
        </li>
      ))}
    </ul>
  );
}
