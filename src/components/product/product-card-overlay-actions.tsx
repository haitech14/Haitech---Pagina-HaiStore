import { Eye, GitCompare, Heart, ShoppingCart } from 'lucide-react';

import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import type { ProductClipboardTextInput } from '@/lib/product-clipboard-text';
import { cn } from '@/lib/utils';

const overlayButtonClass =
  'flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

interface ProductCardOverlayActionsProps {
  productName: string;
  isCompareSelected: boolean;
  isWishlisted?: boolean;
  /** Desplaza los iconos hacia abajo cuando hay badge de condición en la imagen. */
  withConditionBadge?: boolean;
  /** Muestra los iconos solo al hover/focus de la tarjeta (`group`). */
  revealOnHover?: boolean;
  /** Segundo icono: comparar (por defecto) o añadir al carrito. */
  secondaryAction?: 'compare' | 'buy';
  /** Si se pasa, muestra los botones de copiar imagen / datos. */
  clipboard?: ProductClipboardTextInput;
  onWishlist?: () => void;
  onQuickView: () => void;
  onCompare: () => void;
  onBuy?: () => void;
}

export function ProductCardOverlayActions({
  productName,
  isCompareSelected,
  isWishlisted = false,
  withConditionBadge = false,
  revealOnHover = false,
  secondaryAction = 'compare',
  clipboard,
  onWishlist,
  onQuickView,
  onCompare,
  onBuy,
}: ProductCardOverlayActionsProps) {
  const clipboardImageUrl = clipboard?.imageUrl?.trim() || null;

  return (
    <div
      className={cn(
        'pointer-events-auto absolute right-3 z-10 flex flex-col gap-1.5',
        withConditionBadge ? 'top-10 sm:top-11' : 'top-3',
        revealOnHover &&
          cn(
            'opacity-0 transition-opacity duration-200 ease-out motion-reduce:opacity-100 motion-reduce:transition-none',
            'group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100',
          ),
      )}
    >
      <button
        type="button"
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? `Quitar ${productName} de favoritos`
            : `Añadir ${productName} a favoritos`
        }
        className={cn(
          overlayButtonClass,
          isWishlisted ? 'border-red-600 bg-red-50 text-red-600' : 'text-red-600 hover:bg-red-50',
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onWishlist?.();
        }}
      >
        <Heart
          className={cn('size-4', isWishlisted && 'fill-red-600')}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      {secondaryAction === 'buy' ? (
        <button
          type="button"
          aria-label={`Añadir ${productName} al carrito`}
          className={cn(overlayButtonClass, 'text-red-600 hover:bg-red-50')}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onBuy?.();
          }}
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
        </button>
      ) : null}
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
      {clipboardImageUrl ? (
        <ProductCardCopyImageButton
          productName={productName}
          imageUrl={clipboardImageUrl}
          className={cn(overlayButtonClass, 'text-neutral-700 hover:bg-neutral-50')}
        />
      ) : null}
      {clipboard ? (
        <ProductCardCopyButton
          productName={productName}
          title={clipboard.title}
          stock={clipboard.stock}
          priceUsd={clipboard.priceUsd}
          {...(clipboard.code != null ? { code: clipboard.code } : {})}
          {...(clipboard.priceRole != null ? { priceRole: clipboard.priceRole } : {})}
          {...(clipboard.priceRoleLabel != null
            ? { priceRoleLabel: clipboard.priceRoleLabel }
            : {})}
          {...(clipboard.normalPriceUsd != null
            ? { normalPriceUsd: clipboard.normalPriceUsd }
            : {})}
          {...(clipboard.productId != null ? { productId: clipboard.productId } : {})}
          {...(clipboard.condition != null ? { condition: clipboard.condition } : {})}
          {...(clipboard.category != null ? { category: clipboard.category } : {})}
          {...(clipboard.isColorProduct != null
            ? { isColorProduct: clipboard.isColorProduct }
            : {})}
          {...(clipboard.volumeRolePrices != null
            ? { volumeRolePrices: clipboard.volumeRolePrices }
            : {})}
          {...(clipboard.volumeDiscount !== undefined
            ? { volumeDiscount: clipboard.volumeDiscount }
            : {})}
          {...(clipboard.deliveryTime != null ? { deliveryTime: clipboard.deliveryTime } : {})}
          {...(clipboard.priceValidity != null ? { priceValidity: clipboard.priceValidity } : {})}
          {...(clipboard.productPath != null ? { productPath: clipboard.productPath } : {})}
          className={cn(overlayButtonClass, 'text-neutral-700 hover:bg-neutral-50')}
        />
      ) : null}
      {secondaryAction === 'compare' ? (
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
      ) : null}
    </div>
  );
}
