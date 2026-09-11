import { Check, Settings, Shield, Wrench, type LucideIcon } from 'lucide-react';

import {
  VISIT_DEFECT_OPTIONS,
  type VisitDefectId,
  type VisitServiceIconId,
} from '@/data/maintenance-visit';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<VisitServiceIconId, LucideIcon> = {
  wrench: Wrench,
  shield: Shield,
  settings: Settings,
};

interface VisitServiceTypeSelectorProps {
  value: VisitDefectId;
  onChange: (id: VisitDefectId) => void;
}

export function VisitServiceTypeSelector({ value, onChange }: VisitServiceTypeSelectorProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2.5"
      role="listbox"
      aria-label="Tipo de servicio"
    >
        {VISIT_DEFECT_OPTIONS.map((option) => {
          const selected = option.id === value;
          const Icon = SERVICE_ICONS[option.icon];
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
                aria-hidden
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl transition-colors sm:size-14',
                  selected ? 'bg-[#FFF1F1] text-[#E30613]' : 'bg-[#F7F7F8] text-[#4B5563]',
                )}
              >
                <Icon className="size-6" strokeWidth={1.75} aria-hidden />
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
  );
}
