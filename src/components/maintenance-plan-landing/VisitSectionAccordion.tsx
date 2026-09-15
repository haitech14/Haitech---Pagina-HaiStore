import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type VisitFormStep = 1 | 2 | 3;

interface VisitSectionAccordionProps {
  step: VisitFormStep;
  title: string;
  subtitle: string;
  summary: string;
  complete: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function VisitSectionAccordion({
  step,
  title,
  subtitle,
  summary,
  complete,
  open,
  onToggle,
  children,
}: VisitSectionAccordionProps) {
  const headingId = `visit-section-${step}-title`;
  const panelId = `visit-section-${step}-panel`;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)]',
        !open && complete && 'border-[#D1FADF]',
      )}
    >
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          'flex w-full items-start gap-3 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
          open ? 'px-4 pt-4 sm:px-6 sm:pt-6' : 'px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-[#FAFAFA]',
        )}
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            complete ? 'bg-[#12B76A] text-white' : 'bg-[#E30613] text-white',
          )}
          aria-hidden
        >
          {complete ? <Check className="size-4" strokeWidth={2.75} /> : step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
              {title}
            </span>
            {complete && !open ? (
              <span className="rounded-full bg-[#E8F8EE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1B7A3D]">
                Completo
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-[#6B7280]">
            {open ? subtitle : summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'mt-1 size-5 shrink-0 text-[#9CA3AF] transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!open}
        className={cn(open && 'px-4 pb-4 sm:px-6 sm:pb-6')}
      >
        {open ? children : null}
      </div>
    </div>
  );
}
