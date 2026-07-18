import { ImageOff } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { ProductDetailHeroWarrantySelector } from '@/components/product-detail/product-detail-hero-warranty-selector';
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
import { resolveStorefrontUi } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { ResolvedStorefrontUi, StoredStorefrontUi } from '@/types/product-storefront';

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
  storefrontUi?: StoredStorefrontUi | null;
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

const TONER_COLOR_SWATCH: Record<string, string> = {
  Negro: '#1a1a1a',
  Cyan: '#00a3e0',
  Magenta: '#e6007e',
  Amarillo: '#ffd100',
  Estándar: '#6b7280',
};

function resolveCardColor(card: ConfigureTonerCard): string {
  return (
    resolveTonerColorLabel(undefined, card.title) ??
    resolveTonerColorLabel(undefined, card.name) ??
    'Estándar'
  );
}

function extractTonerYieldLabel(card: ConfigureTonerCard): string | null {
  const fromDescription = card.description?.trim();
  if (fromDescription && fromDescription !== '—' && !/^rendimiento según modelo$/i.test(fromDescription)) {
    if (/\d/.test(fromDescription)) return fromDescription;
  }

  const raw = `${card.name} ${card.title}`;
  const match = raw.match(/\(([\d][\d.,]*)\s*(?:p[aá]g(?:inas)?|pages?)?\)/i);
  if (!match?.[1]) return null;

  const pages = Number(match[1].replace(/[.,\s]/g, ''));
  if (!Number.isFinite(pages) || pages <= 0) return null;
  return `${pages.toLocaleString('es-PE')} pág.`;
}

function extractTonerModelHint(card: ConfigureTonerCard): string | null {
  const raw = formatTonerCardDisplayTitle(card.name?.trim() || card.title?.trim() || '');
  const models = raw.match(/\b(?:MP|IM|M)\s*[\w+./-]{2,}/gi);
  if (!models || models.length === 0) return null;

  const unique = [...new Set(models.map((model) => model.replace(/\s+/g, ' ').trim().toUpperCase()))];
  const shown = unique.slice(0, 3).join(' · ');
  return unique.length > 3 ? `${shown}…` : shown;
}

function resolveTonerCardLabels(
  card: ConfigureTonerCard,
  ui: Pick<ResolvedStorefrontUi, 'tonerOriginalCardTitle' | 'tonerCompatibleCardTitle'>,
): {
  title: string;
  meta: string | null;
} {
  const color = resolveCardColor(card);
  const yieldLabel = extractTonerYieldLabel(card);
  const models = extractTonerModelHint(card);

  const title =
    color !== 'Estándar'
      ? color
      : card.supplyType === 'compatible'
        ? ui.tonerCompatibleCardTitle
        : ui.tonerOriginalCardTitle;

  const metaParts = [yieldLabel, models].filter(Boolean);
  return {
    title,
    meta: metaParts.length > 0 ? metaParts.join(' · ') : null,
  };
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
  storefrontUi,
}: {
  cards: ConfigureTonerCard[];
  selectedTonerOptionIds: Set<string>;
  onTonerToggle: (card: ConfigureTonerCard) => void;
  defaultSupplyType: ConfigureTonerSupplyType;
  storefrontUi: ResolvedStorefrontUi;
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

  const tabOptions = [
    {
      id: 'original' as const,
      label: storefrontUi.tonerOriginalTabLabel,
      count: originalCards.length,
    },
    {
      id: 'compatible' as const,
      label: storefrontUi.tonerCompatibleTabLabel,
      count: compatibleCards.length,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <h3 className="shrink-0 text-[0.8125rem] font-semibold text-[#0f1f3d]">
          {storefrontUi.tonerSectionTitle}
        </h3>

        <div
          role="tablist"
          aria-label="Tipo de tóner"
          id={tabListId}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-neutral-100/80 p-0.5"
        >
          {tabOptions.map((option) => {
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
                  'inline-flex items-center justify-center rounded px-2 py-1 text-[0.6875rem] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus-visible:ring-offset-1',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  isActive
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700',
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
          <ul className="grid grid-cols-1 gap-1.5" aria-label="Tóners disponibles">
            {activeCards.map((card) => {
              const selected = selectedTonerOptionIds.has(card.optionId);
              const { title, meta } = resolveTonerCardLabels(card, storefrontUi);
              const color = resolveCardColor(card);
              const swatch = TONER_COLOR_SWATCH[color] ?? TONER_COLOR_SWATCH.Estándar;
              const inputId = `complementa-toner-${card.supplyType}-${card.productId}`;
              const productName = card.name || card.title;

              return (
                <li key={`${card.supplyType}-${card.productId}`}>
                  <label
                    htmlFor={inputId}
                    className={cn(
                      'flex min-w-0 cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-2 transition-colors',
                      selected
                        ? 'border-red-600/35 bg-red-50/70'
                        : 'border-transparent bg-white hover:bg-neutral-50',
                    )}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={selected}
                      onChange={() => onTonerToggle(card)}
                      className="size-3.5 shrink-0 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    />
                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white p-0.5">
                      <ProductCardHoverImage
                        candidates={card.imageCandidates}
                        alt={productName}
                        className="size-full"
                        imageClassName="size-full object-contain"
                        placeholder={<ComplementaCardNoImage />}
                      />
                      <span
                        className="absolute bottom-1 right-1 size-2.5 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8125rem] font-semibold leading-tight text-[#0f1f3d]">
                        {title}
                      </p>
                      {meta ? (
                        <p className="mt-0.5 truncate text-[0.6875rem] leading-snug text-neutral-500">
                          {meta}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-[#0f1f3d]">
                      <DualPrice usd={card.prices.public} />
                    </p>
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
  storefrontUi,
  className,
}: ProductDetailComplementaCompraProps) {
  const resolvedUi = useMemo(() => resolveStorefrontUi(storefrontUi), [storefrontUi]);
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
            storefrontUi={resolvedUi}
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
