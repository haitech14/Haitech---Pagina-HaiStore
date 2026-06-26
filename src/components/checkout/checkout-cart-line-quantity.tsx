import { Minus, Plus } from 'lucide-react';

import { formatOrderQuantityHint } from '@/components/cart/add-to-cart-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface CheckoutCartLineQuantityProps {
  product: Product;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
  id?: string;
}

export function CheckoutCartLineQuantity({
  product,
  quantity,
  onDecrease,
  onIncrease,
  className,
  id,
}: CheckoutCartLineQuantityProps) {
  const orderHint = formatOrderQuantityHint(product, quantity);
  const quantityLabelId = id ? `${id}-qty-label` : undefined;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className="inline-flex w-fit items-center rounded-md border border-border"
        role="group"
        aria-labelledby={quantityLabelId}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-none rounded-l-md"
          aria-label={`Quitar una unidad de ${product.name}`}
          onClick={onDecrease}
          disabled={quantity <= 1}
        >
          <Minus className="size-4" aria-hidden="true" />
        </Button>
        <span
          id={quantityLabelId}
          className="min-w-10 px-1 text-center text-sm font-semibold tabular-nums"
          aria-label={
            orderHint ? `Cantidad: ${quantity} (${orderHint})` : `Cantidad: ${quantity}`
          }
          title={orderHint ?? undefined}
        >
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-none rounded-r-md"
          aria-label={`Añadir una unidad de ${product.name}`}
          onClick={onIncrease}
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {orderHint ? (
        <p className="text-xs text-amber-700" role="status">
          {orderHint}
        </p>
      ) : null}
    </div>
  );
}
