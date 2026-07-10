import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatDisplayPriceFromUsd } from '@/lib/display-price';
import {
  selectEquipmentOption,
  type EquipmentSelectionState,
} from '@/lib/equipment-config-selection';
import { cn, penToUsd } from '@/lib/utils';
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';
import type { EquipmentConfigStep } from '@/types/product-detail';

export type PurchaseMode = 'buy' | 'rent';

interface ProductDetailOptionalProductsProps {
  steps: EquipmentConfigStep[];
  selection: EquipmentSelectionState;
  onSelectionChange: (selection: EquipmentSelectionState) => void;
  className?: string;
}

function formatOptionPrice(
  pricePen: number,
  priceUsd: number | undefined,
  displayCurrency: DisplayCurrency,
  dualPriceOrder: DualPriceOrder,
): string | null {
  if (pricePen <= 0 && (priceUsd == null || priceUsd <= 0)) return null;
  const usd = priceUsd != null && priceUsd > 0 ? priceUsd : penToUsd(pricePen);
  return `+${formatDisplayPriceFromUsd(usd, displayCurrency, dualPriceOrder)}`;
}

function OptionPill({
  optionId,
  name,
  description,
  image,
  selected,
  included,
  priceLabel,
  onSelect,
}: {
  optionId: string;
  name: string;
  description?: string;
  image?: string;
  selected: boolean;
  included?: boolean;
  priceLabel: string | null;
  onSelect: (optionId: string) => void;
}) {
  return (
    <button
      type="button"
      role={included ? 'presentation' : undefined}
      aria-pressed={included ? undefined : selected}
      disabled={included}
      onClick={() => onSelect(optionId)}
      className={cn(
        'flex w-full min-w-0 flex-row items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:gap-2.5 sm:px-2.5',
        included
          ? 'cursor-default border-emerald-200 bg-emerald-50 text-foreground'
          : selected
            ? 'border-red-600 bg-red-50 text-foreground'
            : 'border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/30',
      )}
    >
      {image ? (
        <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border/40 bg-white sm:size-12">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-contain p-0.5"
          />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="line-clamp-2 text-[0.625rem] font-semibold leading-tight sm:text-[0.6875rem]">
          {name}
        </span>
        {included ? (
          <span className="rounded-full bg-emerald-600 px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white">
            Incluido
          </span>
        ) : priceLabel ? (
          <span className="text-[0.5625rem] font-medium leading-tight text-muted-foreground sm:text-[0.625rem]">
            {priceLabel}
          </span>
        ) : null}
        {description ? (
          <span className="line-clamp-2 text-[0.5625rem] leading-tight text-muted-foreground sm:text-[0.625rem]">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function OptionalGroup({
  title,
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? (controlledOpen ?? false) : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  return (
    <details open={isOpen} className="group rounded-lg border border-border/60 bg-background text-left">
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold text-foreground marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          setOpen(!isOpen);
        }}
      >
        <span>{title}</span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-border/50 px-2 pb-2.5 pt-2">{children}</div>
    </details>
  );
}

export function ProductDetailOptionalProducts({
  steps,
  selection,
  onSelectionChange,
  className,
}: ProductDetailOptionalProductsProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const [garantiaOpen, setGarantiaOpen] = useState(false);
  const tonerStep = steps.find((step) => step.id === 'toner');
  const accesoriosStep = steps.find((step) => step.id === 'accesorios');
  const estabilizadorStep = steps.find((step) => step.id === 'estabilizador');
  const garantiaStep = steps.find((step) => step.id === 'garantia');

  if (!tonerStep && !accesoriosStep && !estabilizadorStep && !garantiaStep) {
    return null;
  }

  const handleSelect = (step: EquipmentConfigStep, optionId: string) => {
    onSelectionChange(selectEquipmentOption(selection, step, optionId));
  };

  const renderPillGroup = (step: EquipmentConfigStep) => {
    const selectedIds = selection[step.id] ?? new Set<string>();

    return (
      <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-2 sm:max-w-lg sm:grid-cols-2">
        {step.options.map((option) => (
          <OptionPill
            key={option.id}
            optionId={option.id}
            name={option.name}
            {...(option.image ? { image: option.image } : {})}
            {...(option.description ? { description: option.description } : {})}
            selected={selectedIds.has(option.id)}
            {...(option.included ? { included: true } : {})}
            priceLabel={formatOptionPrice(
              option.pricePen,
              option.priceUsd,
              displayCurrency,
              dualPriceOrder,
            )}
            onSelect={(id) => handleSelect(step, id)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className={cn('space-y-3 text-center', className)}>
      <div className="mx-auto w-full max-w-lg space-y-2 text-left">
        {tonerStep && !garantiaOpen ? (
          <OptionalGroup title={tonerStep.title}>{renderPillGroup(tonerStep)}</OptionalGroup>
        ) : null}

        {accesoriosStep && !garantiaOpen ? (
          <OptionalGroup title={accesoriosStep.title}>{renderPillGroup(accesoriosStep)}</OptionalGroup>
        ) : null}

        {estabilizadorStep && !garantiaOpen ? (
          <OptionalGroup title={estabilizadorStep.title}>{renderPillGroup(estabilizadorStep)}</OptionalGroup>
        ) : null}

        {garantiaStep ? (
          <OptionalGroup
            title={garantiaStep.title}
            open={garantiaOpen}
            onOpenChange={setGarantiaOpen}
          >
            {renderPillGroup(garantiaStep)}
          </OptionalGroup>
        ) : null}
      </div>
    </section>
  );
}
