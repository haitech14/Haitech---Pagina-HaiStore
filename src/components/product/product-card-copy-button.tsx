import type { MouseEvent } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

import { copyProductTextToClipboard } from '@/lib/copy-product-to-clipboard';
import {
  buildProductClipboardPayload,
  type ProductClipboardTextInput,
} from '@/lib/product-clipboard-text';
import { cn } from '@/lib/utils';

export type ProductCardCopyTextInput = Omit<ProductClipboardTextInput, 'imageUrl'>;

interface ProductCardCopyButtonProps extends ProductCardCopyTextInput {
  productName: string;
  className?: string;
}

export function ProductCardCopyButton({
  productName,
  code,
  title,
  stock,
  priceUsd,
  normalPriceUsd,
  productId,
  condition,
  volumeRolePrices,
  volumeDiscount,
  deliveryTime,
  priceValidity,
  productPath,
  className,
}: ProductCardCopyButtonProps) {
  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const payload = buildProductClipboardPayload({
      title,
      stock,
      priceUsd,
      ...(code != null ? { code } : {}),
      ...(normalPriceUsd != null ? { normalPriceUsd } : {}),
      ...(productId != null ? { productId } : {}),
      ...(condition != null ? { condition } : {}),
      ...(volumeRolePrices != null ? { volumeRolePrices } : {}),
      ...(volumeDiscount !== undefined ? { volumeDiscount } : {}),
      ...(deliveryTime != null ? { deliveryTime } : {}),
      ...(priceValidity != null ? { priceValidity } : {}),
      ...(productPath != null ? { productPath } : {}),
    });

    const ok = await copyProductTextToClipboard({
      plain: payload.plain,
      html: payload.html,
    });

    if (ok) {
      toast.success('Datos del producto copiados 📋');
      return;
    }
    toast.error('No se pudo copiar los datos');
  };

  return (
    <button
      type="button"
      className={cn(className)}
      aria-label={`Copiar datos de ${productName}`}
      title="Copiar datos"
      onClick={(event) => {
        void handleClick(event);
      }}
    >
      <ClipboardCopy className="size-4" aria-hidden="true" />
    </button>
  );
}
