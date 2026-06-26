import { useMemo, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';

import {
  AddToCartButton,
  adjustProductQuantity,
  formatOrderQuantityHint,
  getAddToCartLabel,
  hasOnRequestQuantity,
  isProductOutOfStock,
  ON_REQUEST_PRODUCT_BUTTON_CLASS,
} from '@/components/cart/add-to-cart-button';
import { ProductVolumeDiscountPromo } from '@/components/product/product-volume-discount-promo';
import { ProductDetailRolePriceLines } from '@/components/product-detail/product-detail-role-prices';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { BulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { cn, penToUsd } from '@/lib/utils';
import {
  computeEquipmentRentalEstimate,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import type { CartConfigurationLine } from '@/types/product';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPurchaseCardProps {
  product: Product;
  detail: ProductDetailViewModel;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  volumePricing: BulkDiscountPricing;
  purchaseActionsRef?: RefObject<HTMLDivElement | null>;
  equipmentConfiguration?: CartConfigurationLine;
  onQuoteGenerated?: (preview: QuotePdfPreview) => void;
  purchaseMode?: PurchaseMode;
  onPurchaseModeChange?: (mode: PurchaseMode) => void;
  rentalEstimate?: EquipmentRentalEstimate | null;
  maintenancePlanMonthlyPen?: number | null;
  preparationType?: SeminuevaPreparationType;
  preparationSurchargeUsd?: number;
  showRentalAction?: boolean;
  onRentalClick?: () => void;
  showMaintenancePlanAction?: boolean;
  onMaintenancePlanClick?: () => void;
}

export function ProductDetailPurchaseCard({
  product,
  detail,
  quantity,
  onQuantityChange,
  volumePricing,
  purchaseActionsRef,
  equipmentConfiguration,
  onQuoteGenerated,
  purchaseMode,
  onPurchaseModeChange,
  rentalEstimate = null,
  maintenancePlanMonthlyPen,
  preparationType,
  preparationSurchargeUsd = 0,
  showRentalAction = false,
  onRentalClick: _onRentalClick,
  showMaintenancePlanAction = false,
  onMaintenancePlanClick,
}: ProductDetailPurchaseCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const outOfStock = isProductOutOfStock(product);
  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const orderHint = formatOrderQuantityHint(product, quantity);
  const hasVolumeDiscount =
    volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const isRentMode = purchaseMode === 'rent' && detail.rentalPlans.length > 0;
  const isColorEquipment = useMemo(() => isColorPrinterEquipment(product), [product]);

  const fallbackRentalEstimate = useMemo(() => {
    if (!isRentMode) return null;
    return computeEquipmentRentalEstimate({
      monthlyPages: detail.rentalPlans[0]?.pagesPerMonth ?? 5000,
      equipmentQuantity: 1,
      termMonths: 12,
      equipmentBasePriceUsd: displayUsd,
      isColorEquipment,
      includePaper: false,
      includeOperator: false,
      includeLaptop: false,
      includeLaminator: false,
      includeGuillotine: false,
    });
  }, [detail.rentalPlans, displayUsd, isRentMode, isColorEquipment]);

  const activeRentalEstimate = rentalEstimate ?? fallbackRentalEstimate;

  const offerUnitUsd = volumePricing.unitUsd;
  const equipmentExtrasUsd = useMemo(
    () =>
      equipmentConfiguration
        ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
        : 0,
    [equipmentConfiguration],
  );
  const configuredUnitUsd = offerUnitUsd + equipmentExtrasUsd;
  const normalPriceUsd =
    detail.oldPricePen != null
      ? penToUsd(detail.oldPricePen)
      : detail.isOnOffer
        ? displayUsd
        : null;
  const showNormalPrice =
    normalPriceUsd != null && normalPriceUsd > offerUnitUsd + 0.001;

  const hasCustomUnitPrice =
    hasVolumeDiscount || preparationSurchargeUsd > 0;

  const cartAddOptions = useMemo(
    () => ({
      quantity,
      ...(hasCustomUnitPrice ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
      ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
      ...(preparationType === 'semirepotenciada' ? { preparationType } : {}),
    }),
    [
      quantity,
      hasCustomUnitPrice,
      volumePricing.unitUsd,
      equipmentConfiguration,
      preparationType,
    ],
  );

  const adjustQuantity = (delta: number) => {
    onQuantityChange(adjustProductQuantity(product, quantity, delta));
  };

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const addToCartLabel = getAddToCartLabel(product, 'default', quantity);
  const buyNowLabel = includesOnRequest ? 'Comprar a pedido' : 'Comprar ahora';

  const priceBlock = isRentMode && activeRentalEstimate ? (
    <div>
      <p className="text-xs font-semibold text-foreground">Total configurado</p>
      <p
        className="mt-0.5 text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        <DualPrice usd={penToUsd(activeRentalEstimate.estimatedMonthlyPen)} />
        <span className="ml-1 text-sm font-semibold text-muted-foreground">/ mes</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Plan {activeRentalEstimate.termMonths} meses · cuota variable{' '}
        <DualPrice
          usd={penToUsd(activeRentalEstimate.variableFeeMonthlyPen)}
          className="inline font-medium text-foreground"
        />
        {activeRentalEstimate.excessFeeMonthlyPen > 0 ? (
          <>
            {' '}
            (incl. excedentes{' '}
            <DualPrice
              usd={penToUsd(activeRentalEstimate.excessFeeMonthlyPen)}
              className="inline font-medium text-foreground"
            />
            )
          </>
        ) : null}
        {activeRentalEstimate.isColorEquipment ? (
          <>
            {' '}
            (negro{' '}
            <DualPrice
              usd={penToUsd(activeRentalEstimate.blackVariableMonthlyPen)}
              className="inline font-medium text-foreground"
            />
            {' + '}color{' '}
            <DualPrice
              usd={penToUsd(activeRentalEstimate.colorVariableMonthlyPen)}
              className="inline font-medium text-foreground"
            />
            )
          </>
        ) : null}
        {' + '}
        cuota fija{' '}
        <DualPrice
          usd={penToUsd(activeRentalEstimate.fixedFeeMonthlyPen)}
          className="inline font-medium text-foreground"
        />
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {activeRentalEstimate.equipmentQuantity} equipo
        {activeRentalEstimate.equipmentQuantity > 1 ? 's' : ''} ·{' '}
        {activeRentalEstimate.billablePages.toLocaleString('es-PE')} pág./mes · IGV incluido
      </p>
    </div>
  ) : (
      <div>
        <p className="text-xs font-semibold text-foreground">Oferta</p>
        <div className="mt-0.5" aria-live="polite" aria-atomic="true">
          <ProductDetailRolePriceLines
            product={product}
            quantity={quantity}
            fullPrices={fullPrices}
            bulkDiscountTiers={detail.bulkDiscountTiers}
            equipmentExtrasUsd={equipmentExtrasUsd}
            preparationSurchargeUsd={preparationSurchargeUsd}
          />
        </div>
      {quantity > 1 ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          <DualPrice usd={configuredUnitUsd} className="inline" /> por unidad · {quantity} ud.
        </p>
      ) : equipmentExtrasUsd > 0 ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Equipo <DualPrice usd={offerUnitUsd} className="inline" />
          {' + '}tóner <DualPrice usd={equipmentExtrasUsd} className="inline" />
        </p>
      ) : null}
      <p className="mt-0.5 text-xs text-muted-foreground">IGV incluido</p>
      {showNormalPrice ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Precio normal:{' '}
          <DualPrice
            usd={normalPriceUsd}
            strikethrough
            className="inline font-medium text-muted-foreground"
          />
        </p>
      ) : null}
    </div>
  );

  return (
    <aside
      ref={purchaseActionsRef}
      className="min-w-0 lg:sticky lg:top-4 lg:self-start"
      aria-labelledby="compra-producto-titulo"
    >
      <h2 id="compra-producto-titulo" className="sr-only">
        Comprar {product.name}
      </h2>

      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:p-5">
        {purchaseMode != null && onPurchaseModeChange ? (
          <ProductDetailPurchaseMode
            purchaseMode={purchaseMode}
            onPurchaseModeChange={onPurchaseModeChange}
            rentalPlans={detail.rentalPlans}
            maintenancePlanMonthlyPen={maintenancePlanMonthlyPen ?? null}
            showMaintenancePlan={showMaintenancePlanAction && Boolean(onMaintenancePlanClick)}
            {...(onMaintenancePlanClick ? { onMaintenancePlanClick } : {})}
            className="mb-3"
          />
        ) : null}

        {priceBlock}

        {detail.bulkDiscountTiers.length > 0 && !isRentMode ? (
          <ProductVolumeDiscountPromo
            product={product}
            quantity={quantity}
            tiers={detail.bulkDiscountTiers}
            basePriceUsd={displayUsd + preparationSurchargeUsd}
            floorPriceUsd={fullPrices.tecnico}
            className="mt-4"
          />
        ) : null}

        <div className="mt-4 flex items-stretch gap-2.5">
          <div
            className="flex h-11 w-[7.75rem] shrink-0 items-stretch overflow-hidden rounded-lg border border-border bg-background"
            role="group"
            aria-label="Cantidad"
          >
            <button
              type="button"
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
              className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              className="flex w-8 items-center justify-center border-x border-border text-sm font-semibold text-foreground"
              aria-live="polite"
              aria-atomic="true"
              title={orderHint ?? undefined}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => adjustQuantity(1)}
              aria-label="Aumentar cantidad"
              className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <AddToCartButton
            product={product}
            addOptions={cartAddOptions}
            size="lg"
            className={cn(
              'h-11 min-h-11 min-w-0 flex-1 gap-2 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50',
              includesOnRequest
                ? ON_REQUEST_PRODUCT_BUTTON_CLASS
                : 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
            )}
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            {addToCartLabel}
          </AddToCartButton>
        </div>

        <div className="mt-2.5 flex flex-col gap-2.5">
          <div
            className={cn(
              'flex gap-2.5',
              (showRentalAction || showMaintenancePlanAction) && 'flex-col sm:flex-row',
            )}
          >
            <Button
              type="button"
              size="lg"
              onClick={handleBuyNow}
              className={cn(
                'h-11 min-h-11 gap-2 rounded-lg border-0 bg-foreground text-sm font-semibold text-white hover:bg-foreground/90 focus-visible:ring-foreground',
                (showRentalAction || showMaintenancePlanAction) && 'min-w-0 flex-1',
                !showRentalAction && !showMaintenancePlanAction && 'w-full',
              )}
            >
              <Zap className="size-4 shrink-0" aria-hidden="true" />
              {buyNowLabel}
            </Button>

            {showMaintenancePlanAction && onMaintenancePlanClick ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onMaintenancePlanClick}
                className="h-11 min-h-11 min-w-0 flex-1 gap-2 rounded-lg border-border px-2.5 text-xs font-semibold leading-tight sm:px-4 sm:text-sm"
              >
                Solicitar Plan de Mantenimiento
              </Button>
            ) : null}
          </div>

          {includesOnRequest ? (
            <p className="text-center text-xs text-muted-foreground">
              {orderHint}
              {outOfStock
                ? ' · confirmamos plazo al procesar tu pedido.'
                : ' · el excedente se confirma al procesar tu pedido.'}
            </p>
          ) : null}

          <ProductWhatsAppButton
            stopPropagation={false}
            accent="solid"
            label="Comprar por WhatsApp"
            quantity={quantity}
            product={{
              id: product.id,
              name: product.name,
              priceUsd: offerUnitUsd,
              category: product.category,
              brand: product.brand ?? null,
            }}
            quoteContext={{
              product,
              displayTitle: detail.displayTitle,
              sku: detail.sku,
              brandLabel: detail.brandLabel,
              categoryLabel: detail.categoryLabel,
              heroSpecBullets: detail.heroSpecBullets,
              heroLead: detail.heroLead,
              heroDescription: detail.heroDescription,
              quantity,
              ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
            }}
            {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
            className={cn(
              'h-11 min-h-11 w-full gap-2 rounded-lg border-0 bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:ring-emerald-600',
            )}
          />
        </div>
      </div>
    </aside>
  );
}
