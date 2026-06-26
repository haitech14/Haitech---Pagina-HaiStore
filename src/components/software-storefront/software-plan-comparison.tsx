import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { formatSoftwarePrice, getSoftwareDisplayPrice } from '@/data/software-catalog';
import type { SoftwareCatalogItem, SoftwarePlanId } from '@/types/software-catalog';
import { cn } from '@/lib/utils';

interface SoftwarePlanSelectorProps {
  item: SoftwareCatalogItem;
  selectedPlanId: SoftwarePlanId;
  onSelectPlan: (planId: SoftwarePlanId) => void;
  durationId: string;
  className?: string;
}

export function SoftwarePlanSelector({
  item,
  selectedPlanId,
  onSelectPlan,
  durationId,
  className,
}: SoftwarePlanSelectorProps) {
  const { effectiveRole } = useAuth();

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm font-semibold text-foreground">Selecciona un plan</p>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="tablist"
        aria-label="Planes de software"
      >
        {item.plans.map((plan) => {
          const isActive = selectedPlanId === plan.id;
          const price = getSoftwareDisplayPrice(item, plan.id, durationId, effectiveRole);
          return (
            <button
              key={plan.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectPlan(plan.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                isActive
                  ? 'border-red-600 bg-red-50 ring-1 ring-red-600/20'
                  : 'border-border/70 bg-card hover:border-red-600/30',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">{plan.label}</span>
                {plan.highlighted ? (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                    Más elegido
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              <p className="mt-2 text-sm font-bold text-neutral-950">
                {formatSoftwarePrice(price, item.pricePeriod)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SoftwarePlanComparisonProps {
  item: SoftwareCatalogItem;
  selectedPlanId: SoftwarePlanId;
  onSelectPlan: (planId: SoftwarePlanId) => void;
  durationId: string;
  className?: string;
}

function ComparisonCell({ value }: { value: boolean | string | undefined }) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">Sí</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <X className="size-3.5" aria-hidden="true" />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span className="text-xs font-medium text-foreground sm:text-sm">{value ?? '—'}</span>;
}

export function SoftwarePlanComparison({
  item,
  selectedPlanId,
  onSelectPlan,
  durationId,
  className,
}: SoftwarePlanComparisonProps) {
  const { effectiveRole } = useAuth();

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-[40rem]">
        <div className="grid grid-cols-4 gap-3">
          <div />
          {item.plans.map((plan) => {
            const highlighted = plan.highlighted === true;
            const price = getSoftwareDisplayPrice(item, plan.id, durationId, effectiveRole);
            return (
              <div
                key={plan.id}
                className={cn(
                  'rounded-xl border p-4 text-center',
                  highlighted
                    ? 'border-red-600/40 bg-red-50 ring-1 ring-red-600/20'
                    : 'border-border/70 bg-card',
                )}
              >
                <p className="text-sm font-bold text-foreground">{plan.label}</p>
                {highlighted ? (
                  <p className="mt-1 text-xs font-medium text-red-600">Más elegido</p>
                ) : null}
                <p className="mt-2 text-lg font-bold text-neutral-950">
                  {formatSoftwarePrice(price, item.pricePeriod)}
                </p>
                <Button
                  type="button"
                  variant={selectedPlanId === plan.id ? 'default' : 'outline'}
                  className={cn(
                    'mt-4 min-h-10 w-full text-xs font-semibold sm:text-sm',
                    selectedPlanId === plan.id ? 'bg-red-600 hover:bg-red-700' : '',
                  )}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  Seleccionar plan
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          {item.planComparison.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-4 items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2.5"
            >
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">{row.label}</span>
              <div className="flex justify-center">
                <ComparisonCell value={row.basico} />
              </div>
              <div className="flex justify-center">
                <ComparisonCell value={row.empresarial} />
              </div>
              <div className="flex justify-center">
                <ComparisonCell value={row.premium} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
