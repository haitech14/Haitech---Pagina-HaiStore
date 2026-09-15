import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroCollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  badge?: string | undefined;
  /** Número de paso visible (p. ej. 1, 2, 3). */
  stepNumber?: number | undefined;
  panelAriaLabel?: string | undefined;
  defaultExpanded?: boolean | undefined;
  /** Si se pasa, el panel es controlado (p. ej. acordeón exclusivo). */
  expanded?: boolean | undefined;
  onExpandedChange?: ((expanded: boolean) => void) | undefined;
  compact?: boolean | undefined;
  /** Acordeón interno, más compacto y sin sombra del contenedor padre. */
  nested?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}

export function ProductDetailHeroCollapsibleSection({
  title,
  icon: Icon,
  badge,
  stepNumber,
  panelAriaLabel,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  compact = false,
  nested = false,
  className,
  children,
}: ProductDetailHeroCollapsibleSectionProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : uncontrolledExpanded;
  const triggerId = useId();
  const panelId = useId();

  const setExpanded = (next: boolean) => {
    if (!isControlled) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <div
      className={cn(
        'overflow-hidden border border-neutral-200 bg-white',
        nested ? 'rounded-md' : 'rounded-lg',
        className,
      )}
    >
      <button
        type="button"
        id={triggerId}
        className={cn(
          'flex w-full items-center text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          compact || nested
            ? 'min-h-9 gap-2 px-3 py-2 sm:px-3.5'
            : 'gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3',
        )}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded(!expanded)}
      >
        {stepNumber != null ? (
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f1f3d] text-[0.625rem] font-bold tabular-nums text-white sm:text-[0.6875rem]"
            aria-hidden="true"
          >
            {stepNumber}
          </span>
        ) : Icon ? (
          <Icon
            className="size-4 shrink-0 text-[#0f1f3d] sm:size-[1.125rem]"
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              'text-[0.8125rem] font-semibold leading-snug text-[#0f1f3d] sm:text-sm',
              compact && 'whitespace-nowrap',
            )}
          >
            {stepNumber != null ? (
              <span className="sr-only">Paso {stepNumber}. </span>
            ) : null}
            {title}
          </span>
          {badge ? (
            <span
              className={cn(
                'shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium leading-none text-neutral-500 sm:text-[11px]',
              )}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'shrink-0 text-neutral-400 transition-transform duration-200',
            compact || nested ? 'size-4' : 'size-4 sm:size-[1.125rem]',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        {...(panelAriaLabel ? { 'aria-label': panelAriaLabel } : {})}
        hidden={!expanded}
        className={cn(
          'border-t border-neutral-200',
          nested ? 'px-2.5 py-2 sm:px-3' : 'px-3 pb-2.5 pt-2 sm:px-3 sm:pb-3',
          !expanded && 'hidden',
        )}
      >
        {children}
      </div>
    </div>
  );
}
