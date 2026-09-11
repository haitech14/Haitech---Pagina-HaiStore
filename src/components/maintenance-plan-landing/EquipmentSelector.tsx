import { Check } from 'lucide-react';

import {
  MAINTENANCE_EQUIPMENT_OPTIONS,
  type MaintenanceEquipmentId,
} from '@/data/maintenance-plan';
import { cn } from '@/lib/utils';

interface EquipmentSelectorProps {
  value: MaintenanceEquipmentId;
  onChange: (id: MaintenanceEquipmentId) => void;
}

export function EquipmentSelector({ value, onChange }: EquipmentSelectorProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-[#111111]">Tipo de equipo</p>
      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        role="listbox"
        aria-label="Tipo de equipo"
      >
        {MAINTENANCE_EQUIPMENT_OPTIONS.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'group relative flex flex-col items-center rounded-2xl border bg-white px-2 py-3 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                selected
                  ? 'border-[#E30613] shadow-[0_8px_20px_-14px_rgba(227,6,19,0.55)] ring-1 ring-[#E30613]/20'
                  : 'border-[#E8E8E8] hover:border-[#E30613]/40 hover:shadow-sm',
              )}
            >
              <span
                className={cn(
                  'absolute right-2 top-2 flex size-4 items-center justify-center rounded-full border transition-colors',
                  selected
                    ? 'border-[#E30613] bg-[#E30613] text-white'
                    : 'border-[#D1D5DB] bg-white text-transparent',
                )}
                aria-hidden="true"
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span className="flex h-14 w-full items-center justify-center sm:h-16">
                <img
                  src={option.image}
                  alt=""
                  className="max-h-full max-w-[4.75rem] object-contain transition-transform duration-200 group-hover:scale-[1.04] sm:max-w-[5.5rem]"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="mt-2 text-[12px] font-semibold leading-tight text-[#111111] sm:text-[13px]">
                {option.label}
              </span>
              <span className="mt-0.5 text-[10px] leading-snug text-[#9CA3AF] sm:text-[11px]">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
