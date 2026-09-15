import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Minus, Plane, Plus, ShoppingCart } from 'lucide-react';

import {
  ADD_ON_REQUEST_LABEL,
  AddToCartButton,
  adjustProductQuantity,
  formatOrderQuantityHint,
  getAddToCartLabel,
  isAddOnRequestProduct,
} from '@/components/cart/add-to-cart-button';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { resolveProductVolumeUnitUsd } from '@/lib/checkout-cart-bulk-discount';
import { resolveProductBulkDiscountTiers } from '@/lib/product-bulk-discount';
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
  /** Clases del contenedor bajo el botón (p. ej. menos padding entre CTAs). */
  belowClassName?: string;
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
  belowClassName,
  hideQuantity = false,
  addLabel,
  addLabelHover,
  addButtonClassName,
  quantityClassName,
  centeredActions = false,
}: ProductQuantityAddFooterProps) {
  const [quantity, setQuantity] = useState(1);
  const settingsQuery = useCompanySettings();
  const volumeTiers = resolveProductBulkDiscountTiers(
    product,
    settingsQuery.data?.bulkDiscountTiers,
  );
  const volumeUnitPriceUsd = useMemo(
    () => resolveProductVolumeUnitUsd(product, quantity, volumeTiers),
    [product, quantity, volumeTiers],
  );
  const orderHint = formatOrderQuantityHint(product, quantity);
  const onRequestOnly = isAddOnRequestProduct(product, quantity);
  const cartLabel =
    addLabel ??
    (onRequestOnly ? ADD_ON_REQUEST_LABEL : getAddToCartLabel(product, 'short', quantity));
  const cartLabelHover = addLabel != null ? addLabelHover ?? null : onRequestOnly ? null : addLabelHover ?? null;
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
      ? hideQuantity
        ? 'h-7 min-h-7 w-full min-w-0 flex-1 gap-1 rounded-md px-1.5 text-[0.625rem] font-semibold sm:h-8 sm:min-h-8 sm:px-2 sm:text-xs'
        : 'h-7 min-h-7 min-w-0 flex-1 gap-1 rounded-md px-1.5 text-[0.625rem] font-semibold sm:h-8 sm:min-h-8 sm:px-2 sm:text-xs'
      : hideQuantity
        ? 'h-8 min-h-8 w-full min-w-0 flex-1 gap-1.5 rounded-md px-2 text-xs font-semibold sm:h-9 sm:min-h-9 sm:text-sm'
        : 'h-8 min-h-8 min-w-0 flex-1 gap-1.5 rounded-md px-2 text-xs font-semibold sm:h-9 sm:min-h-9 sm:text-sm';
  const compactBuyWidth = centeredActions
    ? 'w-auto min-w-0 flex-none whitespace-nowrap px-3.5 sm:px-4'
    : null;

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

  const addButton = (
    <AddToCartButton
      product={product}
      addOptions={{
        quantity,
        ...(volumeUnitPriceUsd != null ? { volumeUnitPriceUsd } : {}),
      }}
      className={cn(
        addButtonClass,
        'border-[#E30613] bg-[#E30613] text-white shadow-none hover:bg-[#c90511] hover:text-white focus-visible:ring-[#E30613]',
        addButtonClassName,
        onRequestOnly
          ? 'border-foreground !bg-[#111111] hover:!bg-[#222222] !text-white focus-visible:ring-ring'
          : '!bg-[#E30613] hover:!bg-[#c90511] !text-white',
        compactBuyWidth,
      )}
    >
      {onRequestOnly ? (
        <Plane className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <ShoppingCart
          className={cn(
            'size-4 shrink-0',
            swapLabelOnHover && 'max-md:hidden group-hover:hidden group-focus-within:hidden',
          )}
          aria-hidden="true"
        />
      )}
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

  const belowWidthClass = centeredActions ? 'w-auto min-w-0' : 'w-full min-w-0';
  const hoverFooter =
    belowOnHover != null ? (
      belowAlways ? (
        <div className={cn(belowWidthClass, 'overflow-hidden', belowClassName ?? 'pt-1.5')}>
          {belowOnHover}
        </div>
      ) : (
        <div className={hoverRevealClass}>
          <div className={cn('min-h-0 overflow-hidden', belowWidthClass, belowClassName ?? 'pt-1.5')}>
            {belowOnHover}
          </div>
        </div>
      )
    ) : null;

  const actionRow = (
    <div
      className={cn(
        'flex min-w-0 items-stretch gap-1.5 sm:gap-2',
        centeredActions ? 'w-auto shrink-0' : 'w-full flex-1',
      )}
    >
      {addButton}
      {endAdornmentNode}
    </div>
  );

  if (quantityAbove) {
    return (
      <div
        className={cn(
          'flex min-w-0 flex-col gap-1.5',
          centeredActions ? 'w-full items-center' : 'w-full',
          className,
        )}
      >
        {quantityControl}
        {actionRow}
        {hoverFooter}
      </div>
    );
  }

  return (
    <div
      className={cn(
          'flex min-w-0 flex-col',
          centeredActions ? 'w-full items-center' : 'w-full items-stretch',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-stretch',
          centeredActions ? 'w-auto max-w-full' : 'w-full',
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
      {hoverFooter}
    </div>
  );
}
