import { ImageOff } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { ProductDetailHeroWarrantySelector } from '@/components/product-detail/product-detail-hero-warranty-selector';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { EquipmentSelectionState } from '@/lib/equipment-config-selection';
import {
  HERO_WARRANTY_BASE_OPTION_ID,
  type ConfigureHeroAccessoryCard,
  type ConfigureHeroWarrantyUpgrade,
} from '@/lib/product-configure-hero-options';
import { IM430F_ORIGINAL_TONER_PRODUCT_ID } from '@/lib/equipment-config-catalog';
import {
  formatTonerCardDisplayTitle,
  resolveTonerColorLabel,
  type ConfigureTonerCard,
  type ConfigureTonerSupplyType,
} from '@/lib/product-configure-toner';
import { resolveStorefrontUi } from '@/lib/product-storefront-detail';
import { cn, penToUsd } from '@/lib/utils';
import type { ResolvedStorefrontUi, StoredStorefrontUi } from '@/types/product-storefront';

interface ProductDetailComplementaCompraProps {
  tonerCards?: ConfigureTonerCard[];
  defaultTonerSupplyType?: ConfigureTonerSupplyType;
  accessoryCards?: ConfigureHeroAccessoryCard[];
  stabilizerCard?: ConfigureHeroAccessoryCard | null;
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
  /** Sidebar mockup: lista compacta sin tabs de tóner. */
  variant?: 'default' | 'sidebar';
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

function extractTonerYieldPagesLabel(card: ConfigureTonerCard): string | null {
  if (
    card.productId === IM430F_ORIGINAL_TONER_PRODUCT_ID ||
    /\bim\s*430\s*f\b/i.test(`${card.name} ${card.title}`)
  ) {
    return '15,500';
  }

  const fromDescription = card.description?.trim();
  if (fromDescription && fromDescription !== '—' && !/^rendimiento según modelo$/i.test(fromDescription)) {
    const rendMatch = fromDescription.match(/(?:rend(?:imiento)?|p[aá]g(?:inas)?)[^\d]*([\d][\d.,]*)/i);
    const pagesMatch = rendMatch?.[1] ?? fromDescription.match(/([\d]{1,3}(?:[.,]\d{3})+)/)?.[1];
    if (pagesMatch) {
      const pages = Number(pagesMatch.replace(/[.,\s]/g, ''));
      if (Number.isFinite(pages) && pages >= 1000) {
        return pages.toLocaleString('es-PE');
      }
    }
  }

  const raw = `${card.name} ${card.title}`;
  const match = raw.match(/\(([\d][\d.,]*)\s*(?:p[aá]g(?:inas)?|pages?)?\)/i);
  if (!match?.[1]) return null;

  const pages = Number(match[1].replace(/[.,\s]/g, ''));
  if (!Number.isFinite(pages) || pages < 1000) return null;
  return pages.toLocaleString('es-PE');
}

function extractTonerModelHint(card: ConfigureTonerCard): string | null {
  const raw = formatTonerCardDisplayTitle(card.name?.trim() || card.title?.trim() || '');
  const models = raw.match(/\b(?:MP|IM|M)\s*[\w+./-]{2,}/gi);
  if (!models || models.length === 0) return null;

  const unique = [...new Set(models.map((model) => model.replace(/\s+/g, ' ').trim().toUpperCase()))];
  return unique[0] ?? null;
}

function resolveTonerCardLabels(card: ConfigureTonerCard): {
  title: string;
  code: string | null;
  yieldLabel: string | null;
} {
  const color = resolveCardColor(card);
  const model = extractTonerModelHint(card);
  const yieldPages = extractTonerYieldPagesLabel(card);
  const supplyPrefix =
    card.supplyType === 'compatible' ? 'Toner Compatible' : 'Toner Original';

  const title = [supplyPrefix, model, color !== 'Estándar' ? color : null]
    .filter(Boolean)
    .join(' ');

  return {
    title:
      title ||
      formatTonerCardDisplayTitle(card.title?.trim() || card.name?.trim() || supplyPrefix),
    code: card.code?.trim() || null,
    yieldLabel: yieldPages ? `${yieldPages} págs al 5%` : null,
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
              const { title, code, yieldLabel } = resolveTonerCardLabels(card);
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
                      <p className="truncate text-xs font-semibold leading-tight text-[#0f1f3d]">
                        {title}
                      </p>
                      {code ? (
                        <p className="mt-0.5 truncate text-[0.625rem] leading-snug text-neutral-500">
                          Código: {code}
                        </p>
                      ) : null}
                      {yieldLabel ? (
                        <p className="mt-0.5 truncate text-[0.625rem] leading-snug text-neutral-500">
                          {yieldLabel}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-[0.6875rem] font-semibold tabular-nums text-[#0f1f3d]">
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
                  <p className="mt-0.5 text-[0.6875rem] font-semibold text-red-600">
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

function ComplementaSidebarAccessoryRow({
  card,
  selected,
  onToggle,
}: {
  card: ConfigureHeroAccessoryCard;
  selected: boolean;
  onToggle: () => void;
}) {
  const inputId = `sidebar-accessory-${card.stepId}-${card.optionId}`;
  const hasPrice = card.prices.public > 0.001;

  return (
    <li>
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-start gap-2.5 rounded-md border px-2.5 py-2.5 transition-colors',
          selected ? 'border-red-600/30 bg-red-50/50' : 'border-neutral-200 bg-white',
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 size-3.5 shrink-0 accent-red-600"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold leading-snug text-[#0f1f3d]">
            {card.title}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0f1f3d]">
          {hasPrice ? <DualPrice usd={card.prices.public} /> : 'Consultar precio'}
        </span>
      </label>
    </li>
  );
}

function ComplementaSidebarRows({
  tonerCards,
  selectedTonerOptionIds,
  onTonerToggle,
  accessoryCards,
  stabilizerCard,
  equipmentSelection,
  onAccessoryToggle,
  warrantyBaseLabel,
  warrantyUpgrades,
  selectedWarrantyOptionId,
  onWarrantySelect,
}: {
  tonerCards: ConfigureTonerCard[];
  selectedTonerOptionIds: Set<string>;
  onTonerToggle: (card: ConfigureTonerCard) => void;
  accessoryCards: ConfigureHeroAccessoryCard[];
  stabilizerCard?: ConfigureHeroAccessoryCard | null;
  equipmentSelection: EquipmentSelectionState;
  onAccessoryToggle: (card: ConfigureHeroAccessoryCard) => void;
  warrantyBaseLabel?: string;
  warrantyUpgrades: ConfigureHeroWarrantyUpgrade[];
  selectedWarrantyOptionId?: string | undefined;
  onWarrantySelect?: ((optionId: string) => void) | undefined;
}) {
  const primaryToner = dedupeTonerCards(tonerCards)[0] ?? null;
  const primaryWarranty = warrantyUpgrades[0] ?? null;
  const warrantySelected =
    primaryWarranty != null &&
    selectedWarrantyOptionId != null &&
    selectedWarrantyOptionId === primaryWarranty.optionId;

  return (
    <ul className="space-y-2" aria-label="Complementa tu compra">
      {primaryToner ? (
        <li>
          {(() => {
            const selected = selectedTonerOptionIds.has(primaryToner.optionId);
            const { title, yieldLabel } = resolveTonerCardLabels(primaryToner);
            const inputId = `sidebar-toner-${primaryToner.productId}`;
            return (
              <label
                htmlFor={inputId}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-md border px-2.5 py-2.5 transition-colors',
                  selected ? 'border-red-600/30 bg-red-50/50' : 'border-neutral-200 bg-white',
                )}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selected}
                  onChange={() => onTonerToggle(primaryToner)}
                  className="mt-1 size-3.5 shrink-0 accent-red-600"
                />
                <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white p-0.5">
                  <ProductCardHoverImage
                    candidates={primaryToner.imageCandidates}
                    alt={title}
                    className="size-full"
                    imageClassName="size-full object-contain"
                    placeholder={<ComplementaCardNoImage />}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold leading-snug text-[#0f1f3d]">
                    {title}
                  </span>
                  {yieldLabel ? (
                    <span className="mt-0.5 block text-[0.625rem] leading-snug text-neutral-500">
                      {yieldLabel}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0f1f3d]">
                  <DualPrice usd={primaryToner.prices.public} />
                </span>
              </label>
            );
          })()}
        </li>
      ) : null}

      {primaryWarranty && onWarrantySelect && warrantyBaseLabel ? (
        <li>
          <label
            htmlFor={`sidebar-warranty-${primaryWarranty.optionId}`}
            className={cn(
              'flex cursor-pointer items-start gap-2.5 rounded-md border px-2.5 py-2.5 transition-colors',
              warrantySelected ? 'border-red-600/30 bg-red-50/50' : 'border-neutral-200 bg-white',
            )}
          >
            <input
              id={`sidebar-warranty-${primaryWarranty.optionId}`}
              type="checkbox"
              checked={warrantySelected}
              onChange={() =>
                onWarrantySelect(
                  warrantySelected ? HERO_WARRANTY_BASE_OPTION_ID : primaryWarranty.optionId,
                )
              }
              className="mt-1 size-3.5 shrink-0 accent-red-600"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold leading-snug text-[#0f1f3d]">
                Garantía extendida
              </span>
              <span className="mt-0.5 block text-[0.625rem] leading-snug text-neutral-500">
                {primaryWarranty.label}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0f1f3d]">
              <DualPrice usd={primaryWarranty.priceUsd ?? penToUsd(primaryWarranty.pricePen)} />
            </span>
          </label>
        </li>
      ) : null}

      {accessoryCards.map((card) => {
        const selected = (equipmentSelection[card.stepId] ?? new Set<string>()).has(card.optionId);
        return (
          <ComplementaSidebarAccessoryRow
            key={`${card.stepId}-${card.optionId}`}
            card={card}
            selected={selected}
            onToggle={() => onAccessoryToggle(card)}
          />
        );
      })}

      {stabilizerCard ? (
        <ComplementaSidebarAccessoryRow
          card={stabilizerCard}
          selected={(equipmentSelection[stabilizerCard.stepId] ?? new Set<string>()).has(
            stabilizerCard.optionId,
          )}
          onToggle={() => onAccessoryToggle(stabilizerCard)}
        />
      ) : null}
    </ul>
  );
}

export function ProductDetailComplementaCompra({
  tonerCards = [],
  defaultTonerSupplyType = 'original',
  accessoryCards = [],
  stabilizerCard = null,
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
  variant = 'default',
}: ProductDetailComplementaCompraProps) {
  const resolvedUi = useMemo(() => resolveStorefrontUi(storefrontUi), [storefrontUi]);
  const isDesktopLayout = useMediaQuery('(min-width: 1024px)');
  const isSidebarVariant = variant === 'sidebar';
  const hasToner = tonerCards.length > 0;
  const hasAccessories = accessoryCards.length > 0;
  const hasWarranty =
    warrantyUpgrades.length > 0 &&
    warrantyBaseLabel != null &&
    selectedWarrantyOptionId != null &&
    onWarrantySelect != null;
  const hasStabilizer = stabilizerCard != null;
  const hasConfig = hasAccessories || hasWarranty || hasStabilizer || Boolean(maintenanceSlot);

  if (!hasToner && !hasConfig) return null;

  if (isSidebarVariant) {
    return (
      <section className={className} aria-label="Complementa tu compra">
        <h3 className="mb-2.5 text-xs font-semibold text-[#0f1f3d]">Complementa tu compra</h3>
        <ComplementaSidebarRows
          tonerCards={tonerCards}
          selectedTonerOptionIds={selectedTonerOptionIds}
          onTonerToggle={onTonerToggle}
          accessoryCards={accessoryCards}
          stabilizerCard={stabilizerCard}
          equipmentSelection={equipmentSelection}
          onAccessoryToggle={onAccessoryToggle}
          warrantyUpgrades={warrantyUpgrades}
          selectedWarrantyOptionId={selectedWarrantyOptionId}
          {...(warrantyBaseLabel != null ? { warrantyBaseLabel } : {})}
          {...(onWarrantySelect != null ? { onWarrantySelect } : {})}
        />
      </section>
    );
  }

  const body = (
    <>
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
    </>
  );

  if (!isDesktopLayout) {
    return (
      <div className={className}>
        <ProductDetailHeroCollapsibleSection
          title="Complementa tu compra"
          panelAriaLabel="Complementa tu compra"
          defaultExpanded={false}
        >
          <div className="flex flex-col gap-4">{body}</div>
        </ProductDetailHeroCollapsibleSection>
      </div>
    );
  }

  return (
    <section
      className={cn('flex flex-col gap-4', className)}
      aria-label="Complementa tu compra"
    >
      {body}
    </section>
  );
}
