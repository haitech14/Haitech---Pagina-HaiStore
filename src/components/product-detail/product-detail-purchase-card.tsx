import { useMemo, useState, type Ref, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Lock, MessageCircle, ShoppingCart } from 'lucide-react';

import {
  formatOrderQuantityHint,
  hasOnRequestQuantity,
  isProductOutOfStock,
} from '@/components/cart/add-to-cart-button';
import { AttachmentPdfViewer } from '@/components/product-detail/attachment-pdf-viewer';
import { PurchaseSidebarRolePrices } from '@/components/product-detail/product-detail-role-prices';
import {
  ProductDetailShippingRows,
} from '@/components/product-detail/product-detail-shipping-info';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { BulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { resolveBulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { calculateInstallmentPreview } from '@/lib/checkout-totals';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import {
  downloadProductAttachment,
  isPdfAttachment,
} from '@/lib/inventory-attachments';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { cn, formatPenFromUsd, penToUsd } from '@/lib/utils';
import { ProductDetailRentalConfigurator,
  computeEquipmentRentalEstimate,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { SeminuevaPreparationPriceRows } from '@/components/product-detail/product-detail-seminueva-preparation-prices';
import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import { ProductDetailPurchaseQuantity } from '@/components/product-detail/product-detail-purchase-quantity';
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
  onTechnicalSheetFallback?: () => void;
  showRentalTab?: boolean;
  equipmentBasePriceUsd?: number;
  onRentalEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  rentalConfiguratorRef?: Ref<HTMLDivElement>;
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
  showRentalAction: _showRentalAction = false,
  onRentalClick: _onRentalClick,
  showMaintenancePlanAction = false,
  onMaintenancePlanClick,
  onQuoteClick,
  onTechnicalSheetFallback,
  showRentalTab = false,
  equipmentBasePriceUsd,
  onRentalEstimateChange,
  rentalConfiguratorRef,
}: ProductDetailPurchaseCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [technicalSheetOpen, setTechnicalSheetOpen] = useState(false);

  const fichaLink = useMemo(
    () => detail.resourceLinks.find((link) => link.action === 'technical_sheet'),
    [detail.resourceLinks],
  );
  const fichaFileName = fichaLink?.fileName ?? 'ficha-tecnica.pdf';
  const fichaCanPreview = Boolean(
    fichaLink?.href &&
      isPdfAttachment(fichaLink.href, fichaLink.mimeType, fichaFileName),
  );

  const handleTechnicalSheetClick = () => {
    if (fichaLink?.href) {
      if (fichaCanPreview) {
        setTechnicalSheetOpen(true);
        return;
      }
      downloadProductAttachment(fichaLink.href, fichaFileName);
      return;
    }
    onTechnicalSheetFallback?.();
  };

  const fichaTecnicaLabel = 'Especificaciones Tecnicas';

  const purchaseSidebarLinks =
    onQuoteClick || onTechnicalSheetFallback || fichaLink?.href ? (
      <div className="mt-3 flex items-center justify-center gap-3 border-t border-neutral-200 pt-3">
        <button
          type="button"
          onClick={handleTechnicalSheetClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline"
        >
          <FileText className="size-3.5 shrink-0" aria-hidden="true" />
          {fichaTecnicaLabel}
        </button>
        {onQuoteClick ? (
          <>
            <span className="h-4 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline"
            >
              <MessageCircle className="size-3.5 shrink-0" aria-hidden="true" />
              Generar Cotización
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const publicUnitBaseUsd = displayUsd + preparationSurchargeUsd;
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
      includeResidentTech: false,
      includeSpiralBinder: false,
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

  const handleBuyNow = () => {
    addItem(product, { ...cartAddOptions, openDrawer: false });
    navigate('/checkout');
  };

  const buyNowLabel = includesOnRequest ? 'Reservar ahora' : 'Comprar ahora';
  const stockCount = outOfStock ? 0 : Math.max(product.stock, 0);
  const installmentPreview = useMemo(
    () => calculateInstallmentPreview(configuredUnitUsd * quantity),
    [configuredUnitUsd, quantity],
  );

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
        />
      )}
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        {outOfStock ? (
          'Disponible bajo pedido'
        ) : stockCount > 0 ? (
          <>
            <span className="size-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
            {stockCount} disponibles
          </>
        ) : (
          'Consulta disponibilidad con un asesor'
        )}
      </p>
    </div>
  );

  const showMockupBuyLayout = !isRentMode;

  return (
    <aside
      ref={purchaseActionsRef}
      className="min-w-0"
      aria-labelledby="compra-producto-titulo"
    >
      <h2 id="compra-producto-titulo" className="sr-only">
        Comprar {product.name}
      </h2>

      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
        {purchaseMode != null && onPurchaseModeChange ? (
          <ProductDetailPurchaseMode
            purchaseMode={purchaseMode}
            onPurchaseModeChange={onPurchaseModeChange}
            rentalPlans={detail.rentalPlans}
            maintenancePlanMonthlyPen={maintenancePlanMonthlyPen ?? null}
            showMaintenancePlan={showMaintenancePlanAction && Boolean(onMaintenancePlanClick)}
            showRentalTab={showRentalTab}
            {...(onMaintenancePlanClick ? { onMaintenancePlanClick } : {})}
            className="mb-3"
          />
        ) : null}

        {isRentMode ? (
          <div ref={rentalConfiguratorRef} className="mb-3">
            <ProductDetailRentalConfigurator
              variant="full"
              rentalPlans={detail.rentalPlans}
              equipmentBasePriceUsd={equipmentBasePriceUsd ?? displayUsd}
              isColorEquipment={isColorEquipment}
              {...(onRentalEstimateChange ? { onEstimateChange: onRentalEstimateChange } : {})}
            />
          </div>
        ) : null}

        {showMockupBuyLayout ? buyPriceBlock : null}

        {showMockupBuyLayout ? (
          <>
            <ProductDetailVolumePurchaseHint
              quantity={quantity}
              basePriceUsd={publicUnitBaseUsd}
              bulkDiscountTiers={detail.bulkDiscountTiers}
              floorPriceUsd={fullPrices.tecnico}
              equipmentExtrasUsd={equipmentExtrasUsd}
              className="mt-3"
            />

            <div className="mt-3 flex w-full items-end gap-2">
              <ProductDetailPurchaseQuantity
                product={product}
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                className="w-[7.25rem] shrink-0"
              />
              <Button
                type="button"
                onClick={handleBuyNow}
                className="h-10 min-h-10 min-w-0 flex-1 gap-1.5 rounded-lg border-0 bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
                {buyNowLabel}
              </Button>
            </div>

            <div className="mt-2 w-full">
              <ProductWhatsAppButton
                stopPropagation={false}
                accent="outline"
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
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border-green-600 bg-white text-sm font-semibold normal-case tracking-normal text-green-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-600"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
                <p className="shrink-0 text-xs font-semibold text-neutral-700">
                  Pagos 100% seguros
                </p>
                <div className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
              </div>
              <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2">
                <img
                  src="/mediosdepago2.png"
                  alt="Medios de pago: Visa, Mastercard, American Express, Yape, Plin y más"
                  className="mx-auto block h-auto max-h-9 w-full max-w-full object-contain sm:max-h-10"
                  loading="lazy"
                  width={1200}
                  height={96}
                />
              </div>
            </div>

            <div className="mt-4">
              <ProductDetailShippingRows variant="mockup" />
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
              <Lock className="size-3.5 shrink-0 text-neutral-500" aria-hidden="true" />
              Compra segura y protegida
            </p>

            {purchaseSidebarLinks}

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
            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="button"
                size="lg"
                onClick={handleBuyNow}
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border-0 bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                {buyNowLabel}
              </Button>
            </div>

            <div className="mt-2 w-full">
              <ProductWhatsAppButton
                stopPropagation={false}
                accent="outline"
                label="Comprar por WhatsApp"
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
                    ? `Alquiler estimado: ${activeRentalEstimate.billablePages.toLocaleString('es-PE')} pág./mes · ${activeRentalEstimate.equipmentQuantity} equipo(s) · plazo ${activeRentalEstimate.termMonths} meses`
                    : detail.heroLead,
                  heroDescription: detail.heroDescription,
                  quantity: activeRentalEstimate?.equipmentQuantity ?? quantity,
                  ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
                }}
                {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
                className="h-10 min-h-10 w-full gap-1.5 rounded-lg border border-green-600 bg-white text-sm font-semibold normal-case tracking-normal text-green-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-600"
              />
            </div>

            {purchaseSidebarLinks}
          </>
        )}
      </div>

      {!showMockupBuyLayout ? (
        <p className={cn('sr-only')}>
          Cuota desde {formatPenFromUsd(installmentPreview.perInstallmentUsd)}
        </p>
      ) : null}

      {fichaLink?.href && fichaCanPreview ? (
        <AttachmentPdfViewer
          open={technicalSheetOpen}
          onOpenChange={setTechnicalSheetOpen}
          url={fichaLink.href}
          filename={fichaFileName}
        />
      ) : null}
    </aside>
  );
}
 ) : null}
    </aside>
  );
}
