import { useMemo, type Ref, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, ShoppingCart } from 'lucide-react';

import {
  formatOrderQuantityHint,
  hasOnRequestQuantity,
} from '@/components/cart/add-to-cart-button';
import { PurchaseSidebarRolePrices } from '@/components/product-detail/product-detail-role-prices';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { BulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { calculateInstallmentPreview } from '@/lib/checkout-totals';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { cn, formatPenFromUsd, penToUsd } from '@/lib/utils';
import { ProductDetailRentalConfigurator,
  computeEquipmentRentalEstimate,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { SeminuevaPreparationPriceRows } from '@/components/product-detail/product-detail-seminueva-preparation-prices';
import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import { ProductDetailPurchaseQuantity } from '@/components/product-detail/product-detail-purchase-quantity';
import { ProductDetailPurchasePaymentShipping } from '@/components/product-detail/product-detail-purchase-payment-shipping';
import { ProductDetailPurchaseCardTrust } from '@/components/product-detail/product-detail-purchase-card-trust';
import { ProductDetailVolumePurchaseHint } from '@/components/product-detail/product-detail-volume-purchase-hint';
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
  showSeminuevaPreparationPrices?: boolean;
  showRentalAction?: boolean;
  onRentalClick?: () => void;
  showMaintenancePlanAction?: boolean;
  onMaintenancePlanClick?: () => void;
  onQuoteClick?: () => void;
  showRentalTab?: boolean;
  equipmentBasePriceUsd?: number;
  onRentalEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  rentalConfiguratorRef?: Ref<HTMLDivElement>;
  /** Slot para «Complementa tu compra» (sidebar mockup). */
  complementaSlot?: React.ReactNode;
  layout?: 'default' | 'mockup';
  outOfStock?: boolean;
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
  showSeminuevaPreparationPrices = false,
  showRentalAction = false,
  onRentalClick,
  showMaintenancePlanAction = false,
  onMaintenancePlanClick,
  onQuoteClick,
  showRentalTab = false,
  equipmentBasePriceUsd,
  onRentalEstimateChange,
  rentalConfiguratorRef,
  complementaSlot,
  layout = 'default',
  outOfStock = false,
}: ProductDetailPurchaseCardProps) {
  const isMockupLayout = layout === 'mockup';
  const isLaptopMockup = isMockupLayout && detail.isLaptopProduct;
  const { addItem } = useCart();
  const navigate = useNavigate();

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const publicUnitBaseUsd = displayUsd + preparationSurchargeUsd;
  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const orderHint = formatOrderQuantityHint(product, quantity);
  const hasVolumeDiscount =
    volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const isRentMode = purchaseMode === 'rent' && detail.rentalPlans.length > 0;
  const isColorEquipment = useMemo(() => isColorPrinterEquipment(product), [product]);

  const fallbackRentalEstimate = useMemo(() => {
    if (!isRentMode) return null;
    const plan = detail.rentalPlans[0];
    const pages = plan?.pagesPerMonth ?? 5000;
    return computeEquipmentRentalEstimate({
      planMonthlyPricePen: plan?.monthlyPricePen ?? 499,
      includedPages: pages,
      monthlyPages: pages,
      equipmentQuantity: 1,
      termMonths: 12,
      equipmentBasePriceUsd: displayUsd,
      isColorEquipment,
      includePaper: false,
      includeOperator: false,
      includeLaptop: false,
      includeLaminator: false,
      includeGuillotine: false,
      includeResidentTech: false,
      includeSpiralBinder: false,
      includeRingBinder: false,
    });
  }, [detail.rentalPlans, displayUsd, isRentMode, isColorEquipment]);

  const activeRentalEstimate = rentalEstimate ?? fallbackRentalEstimate;

  const quoteButton = onQuoteClick ? (
    <Button
      type="button"
      variant="outline"
      onClick={onQuoteClick}
      className="mt-3 h-10 min-h-10 w-full gap-1.5 rounded-lg border-neutral-300 text-sm font-semibold text-[#0f1f3d] hover:bg-neutral-50"
    >
      <FileText className="size-4 shrink-0" aria-hidden="true" />
      {isRentMode ? 'Descargar propuesta PDF' : 'Generar cotización'}
    </Button>
  ) : null;

  const offerUnitUsd = volumePricing.unitUsd;
  const equipmentExtrasUsd = useMemo(
    () =>
      equipmentConfiguration
        ? computeEquipmentExtrasUsd(equipmentConfiguration.options)
        : 0,
    [equipmentConfiguration],
  );
  const configuredUnitUsd = offerUnitUsd + equipmentExtrasUsd;

  const hasCustomUnitPrice =
    hasVolumeDiscount || preparationSurchargeUsd > 0;

  const cartAddOptions = useMemo(
    () => ({
      quantity,
      ...(hasCustomUnitPrice ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
      ...(equipmentConfiguration != null ? { configuration: equipmentConfiguration } : {}),
      ...(preparationType && preparationType !== 'acondicionado' ? { preparationType } : {}),
    }),
    [
      quantity,
      hasCustomUnitPrice,
      volumePricing.unitUsd,
      equipmentConfiguration,
      preparationType,
    ],
  );

  const handleAddToCart = () => {
    addItem(product, { ...cartAddOptions, openDrawer: true });
  };

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const buyNowLabel = includesOnRequest ? 'Reservar ahora' : 'Comprar ahora';
  const addToCartLabel = includesOnRequest ? 'Solicitar disponibilidad' : 'Agregar al carrito';
  const installmentPreview = useMemo(
    () => calculateInstallmentPreview(configuredUnitUsd * quantity),
    [configuredUnitUsd, quantity],
  );

  const displayDiscountPercent =
    detail.discountPercent ??
    (detail.isOnOffer && detail.oldPricePen != null && offerUnitUsd > 0
      ? Math.round(
          ((penToUsd(detail.oldPricePen) - offerUnitUsd) / penToUsd(detail.oldPricePen)) * 100,
        )
      : null);

  const buyPriceBlock = (
    <div aria-live="polite" aria-atomic="true">
      {showSeminuevaPreparationPrices && preparationType ? (
        <SeminuevaPreparationPriceRows
          product={product}
          catalogPublicUsd={displayUsd}
          preparationType={preparationType}
          quantity={quantity}
          bulkDiscountTiers={detail.bulkDiscountTiers}
          floorPriceUsd={fullPrices.tecnico}
          equipmentExtrasUsd={equipmentExtrasUsd}
          className="mb-3"
        />
      ) : (
        <PurchaseSidebarRolePrices
          variant="buy-sidebar"
          product={product}
          quantity={quantity}
          fullPrices={fullPrices}
          bulkDiscountTiers={detail.bulkDiscountTiers}
          equipmentExtrasUsd={equipmentExtrasUsd}
          preparationSurchargeUsd={preparationSurchargeUsd}
          oldPricePen={detail.oldPricePen}
          isOnOffer={detail.isOnOffer}
          discountPercent={detail.discountPercent}
          catalogPublicUsd={displayUsd}
          offerUnitUsd={offerUnitUsd}
          showDiscountBadge={!isMockupLayout}
          showAdminPurchaseLine={isMockupLayout}
          showOfferBreakdown={isLaptopMockup}
        />
      )}
    </div>
  );

  const showMockupBuyLayout = !isRentMode;

  const mockupPromoHeader =
    isMockupLayout && showMockupBuyLayout ? (
      isLaptopMockup ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[0.6875rem] font-semibold',
              outOfStock ? 'bg-neutral-100 text-neutral-600' : 'bg-emerald-50 text-emerald-700',
            )}
          >
            {outOfStock ? 'Consultar stock' : 'En stock'}
          </span>
          <span className="rounded bg-pink-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-pink-700">
            Exclusivo online
          </span>
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between gap-2">
          {displayDiscountPercent != null && displayDiscountPercent > 0 ? (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[0.6875rem] font-bold text-white">
              {displayDiscountPercent}% OFF
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              outOfStock ? 'text-neutral-500' : 'text-emerald-600',
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full',
                outOfStock ? 'bg-neutral-400' : 'bg-emerald-500',
              )}
              aria-hidden="true"
            />
            {outOfStock ? 'Consultar stock' : 'Stock disponible'}
          </span>
        </div>
      )
    ) : null;

  return (
    <aside
      ref={purchaseActionsRef}
      className="min-w-0"
      aria-labelledby="compra-producto-titulo"
    >
      <h2 id="compra-producto-titulo" className="sr-only">
        Comprar {product.name}
      </h2>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        {purchaseMode != null && onPurchaseModeChange && !isMockupLayout ? (
          <ProductDetailPurchaseMode
            purchaseMode={purchaseMode}
            onPurchaseModeChange={onPurchaseModeChange}
            rentalPlans={detail.rentalPlans}
            maintenancePlanMonthlyPen={maintenancePlanMonthlyPen ?? null}
            showMaintenancePlan={showMaintenancePlanAction && Boolean(onMaintenancePlanClick)}
            showRentalTab={showRentalTab}
            {...(onMaintenancePlanClick ? { onMaintenancePlanClick } : {})}
            className="mb-4"
          />
        ) : null}

        {isRentMode ? (
          <div ref={rentalConfiguratorRef} className="mb-4">
            <ProductDetailRentalConfigurator
              variant="full"
              rentalPlans={detail.rentalPlans}
              equipmentBasePriceUsd={equipmentBasePriceUsd ?? displayUsd}
              isColorEquipment={isColorEquipment}
              {...(onRentalEstimateChange ? { onEstimateChange: onRentalEstimateChange } : {})}
            />
          </div>
        ) : null}

        {showMockupBuyLayout ? mockupPromoHeader : null}
        {showMockupBuyLayout ? buyPriceBlock : null}

        {showMockupBuyLayout ? (
          <>
            {!isMockupLayout ? (
              <ProductDetailVolumePurchaseHint
                quantity={quantity}
                basePriceUsd={publicUnitBaseUsd}
                bulkDiscountTiers={detail.bulkDiscountTiers}
                floorPriceUsd={fullPrices.tecnico}
                equipmentExtrasUsd={equipmentExtrasUsd}
                className="mt-3.5"
              />
            ) : null}

            <div className="mt-4 flex w-full items-end gap-2">
              <ProductDetailPurchaseQuantity
                product={product}
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                className="w-[7.25rem] shrink-0"
              />
              <Button
                type="button"
                onClick={isMockupLayout ? handleAddToCart : handleBuyNow}
                disabled={outOfStock}
                className="h-10 min-h-10 min-w-0 flex-1 gap-1.5 rounded-lg border-0 bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 disabled:opacity-60"
              >
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
                {isMockupLayout ? addToCartLabel : buyNowLabel}
              </Button>
            </div>

            <div className="mt-3 w-full">
              <ProductWhatsAppButton
                stopPropagation={false}
                accent="outline"
                label="Comprar por WhatsApp"
                skipDialogIfComplete
                defaultGenerateQuote
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
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border-green-600/80 bg-white text-sm font-semibold normal-case tracking-normal text-green-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-600"
              />
            </div>

            {quoteButton && !isMockupLayout ? quoteButton : null}

            {complementaSlot ? <div className="mt-4 border-t border-neutral-100 pt-4">{complementaSlot}</div> : null}

            {!isMockupLayout ? (
              <div className="mt-5">
                <ProductDetailPurchasePaymentShipping />
              </div>
            ) : null}

            <ProductDetailPurchaseCardTrust className="mt-4" variant={isLaptopMockup ? 'laptop' : 'default'} />

            {showRentalAction && onRentalClick && detail.rentalPlans.length === 0 ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onRentalClick}
                className="mt-3 h-9 w-full rounded-lg border-neutral-300 text-xs font-semibold"
              >
                Ver opciones de alquiler
              </Button>
            ) : null}

            {showMaintenancePlanAction && onMaintenancePlanClick ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onMaintenancePlanClick}
                className="mt-3 h-9 w-full rounded-lg border-neutral-300 text-xs font-semibold"
              >
                Solicitar Plan de Mantenimiento
              </Button>
            ) : null}

            {includesOnRequest && orderHint ? (
              <p className="mt-2 text-center text-[0.6875rem] text-neutral-500">{orderHint}</p>
            ) : null}
          </>
        ) : (
          <>
            {activeRentalEstimate ? (
              <p className="mt-1 text-sm font-semibold text-[#0f1f3d]">
                Desde S/{' '}
                {activeRentalEstimate.estimatedMonthlyPen.toLocaleString('es-PE', {
                  maximumFractionDigits: 2,
                })}
                /mes · {activeRentalEstimate.termMonths} meses
              </p>
            ) : null}

            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="button"
                size="lg"
                onClick={() => onQuoteClick?.()}
                disabled={!onQuoteClick || !activeRentalEstimate}
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border-0 bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <Calculator className="size-4 shrink-0" aria-hidden="true" />
                Solicitar propuesta
              </Button>
            </div>

            <div className="mt-2 w-full">
              <ProductWhatsAppButton
                stopPropagation={false}
                accent="outline"
                label="Solicitar alquiler por WhatsApp"
                skipDialogIfComplete
                defaultGenerateQuote
                dialogTitle="Solicitar alquiler por WhatsApp"
                dialogDescription="Completa tus datos para enviar la solicitud de alquiler con el estimado mensual a nuestro equipo."
                quantity={activeRentalEstimate?.equipmentQuantity ?? quantity}
                product={{
                  id: product.id,
                  name: activeRentalEstimate
                    ? `${product.name} (Alquiler · ${activeRentalEstimate.billablePages.toLocaleString('es-PE')} pág./mes)`
                    : product.name,
                  priceUsd: activeRentalEstimate
                    ? penToUsd(activeRentalEstimate.estimatedMonthlyPen)
                    : offerUnitUsd,
                  category: product.category,
                  brand: product.brand ?? null,
                }}
                quoteContext={{
                  product,
                  displayTitle: activeRentalEstimate
                    ? `${detail.displayTitle} — Alquiler`
                    : detail.displayTitle,
                  sku: detail.sku,
                  brandLabel: detail.brandLabel,
                  categoryLabel: detail.categoryLabel,
                  heroSpecBullets: detail.heroSpecBullets,
                  heroLead: activeRentalEstimate
                    ? `Alquiler estimado: ${activeRentalEstimate.billablePages.toLocaleString('es-PE')} pág./mes · ${activeRentalEstimate.equipmentQuantity} equipo(s) · plazo ${activeRentalEstimate.termMonths} meses · Total mensual S/ ${activeRentalEstimate.estimatedMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}`
                    : detail.heroLead,
                  heroDescription: detail.heroDescription,
                  quantity: activeRentalEstimate?.equipmentQuantity ?? quantity,
                  ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
                }}
                {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border border-green-600 bg-white text-sm font-semibold normal-case tracking-normal text-green-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-600"
              />
            </div>

            {quoteButton}

            <ProductDetailPurchaseCardTrust className="mt-4" variant={isLaptopMockup ? 'laptop' : 'default'} />
          </>
        )}
      </div>

      {!showMockupBuyLayout ? (
        <p className={cn('sr-only')}>
          Cuota desde {formatPenFromUsd(installmentPreview.perInstallmentUsd)}
        </p>
      ) : null}
    </aside>
  );
}
