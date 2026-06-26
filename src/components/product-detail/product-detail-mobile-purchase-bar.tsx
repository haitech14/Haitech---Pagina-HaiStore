import { useEffect, useMemo, useState, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, ShoppingCart, Zap } from 'lucide-react';

import { AddToCartButton, getAddToCartLabel, hasOnRequestQuantity } from '@/components/cart/add-to-cart-button';
import { ProductCardImage } from '@/components/product/product-card-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatVolumeQuantityPromoMessage } from '@/lib/display-price';
import {
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
  type BulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { buildProductCardImageCandidates } from '@/lib/product-card-images';
import { productPath } from '@/lib/product-path';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import {
  MOBILE_PURCHASE_BAR_HEIGHT_PX,
  useSetMobileBottomInset,
} from '@/context/mobile-bottom-inset-context';
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
  preparationType?: SeminuevaPreparationType;
  preparationSurchargeUsd?: number;
  showRentalAction?: boolean;
  onRentalClick?: () => void;
  showMaintenancePlanAction?: boolean;
  onMaintenancePlanClick?: () => void;
}

function ProductPurchaseBarThumbnail({ product }: { product: Product }) {
  const detailHref = productPath(product);
  const imageCandidates = useMemo(() => buildProductCardImageCandidates(product), [product]);
  const [imageIndex, setImageIndex] = useState(0);
  const [imagesExhausted, setImagesExhausted] = useState(false);
  const src = imagesExhausted ? null : (imageCandidates[imageIndex] ?? null);

  useEffect(() => {
    setImageIndex(0);
    setImagesExhausted(false);
  }, [imageCandidates.join('|')]);

  const handleError = () => {
    if (imageIndex + 1 < imageCandidates.length) {
      setImageIndex((current) => current + 1);
      return;
    }
    setImagesExhausted(true);
  };

  return (
    <Link
      to={detailHref}
      className="relative block size-14 shrink-0 overflow-hidden rounded-md border border-border/70 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 sm:size-16"
      aria-label={`Ver ficha de ${product.name}`}
    >
      {src ? (
        <ProductCardImage
          src={src}
          alt=""
          className="size-full object-contain p-1"
          loading="eager"
          onError={handleError}
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-muted/30">
          <ImageOff className="size-5 text-muted-foreground/70" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}

export function ProductDetailMobilePurchaseBar({
  product,
  quantity,
  volumePricing,
  basePriceUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
  outOfStock: _outOfStock,
  purchaseActionsRef,
  equipmentConfiguration,
  preparationType,
  preparationSurchargeUsd = 0,
  showRentalAction: _showRentalAction = false,
  onRentalClick: _onRentalClick,
  showMaintenancePlanAction = false,
  onMaintenancePlanClick,
}: ProductDetailMobilePurchaseBarProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
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

  const showBar = !heroActionsVisible;
  useSetMobileBottomInset(showBar ? MOBILE_PURCHASE_BAR_HEIGHT_PX : 0);
  const hasVolumeDiscount = volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const hasCustomUnitPrice = hasVolumeDiscount || preparationSurchargeUsd > 0;
  const equipmentExtrasUsd = equipmentConfiguration
    ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
    : 0;
  const cartAddOptions = {
    quantity,
    ...(hasCustomUnitPrice ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
    ...(preparationType === 'semirepotenciada' ? { preparationType } : {}),
  };

  const { displayCurrency } = useDisplayCurrency();

  const savingsMessage = useMemo(() => {
    if (bulkDiscountTiers.length === 0) {
      return quantity > 1 ? `Total ${quantity} ud.` : null;
    }
    const hint = resolveBulkDiscountSavingsHint(quantity, basePriceUsd, bulkDiscountTiers, {
      floorPriceUsd,
    });
    if (!hint) return quantity > 1 ? `Total ${quantity} ud.` : null;

    const pricing = resolveBulkDiscountPricing(
      hint.targetQuantity,
      basePriceUsd,
      bulkDiscountTiers,
      { floorPriceUsd },
    );
    return formatVolumeQuantityPromoMessage(
      hint.targetQuantity,
      pricing.unitUsd,
      displayCurrency,
    );
  }, [bulkDiscountTiers, quantity, basePriceUsd, floorPriceUsd, displayCurrency]);

  const totalUsd =
    (quantity > 1 || hasVolumeDiscount ? volumePricing.totalUsd : volumePricing.unitUsd) +
    equipmentExtrasUsd * quantity;

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const buyNowLabel = includesOnRequest ? 'Pedido' : 'Comprar';
  const addToCartLabel = getAddToCartLabel(product, 'short', quantity);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-transform duration-200',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        showBar ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!showBar}
    >
      <div className="container flex items-center gap-2.5 sm:gap-3">
        <ProductPurchaseBarThumbnail product={product} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground sm:text-sm">{product.name}</p>
          <p className="truncate text-base font-bold leading-tight text-foreground sm:text-lg lg:text-xl">
            <DualPrice usd={totalUsd} />
          </p>
          {savingsMessage ? (
            <p className="truncate text-xs text-muted-foreground">{savingsMessage}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-stretch gap-2">
          <AddToCartButton
            product={product}
            addOptions={cartAddOptions}
            className={cn(
              'min-h-11 gap-1.5 rounded-md px-3 text-sm font-bold lg:px-4',
              includesOnRequest
                ? 'border border-foreground bg-foreground text-background hover:bg-foreground/90'
                : 'bg-red-600 text-white hover:bg-red-500',
            )}
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:inline lg:inline">{addToCartLabel}</span>
          </AddToCartButton>
          <Button
            type="button"
            onClick={handleBuyNow}
            className="min-h-11 gap-1 rounded-md bg-[#0f1f3d] px-3 text-sm font-bold text-white hover:bg-[#0f1f3d]/90 lg:px-4"
            aria-label="Comprar ahora"
          >
            <Zap className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-[400px]:inline">{buyNowLabel}</span>
          </Button>
          {showMaintenancePlanAction && onMaintenancePlanClick ? (
            <Button
              type="button"
              variant="outline"
              onClick={onMaintenancePlanClick}
              className="min-h-11 max-w-[7.5rem] rounded-md px-2 text-[0.65rem] font-bold leading-tight sm:max-w-none sm:px-2.5 sm:text-xs"
              aria-label="Solicitar plan de mantenimiento"
            >
              <span className="line-clamp-2 text-center sm:line-clamp-none">
                Plan mantenimiento
              </span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
