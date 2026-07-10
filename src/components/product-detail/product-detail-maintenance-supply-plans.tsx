import { Calendar, Wrench } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import type { ConsumableGroup } from '@/lib/product-equipment-consumables';
import {
  calculateMaintenancePlanPriceUsd,
  calculateSupplyPlanPriceUsd,
  formatMaintenanceSupplyPlanDurationLabel,
  MAINTENANCE_SUPPLY_PLAN_TERM_OPTIONS,
  resolveMaintenanceSupplyPlanPages,
  resolveTonerYieldPages,
  type MaintenanceSupplyPlanSelection,
  type MaintenanceSupplyPlanTermMonths,
  type MaintenanceSupplyPlanType,
} from '@/lib/maintenance-supply-plan-calculator';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailMaintenanceSupplyPlansProps {
  tonerCards: ConfigureTonerCard[];
  catalog: Product[];
  consumableGroups?: ConsumableGroup[];
  selection: MaintenanceSupplyPlanSelection;
  onSelectionChange: (selection: MaintenanceSupplyPlanSelection) => void;
  className?: string;
}

interface PlanOption {
  planType: Exclude<MaintenanceSupplyPlanType, 'none'>;
  title: string;
  priceUsd: number | null;
  description?: string;
  disabled?: boolean;
}

function TermPill({
  months,
  selected,
  onSelect,
}: {
  months: MaintenanceSupplyPlanTermMonths;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'h-8 flex-1 rounded-md border px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        selected
          ? 'border-red-600 bg-red-50 text-[#0f1f3d]'
          : 'border-border/70 bg-white text-[#0f1f3d] hover:bg-muted/30',
      )}
    >
      {months} meses
    </button>
  );
}

export function ProductDetailMaintenanceSupplyPlans({
  tonerCards,
  catalog,
  consumableGroups = [],
  selection,
  onSelectionChange,
  className,
}: ProductDetailMaintenanceSupplyPlansProps) {
  const originalToner = tonerCards.find((card) => card.supplyType === 'original');
  const compatibleToner = tonerCards.find((card) => card.supplyType === 'compatible');
  const planPages = resolveMaintenanceSupplyPlanPages(selection.termMonths);
  const durationLabel = formatMaintenanceSupplyPlanDurationLabel(selection.termMonths);

  const planOptions: PlanOption[] = [
    {
      planType: 'maintenance',
      title: 'Plan de Mantenimiento',
      priceUsd: calculateMaintenancePlanPriceUsd(selection.termMonths),
      description:
        'Incluye mantenimiento al término de garantía y al último mes.',
    },
    {
      planType: 'supply-original',
      title: 'Plan de Suministro Original',
      priceUsd: originalToner
        ? calculateSupplyPlanPriceUsd(
            planPages,
            originalToner.prices.public,
            resolveTonerYieldPages(originalToner, catalog, consumableGroups),
          )
        : null,
      disabled: !originalToner,
    },
    {
      planType: 'supply-compatible',
      title: 'Plan de Suministro Compatible',
      priceUsd: compatibleToner
        ? calculateSupplyPlanPriceUsd(
            planPages,
            compatibleToner.prices.public,
            resolveTonerYieldPages(compatibleToner, catalog, consumableGroups),
          )
        : null,
      disabled: !compatibleToner,
    },
  ];

  const visibleOptions = planOptions.filter((option) => !option.disabled);
  if (visibleOptions.length === 0) return null;

  const handlePlanSelect = (planType: Exclude<MaintenanceSupplyPlanType, 'none'>) => {
    if (selection.planType === planType) {
      onSelectionChange({ ...selection, planType: 'none' });
      return;
    }
    onSelectionChange({ ...selection, planType });
  };

  return (
    <ProductDetailHeroCollapsibleSection
      title="Planes de Mantenimiento/Suministro"
      icon={Wrench}
      badge="Opcional"
      panelAriaLabel="Planes de mantenimiento y suministro"
      className={className}
    >
      <div className="space-y-2">
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold text-[#0f1f3d] sm:text-xs">
            <Calendar
              className="size-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Duración del plan
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {MAINTENANCE_SUPPLY_PLAN_TERM_OPTIONS.map((months) => (
              <TermPill
                key={months}
                months={months}
                selected={selection.termMonths === months}
                onSelect={() =>
                  onSelectionChange({
                    ...selection,
                    termMonths: months,
                  })
                }
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="sr-only">Tipo de plan</legend>
          <ul className="space-y-1.5" role="radiogroup" aria-label="Planes de mantenimiento y suministro">
            {visibleOptions.map((option) => {
              const selected = selection.planType === option.planType;
              const inputId = `maintenance-supply-${option.planType}`;
              const priceAvailable = option.priceUsd != null && option.priceUsd > 0;

              return (
                <li key={option.planType}>
                  <label
                    htmlFor={inputId}
                    className={cn(
                      'flex cursor-pointer items-start gap-2 rounded-md border px-2 py-2 transition-colors focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2',
                      selected
                        ? 'border-red-600/40 bg-white'
                        : 'border-border/60 bg-white hover:bg-muted/20',
                      !priceAvailable && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name="maintenance-supply-plan"
                      value={option.planType}
                      checked={selected}
                      disabled={!priceAvailable}
                      onChange={() => handlePlanSelect(option.planType)}
                      className="mt-0.5 size-3.5 shrink-0 accent-red-600"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[0.6875rem] font-medium leading-snug text-[#0f1f3d] sm:text-xs">
                        {option.title}
                      </span>
                      <span className="text-[0.625rem] text-muted-foreground sm:text-[0.6875rem]">
                        {durationLabel}
                      </span>
                      {option.description ? (
                        <span className="text-[0.625rem] leading-snug text-muted-foreground sm:text-[0.6875rem]">
                          {option.description}
                        </span>
                      ) : null}
                      {priceAvailable ? (
                        <span className="text-[0.625rem] font-semibold text-muted-foreground sm:text-[0.6875rem]">
                          <DualPrice usd={option.priceUsd!} className="inline font-semibold" />
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-muted-foreground sm:text-[0.6875rem]">
                          Precio no disponible (falta precio del tóner)
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>
    </ProductDetailHeroCollapsibleSection>
  );
}
