import { useMemo, type Ref, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Headphones, ShoppingCart } from 'lucide-react';

import {
  formatOrderQuantityHint,
  hasOnRequestQuantity,
} from '@/components/cart/add-to-cart-button';
import { PurchaseSidebarRolePrices } from '@/components/product-detail/product-detail-role-prices';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import type { BulkDiscountPricing } from '@/lib/bulk-discount-tiers';
import { calculateInstallmentPreview } from '@/lib/checkout-totals';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { computeEquipmentExtrasUsd } from '@/lib/equipment-config-selection';
import { resolvePublicDisplayUsd } from '@/lib/pen-pricing';
import { cn, formatPenFromUsd, penToUsd } from '@/lib/utils';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { ProductDetailRentalConfigurator,
  computeEquipmentRentalEstimate,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { ProductDetailPurchaseMode } from '@/components/product-detail/product-detail-purchase-mode';
import { ProductDetailPurchaseQuantity } from '@/components/product-detail/product-detail-purchase-quantity';
import { ProductDetailPurchasePaymentShipping } from '@/components/product-detail/product-detail-purchase-payment-shipping';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { ProductDetailHeroWarrantySelector } from '@/components/product-detail/product-detail-hero-warranty-selector';
import { ProductDetailPurchaseCardTrust } from '@/components/product-detail/product-detail-purchase-card-trust';
import type { ConfigureHeroWarrantyUpgrade } from '@/lib/product-configure-hero-options';
import { ProductDetailVolumePurchaseHint } from '@/components/product-detail/product-detail-volume-purchase-hint';
import { HOME_HERO_WHATSAPP_LINK } from '@/data/home-hero-slides';
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
  onQuoteClick?: () => void;
  showRentalTab?: boolean;
  equipmentBasePriceUsd?: number;
  onRentalEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  rentalConfiguratorRef?: Ref<HTMLDivElement>;
  /** Slot para «Complementa tu compra» (sidebar mockup). */
  complementaSlot?: React.ReactNode;
  warrantyBaseLabel?: string;
  warrantyUpgrades?: ConfigureHeroWarrantyUpgrade[];
  selectedWarrantyOptionId?: string;
  onWarrantySelect?: (optionId: string) => void;
  warrantyIdPrefix?: string;
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
  warrantyBaseLabel,
  warrantyUpgrades = [],
  selectedWarrantyOptionId,
  onWarrantySelect,
  warrantyIdPrefix = '',
  layout = 'default',
  outOfStock: _outOfStock = false,
}: ProductDetailPurchaseCardProps) {
  const isMockupLayout = layout === 'mockup';
  const isLaptopMockup = isMockupLayout && detail.isLaptopProduct;
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const catalogStock = getCatalogProductById(product.id)?.stock;
  const stockCount = Math.max(
    Math.max(0, Math.floor(Number(product.stock) || 0)),
    Math.max(0, Math.floor(Number(catalogStock) || 0)),
  );
  const hasStock = stockCount > 0;
  const stockStatusLabel = hasStock ? 'En stock' : 'Agotado';
  const skuLabel = detail.sku?.trim() || product.code?.trim() || '';

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = resolvePublicDisplayUsd(fullPrices.public, product.category);
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
      className={cn(
        'h-11 min-h-11 w-full gap-1.5 rounded-full text-sm font-semibold',
        isMockupLayout
          ? 'border-[#E31B23] bg-white text-[#E31B23] hover:bg-[#E31B23] hover:text-white'
          : 'mt-3 border-neutral-300 text-[#0f1f3d] hover:bg-neutral-50',
      )}
    >
      {isRentMode ? 'Descargar propuesta PDF' : 'Generar Cotización'}
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

  const buyNowLabel = includesOnRequest ? 'Agregar a Pedido' : 'Comprar ahora';
  const addToCartLabel = includesOnRequest ? 'Agregar a Pedido' : 'Agregar al carrito';
  const installmentPreview = useMemo(
    () => calculateInstallmentPreview(configuredUnitUsd * quantity),
    [configuredUnitUsd, quantity],
  );

  const buyPriceBlock = (
    <div aria-live="polite" aria-atomic="true">
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
        showAdminPurchaseLine={isMockupLayout && isAdmin}
        showOfferBreakdown={isLaptopMockup}
      />
    </div>
  );

  const showMockupBuyLayout = !isRentMode;
  const showWarrantyAccordion =
    showMockupBuyLayout &&
    warrantyUpgrades.length > 0 &&
    Boolean(warrantyBaseLabel) &&
    selectedWarrantyOptionId != null &&
    onWarrantySelect != null;

  const warrantyAccordion = showWarrantyAccordion ? (
    <ProductDetailHeroCollapsibleSection
      title="Garantía"
      badge="Opcional"
      panelAriaLabel="Opciones de garantía"
      className="mt-3 border-neutral-200 bg-white"
    >
      <ProductDetailHeroWarrantySelector
        baseLabel={warrantyBaseLabel ?? '1 año de garantía'}
        upgrades={warrantyUpgrades}
        selectedOptionId={selectedWarrantyOptionId ?? ''}
        onSelectOption={onWarrantySelect ?? (() => undefined)}
        embedded
        hideTitle
        idPrefix={warrantyIdPrefix}
      />
    </ProductDetailHeroCollapsibleSection>
  ) : null;

  const mockupPromoHeader = showMockupBuyLayout ? (
      isLaptopMockup ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              hasStock ? 'text-emerald-600' : 'text-neutral-500',
            )}
          >
            <span
              className={cn('size-2 rounded-full', hasStock ? 'bg-emerald-500' : 'bg-neutral-400')}
              aria-hidden="true"
            />
            {stockStatusLabel}
          </span>
          {skuLabel ? (
            <span className="text-xs font-medium text-neutral-400">SKU: {skuLabel}</span>
          ) : null}
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              hasStock ? 'text-emerald-600' : 'text-neutral-500',
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full',
                hasStock ? 'bg-emerald-500' : 'bg-neutral-400',
              )}
              aria-hidden="true"
            />
            {stockStatusLabel}
          </span>
          {skuLabel ? (
            <span className="text-xs font-medium text-neutral-400">SKU: {skuLabel}</span>
          ) : null}
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

      <div
        className={cn(
          'rounded-2xl p-5 shadow-sm sm:p-6',
          isMockupLayout
            ? 'border border-neutral-200 bg-neutral-100 text-neutral-900'
            : 'border border-neutral-200 bg-white',
        )}
      >
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
        {showMockupBuyLayout && isMockupLayout ? (
          <p className="mt-1.5 text-xs text-neutral-400">IGV incluido</p>
        ) : null}
        {warrantyAccordion}

        {showMockupBuyLayout ? (
          <>
            <ProductDetailVolumePurchaseHint
              quantity={quantity}
              basePriceUsd={publicUnitBaseUsd}
              bulkDiscountTiers={detail.bulkDiscountTiers}
              floorPriceUsd={fullPrices.tecnico}
              equipmentExtrasUsd={equipmentExtrasUsd}
              className="mt-3.5"
            />

            <div className="mt-5 flex w-full items-center gap-2">
              <ProductDetailPurchaseQuantity
                product={product}
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                hideLabel
                className="w-[6.25rem] shrink-0 sm:w-[7rem]"
              />
              <Button
                type="button"
                onClick={isMockupLayout ? handleAddToCart : handleBuyNow}
                className="h-11 min-h-11 min-w-0 flex-1 justify-center gap-1.5 rounded-full border-0 bg-[#E31B23] px-3 text-[0.8125rem] font-semibold leading-none text-white hover:bg-[#c41820] focus-visible:ring-[#E31B23] sm:gap-2 sm:px-4 sm:text-sm"
              >
                <ShoppingCart className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
                <span className="min-w-0 whitespace-nowrap">
                  {isMockupLayout ? addToCartLabel : buyNowLabel}
                </span>
              </Button>
            </div>

            {isMockupLayout ? (
              <div className="mt-3 w-full space-y-2.5">
                {quoteButton}
                <ProductWhatsAppButton
                  stopPropagation={false}
                  accent="solid"
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
                    unitUsd: offerUnitUsd,
                    ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
                  }}
                  {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
                  className="h-11 min-h-11 w-full gap-1.5 rounded-full border-0 bg-[#25D366] text-sm font-semibold normal-case tracking-normal text-white hover:bg-[#20bd5a] hover:text-white focus-visible:ring-[#25D366]"
                />
              </div>
            ) : (
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
                    unitUsd: offerUnitUsd,
                    ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
                  }}
                  {...(onQuoteGenerated ? { onQuoteGenerated } : {})}
                  className="h-10 min-h-10 w-full gap-1.5 rounded-lg border-green-600/80 bg-white text-sm font-semibold normal-case tracking-normal text-green-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-600"
                />
              </div>
            )}

            {quoteButton && !isMockupLayout ? quoteButton : null}

            {complementaSlot ? <div className="mt-4 border-t border-neutral-100 pt-4">{complementaSlot}</div> : null}

            {!isMockupLayout ? (
              <div className="mt-5">
                <ProductDetailPurchasePaymentShipping />
              </div>
            ) : null}

            <ProductDetailPurchaseCardTrust
              className="mt-4"
              variant={isMockupLayout ? 'premium' : isLaptopMockup ? 'laptop' : 'default'}
            />

            {isMockupLayout ? (
              <div className="mt-3.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
                <div className="flex items-start gap-2.5">
                  <Headphones className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900">¿Necesitas asesoría?</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                      Te ayudamos a elegir la mejor solución para tu negocio.
                    </p>
                    <a
                      href={HOME_HERO_WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#E31B23] transition-colors hover:text-[#c41820]"
                    >
                      Contacta a un asesor
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

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

            <div className="mt-3 w-full">{quoteButton}</div>

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
