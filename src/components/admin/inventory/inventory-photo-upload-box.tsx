import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useId, useRef } from 'react';
import { CloudUpload, X } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InventoryPhotoUploadBoxProps {
  label: string;
  uploadLabel: string;
  hint: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  preview?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}

export function InventoryPhotoUploadBox({
  label,
  uploadLabel,
  hint,
  multiple = false,
  onFiles,
  preview,
  inputRef,
  className,
}: InventoryPhotoUploadBoxProps) {
  const fallbackId = useId();
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    onFiles(files);
    event.target.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <button
        type="button"
        className="flex min-h-[10.5rem] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => ref.current?.click()}
      >
        <CloudUpload className="size-9 text-muted-foreground/80" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">{uploadLabel}</span>
        <span className="max-w-[12rem] text-xs leading-snug text-muted-foreground">{hint}</span>
      </button>
      <input
        ref={ref}
        id={fallbackId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />
      {preview}
    </div>
  );
}

interface InventoryPhotoPreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
  size?: 'main' | 'thumb';
}

export function InventoryPhotoPreview({
  src,
  alt,
  onRemove,
  size = 'main',
}: InventoryPhotoPreviewProps) {
  return (
    <div className="relative mt-2 w-fit">
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-md border object-contain',
          size === 'main' ? 'max-h-28 w-auto max-w-full' : 'size-16 object-cover',
        )}
      />
      <button
        type="button"
        className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Quitar imagen"
        onClick={onRemove}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
