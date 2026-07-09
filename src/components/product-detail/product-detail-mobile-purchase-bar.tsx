import { useEffect, useMemo, useState, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react';

import { hasOnRequestQuantity } from '@/components/cart/add-to-cart-button';
import {
  clampPurchaseQuantity,
  PURCHASE_QUANTITY_MAX,
} from '@/components/product-detail/product-detail-purchase-quantity';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { ProductCardImage } from '@/components/product/product-card-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { PurchaseSidebarRolePrices } from '@/components/product-detail/product-detail-role-prices';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatVolumePerUnitPromoMessage } from '@/lib/display-price';
import {
  resolveBulkDiscountPricing,
  resolveBulkDiscountSavingsHint,
  type BulkDiscountPricing,
} from '@/lib/bulk-discount-tiers';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { ensureFullPrices } from '@/lib/roles';
import { buildProductCardImageCandidates } from '@/lib/product-card-images';
import { productPath } from '@/lib/product-path';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import { cn, penToUsd } from '@/lib/utils';
import {
  MOBILE_PURCHASE_BAR_HEIGHT_PX,
  useMobileBottomNavInset,
  useSetMobileBottomInset,
} from '@/context/mobile-bottom-inset-context';
import type { CartConfigurationLine } from '@/types/product';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailMobilePurchaseBarProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  volumePricing: BulkDiscountPricing;
  basePriceUsd: number;
  catalogPublicUsd: number;
  bulkDiscountTiers: BulkDiscountTier[];
  floorPriceUsd?: number;
  outOfStock: boolean;
  purchaseActionsRef: RefObject<HTMLDivElement | null>;
  equipmentConfiguration?: CartConfigurationLine;
  preparationType?: SeminuevaPreparationType;
  preparationSurchargeUsd?: number;
  oldPricePen?: number | null;
  isOnOffer?: boolean;
  discountPercent?: number | null;
  showRentalAction?: boolean;
  onRentalClick?: () => void;
  showMaintenancePlanAction?: boolean;
  onMaintenancePlanClick?: () => void;
}

