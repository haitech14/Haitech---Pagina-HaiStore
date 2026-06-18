import { useEffect, useMemo, useState, type RefObject } from 'react';
import { ShoppingCart } from 'lucide-react';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  resolveBulkDiscountSavingsHint,
  type BulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailMobilePurchaseBarProps {
  product: Product;
  quantity: number;
  volumePricing: BulkDiscountPricing;
  basePriceUsd: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd?: number;
  outOfStock: boolean;
  purchaseActionsRef: RefObject<HTMLDivElement | null>;
}

export function ProductDetailMobilePurchaseBar({
  product,
  quantity,
  volumePricing,
  basePriceUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
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
  const hasVolumeDiscount = volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const cartAddOptions = {
    quantity,
    ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
  };

  const savingsMessage = useMemo(() => {
    if (bulkDiscountTiers.length === 0) {
      return quantity > 1 ? `Total ${quantity} ud.` : null;
    }
    const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, bulkDiscountTiers, {
      floorPriceUsd,
    });
    if (!hint) return quantity > 1 ? `Total ${quantity} ud.` : null;
    const amount = formatPenFromUsdPrecise(hint.savingsUsd);
    return hint.isActive
      ? `Ahorro: ahorras ${amount} con ${hint.targetQuantity} ud.`
      : `Ahorro: si llevas ${hint.targetQuantity} ud. puedes ahorrar ${amount}`;
  }, [bulkDiscountTiers, quantity, basePriceUsd, floorPriceUsd]);

  const priceLabel =
    displayCurrency === 'USD'
      ? quantity > 1 || hasVolumeDiscount
        ? formatUsd(volumePricing.totalUsd)
        : formatUsd(volumePricing.unitUsd)
      : displayCurrency === 'PEN'
        ? quantity > 1 || hasVolumeDiscount
          ? formatPenFromUsdPrecise(volumePricing.totalUsd)
          : formatPenFromUsdPrecise(volumePricing.unitUsd)
        : quantity > 1 || hasVolumeDiscount
          ? `${formatUsd(volumePricing.totalUsd)} · ${formatPenFromUsdPrecise(volumePricing.totalUsd)}`
          : `${formatUsd(volumePricing.unitUsd)} · ${formatPenFromUsdPrecise(volumePricing.unitUsd)}`;

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
          {savingsMessage ? (
            <p className="truncate text-xs text-muted-foreground">{savingsMessage}</p>
          ) : null}
        </div>
        <AddToCartButton
          product={product}
          addOptions={cartAddOptions}
          className="min-h-11 shrink-0 gap-1.5 rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-500"
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
          Añadir al carrito
        </AddToCartButton>
      </div>
    </div>
  );
}
