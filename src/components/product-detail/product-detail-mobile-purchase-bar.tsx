import { useEffect, useState, type RefObject } from 'react';
import { ShoppingCart } from 'lucide-react';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailMobilePurchaseBarProps {
  product: Product;
  quantity: number;
  displayUsd: number;
  outOfStock: boolean;
  purchaseActionsRef: RefObject<HTMLDivElement | null>;
}

export function ProductDetailMobilePurchaseBar({
  product,
  quantity,
  displayUsd,
  outOfStock,
  purchaseActionsRef,
}: ProductDetailMobilePurchaseBarProps) {
  const { displayCurrency } = useDisplayCurrency();
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);

  useEffect(() => {
    const target = purchaseActionsRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroActionsVisible(entry?.isIntersecting ?? false);
      },
      { root: null, rootMargin: '0px', threshold: 0.15 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [purchaseActionsRef]);

  const showBar = !heroActionsVisible && !outOfStock;

  const priceLabel =
    displayCurrency === 'USD'
      ? formatUsd(displayUsd)
      : displayCurrency === 'PEN'
        ? formatPenFromUsdPrecise(displayUsd)
        : `${formatUsd(displayUsd)} · ${formatPenFromUsdPrecise(displayUsd)}`;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-transform duration-200 lg:hidden',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        showBar ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!showBar}
    >
      <div className="container flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold leading-tight text-red-600">{priceLabel}</p>
          <p className="text-xs text-muted-foreground">Incl. IGV</p>
        </div>
        <AddToCartButton
          product={product}
          addOptions={{ quantity }}
          className="min-h-11 shrink-0 gap-1.5 rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-500"
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
          Añadir al carrito
        </AddToCartButton>
      </div>
    </div>
  );
}
