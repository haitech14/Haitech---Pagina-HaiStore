import { Minus, Plus } from 'lucide-react';

import { formatOrderQuantityHint } from '@/components/cart/add-to-cart-button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

export const PURCHASE_QUANTITY_MAX = 99;

export function clampPurchaseQuantity(value: number): number {
  return Math.min(PURCHASE_QUANTITY_MAX, Math.max(1, Math.floor(Number(value) || 1)));
}

interface ProductDetailPurchaseQuantityProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}

export function ProductDetailPurchaseQuantity({
  product,
  quantity,
  onQuantityChange,
  className,
}: ProductDetailPurchaseQuantityProps) {
  const orderHint = formatOrderQuantityHint(product, quantity);

  const adjustQuantity = (delta: number) => {
    onQuantityChange(clampPurchaseQuantity(quantity + delta));
  };

  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-[0.6875rem] font-medium text-neutral-500">Cantidad</p>
      <div
        className="flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-neutral-200/80 bg-white"
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
          className="flex w-8 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 disabled:opacity-40"
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <span
          className="flex flex-1 items-center justify-center border-x border-neutral-100 text-sm font-semibold tabular-nums text-neutral-900"
          aria-live="polite"
          aria-atomic="true"
          title={orderHint ?? undefined}
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjustQuantity(1)}
          disabled={quantity >= PURCHASE_QUANTITY_MAX}
          aria-label="Aumentar cantidad"
          className="flex w-8 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 disabled:opacity-40"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {orderHint ? (
        <p className="sr-only">{orderHint}</p>
      ) : null}
    </div>
  );
}