/** Muestra la barra solo cuando el usuario ya pasó la sección de compra (quedó arriba del viewport). */
function useScrollPastElement(
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  observeKey: string,
) {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setScrolledPast(false);
      return;
    }

    let observer: IntersectionObserver | undefined;
    let disposed = false;

    const updateFromEntry = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setScrolledPast(false);
        return;
      }
      setScrolledPast(entry.boundingClientRect.bottom <= 0);
    };

    const attach = () => {
      const target = targetRef.current;
      if (!target || disposed) return false;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry) updateFromEntry(entry);
        },
        { threshold: [0, 0.01, 1] },
      );
      observer.observe(target);
      return true;
    };

    if (!attach()) {
      const raf = requestAnimationFrame(() => attach());
      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        observer?.disconnect();
      };
    }

    return () => {
      disposed = true;
      observer?.disconnect();
    };
  }, [targetRef, enabled, observeKey]);

  return scrolledPast;
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
  onQuantityChange,
  volumePricing,
  basePriceUsd,
  catalogPublicUsd,
  bulkDiscountTiers,
  floorPriceUsd = 0,
  outOfStock: _outOfStock,
  purchaseActionsRef,
  equipmentConfiguration,
  preparationType,
  preparationSurchargeUsd = 0,
  oldPricePen = null,
  isOnOffer = false,
  discountPercent = null,
  showRentalAction: _showRentalAction = false,
  onRentalClick: _onRentalClick,
  showMaintenancePlanAction = false,
  onMaintenancePlanClick,
}: ProductDetailMobilePurchaseBarProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const bottomNavInset = useMobileBottomNavInset();
  const isMobileLayout = useMediaQuery('(max-width: 1023px)');
  const showBar = useScrollPastElement(purchaseActionsRef, isMobileLayout, product.id);
  useSetMobileBottomInset(showBar ? MOBILE_PURCHASE_BAR_HEIGHT_PX : 0);
  const hasVolumeDiscount = volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const hasCustomUnitPrice = hasVolumeDiscount || preparationSurchargeUsd > 0;
  const equipmentExtrasUsd = equipmentConfiguration
    ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
    : 0;
  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const cartAddOptions = {
    quantity,
    ...(hasCustomUnitPrice ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
    ...(preparationType && preparationType !== 'acondicionado' ? { preparationType } : {}),
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
    const unitUsd = pricing.unitUsd + equipmentExtrasUsd;
    const promo = formatVolumePerUnitPromoMessage(
      hint.targetQuantity,
      unitUsd,
      displayCurrency,
    );
    return hint.isActive ? `Volumen activo · ${promo}` : promo;
  }, [
    bulkDiscountTiers,
    quantity,
    basePriceUsd,
    floorPriceUsd,
    equipmentExtrasUsd,
    displayCurrency,
  ]);

  const offerUnitUsd = volumePricing.unitUsd;
  const normalPriceUsd =
    oldPricePen != null
      ? penToUsd(oldPricePen)
      : isOnOffer
        ? catalogPublicUsd
        : null;
  const showNormalPrice =
    normalPriceUsd != null && normalPriceUsd > offerUnitUsd + 0.001;
  const compareUnitUsd =
    showNormalPrice && normalPriceUsd
      ? normalPriceUsd
      : oldPricePen != null
        ? penToUsd(oldPricePen)
        : null;
  const showComparePrice =
    (showNormalPrice && normalPriceUsd != null) || oldPricePen != null;
  const displayDiscountPercent =
    discountPercent ??
    (showNormalPrice && normalPriceUsd
      ? Math.round(((normalPriceUsd - offerUnitUsd) / normalPriceUsd) * 100)
      : null);

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const buyNowLabel = includesOnRequest ? 'Reservar' : 'Comprar Ahora';

  if (!isMobileLayout) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 left-0 z-40 w-full border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-[transform,opacity] duration-300 ease-out lg:hidden',
        bottomNavInset > 0 ? 'pb-3' : 'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        showBar
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0',
      )}
      style={bottomNavInset > 0 ? { bottom: `${bottomNavInset}px` } : undefined}
      aria-hidden={!showBar}
      role="complementary"
      aria-label="Acciones rápidas de compra"
    >
      <div className="container flex items-center gap-2.5 sm:gap-3">
        <ProductPurchaseBarThumbnail product={product} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground sm:text-sm">{product.name}</p>
          {showComparePrice && compareUnitUsd != null ? (
            <p className="truncate text-xs text-muted-foreground">
              Antes:{' '}
              <DualPrice
                usd={compareUnitUsd * quantity}
                strikethrough
                alwaysBoth
                className="inline text-xs"
              />
            </p>
          ) : null}
          <div className="min-w-0 truncate" aria-live="polite" aria-atomic="true">
            <PurchaseSidebarRolePrices
              product={product}
              quantity={quantity}
              fullPrices={fullPrices}
              bulkDiscountTiers={bulkDiscountTiers}
              equipmentExtrasUsd={equipmentExtrasUsd}
              preparationSurchargeUsd={preparationSurchargeUsd}
              discountPercent={displayDiscountPercent}
              compact
            />
          </div>
          {savingsMessage ? (
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-semibold text-neutral-500">Compra por Volumen: </span>
              {savingsMessage}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <div className="flex items-end gap-1.5">
            <div
              className="inline-flex w-[6.5rem] shrink-0 items-center rounded-md border border-border bg-background"
              role="group"
              aria-label={`Cantidad: ${quantity}`}
            >
              <button
                type="button"
                onClick={() => onQuantityChange(clampPurchaseQuantity(quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Disminuir cantidad"
                className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted/40 disabled:opacity-40"
              >
                <Minus className="size-3.5" aria-hidden="true" />
              </button>
              <span className="min-w-6 flex-1 text-center text-xs font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(clampPurchaseQuantity(quantity + 1))}
                disabled={quantity >= PURCHASE_QUANTITY_MAX}
                aria-label="Aumentar cantidad"
                className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted/40 disabled:opacity-40"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <Button
              type="button"
              onClick={handleBuyNow}
              className={cn(
                'min-h-10 flex-1 gap-1.5 rounded-md px-3 text-sm font-bold lg:px-4',
                includesOnRequest
                  ? 'border border-foreground bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
              )}
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate text-xs sm:text-sm">{buyNowLabel}</span>
            </Button>
            <ProductWhatsAppButton
              className="size-10 shrink-0 rounded-md border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              quantity={quantity}
              product={{
                id: product.id,
                name: product.name,
                priceUsd: volumePricing.unitUsd,
                category: product.category,
                brand: product.brand ?? null,
              }}
            />
          </div>
          {showMaintenancePlanAction && onMaintenancePlanClick ? (
            <Button
              type="button"
              variant="outline"
              onClick={onMaintenancePlanClick}
              className="min-h-9 w-full rounded-md px-2 text-[0.65rem] font-bold leading-tight sm:text-xs"
              aria-label="Solicitar plan de mantenimiento"
            >
              Plan mantenimiento
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
