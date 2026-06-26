import { useState, type MouseEvent } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ServiceCartInput } from '@/lib/service-to-cart';
import { useServicePurchase } from '@/hooks/use-service-purchase';
import { cn } from '@/lib/utils';

interface ServicePurchaseActionsProps {
  cartInput: ServiceCartInput;
  className?: string;
  layout?: 'stack' | 'row';
}

export function ServicePurchaseActions({
  cartInput,
  className,
  layout = 'row',
}: ServicePurchaseActionsProps) {
  const { addServiceToCart, buyServiceNow } = useServicePurchase();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addServiceToCart(cartInput);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    buyServiceNow(cartInput);
  };

  return (
    <div
      className={cn(
        layout === 'stack' ? 'flex flex-col gap-2' : 'flex flex-col gap-3 sm:flex-row',
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        aria-live="polite"
        aria-label={
          justAdded
            ? `${cartInput.item.title} agregado al carrito`
            : `Añadir ${cartInput.item.title} al carrito`
        }
        className={cn(
          'min-h-11 flex-1 gap-2 font-semibold transition-all duration-300 motion-reduce:transition-none',
          justAdded && 'cart-add-success border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-50',
        )}
        onClick={handleAddToCart}
      >
        {justAdded ? (
          <>
            <Check className="size-4 motion-safe:animate-in motion-safe:zoom-in" aria-hidden="true" />
            <span className="motion-safe:animate-in motion-safe:fade-in">¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="size-4" aria-hidden="true" />
            Añadir al carrito
          </>
        )}
      </Button>
      <Button
        type="button"
        className="min-h-11 flex-1 gap-2 bg-red-600 font-semibold hover:bg-red-500"
        aria-label={`Comprar ${cartInput.item.title} ahora`}
        onClick={handleBuyNow}
      >
        Comprar ahora
      </Button>
    </div>
  );
}
