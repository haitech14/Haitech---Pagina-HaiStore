import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, ShieldCheck } from 'lucide-react';

import {
  ProductDetailRentalConfigurator,
  type EquipmentRentalEstimate,
} from '@/components/product-detail/product-detail-rental-configurator';
import { ProductRentalQuoteDialog } from '@/components/product-detail/product-rental-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { useCart } from '@/context/cart-context';
import {
  selectEquipmentOption,
  type EquipmentSelectionState,
} from '@/lib/equipment-config-selection';
import {
  MAINTENANCE_PLAN_FROM_MONTHLY_PEN,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_DEFAULT_TERM_MONTHS,
  calculateRentalQuote,
} from '@/lib/rental-calculator';
import {
  resolveIncludedTonerImage,
  resolveRecommendedConfigureAccessory,
  type ConfigureAccessoryItem,
} from '@/lib/product-configure-accessory';
import {
  resolveConfigureEquipmentCards,
  type ConfigureEquipmentCard,
} from '@/lib/product-configure-equipment-cards';
import {
  formatTonerCardDisplayTitle,
  resolveConfigureTonerCards,
  type ConfigureTonerCard,
} from '@/lib/product-configure-toner';
import {
  MERCHANDISING_CROSS_SELL_STEP_ID,
  MERCHANDISING_UPSELL_STEP_ID,
  crossSellOptionId,
  resolveCrossSellConfigureCards,
  resolveUpsellConfigureCards,
  upsellOptionId,
  type MerchandisingConfigureCard,
} from '@/lib/product-merchandising';
import { TonerCardRolePrices } from '@/components/product-detail/product-detail-role-prices';
import { ensureFullPrices } from '@/lib/roles';
import { isColorPrinterEquipment } from '@/lib/build-product-detail';
import { cn } from '@/lib/utils';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import type { EquipmentConfigStep, ProductComboItem, ProductDetailViewModel, RentalPlanOption } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailConfigureEquipmentProps {
  product: Product;
  detail: ProductDetailViewModel;
  plans: RentalPlanOption[];
  equipmentSteps: EquipmentConfigStep[];
  equipmentSelection: EquipmentSelectionState;
  onEquipmentSelectionChange: (selection: EquipmentSelectionState) => void;
  frequentlyBought: ProductComboItem[];
  catalogProducts: Product[];
  consumableGroups: ConsumableGroup[];
  onPurchaseModeChange: (mode: PurchaseMode) => void;
  purchaseMode: PurchaseMode;
  onRentalEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  purchaseActionsRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  /** @deprecated El bloque usa carrusel horizontal en todos los layouts. */
  layout?: 'full' | 'inline';
}

const cardClass =
  'flex h-full min-h-[10.5rem] flex-col rounded-lg border border-border/70 bg-white p-3 shadow-sm sm:min-h-[11.5rem]';

const cardButtonClass =
  'mt-auto w-full rounded-md border border-border/80 bg-muted/35 px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:text-sm';

const carouselSlideClass =
  'min-w-0 flex-[0_0_82%] sm:flex-[0_0_52%] lg:flex-[0_0_38%]';

function formatPenAmount(value: number): string {
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MaintenancePlanCard({
  onChoosePlan,
}: {
  onChoosePlan: () => void;
}) {
  return (
    <article className={cardClass}>
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0f1f3d]" strokeWidth={2} aria-hidden="true" />
        <h3 className="text-pretty text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
          Plan de Mantenimiento y Suministros
        </h3>
      </div>

      <p className="mt-2 text-sm font-bold text-emerald-600 sm:text-base">
        Desde S/ {formatPenAmount(MAINTENANCE_PLAN_FROM_MONTHLY_PEN)}/mes
      </p>

      <p className="mt-1.5 flex-1 text-pretty text-[0.6875rem] leading-relaxed text-muted-foreground sm:text-xs">
        Mantenimiento preventivo, repuestos y suministros. Plazos 6, 12 o 36 meses.
      </p>

      <button type="button" className={cardButtonClass} onClick={onChoosePlan}>
        Elegir plan
      </button>
    </article>
  );
}

