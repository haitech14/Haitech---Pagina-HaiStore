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
  /** Si se pasa, muestra icono + etiqueta (p. ej. ficha de producto). */
  label?: string;
}

export function ProductCardCopyButton({
  productName,
  code,
  title,
  stock,
  priceUsd,
  priceRole,
  priceRoleLabel,
  normalPriceUsd,
  productId,
  condition,
  category,
  isColorProduct,
  volumeRolePrices,
  volumeDiscount,
  deliveryTime,
  priceValidity,
  productPath,
  className,
  label,
}: ProductCardCopyButtonProps) {
  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const payload = buildProductClipboardPayload({
      title,
      stock,
      priceUsd,
      ...(code != null ? { code } : {}),
      ...(priceRole != null ? { priceRole } : {}),
      ...(priceRoleLabel != null ? { priceRoleLabel } : {}),
      ...(normalPriceUsd != null ? { normalPriceUsd } : {}),
      ...(productId != null ? { productId } : {}),
      ...(condition != null ? { condition } : {}),
      ...(category != null ? { category } : {}),
      ...(isColorProduct != null ? { isColorProduct } : {}),
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
      aria-label={label ? `${label} de ${productName}` : `Texto de ${productName}`}
      title={label ?? 'Texto'}
      onClick={(event) => {
        void handleClick(event);
      }}
    >
      <ClipboardCopy
        className={cn('shrink-0', label ? 'size-3.5' : 'size-4')}
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
