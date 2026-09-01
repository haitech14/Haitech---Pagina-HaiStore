import type { ReactNode } from 'react';
import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

import {
  AddToCartButton,
  adjustProductQuantity,
  formatOrderQuantityHint,
  getAddToCartLabel,
  hasOnRequestQuantity,
} from '@/components/cart/add-to-cart-button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductQuantityAddFooterProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md';
  onQuantityChange?: (quantity: number) => void;
  /** Oculta el stepper hasta hover/focus en la tarjeta (`group`). */
  revealQuantityOnHover?: boolean;
  /**
   * `inline` (default): cantidad a la izquierda del botón.
   * `above`: cantidad arriba (deja sitio a Comprar + acción lateral, p. ej. WhatsApp).
   */
  quantityPlacement?: 'inline' | 'above';
  /** Contenido a la derecha del botón Comprar (p. ej. WhatsApp icon-only). */
  endAdornment?: ReactNode;
  /** Fila extra bajo Comprar al hover de la tarjeta (`group`), p. ej. «Comprar por WhatsApp». */
  belowOnHover?: ReactNode;
  /** Muestra `belowOnHover` siempre visible (sin esperar hover en desktop). */
  belowAlways?: boolean;
  /** No muestra el selector de cantidad (siempre agrega 1 unidad). */
  hideQuantity?: boolean;
  /** Etiqueta del botón de carrito (p. ej. «Comprar»). */
  addLabel?: string;
  /** Etiqueta corta al hover de la tarjeta (`group`) cuando `revealQuantityOnHover`. */
  addLabelHover?: string;
  addButtonClassName?: string;
  /** Clases extra del stepper de cantidad (p. ej. `h-10 rounded-lg`). */
  quantityClassName?: string;
  /** Botón Comprar compacto y centrado (sin ancho completo ni WhatsApp lateral). */
  centeredActions?: boolean;
}

