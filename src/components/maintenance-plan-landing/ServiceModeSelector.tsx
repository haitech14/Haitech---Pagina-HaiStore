import { CalendarRange, Wrench } from 'lucide-react';

import {
  MAINTENANCE_SERVICE_MODES,
  type MaintenanceServiceModeId,
} from '@/data/maintenance-plan';
import { cn } from '@/lib/utils';

interface ServiceModeSelectorProps {
  value: MaintenanceServiceModeId;
  onChange: (mode: MaintenanceServiceModeId) => void;
  className?: string;
}

const MODE_ICONS = {
  plan: CalendarRange,
  individual: Wrench,
} as const;

/** Selector Plan / A Demanda debajo del banner de servicio técnico. */
export function ServiceModeSelector({ value, onChange, className }: ServiceModeSelectorProps) {
  return (
    <section
      aria-label="Modalidad de servicio técnico"
      className={cn('border-b border-[#E8E8E8] bg-white py-3 sm:py-4', className)}
    >
      <div className="container flex flex-col items-center px-4 sm:px-6">
        <div
          role="tablist"
          aria-label="Plan o a demanda"
          className="inline-flex w-full max-w-lg rounded-full bg-[#F3F4F6] p-1 sm:w-auto"
        >
          {MAINTENANCE_SERVICE_MODES.map((option) => {
            const selected = option.id === value;
            const Icon = MODE_ICONS[option.id];
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChange(option.id)}
                className={cn(
                  'min-h-11 flex-1 rounded-full px-5 text-sm font-bold transition-colors sm:min-w-[12.5rem] sm:flex-none',
                  'inline-flex items-center justify-center gap-2',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  selected
                    ? 'bg-[#E30613] text-white shadow-[0_6px_16px_-8px_rgba(227,6,19,0.85)]'
                    : 'text-[#4B5563] hover:text-[#111111]',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-[#6B7280] sm:text-[13px]">
          {MAINTENANCE_SERVICE_MODES.find((item) => item.id === value)?.hint}
        </p>
      </div>
    </section>
  );
}
