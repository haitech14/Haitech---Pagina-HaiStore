import { CalendarClock, ShoppingCart, Wrench } from 'lucide-react';
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
  icon: typeof ShoppingCart;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex min-h-[2.75rem] w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
        selected
          ? 'border-red-600 bg-red-50/40'
          : 'border-transparent bg-neutral-50 hover:bg-neutral-100',
      )}
    >
      <Icon
        className={cn(
          'size-4 shrink-0',
          selected ? 'text-red-600' : 'text-neutral-500',
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 leading-tight">
        <span
          className={cn(
            'block text-xs font-semibold',
            selected ? 'text-red-600' : 'text-neutral-800',
          )}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-[0.625rem] leading-snug text-neutral-500">
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
    <fieldset className={cn('border-0 p-0', className)}>
      <legend id={legendId} className="sr-only">
        Elige cómo llevarlo
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={legendId}
        className="grid grid-cols-2 items-stretch gap-2"
      >
        <PurchaseModeCard
          selected={purchaseMode === 'buy'}
          title="Comprar"
          subtitle="Pago único"
          icon={ShoppingCart}
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
