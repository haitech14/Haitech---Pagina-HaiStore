import type { MouseEvent } from 'react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { copyProductImageToClipboard } from '@/lib/copy-product-to-clipboard';
import { cn } from '@/lib/utils';

interface ProductCardCopyImageButtonProps {
  productName: string;
  imageUrl: string;
  className?: string;
  /** Si se pasa, muestra icono + etiqueta (p. ej. ficha de producto). */
  label?: string;
}

export function ProductCardCopyImageButton({
  productName,
  imageUrl,
  className,
  label,
}: ProductCardCopyImageButtonProps) {
  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const ok = await copyProductImageToClipboard(imageUrl);
    if (ok) {
      toast.success('Imagen del producto copiada 🖼️');
      return;
    }
    toast.error('No se pudo copiar la imagen');
  };

  return (
    <button
      type="button"
      className={cn(className)}
      aria-label={label ? `${label} de ${productName}` : `Imagen de ${productName}`}
      title={label ?? 'Imagen'}
      onClick={(event) => {
        void handleClick(event);
      }}
    >
      <ImageIcon className={cn('shrink-0', label ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
