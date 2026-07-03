import { CalendarClock, ShoppingBag, Wrench } from 'lucide-react';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';

import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';

function PurchaseModeCard({
  selected,
  title,
  subtitle,
  icon: Icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  icon: typeof ShoppingBag;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex min-h-[3.25rem] w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all sm:min-h-[3.5rem] sm:px-2.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        selected
          ? 'bg-background text-foreground shadow-sm ring-1 ring-red-600/25'
          : 'bg-transparent text-foreground hover:bg-background/60',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors sm:size-8',
          selected ? 'bg-red-600 text-white' : 'bg-muted/80 text-muted-foreground',
        )}
        aria-hidden="true"
      >
        <Icon className="size-3.5 sm:size-4" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-xs font-semibold text-balance sm:text-sm">{title}</span>
        <span className="mt-0.5 block text-[0.6875rem] leading-snug text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

interface ProductDetailPurchaseModeProps {
  purchaseMode: PurchaseMode;
  onPurchaseModeChange: (mode: PurchaseMode) => void;
  rentalPlans: RentalPlanOption[];
  maintenancePlanMonthlyPen?: number | null;
  showMaintenancePlan?: boolean;
  onMaintenancePlanClick?: () => void;
  /** Muestra pestaña Alquilar aunque no haya planes cargados (equipos). */
  showRentalTab?: boolean;
  className?: string;
}

export function ProductDetailPurchaseMode({
  purchaseMode,
  onPurchaseModeChange,
  rentalPlans,
  maintenancePlanMonthlyPen,
  showMaintenancePlan = false,
  onMaintenancePlanClick,
  showRentalTab = false,
  className,
}: ProductDetailPurchaseModeProps) {
  const minRentalPen = useMemo(() => {
    if (rentalPlans.length === 0) return null;
    return Math.min(...rentalPlans.map((plan) => plan.monthlyPricePen));
  }, [rentalPlans]);

  const hasRentalPlans = rentalPlans.length > 0;
  const hasMaintenancePlan = showMaintenancePlan && (maintenancePlanMonthlyPen ?? 0) >= 0;
  if (!hasRentalPlans && !hasMaintenancePlan && !showRentalTab) return null;

  const legendId = 'purchase-mode-legend';
  const secondaryTitle = hasRentalPlans || showRentalTab ? 'Alquilar' : 'Plan de Mantenimiento';
  const secondarySubtitle = hasRentalPlans
    ? minRentalPen != null
      ? `Desde S/ ${minRentalPen.toLocaleString('es-PE')}/mes`
      : 'Consultar planes'
    : showRentalTab
      ? 'Desde S/ 150/mes'
      : maintenancePlanMonthlyPen != null
        ? `Desde S/ ${maintenancePlanMonthlyPen.toLocaleString('es-PE')}/mes`
        : 'Cotización mensual';
  const SecondaryIcon = hasRentalPlans || showRentalTab ? CalendarClock : Wrench;

  return (
    <fieldset className={cn('space-y-1.5 border-0 p-0', className)}>
      <legend id={legendId} className="text-xs font-semibold text-foreground sm:text-sm">
        Elige cómo llevarlo
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={legendId}
        className="grid grid-cols-2 items-stretch gap-1 rounded-lg border border-border/70 bg-muted/25 p-0.5 sm:rounded-xl sm:p-1"
      >
        <PurchaseModeCard
          selected={purchaseMode === 'buy'}
          title="Comprar"
          subtitle="Pago único"
          icon={ShoppingBag}
          onSelect={() => onPurchaseModeChange('buy')}
        />
        <PurchaseModeCard
          selected={purchaseMode === 'rent'}
          title={secondaryTitle}
          subtitle={secondarySubtitle}
          icon={SecondaryIcon}
          onSelect={() => {
            onPurchaseModeChange('rent');
            if (!hasRentalPlans && !showRentalTab && onMaintenancePlanClick) {
              onMaintenancePlanClick();
            }
          }}
        />
      </div>
    </fieldset>
  );
}
