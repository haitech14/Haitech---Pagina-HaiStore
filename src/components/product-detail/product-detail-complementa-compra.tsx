import { ImageOff, Printer, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

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
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';

interface ProductDetailComplementaCompraProps {
  tonerCards?: ConfigureTonerCard[];
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

function ComplementaTonerCards({
  cards,
  selectedTonerOptionIds,
  onTonerToggle,
}: {
  cards: ConfigureTonerCard[];
  selectedTonerOptionIds: Set<string>;
  onTonerToggle: (card: ConfigureTonerCard) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {cards.map((card) => {
        const selected = selectedTonerOptionIds.has(card.optionId);
        const inputId = `complementa-toner-${card.optionId}`;
        const code = card.code?.trim();

        return (
          <li key={card.optionId}>
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
                    <DualPrice usd={card.prices.public} alwaysBoth />
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 border-t border-neutral-100 pt-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selected}
                  onChange={() => onTonerToggle(card)}
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
                    <DualPrice usd={card.prices.public} alwaysBoth />
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
  className,
}: ProductDetailComplementaCompraProps) {
  const hasToner = tonerCards.length > 0;
  const hasAccessories = accessoryCards.length > 0;
  const hasWarranty =
    warrantyUpgrades.length > 0 &&
    warrantyBaseLabel != null &&
    selectedWarrantyOptionId != null &&
    onWarrantySelect != null;

  if (!hasToner && !hasAccessories && !hasWarranty) return null;

  return (
    <section
      className={cn('flex flex-col gap-2', className)}
      aria-label="Complementa tu compra"
    >
      {leadingSlot}
      {hasToner ? (
        <>
          {beforeTonerSlot}
          <ProductDetailHeroCollapsibleSection
          title="Adicionar Tóner"
          icon={Printer}
          badge="Opcional"
          panelAriaLabel="Adicionar Tóner opcional"
        >
          <ComplementaTonerCards
            cards={tonerCards}
            selectedTonerOptionIds={selectedTonerOptionIds}
            onTonerToggle={onTonerToggle}
          />
        </ProductDetailHeroCollapsibleSection>
        </>
      ) : null}

      {hasAccessories ? (
        <ProductDetailHeroCollapsibleSection
          title="Accesorios"
          icon={Settings}
          badge="Opcional"
          panelAriaLabel="Accesorios opcionales"
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
    </section>
  );
}
