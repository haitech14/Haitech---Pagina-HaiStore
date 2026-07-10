import { ImageOff } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { ProductDetailHeroWarrantySelector } from '@/components/product-detail/product-detail-hero-warranty-selector';
import { cn } from '@/lib/utils';
import type { EquipmentSelectionState } from '@/lib/equipment-config-selection';
import type {
  ConfigureHeroAccessoryCard,
  ConfigureHeroWarrantyUpgrade,
} from '@/lib/product-configure-hero-options';
import {
  formatTonerCardDisplayTitle,
  resolveTonerColorLabel,
  type ConfigureTonerCard,
  type ConfigureTonerSupplyType,
} from '@/lib/product-configure-toner';

interface ProductDetailComplementaCompraProps {
  tonerCards?: ConfigureTonerCard[];
  defaultTonerSupplyType?: ConfigureTonerSupplyType;
  accessoryCards?: ConfigureHeroAccessoryCard[];
  selectedTonerOptionIds: Set<string>;
  equipmentSelection: EquipmentSelectionState;
  onTonerToggle: (card: ConfigureTonerCard) => void;
  onAccessoryToggle: (card: ConfigureHeroAccessoryCard) => void;
  warrantyBaseLabel?: string;
  warrantyUpgrades?: ConfigureHeroWarrantyUpgrade[];
  selectedWarrantyOptionId?: string;
  onWarrantySelect?: (optionId: string) => void;
  beforeTonerSlot?: ReactNode;
  leadingSlot?: ReactNode;
  maintenanceSlot?: ReactNode;
  className?: string;
}

function ComplementaCardNoImage() {
  return (
    <span className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground">
      <ImageOff className="size-4 text-muted-foreground/70" aria-hidden="true" />
      <span className="text-[0.5625rem] font-semibold">Sin imagen</span>
    </span>
  );
}

function resolveCardColor(card: ConfigureTonerCard): string {
  return (
    resolveTonerColorLabel(undefined, card.title) ??
    resolveTonerColorLabel(undefined, card.name) ??
    'Estándar'
  );
}

function resolveTonerShortTitle(card: ConfigureTonerCard): string {
  const catalogName = formatTonerCardDisplayTitle(card.name?.trim() || card.title?.trim() || '');
  if (catalogName && !/^toner original$/i.test(catalogName) && !/^tóner compatible$/i.test(catalogName)) {
    return catalogName;
  }

  const displayTitle = formatTonerCardDisplayTitle(card.title);
  const color = resolveCardColor(card);
  if (/compatible/i.test(displayTitle) || card.supplyType === 'compatible') {
    return `Tóner ${color.toLowerCase()} compatible`;
  }
  if (/original/i.test(displayTitle) || card.supplyType === 'original') {
    return `Tóner ${color.toLowerCase()} original`;
  }
  return displayTitle;
}

function dedupeTonerCards(cards: ConfigureTonerCard[]): ConfigureTonerCard[] {
  const seen = new Map<string, ConfigureTonerCard>();
  for (const card of cards) {
    const key = `${card.supplyType}-${resolveCardColor(card)}-${card.productId}`;
    if (!seen.has(key)) seen.set(key, card);
  }
  return [...seen.values()];
}

