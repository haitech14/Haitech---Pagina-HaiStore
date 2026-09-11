import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  MAINTENANCE_INDIVIDUAL_INCLUDES,
  MAINTENANCE_PLAN_INCLUDES,
  MAINTENANCE_TERM_OPTIONS,
  formatMaintenancePen,
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
  className?: string;
}

export function PricingSummary({
  state,
  quote,
  onRequestPlan,
  onTermChange,
  className,
}: PricingSummaryProps) {
  const isPlan = quote.serviceMode === 'plan';
  const includes = isPlan ? MAINTENANCE_PLAN_INCLUDES : MAINTENANCE_INDIVIDUAL_INCLUDES;
  const location = [quote.city, quote.district].filter(Boolean).join(' · ');

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
            Ahorras {quote.savingsPercent}%
          </span>
        ) : null}
      </div>

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
              {formatMaintenancePen(quote.monthlyPen)}
            </span>
            <span className="text-sm font-semibold text-[#6B7280]">+ IGV /mes</span>
          </p>
          <p className="mt-1 text-sm font-bold text-[#111111]">
            {formatMaintenancePen(quote.monthlyTotalPen)}{' '}
            <span className="font-semibold text-[#6B7280]">total /mes</span>
          </p>
          {quote.savingsPercent > 0 ? (
            <p className="mt-1 text-xs text-[#9CA3AF] line-through">
              {formatMaintenancePen(quote.monthlyBeforeDiscount)} + IGV (
              {formatMaintenancePen(quote.monthlyBeforeDiscountTotal)} total)
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
      </dl>

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
        No incluye repuestos. Los repuestos necesarios serán cotizados por separado.
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