export function ProductQuantityAddFooter({
  product,
  className,
  size = 'md',
  onQuantityChange,
  revealQuantityOnHover = true,
  quantityPlacement = 'inline',
  endAdornment,
  belowOnHover,
  belowAlways = false,
  hideQuantity = false,
  addLabel,
  addLabelHover,
  addButtonClassName,
  quantityClassName,
  centeredActions = false,
}: ProductQuantityAddFooterProps) {
  const [quantity, setQuantity] = useState(1);
  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const orderHint = formatOrderQuantityHint(product, quantity);
  const cartLabel = addLabel ?? getAddToCartLabel(product, 'short', quantity);
  const cartLabelHover = addLabelHover ?? null;
  const swapLabelOnHover = Boolean(cartLabelHover && revealQuantityOnHover && !hideQuantity);
  const hideEndAdornmentOnHover = Boolean(belowOnHover && endAdornment);
  const hoverRevealClass = belowAlways
    ? ''
    : 'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';
  const tallQuantity = quantityClassName?.includes('h-10') ?? false;
  const quantityAbove = quantityPlacement === 'above' && !hideQuantity;

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => {
      const next = adjustProductQuantity(product, current, delta);
      onQuantityChange?.(next);
      return next;
    });
  };

  const qtyButtonClass = tallQuantity
    ? 'flex w-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40'
    : size === 'sm'
      ? 'flex size-7 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40 sm:size-8'
      : 'flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40';

  const qtyValueClass =
    size === 'sm'
      ? 'min-w-[0.875rem] text-center text-[0.6875rem] font-semibold tabular-nums text-foreground sm:text-xs'
      : 'min-w-[1rem] text-center text-xs font-semibold tabular-nums text-foreground';

  const addButtonClass =
    size === 'sm'
      ? 'h-7 min-h-7 min-w-0 flex-1 gap-1 rounded-md px-1.5 text-[0.625rem] font-semibold sm:h-8 sm:min-h-8 sm:px-2 sm:text-xs'
      : 'h-8 min-h-8 min-w-0 flex-1 gap-1.5 rounded-md px-2 text-xs font-semibold sm:h-9 sm:min-h-9 sm:text-sm';

  const quantityControl = hideQuantity ? null : (
    <div
      className={cn(
        'flex shrink-0 rounded-md border bg-white',
        tallQuantity ? 'items-stretch' : 'items-center',
        quantityClassName,
        revealQuantityOnHover
          ? quantityAbove
            ? cn(
                'max-h-0 overflow-hidden border-transparent opacity-0',
                'transition-[max-height,opacity,border-color,margin] duration-200 ease-out motion-reduce:transition-none',
                'group-hover:max-h-12 group-hover:border-border group-hover:opacity-100',
                'group-focus-within:max-h-12 group-focus-within:border-border group-focus-within:opacity-100',
                'focus-within:max-h-12 focus-within:border-border focus-within:opacity-100',
                'max-md:max-h-12 max-md:border-border max-md:opacity-100',
              )
            : cn(
                'max-w-0 overflow-hidden border-transparent opacity-0',
                'transition-[max-width,opacity,border-color] duration-200 ease-out motion-reduce:transition-none',
                tallQuantity
                  ? 'group-hover:max-w-[8.25rem] group-focus-within:max-w-[8.25rem] focus-within:max-w-[8.25rem] max-md:max-w-[8.25rem]'
                  : 'group-hover:max-w-[7.5rem] group-focus-within:max-w-[7.5rem] focus-within:max-w-[7.5rem] max-md:max-w-[7.5rem]',
                'group-hover:border-border group-hover:opacity-100',
                'group-focus-within:border-border group-focus-within:opacity-100',
                'focus-within:border-border focus-within:opacity-100',
                'max-md:border-border max-md:opacity-100',
              )
          : 'border-border',
      )}
      role="group"
      aria-label={
        orderHint
          ? `Cantidad de ${product.name}: ${quantity} (${orderHint})`
          : `Cantidad de ${product.name}`
      }
    >
      <button
        type="button"
        onClick={() => adjustQuantity(-1)}
        disabled={quantity <= 1}
        aria-label="Disminuir cantidad"
        className={qtyButtonClass}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span
        className={cn(qtyValueClass, tallQuantity && 'flex items-center justify-center')}
        aria-live="polite"
        aria-atomic="true"
        title={orderHint ?? undefined}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => adjustQuantity(1)}
        aria-label="Aumentar cantidad"
        className={qtyButtonClass}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );

  const stackBuyWithBelow = Boolean(belowOnHover && centeredActions);

  const addButton = (
    <AddToCartButton
      product={product}
      addOptions={{ quantity }}
      className={cn(
        addButtonClass,
        includesOnRequest
          ? cn(
              addButtonClassName,
              // Reserva / a pedido: negro (pisa fondos rojos de las cards).
              'border border-foreground !bg-foreground !text-background shadow-none hover:!bg-foreground/90 hover:!text-background focus-visible:ring-ring',
            )
          : cn(
              'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
              addButtonClassName,
              centeredActions && 'w-full flex-none',
              stackBuyWithBelow &&
                revealQuantityOnHover &&
                !hideQuantity &&
                'transition-[padding] duration-200 ease-out sm:group-hover:px-3 sm:group-focus-within:px-3 motion-reduce:transition-none',
            ),
      )}
    >
      {!includesOnRequest ? (
        <ShoppingCart
          className={cn(
            'size-4 shrink-0',
            swapLabelOnHover && 'max-md:hidden group-hover:hidden group-focus-within:hidden',
          )}
          aria-hidden="true"
        />
      ) : null}
      {swapLabelOnHover ? (
        <>
          <span className="max-md:hidden group-hover:hidden group-focus-within:hidden">
            {cartLabel}
          </span>
          <span className="hidden max-md:inline group-hover:inline group-focus-within:inline">
            {cartLabelHover}
          </span>
        </>
      ) : (
        <span className="truncate">{cartLabel}</span>
      )}
    </AddToCartButton>
  );

  const endAdornmentNode = endAdornment ? (
    <div
      className={cn(
        hideEndAdornmentOnHover &&
          'group-hover:hidden group-focus-within:hidden max-md:hidden motion-reduce:hidden',
      )}
    >
      {endAdornment}
    </div>
  ) : null;

  const hoverFooter =
    belowOnHover != null ? (
      belowAlways ? (
        <div className="w-full pt-1.5">{belowOnHover}</div>
      ) : (
        <div className={hoverRevealClass}>
          <div className="min-h-0 w-full overflow-hidden pt-1.5">{belowOnHover}</div>
        </div>
      )
    ) : null;

  const buyActionStack = stackBuyWithBelow ? (
    <div
      className={cn(
        'inline-flex min-w-0 flex-col items-stretch transition-[width] duration-200 ease-out motion-reduce:transition-none',
        'w-[9.5rem] sm:w-[14.5rem]',
        revealQuantityOnHover &&
          !hideQuantity &&
          'sm:group-hover:w-[9.5rem] sm:group-focus-within:w-[9.5rem]',
      )}
    >
      {addButton}
      {hoverFooter}
    </div>
  ) : null;

  const actionRow = buyActionStack ? (
    <div
      className={cn(
        'flex min-w-0 items-stretch gap-1.5 sm:gap-2',
        centeredActions ? 'shrink-0 justify-center' : 'flex-1',
      )}
    >
      {buyActionStack}
      {endAdornmentNode}
    </div>
  ) : (
    <div
      className={cn(
        'flex min-w-0 items-stretch gap-1.5 sm:gap-2',
        centeredActions ? 'shrink-0 justify-center' : 'flex-1',
      )}
    >
      {addButton}
      {endAdornmentNode}
    </div>
  );

  if (quantityAbove) {
    return (
      <div className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
        {quantityControl}
        {actionRow}
        {!stackBuyWithBelow ? hoverFooter : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col',
        centeredActions && 'w-auto items-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-stretch',
          centeredActions ? 'w-auto justify-center' : 'w-full',
          hideQuantity
            ? 'gap-0'
            : revealQuantityOnHover
              ? 'gap-0 transition-[gap] duration-200 ease-out group-hover:gap-1.5 group-focus-within:gap-1.5 sm:group-hover:gap-2 max-md:gap-1.5 motion-reduce:transition-none'
              : 'gap-1.5 sm:gap-2',
        )}
      >
        {quantityControl}
        {actionRow}
      </div>
      {!stackBuyWithBelow ? hoverFooter : null}
    </div>
  );
}