function SelectableTonerCard({
  card,
  selected,
  onToggle,
}: {
  card: ConfigureTonerCard;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        cardClass,
        selected && 'border-red-600 ring-1 ring-red-600/30',
      )}
    >
      <h3 className="line-clamp-2 text-pretty text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
        {formatTonerCardDisplayTitle(card.title)}
      </h3>

      <div className="mt-2 flex flex-1 gap-2.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 sm:size-14">
          <ProductCardHoverImage
            candidates={card.imageCandidates}
            alt=""
            className="size-full"
            imageClassName="size-full object-contain p-0.5"
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="line-clamp-2 text-pretty text-[0.6875rem] leading-snug text-muted-foreground sm:text-xs">
            {card.name}
          </p>
          <TonerCardRolePrices prices={card.prices} className="mt-0.5" />
          <p className="mt-0.5 line-clamp-2 text-[0.625rem] leading-snug text-muted-foreground sm:text-[0.6875rem]">
            {card.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        className={cn(
          cardButtonClass,
          selected
            ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
            : 'inline-flex items-center justify-center gap-1',
        )}
        onClick={onToggle}
      >
        {selected ? 'Quitar del total' : 'Agregar al total'}
        {!selected ? (
          <Plus className="size-3.5 shrink-0 sm:size-4" strokeWidth={2.5} aria-hidden="true" />
        ) : null}
      </button>
    </article>
  );
}

function SelectableEquipmentCard({
  card,
  selected,
  onToggle,
}: {
  card: ConfigureEquipmentCard;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        cardClass,
        selected && 'border-red-600 ring-1 ring-red-600/30',
      )}
    >
      <h3 className="text-xs font-bold text-[#0f1f3d] sm:text-sm">{card.title}</h3>

      <div className="mt-2 flex flex-1 gap-2.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 sm:size-14">
          <img
            src={card.image}
            alt=""
            loading="lazy"
            className="size-full object-contain p-0.5"
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="line-clamp-2 text-pretty text-[0.6875rem] font-bold leading-snug text-[#0f1f3d] sm:text-xs">
            {card.name}
          </p>
          <p className="mt-0.5 text-sm font-bold text-red-600 sm:text-base">
            S/ {formatPenAmount(card.pricePen)}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[0.625rem] leading-snug text-muted-foreground sm:text-[0.6875rem]">
            {card.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        className={cn(
          cardButtonClass,
          selected
            ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
            : 'inline-flex items-center justify-center gap-1',
        )}
        onClick={onToggle}
      >
        {selected ? 'Quitar del total' : 'Agregar al total'}
        {!selected ? (
          <Plus className="size-3.5 shrink-0 sm:size-4" strokeWidth={2.5} aria-hidden="true" />
        ) : null}
      </button>
    </article>
  );
}

function SelectableMerchandisingCard({
  card,
  selected,
  onToggle,
}: {
  card: MerchandisingConfigureCard;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        cardClass,
        selected && 'border-red-600 ring-1 ring-red-600/30',
      )}
    >
      <h3 className="text-xs font-bold text-[#0f1f3d] sm:text-sm">{card.title}</h3>

      <div className="mt-2 flex flex-1 gap-2.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 sm:size-14">
          <ProductCardHoverImage
            candidates={card.imageCandidates}
            alt=""
            className="size-full"
            imageClassName="size-full object-contain p-0.5"
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="line-clamp-2 text-pretty text-[0.6875rem] font-bold leading-snug text-[#0f1f3d] sm:text-xs">
            {card.name}
          </p>
          <TonerCardRolePrices prices={card.prices} className="mt-0.5" />
          <p className="mt-0.5 line-clamp-2 text-[0.625rem] leading-snug text-muted-foreground sm:text-[0.6875rem]">
            {card.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        className={cn(
          cardButtonClass,
          selected
            ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
            : 'inline-flex items-center justify-center gap-1',
        )}
        onClick={onToggle}
      >
        {selected ? 'Quitar del total' : 'Agregar al total'}
        {!selected ? (
          <Plus className="size-3.5 shrink-0 sm:size-4" strokeWidth={2.5} aria-hidden="true" />
        ) : null}
      </button>
    </article>
  );
}

