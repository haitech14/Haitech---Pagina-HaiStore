import { Check } from 'lucide-react';

import {
  SOLUTION_MODALITIES,
  type SolutionModalityId,
} from '@/data/rental-solution-configurator';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  value: SolutionModalityId;
  onChange: (modality: SolutionModalityId) => void;
}

export function PlanSelector({ value, onChange }: PlanSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
        Selecciona tu modalidad
      </h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        Elige una opción. Solo puedes seleccionar una modalidad a la vez.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {SOLUTION_MODALITIES.map((plan) => {
          const selected = value === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(plan.id)}
              className={cn(
                'group flex h-full flex-col rounded-2xl border bg-white p-4 text-left shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] transition-all duration-200 sm:p-5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] focus-visible:ring-offset-2',
                selected
                  ? 'border-[#E60012] ring-2 ring-[#E60012]/25'
                  : 'border-[#E8E8E8] hover:border-[#E60012]/40 hover:shadow-[0_12px_28px_-18px_rgba(230,0,18,0.35)]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-[#111111] sm:text-lg">{plan.title}</p>
                  <p className="mt-1 text-sm leading-snug text-[#6B7280]">{plan.subtitle}</p>
                </div>
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                    selected
                      ? 'border-[#E60012] bg-[#E60012] text-white'
                      : 'border-[#D1D5DB] bg-white text-transparent',
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check
                      className={cn(
                        'mt-0.5 size-4 shrink-0 transition-colors',
                        selected ? 'text-[#E60012]' : 'text-[#9CA3AF]',
                      )}
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}
