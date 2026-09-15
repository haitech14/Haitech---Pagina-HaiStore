import { Camera, Plus } from 'lucide-react';

import { ProductEditorCard } from '@/components/ProductEditor/product-editor-ui';
import { cn } from '@/lib/utils';

export interface ProductMediaItem {
  id: string;
  src: string;
  alt?: string;
}

interface ProductMediaProps {
  images: ProductMediaItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductMedia({ images, selectedId, onSelect }: ProductMediaProps) {
  const selected = images.find((image) => image.id === selectedId) ?? images[0] ?? null;

  return (
    <ProductEditorCard
      title="Multimedia"
      description="Imagen principal y galería."
      icon={<Camera className="size-4" aria-hidden="true" />}
    >
      <div className="flex gap-3">
        <div className="flex min-h-[11rem] flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
          {selected ? (
            <img
              src={selected.src}
              alt={selected.alt ?? ''}
              className="max-h-44 w-full object-contain"
            />
          ) : (
            <span className="text-xs text-[#9CA3AF]">Sin imagen</span>
          )}
        </div>

        <div className="flex w-14 shrink-0 flex-col gap-2 sm:w-16">
          {images.map((image) => {
            const active = image.id === selected?.id;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(image.id)}
                className={cn(
                  'aspect-square overflow-hidden rounded-lg border bg-white p-1 transition-colors',
                  active
                    ? 'border-[#EF233C] ring-1 ring-[#EF233C]/30'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]',
                )}
                aria-label={`Seleccionar imagen ${image.alt ?? image.id}`}
                aria-pressed={active}
              >
                <img
                  src={image.src}
                  alt=""
                  className="size-full object-contain"
                />
              </button>
            );
          })}
          <button
            type="button"
            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAFC] text-[#6B7280] transition-colors hover:border-[#EF233C]/40 hover:text-[#EF233C]"
            aria-label="Agregar imagen"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </ProductEditorCard>
  );
}