function RecommendedAccessoryCard({
  item,
  onAdd,
}: {
  item: ConfigureAccessoryItem;
  onAdd: () => void;
}) {
  return (
    <article className={cardClass}>
      <h3 className="text-pretty text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
        Accesorio recomendado (Combo)
      </h3>

      <div className="mt-2 flex flex-1 gap-2.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 sm:size-14">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="size-full object-contain p-0.5"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-pretty text-[0.6875rem] font-bold uppercase leading-snug text-[#0f1f3d] sm:text-xs">
            {item.name}
          </p>
          <p className="mt-0.5 text-sm font-bold text-red-600 sm:text-base">
            S/ {formatPenAmount(item.pricePen)}
          </p>
          {item.compareAtPen != null && item.compareAtPen > item.pricePen ? (
            <p className="text-xs font-bold text-red-600 line-through sm:text-sm">
              S/ {formatPenAmount(item.compareAtPen)}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className={cn(cardButtonClass, 'inline-flex items-center justify-center gap-1')}
        onClick={onAdd}
      >
        Agregar al combo
        <Plus className="size-3.5 shrink-0 sm:size-4" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </article>
  );
}

export function ProductDetailConfigureEquipment({
  product,
  detail,
  plans,
  equipmentSteps,
  equipmentSelection,
  onEquipmentSelectionChange,
  frequentlyBought,
  catalogProducts,
  consumableGroups,
  onPurchaseModeChange,
  purchaseMode,
  onRentalEstimateChange,
  purchaseActionsRef,
  className,
}: ProductDetailConfigureEquipmentProps) {
  const { addItem } = useCart();
  const isRentMode = purchaseMode === 'rent' && plans.length > 0;
  const isColorEquipment = useMemo(() => isColorPrinterEquipment(product), [product]);
  const equipmentBasePriceUsd = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }).public,
    [product.price, product.prices],
  );
  const [expanded, setExpanded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (isRentMode) {
      setExpanded(true);
      return;
    }
    setExpanded(false);
  }, [isRentMode]);

  const tonerStep = equipmentSteps.find((step) => step.id === 'toner');
  const includedTonerImage = resolveIncludedTonerImage(
    tonerStep?.options.find((option) => option.included)?.image ??
      tonerStep?.options[0]?.image,
  );

  const purchasableTonerCards = useMemo(
    () =>
      resolveConfigureTonerCards(
        tonerStep,
        consumableGroups,
        includedTonerImage,
        catalogProducts,
        product,
      ),
    [catalogProducts, consumableGroups, includedTonerImage, product, tonerStep],
  );

  const crossSellStep = equipmentSteps.find((step) => step.id === MERCHANDISING_CROSS_SELL_STEP_ID);
  const upsellStep = equipmentSteps.find((step) => step.id === MERCHANDISING_UPSELL_STEP_ID);

  const upsellCards = useMemo(
    () =>
      resolveUpsellConfigureCards(product, catalogProducts, {
        excludeProductId: product.id,
      }),
    [catalogProducts, product],
  );

  const crossSellCards = useMemo(
    () =>
      resolveCrossSellConfigureCards(product, catalogProducts, {
        excludeProductIds: upsellCards.map((card) => card.productId),
      }),
    [catalogProducts, product, upsellCards],
  );

  const equipmentCards = useMemo(
    () => resolveConfigureEquipmentCards(equipmentSteps),
    [equipmentSteps],
  );

  const selectedTonerIds = equipmentSelection.toner ?? new Set<string>();

  const handleToggleToner = (card: ConfigureTonerCard) => {
    if (!tonerStep) return;
    onEquipmentSelectionChange(
      selectEquipmentOption(equipmentSelection, tonerStep, card.optionId),
    );
  };

  const handleToggleEquipmentCard = (card: ConfigureEquipmentCard) => {
    const step = equipmentSteps.find((entry) => entry.id === card.stepId);
    if (!step) return;

    const selectedIds = equipmentSelection[step.id] ?? new Set<string>();
    const isSelected = selectedIds.has(card.optionId);

    if (step.id === 'garantia' && isSelected) {
      onEquipmentSelectionChange({
        ...equipmentSelection,
        garantia: new Set(['garantia-base']),
      });
      return;
    }

    onEquipmentSelectionChange(
      selectEquipmentOption(equipmentSelection, step, card.optionId),
    );
  };

  const isEquipmentCardSelected = (card: ConfigureEquipmentCard): boolean => {
    const selectedIds = equipmentSelection[card.stepId] ?? new Set<string>();
    return selectedIds.has(card.optionId);
  };

  const recommendedAccessory = useMemo(
    () => resolveRecommendedConfigureAccessory(product, catalogProducts, frequentlyBought),
    [catalogProducts, frequentlyBought, product],
  );

  const showMaintenance = plans.length > 0;
  const showPurchasableToners = purchasableTonerCards.length > 0;
  const showEquipmentCards = equipmentCards.length > 0;
  const showAccessory = recommendedAccessory != null;
  const showUpsellCards = upsellCards.length > 0;
  const showCrossSellCards = crossSellCards.length > 0;
  const visibleCardCount =
    purchasableTonerCards.length +
    equipmentCards.length +
    crossSellCards.length +
    upsellCards.length +
    (showMaintenance ? 1 : 0) +
    (showAccessory ? 1 : 0);

  const quote = useMemo(
    () =>
      calculateRentalQuote({
        monthlyPages: RENTAL_DEFAULT_MONTHLY_PAGES,
        includesPaper: false,
        includesOperator: false,
        plans,
        termMonths: RENTAL_DEFAULT_TERM_MONTHS,
      }),
    [plans],
  );

  if (
    !isRentMode &&
    !showMaintenance &&
    !showPurchasableToners &&
    !showEquipmentCards &&
    !showCrossSellCards &&
    !showUpsellCards &&
    !showAccessory
  ) {
    return null;
  }

  if (isRentMode) {
    return (
      <ProductDetailRentalConfigurator
        rentalPlans={plans}
        equipmentBasePriceUsd={equipmentBasePriceUsd}
        isColorEquipment={isColorEquipment}
        variant="full"
        {...(onRentalEstimateChange ? { onEstimateChange: onRentalEstimateChange } : {})}
      />
    );
  }

  const handleToggleMerchandising = (
    step: typeof crossSellStep,
    optionId: string,
  ) => {
    if (!step) return;
    onEquipmentSelectionChange(selectEquipmentOption(equipmentSelection, step, optionId));
  };

  const isMerchandisingSelected = (stepId: string | undefined, optionId: string): boolean => {
    if (!stepId) return false;
    return equipmentSelection[stepId]?.has(optionId) ?? false;
  };

  const handleChoosePlan = () => {
    onPurchaseModeChange('rent');
    setQuoteOpen(true);
    purchaseActionsRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleAddAccessory = () => {
    if (!recommendedAccessory) return;

    const accesoriosStep = equipmentSteps.find((step) => step.id === 'accesorios');
    const matchingOption = accesoriosStep?.options.find(
      (option) =>
        option.productId === recommendedAccessory.productId ||
        option.id === recommendedAccessory.id ||
        option.name.toLowerCase() === recommendedAccessory.name.toLowerCase(),
    );

    if (accesoriosStep && matchingOption) {
      onEquipmentSelectionChange(
        selectEquipmentOption(equipmentSelection, accesoriosStep, matchingOption.id),
      );
    }

    const catalogProduct = recommendedAccessory.productId
      ? catalogProducts.find((row) => row.id === recommendedAccessory.productId)
      : undefined;

    if (catalogProduct) {
      addItem(catalogProduct, { quantity: 1, openDrawer: true });
      return;
    }

    purchaseActionsRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleQuotePdfPreviewClose = (isOpen: boolean) => {
    if (isOpen) return;
    if (quotePdfPreview?.url) {
      URL.revokeObjectURL(quotePdfPreview.url);
    }
    setQuotePdfPreview(null);
  };

  const showCarouselControls = visibleCardCount > 1;
  const panelId = 'configura-equipo-panel';

  return (
    <>
      <section
        aria-labelledby="configura-equipo-titulo"
        className={cn(
          'overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm',
          className,
        )}
      >
        <button
          type="button"
          className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-4"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
        >
          <h2
            id="configura-equipo-titulo"
            className="min-w-0 flex-1 text-sm font-bold text-[#0f1f3d] sm:text-base"
          >
            Configura tu equipo
          </h2>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform',
              expanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        <div
          id={panelId}
          hidden={!expanded}
          className={cn('border-t border-border/60 px-3 pb-3 pt-3 sm:px-4 sm:pb-4', !expanded && 'hidden')}
        >
        <div className="relative">
          {showCarouselControls ? (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Tarjeta anterior"
                className={cn(
                  'absolute left-0 top-1/2 z-10 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex',
                  !canScrollPrev && 'pointer-events-none opacity-30',
                )}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Siguiente tarjeta"
                className={cn(
                  'absolute right-0 top-1/2 z-10 hidden size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex',
                  !canScrollNext && 'pointer-events-none opacity-30',
                )}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div
            ref={emblaRef}
            className="overflow-hidden px-0.5 sm:px-1"
            aria-roledescription={showCarouselControls ? 'carrusel' : undefined}
          >
            <ul className="flex touch-pan-y gap-2.5 sm:gap-3">
              {purchasableTonerCards.map((card) => (
                <li key={`${card.supplyType}-${card.productId}`} className={carouselSlideClass}>
                  <SelectableTonerCard
                    card={card}
                    selected={selectedTonerIds.has(card.optionId)}
                    onToggle={() => handleToggleToner(card)}
                  />
                </li>
              ))}

              {equipmentCards.map((card) => (
                <li key={`${card.stepId}-${card.optionId}`} className={carouselSlideClass}>
                  <SelectableEquipmentCard
                    card={card}
                    selected={isEquipmentCardSelected(card)}
                    onToggle={() => handleToggleEquipmentCard(card)}
                  />
                </li>
              ))}

              {crossSellCards.map((card) => (
                <li key={`cross-sell-${card.productId}`} className={carouselSlideClass}>
                  <SelectableMerchandisingCard
                    card={card}
                    selected={isMerchandisingSelected(
                      crossSellStep?.id,
                      crossSellOptionId(card.productId),
                    )}
                    onToggle={() =>
                      handleToggleMerchandising(crossSellStep, crossSellOptionId(card.productId))
                    }
                  />
                </li>
              ))}

              {upsellCards.map((card) => (
                <li key={`upsell-${card.productId}`} className={carouselSlideClass}>
                  <SelectableMerchandisingCard
                    card={card}
                    selected={isMerchandisingSelected(
                      upsellStep?.id,
                      upsellOptionId(card.productId),
                    )}
                    onToggle={() =>
                      handleToggleMerchandising(upsellStep, upsellOptionId(card.productId))
                    }
                  />
                </li>
              ))}

              {showMaintenance ? (
                <li className={carouselSlideClass}>
                  <MaintenancePlanCard onChoosePlan={handleChoosePlan} />
                </li>
              ) : null}

              {showAccessory && recommendedAccessory ? (
                <li className={carouselSlideClass}>
                  <RecommendedAccessoryCard item={recommendedAccessory} onAdd={handleAddAccessory} />
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        </div>
      </section>

      {showMaintenance ? (
        <>
          <ProductRentalQuoteDialog
            open={quoteOpen}
            onOpenChange={setQuoteOpen}
            product={product}
            displayTitle={detail.displayTitle}
            sku={detail.sku}
            brandLabel={detail.brandLabel}
            breakdown={quote}
            onGenerated={setQuotePdfPreview}
          />
          <ProductQuotePdfViewer preview={quotePdfPreview} onOpenChange={handleQuotePdfPreviewClose} autoDownload />
        </>
      ) : null}
    </>
  );
}
