import { Eye, GitCompare, Heart } from 'lucide-react';

import { cn } from '@/lib/utils';

const overlayButtonClass =
  'flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

interface ProductCardOverlayActionsProps {
  productName: string;
  isCompareSelected: boolean;
  onWishlist?: () => void;
  onQuickView: () => void;
  onCompare: () => void;
}

export function ProductCardOverlayActions({
  productName,
  isCompareSelected,
  onWishlist,
  onQuickView,
  onCompare,
}: ProductCardOverlayActionsProps) {
  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col gap-1.5">
      <button
        type="button"
        aria-label={`Añadir ${productName} a favoritos`}
        className={cn(overlayButtonClass, 'text-red-600 hover:bg-red-50')}
        onClick={onWishlist}
      >
        <Heart className="size-4 fill-none" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Vista rápida de ${productName}`}
        className={cn(overlayButtonClass, 'text-neutral-700 hover:bg-neutral-50')}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onQuickView();
        }}
      >
        <Eye className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-pressed={isCompareSelected}
        aria-label={
          isCompareSelected
            ? `Quitar ${productName} del comparador`
            : `Comparar ${productName}`
        }
        className={cn(
          overlayButtonClass,
          isCompareSelected
            ? 'border-red-600 bg-red-50 text-red-600'
            : 'text-neutral-700 hover:bg-neutral-50',
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onCompare();
        }}
      >
        <GitCompare className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