function ComplementaTonerCards({
  cards,
  selectedTonerOptionIds,
  onTonerToggle,
  defaultSupplyType,
}: {
  cards: ConfigureTonerCard[];
  selectedTonerOptionIds: Set<string>;
  onTonerToggle: (card: ConfigureTonerCard) => void;
  defaultSupplyType: ConfigureTonerSupplyType;
}) {
  const tabListId = useId();
  const originalPanelId = useId();
  const compatiblePanelId = useId();

  const originalCards = useMemo(
    () => dedupeTonerCards(cards.filter((card) => card.supplyType === 'original')),
    [cards],
  );
  const compatibleCards = useMemo(
    () => dedupeTonerCards(cards.filter((card) => card.supplyType === 'compatible')),
    [cards],
  );

  const [supplyType, setSupplyType] = useState<ConfigureTonerSupplyType>(defaultSupplyType);

  useEffect(() => {
    if (supplyType === 'compatible' && compatibleCards.length === 0 && originalCards.length > 0) {
      setSupplyType('original');
    } else if (
      supplyType === 'original' &&
      originalCards.length === 0 &&
      compatibleCards.length > 0
    ) {
      setSupplyType('compatible');
    }
  }, [compatibleCards.length, originalCards.length, supplyType]);

  const activeCards = supplyType === 'compatible' ? compatibleCards : originalCards;
  const activePanelId = supplyType === 'compatible' ? compatiblePanelId : originalPanelId;

  if (originalCards.length === 0 && compatibleCards.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="shrink-0 text-xs font-semibold text-[#0f1f3d]">Toner</h3>

        <div
          role="tablist"
          aria-label="Tipo de tóner"
          id={tabListId}
          className="flex w-fit shrink-0 gap-3"
        >
        {(
          [
            { id: 'original' as const, label: 'Original', count: originalCards.length },
            { id: 'compatible' as const, label: 'Compatible', count: compatibleCards.length },
          ] as const
        ).map((option) => {
          const isActive = supplyType === option.id;
          const panelId = option.id === 'original' ? originalPanelId : compatiblePanelId;
          const disabled = option.count === 0;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`${tabListId}-${option.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              disabled={disabled}
              onClick={() => setSupplyType(option.id)}
              className={cn(
                'inline-flex items-center justify-center px-0.5 py-0.5 text-[0.6875rem] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-40',
                isActive
                  ? 'text-red-600 underline underline-offset-4 decoration-red-600/70'
                  : 'text-neutral-400 hover:text-neutral-600',
              )}
            >
              {option.label}
            </button>
          );
        })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={activePanelId}
        aria-labelledby={`${tabListId}-${supplyType}`}
      >
        {activeCards.length === 0 ? (
          <p className="px-1 py-2 text-[0.6875rem] text-neutral-500">
            Sin tóners de este tipo.
          </p>
        ) : (
          <ul
            className="grid auto-cols-[calc(50%-0.25rem)] grid-flow-col gap-2 overflow-x-auto snap-x snap-mandatory pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Tóners disponibles"
          >
            {activeCards.map((card) => {
              const selected = selectedTonerOptionIds.has(card.optionId);
              const shortTitle = resolveTonerShortTitle(card);
              const inputId = `complementa-toner-${card.supplyType}-${card.productId}`;

              return (
                <li key={`${card.supplyType}-${card.productId}`} className="snap-start">
                  <label
                    htmlFor={inputId}
                    className={cn(
                      'flex h-full min-w-0 cursor-pointer items-start gap-2 rounded-md bg-white px-2 py-2 transition-colors',
                      selected ? 'bg-red-50/60' : 'hover:bg-neutral-50',
                    )}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={selected}
                      onChange={() => onTonerToggle(card)}
                      className="mt-0.5 size-3.5 shrink-0 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d] sm:text-xs">
                        {shortTitle}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-red-600 sm:text-sm">
                        <DualPrice usd={card.prices.public} />
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ComplementaAccessoryCards({
  cards,
  equipmentSelection,
  onAccessoryToggle,
}: {
  cards: ConfigureHeroAccessoryCard[];
  equipmentSelection: EquipmentSelectionState;
  onAccessoryToggle: (card: ConfigureHeroAccessoryCard) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {cards.map((card) => {
        const selected = (equipmentSelection[card.stepId] ?? new Set<string>()).has(card.optionId);
        const inputId = `complementa-accessory-${card.stepId}-${card.optionId}`;
        const code = card.code?.trim();

        return (
          <li key={`${card.stepId}-${card.optionId}`}>
            <label
              htmlFor={inputId}
              className={cn(
                'flex h-full cursor-pointer flex-col gap-2 rounded-md border bg-white px-2 py-2 transition-colors',
                selected ? 'border-red-600/40' : 'border-neutral-200 hover:border-neutral-300',
              )}
            >
              <div className="flex min-w-0 items-start gap-2">
                <div className="flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 p-0.5 sm:size-14">
                  <ProductCardHoverImage
                    candidates={card.imageCandidates}
                    alt=""
                    className="size-full"
                    imageClassName="size-full object-contain"
                    placeholder={<ComplementaCardNoImage />}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-3 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d] sm:text-xs">
                    {card.title}
                  </p>
                  {code ? (
                    <p className="mt-0.5 text-[0.625rem] text-neutral-500 sm:text-[0.6875rem]">
                      SKU: {code}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs font-bold text-red-600 sm:text-sm">
                    <DualPrice usd={card.prices.public} />
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 border-t border-neutral-100 pt-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selected}
                  onChange={() => onAccessoryToggle(card)}
                  className="size-4 shrink-0 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
                <span className="text-[0.625rem] font-medium leading-tight text-neutral-600 sm:text-[0.6875rem]">
                  Agregar a mi compra
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function ProductDetailComplementaCompra({
  tonerCards = [],
  defaultTonerSupplyType = 'original',
  accessoryCards = [],
  selectedTonerOptionIds,
  equipmentSelection,
  onTonerToggle,
  onAccessoryToggle,
  warrantyBaseLabel,
  warrantyUpgrades = [],
  selectedWarrantyOptionId,
  onWarrantySelect,
  beforeTonerSlot,
  leadingSlot,
  maintenanceSlot,
  className,
}: ProductDetailComplementaCompraProps) {
  const hasToner = tonerCards.length > 0;
  const hasAccessories = accessoryCards.length > 0;
  const hasWarranty =
    warrantyUpgrades.length > 0 &&
    warrantyBaseLabel != null &&
    selectedWarrantyOptionId != null &&
    onWarrantySelect != null;
  const hasConfig = hasAccessories || hasWarranty || Boolean(maintenanceSlot);

  if (!hasToner && !hasConfig) return null;

  return (
    <section
      className={cn('flex flex-col gap-4', className)}
      aria-label="Complementa tu compra"
    >
      {leadingSlot}

      {hasToner ? (
        <>
          {beforeTonerSlot}
          <ComplementaTonerCards
            cards={tonerCards}
            selectedTonerOptionIds={selectedTonerOptionIds}
            onTonerToggle={onTonerToggle}
            defaultSupplyType={defaultTonerSupplyType}
          />
        </>
      ) : null}

      {hasConfig ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#0f1f3d]">Configura tu equipo</h3>

          {hasAccessories ? (
            <ProductDetailHeroCollapsibleSection
              title="Accesorios"
              badge="Opcional"
              panelAriaLabel="Accesorios opcionales"
              defaultExpanded={false}
            >
              <ComplementaAccessoryCards
                cards={accessoryCards}
                equipmentSelection={equipmentSelection}
                onAccessoryToggle={onAccessoryToggle}
              />
            </ProductDetailHeroCollapsibleSection>
          ) : null}

          {hasWarranty ? (
            <ProductDetailHeroWarrantySelector
              baseLabel={warrantyBaseLabel}
              upgrades={warrantyUpgrades}
              selectedOptionId={selectedWarrantyOptionId}
              onSelectOption={onWarrantySelect}
            />
          ) : null}

          {maintenanceSlot}
        </div>
      ) : null}
    </section>
  );
}
