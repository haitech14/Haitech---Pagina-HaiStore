import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailHeroCollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  badge?: string | undefined;
  panelAriaLabel?: string | undefined;
  defaultExpanded?: boolean | undefined;
  compact?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}

export function ProductDetailHeroCollapsibleSection({
  title,
  icon: Icon,
  badge,
  panelAriaLabel,
  defaultExpanded = false,
  compact = false,
  className,
  children,
}: ProductDetailHeroCollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const triggerId = useId();
  const panelId = useId();

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 bg-white',
        className,
      )}
    >
      <button
        type="button"
        id={triggerId}
        className={cn(
          'flex w-full items-center text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          compact
            ? 'min-h-8 gap-1.5 px-3 py-2'
            : 'gap-1.5 px-3 py-2 sm:px-3 sm:py-2.5',
        )}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        {Icon ? (
          <Icon
            className="size-4 shrink-0 text-[#0f1f3d]"
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={cn(
              'text-xs font-semibold text-[#0f1f3d]',
              compact && 'whitespace-nowrap',
            )}
          >
            {title}
          </span>
          {badge ? (
            <span
              className={cn(
                'shrink-0 rounded-full bg-neutral-100 px-1.5 py-px text-[9px] font-medium text-neutral-500',
              )}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'shrink-0 text-neutral-400 transition-transform duration-200',
            compact ? 'size-3.5' : 'size-4',
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
          'border-t border-neutral-200 px-3 pb-2.5 pt-2 sm:px-3 sm:pb-3',
          !expanded && 'hidden',
        )}
      >
        {children}
      </div>
    </div>
  );
}
