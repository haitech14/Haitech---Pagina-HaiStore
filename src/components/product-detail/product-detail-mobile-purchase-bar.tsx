import { useEffect, useMemo, useState, type RefObject } from 'react';
import { ShoppingCart } from 'lucide-react';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { formatOfferQuantitySavingsMessageFromUsd } from '@/lib/display-price';
import {
  resolveBulkDiscountSavingsHint,
  type BulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { cn } from '@/lib/utils';
import type { CartConfigurationLine } from '@/types/product';
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
  equipmentConfiguration?: CartConfigurationLine;
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
  equipmentConfiguration,
}: ProductDetailMobilePurchaseBarProps) {
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
  const equipmentExtrasUsd = equipmentConfiguration
    ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
    : 0;
  const cartAddOptions = {
    quantity,
    ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
  };

  const savingsMessage = useMemo(() => {
    if (bulkDiscountTiers.length === 0) {
      return quantity > 1 ? `Total ${quantity} ud.` : null;
    }
    const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, bulkDiscountTiers, {
      floorPriceUsd,
    });
    if (!hint) return quantity > 1 ? `Total ${quantity} ud.` : null;
    return formatOfferQuantitySavingsMessageFromUsd(hint.targetQuantity, hint.savingsUsd);
  }, [bulkDiscountTiers, quantity, basePriceUsd, floorPriceUsd]);

  const totalUsd =
    (quantity > 1 || hasVolumeDiscount ? volumePricing.totalUsd : volumePricing.unitUsd) +
    equipmentExtrasUsd * quantity;

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
          <p className="truncate text-lg font-bold leading-tight text-red-600">
            <DualPrice usd={totalUsd} />
          </p>
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
