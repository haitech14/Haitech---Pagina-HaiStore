import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  MAINTENANCE_INDIVIDUAL_INCLUDES,
  MAINTENANCE_PLAN_INCLUDES,
  MAINTENANCE_PLAN_KINDS,
  MAINTENANCE_SUPPLY_PLAN_INCLUDES,
  MAINTENANCE_TERM_OPTIONS,
  formatMaintenancePen,
  type MaintenancePlanKindId,
  type MaintenancePlanQuote,
  type MaintenancePlanState,
  type MaintenanceTermMonths,
} from '@/data/maintenance-plan';
import { cn } from '@/lib/utils';

interface PricingSummaryProps {
  state: MaintenancePlanState;
  quote: MaintenancePlanQuote;
  onRequestPlan: () => void;
  onTermChange?: (termMonths: MaintenanceTermMonths) => void;
  onPlanKindChange?: (planKind: MaintenancePlanKindId) => void;
  className?: string;
}

export function PricingSummary({
  state,
  quote,
  onRequestPlan,
  onTermChange,
  onPlanKindChange,
  className,
}: PricingSummaryProps) {
  const isPlan = quote.serviceMode === 'plan';
  const includesSupplies = quote.planKind === 'supplies';
  const includes = isPlan
    ? includesSupplies
      ? MAINTENANCE_SUPPLY_PLAN_INCLUDES
      : MAINTENANCE_PLAN_INCLUDES
    : MAINTENANCE_INDIVIDUAL_INCLUDES;
  const location = [quote.city, quote.district].filter(Boolean).join(' · ');
  const suppliesUnavailable = isPlan && quote.supplyProjection == null;
  const supply = quote.supplyProjection;

  return (
    <aside
      className={cn(
        'rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.45)]',
        'lg:sticky lg:top-24',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#111111]">
          {isPlan ? 'Tu plan de mantenimiento' : 'Tu visita técnica'}
        </p>
        {isPlan && quote.savingsPercent > 0 ? (
          <span className="inline-flex items-center rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-bold text-[#1B7A3D]">
            Ahorras {quote.savingsPercent}% vs. 1 mes
          </span>
        ) : null}
      </div>

      {isPlan && onPlanKindChange ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-[#111111]">Tipo de plan</p>
          <div className="grid grid-cols-2 gap-2">
            {MAINTENANCE_PLAN_KINDS.map((option) => {
              const selected = option.id === state.planKind;
              const disabled = option.id === 'supplies' && suppliesUnavailable;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPlanKindChange(option.id)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-xl border px-2.5 py-2.5 text-left transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
                    selected
                      ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
                    disabled && 'cursor-not-allowed opacity-45 hover:border-[#E5E7EB]',
                  )}
                >
                  <span className="block text-sm font-bold text-[#111111]">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#6B7280]">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isPlan && onTermChange ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-[#111111]">Duración del plan</p>
          <div className="grid grid-cols-3 gap-2">
            {MAINTENANCE_TERM_OPTIONS.map((option) => {
              const selected = option.months === state.termMonths;
              return (
                <button
                  key={option.months}
                  type="button"
                  onClick={() => onTermChange(option.months)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-xl border px-2 py-2 text-center transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
                    selected
                      ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
                  )}
                >
                  <span className="block text-sm font-bold text-[#111111]">{option.label}</span>
                  {option.badge ? (
                    <span
                      className={cn(
                        'mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-tight',
                        option.discount > 0
                          ? 'bg-[#E8F8EE] text-[#1B7A3D]'
                          : 'bg-[#FFF1F1] text-[#E30613]',
                      )}
                    >
                      {option.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isPlan ? (
        <div className="mt-4">
          <p className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-4xl font-black tracking-tight text-[#111111]">
              {formatMaintenancePen(quote.contractPen, 2)}
            </span>
            <span className="text-sm font-semibold text-[#6B7280]">+ IGV</span>
          </p>
          <p className="mt-1 text-sm font-bold text-[#111111]">
            {formatMaintenancePen(quote.contractTotalPen, 2)}{' '}
            <span className="font-semibold text-[#6B7280]">
              total del plan ({quote.termMonths} {quote.termMonths === 1 ? 'mes' : 'meses'})
            </span>
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Equivale a {formatMaintenancePen(quote.monthlyPen, 2)} + IGV /mes
          </p>
          {quote.savingsPercent > 0 ? (
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Vs. plan de 1 mes: {formatMaintenancePen(quote.monthlyBeforeDiscount, 2)} + IGV /mes
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 flex flex-wrap items-baseline gap-1.5">
          <span className="text-4xl font-black tracking-tight text-[#111111]">
            {formatMaintenancePen(quote.visitPen)}
          </span>
          <span className="text-sm font-semibold text-[#6B7280]">/visita</span>
        </p>
      )}

      <dl className="mt-5 space-y-2 border-t border-[#F0F0F0] pt-4 text-[12px] sm:text-[13px]">
        <div>
          <dt className="text-[#9CA3AF]">Modalidad</dt>
          <dd className="font-semibold text-[#111111]">{isPlan ? 'Plan' : 'A Demanda'}</dd>
        </div>
        {isPlan ? (
          <div>
            <dt className="text-[#9CA3AF]">Tipo de plan</dt>
            <dd className="font-semibold text-[#111111]">
              {includesSupplies ? 'Plan de suministros' : 'Solo mantenimiento'}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[#9CA3AF]">Equipo</dt>
          <dd className="font-semibold text-[#111111]">{quote.equipmentLabel}</dd>
        </div>
        <div>
          <dt className="text-[#9CA3AF]">Modelo</dt>
          <dd className="font-semibold text-[#111111]">{quote.modelLabel}</dd>
        </div>
        <div>
          <dt className="text-[#9CA3AF]">Formato / impresión</dt>
          <dd className="font-semibold text-[#111111]">
            {quote.paperFormat} · {quote.printType === 'bw' ? 'B/N' : 'Color'}
            {quote.colorSurchargePen > 0
              ? ` · + ${formatMaintenancePen(quote.colorSurchargePen, 2)} color`
              : ''}
          </dd>
        </div>
        <div>
          <dt className="text-[#9CA3AF]">Dificultad / mano de obra</dt>
          <dd className="font-semibold text-[#111111]">{quote.difficultyLabel}</dd>
        </div>
        <div>
          <dt className="text-[#9CA3AF]">Cantidad</dt>
          <dd className="font-semibold text-[#111111]">
            {quote.quantity} {quote.quantity === 1 ? 'equipo' : 'equipos'}
          </dd>
        </div>
        {location ? (
          <div>
            <dt className="text-[#9CA3AF]">Ubicación</dt>
            <dd className="font-semibold text-[#111111]">{location}</dd>
          </div>
        ) : null}
        {isPlan ? (
          <div>
            <dt className="text-[#9CA3AF]">Volumen</dt>
            <dd className="font-semibold text-[#111111]">
              {quote.volumePages.toLocaleString('es-PE')} páginas/mes
            </dd>
          </div>
        ) : null}
        {isPlan ? (
          <div>
            <dt className="text-[#9CA3AF]">Mantenimiento</dt>
            <dd className="font-semibold text-[#111111]">
              {formatMaintenancePen(quote.maintenanceContractPen, 2)} + IGV
            </dd>
          </div>
        ) : null}
      </dl>

      {isPlan && supply ? (
        <div className="mt-4 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-3.5">
          <p className="text-xs font-bold text-[#111111]">
            Suministros proyectados ({quote.termMonths}{' '}
            {quote.termMonths === 1 ? 'mes' : 'meses'})
          </p>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            {supply.totalPages.toLocaleString('es-PE')} páginas en el plazo · cartuchos al alza
            según rendimiento ISO 5% y precio de venta.
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {supply.lines.map((line) => (
              <li
                key={line.color}
                className="flex items-start justify-between gap-3 text-[12px] text-[#4B5563]"
              >
                <span>
                  <span className="font-semibold text-[#111111]">{line.color}</span>
                  {' · '}
                  {line.unitsToBuy} cart. (consumo {line.rawUnits.toLocaleString('es-PE')})
                  <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                    Rend. {line.yieldPages.toLocaleString('es-PE')} págs ·{' '}
                    {formatMaintenancePen(line.unitSalePen, 2)} c/u
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[#111111]">
                  {formatMaintenancePen(line.linePen, 2)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-[#EDEDED] pt-2 text-[12px] font-bold text-[#111111]">
            Tóner: {formatMaintenancePen(supply.suppliesPen, 2)} + IGV
            {includesSupplies ? '' : ' (no incluido en este plan)'}
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl bg-[#FFF1F2] p-3.5">
        <p className="text-xs font-bold text-[#991B1B]">
          {isPlan ? 'Tu plan incluye' : 'La visita incluye'}
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {includes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[12px] leading-snug text-[#4B5563] sm:text-[13px]"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-[#E30613]"
                strokeWidth={2.5}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[11px] leading-snug text-[#9CA3AF]">
        {includesSupplies
          ? 'El tóner se proyecta según el modelo y el volumen. Los repuestos se cotizan por separado.'
          : 'No incluye tóner ni repuestos. Los consumibles y repuestos se cotizan por separado.'}
      </p>

      <Button
        type="button"
        className="mt-5 h-12 w-full bg-[#E30613] text-sm font-bold text-white hover:bg-[#c40511]"
        onClick={onRequestPlan}
      >
        {isPlan ? 'Solicitar plan' : 'Solicitar visita'}
      </Button>
    </aside>
  );
}
