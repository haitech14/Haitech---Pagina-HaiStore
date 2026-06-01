import { useRef } from 'react';
import { ImageIcon, Loader2, Plus } from 'lucide-react';

import { getProductMediaUrls } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        'size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted',
        className,
      )}
    >
      <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
    </div>
  );
}

interface InventoryMediaCellProps {
  product: InventoryProduct;
  onPreview?: () => void;
  onAddGallery?: (files: FileList) => void | Promise<void>;
  isAddingGallery?: boolean;
}

/** Foto principal, botón + para galería y miniaturas extra. */
export function InventoryMediaCell({
  product,
  onPreview,
  onAddGallery,
  isAddingGallery = false,
}: InventoryMediaCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urls = getProductMediaUrls(product);
  const main = product.image_url ?? urls[0] ?? null;
  const extras = urls.filter((url) => url !== main).slice(0, 3);
  const remaining = urls.length - (main ? 1 : 0) - extras.length;

  const thumbButtonClass =
    'rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  const openFilePicker = () => {
    if (!isAddingGallery) fileInputRef.current?.click();
  };

  const addButton = (
    <button
      type="button"
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-md border border-dashed border-border',
        'bg-muted/40 text-muted-foreground transition-colors',
        'hover:border-primary/50 hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
      )}
      onClick={openFilePicker}
      disabled={isAddingGallery || !onAddGallery}
      aria-label={`Agregar fotos a la galería de ${product.name}`}
    >
      {isAddingGallery ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Plus className="size-4" aria-hidden="true" />
      )}
    </button>
  );

  const fileInput = onAddGallery ? (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const files = event.target.files;
        if (files?.length) void onAddGallery(files);
        event.target.value = '';
      }}
    />
  ) : null;

  if (!main && extras.length === 0) {
    return (
      <div className="flex flex-col items-start gap-1">
        {fileInput}
        <div
          className="flex size-11 items-center justify-center rounded-md border border-dashed border-border bg-muted/50 text-muted-foreground"
          aria-hidden="true"
        >
          <ImageIcon className="size-4" />
        </div>
        {addButton}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5">
      <div className="flex flex-col items-center gap-1">
        {fileInput}
        {main ? (
          <button
            type="button"
            className={thumbButtonClass}
            onClick={onPreview}
            aria-label={`Ampliar foto principal de ${product.name}`}
          >
            <Thumb src={main} alt={`Foto de ${product.name}`} />
          </button>
        ) : null}
        {addButton}
      </div>
      {extras.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {extras.map((url) => (
            <button
              key={url}
              type="button"
              className={thumbButtonClass}
              onClick={onPreview}
              aria-label="Ver imagen de galería"
            >
              <Thumb src={url} alt="" className="size-8" />
            </button>
          ))}
          {remaining > 0 && (
            <span className="text-xs font-medium text-muted-foreground">+{remaining}</span>
          )}
        </div>
      )}
    </div>
  );
}
