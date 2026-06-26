import { useMemo, useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  AddToCartButton,
  adjustProductQuantity,
  formatOrderQuantityHint,
  getAddToCartLabel,
  hasOnRequestQuantity,
  isProductOutOfStock,
  ON_REQUEST_PRODUCT_BUTTON_CLASS,
} from '@/components/cart/add-to-cart-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { DEFAULT_BULK_DISCOUNT_TIERS, resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { ensureFullPrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductQuickViewActionsProps {
  product: Product;
  detailHref: string;
  onClose: () => void;
  className?: string;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export function ProductQuickViewActions({
  product,
  detailHref,
  onClose,
  className,
  quantity: quantityProp,
  onQuantityChange,
}: ProductQuickViewActionsProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const settingsQuery = useCompanySettings();
  const tiers = settingsQuery.data?.bulkDiscountTiers ?? DEFAULT_BULK_DISCOUNT_TIERS;
  const [internalQuantity, setInternalQuantity] = useState(1);
  const quantity = quantityProp ?? internalQuantity;
  const setQuantity = onQuantityChange ?? setInternalQuantity;

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );

  const volumePricing = useMemo(
    () =>
      resolveBulkDiscountPricing(quantity, fullPrices.public, tiers, {
        floorPriceUsd: fullPrices.tecnico,
      }),
    [quantity, fullPrices.public, fullPrices.tecnico, tiers],
  );

  const hasVolumeDiscount =
    volumePricing.tier != null && volumePricing.savingsUsd > 0.001;

  const cartAddOptions = useMemo(
    () => ({
      quantity,
      ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    }),
    [quantity, hasVolumeDiscount, volumePricing.unitUsd],
  );
  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const orderHint = formatOrderQuantityHint(product, quantity);
  const outOfStock = isProductOutOfStock(product);
  const stockAvailability = outOfStock
    ? { label: 'A pedido', tone: 'unavailable' as const }
    : product.stock <= 3
      ? { label: `Disponible: ${product.stock} unidad${product.stock === 1 ? '' : 'es'}`, tone: 'low' as const }
      : { label: `Disponible: ${product.stock} unidades`, tone: 'available' as const };

  const adjustQuantity = (delta: number) => {
    setQuantity(adjustProductQuantity(product, quantity, delta));
  };

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    onClose();
    navigate('/checkout');
  };

  const buyNowLabel = includesOnRequest ? 'Comprar a pedido' : 'Comprar ahora';
  const addToCartLabel = getAddToCartLabel(product, 'default', quantity);

  return (
    <div className={cn('space-y-3', className)}>
      <p
        className={cn(
          'flex items-center gap-2 text-sm font-medium',
          stockAvailability.tone === 'available' && 'text-emerald-700',
          stockAvailability.tone === 'low' && 'text-amber-800',
          stockAvailability.tone === 'unavailable' && 'text-amber-950',
        )}
        role="status"
      >
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold',
            stockAvailability.tone === 'available' && 'bg-emerald-100 text-emerald-600',
            stockAvailability.tone === 'low' && 'bg-amber-100 text-amber-700',
            stockAvailability.tone === 'unavailable' && 'border border-amber-400 bg-amber-100',
          )}
          aria-hidden="true"
        >
          {stockAvailability.tone === 'unavailable' ? '!' : '✓'}
        </span>
        {stockAvailability.label}
      </p>

      <div
        className="inline-flex items-center rounded-md border border-border bg-background"
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
          className="flex size-11 items-center justify-center text-muted-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span
          className="min-w-8 text-center text-sm font-semibold tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjustQuantity(1)}
          aria-label="Aumentar cantidad"
          className="flex size-11 items-center justify-center text-muted-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className={cn(
            'min-h-11 w-full gap-2 bg-red-600 text-base font-semibold hover:bg-red-500',
            includesOnRequest && ON_REQUEST_PRODUCT_BUTTON_CLASS,
          )}
          onClick={handleBuyNow}
        >
          {!includesOnRequest ? <ShoppingCart className="size-4 shrink-0" aria-hidden="true" /> : null}
          {buyNowLabel}
        </Button>

        <AddToCartButton
          product={product}
          addOptions={cartAddOptions}
          className={cn(
            'min-h-11 w-full gap-2 border-red-600 bg-background text-base font-semibold text-red-600 hover:bg-red-50',
            includesOnRequest
              ? ON_REQUEST_PRODUCT_BUTTON_CLASS
              : 'border bg-background hover:text-red-600',
          )}
          variant="outline"
        >
          {!includesOnRequest ? <ShoppingCart className="size-4 shrink-0" aria-hidden="true" /> : null}
          {addToCartLabel}
        </AddToCartButton>

        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full gap-2 text-base font-semibold"
          asChild
        >
          <Link to={detailHref} onClick={onClose}>
            Ver ficha completa
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
