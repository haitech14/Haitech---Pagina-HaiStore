import type { MouseEvent } from 'react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { copyProductImageToClipboard } from '@/lib/copy-product-to-clipboard';
import { cn } from '@/lib/utils';

interface ProductCardCopyImageButtonProps {
  productName: string;
  imageUrl: string;
  className?: string;
}

export function ProductCardCopyImageButton({
  productName,
  imageUrl,
  className,
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
      aria-label={`Copiar imagen de ${productName}`}
      title="Copiar imagen"
      onClick={(event) => {
        void handleClick(event);
      }}
    >
      <ImageIcon className="size-4" aria-hidden="true" />
    </button>
  );
}
