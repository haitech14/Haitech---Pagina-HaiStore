import { useState, type MouseEvent } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { AddToCartOptions } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

export function isProductOutOfStock(product: Product): boolean {
  return product.stock <= 0;
}

export function getProductAvailableStock(product: Product): number {
  return Math.max(0, Math.floor(Number(product.stock) || 0));
}

export interface ProductOrderQuantitySplit {
  total: number;
  fromStock: number;
  onRequest: number;
}

/** Reparte la cantidad pedida entre stock inmediato y unidades a pedido. */
export function splitProductOrderQuantity(
  product: Product,
  quantity: number,
): ProductOrderQuantitySplit {
  const total = Math.max(1, Math.floor(Number(quantity) || 1));
  const available = getProductAvailableStock(product);
  const fromStock = available > 0 ? Math.min(total, available) : 0;
  const onRequest = total - fromStock;
  return { total, fromStock, onRequest };
}

export function hasOnRequestQuantity(product: Product, quantity: number): boolean {
  return splitProductOrderQuantity(product, quantity).onRequest > 0;
}

export function formatOrderQuantityHint(product: Product, quantity: number): string | null {
  const { fromStock, onRequest } = splitProductOrderQuantity(product, quantity);
  if (onRequest <= 0) return null;
  if (fromStock <= 0) return `${onRequest} a pedido`;
  return `${fromStock} en stock · ${onRequest} a pedido`;
}

/** Cantidad mínima 1; sin tope superior en tienda (el excedente va a pedido). */
export function adjustProductQuantity(_product: Product, current: number, delta: number): number {
  return Math.max(1, Math.floor(current + delta));
}

/** Botón / badge de catálogo cuando el producto se compra a pedido (sin stock inmediato). */
export const ON_REQUEST_PRODUCT_BUTTON_CLASS =
  'border border-foreground bg-foreground text-background shadow-none hover:bg-foreground/90 hover:text-background focus-visible:ring-ring';

export const ON_REQUEST_STOCK_BADGE_CLASS =
  'rounded-md border border-border bg-muted px-1.5 py-0.5 font-semibold text-muted-foreground';

export function getAddToCartLabel(
  product: Product,
  variant: 'default' | 'short' | 'detail' = 'default',
  quantity = 1,
): string {
  const { fromStock, onRequest } = splitProductOrderQuantity(product, quantity);
  if (onRequest > 0 && fromStock === 0) {
    return variant === 'short' ? 'A pedido' : 'Comprar a pedido';
  }
  if (variant === 'short') return 'Añadir';
  if (variant === 'detail') return 'Agregar al carrito';
  return 'Añadir al carrito';
}

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
  addOptions?: AddToCartOptions;
}

export function AddToCartButton({
  product,
  addOptions,
  className,
  disabled,
  children,
  ...props
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = isProductOutOfStock(product);
  const orderQuantity = addOptions?.quantity ?? 1;
  const defaultLabel = getAddToCartLabel(product, 'default', orderQuantity);
  const orderHint = formatOrderQuantityHint(product, orderQuantity);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;

    addItem(product, addOptions);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <Button
      type="button"
      disabled={disabled}
      aria-live="polite"
      aria-label={
        justAdded
          ? `${product.name} agregado al carrito`
          : orderHint
            ? `Añadir ${orderQuantity} unidades de ${product.name} (${orderHint})`
            : outOfStock
              ? `Comprar ${product.name} a pedido`
              : `Añadir ${product.name} al carrito`
      }
      onClick={handleClick}
      className={cn(
        'gap-2 transition-all duration-300 motion-reduce:transition-none',
        justAdded && 'cart-add-success bg-emerald-600 hover:bg-emerald-600',
        className,
      )}
      {...props}
    >
      {justAdded ? (
        <>
          <Check className="size-4 motion-safe:animate-in motion-safe:zoom-in" aria-hidden="true" />
          <span className="motion-safe:animate-in motion-safe:fade-in">¡Agregado!</span>
        </>
      ) : (
        children ?? (
          <>
            <ShoppingCart className="size-4" aria-hidden="true" />
            {defaultLabel}
          </>
        )
      )}
    </Button>
  );
}
