import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CrmMetricTone = 'blue' | 'green' | 'purple' | 'red' | 'orange';

const toneStyles: Record<
  CrmMetricTone,
  { iconBg: string; icon: string; value: string }
> = {
  blue: {
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
    value: 'text-blue-600',
  },
  green: {
    iconBg: 'bg-emerald-100',
    icon: 'text-emerald-600',
    value: 'text-emerald-600',
  },
  purple: {
    iconBg: 'bg-violet-100',
    icon: 'text-violet-600',
    value: 'text-violet-600',
  },
  red: {
    iconBg: 'bg-red-100',
    icon: 'text-red-600',
    value: 'text-red-600',
  },
  orange: {
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    value: 'text-amber-600',
  },
};

interface CrmMetricCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string;
  periodLabel: string;
  icon: LucideIcon;
  tone?: CrmMetricTone;
  footer?: ReactNode;
  className?: string;
}

export function CrmMetricCard({
  title,
  value,
  secondaryValue,
  periodLabel,
  icon: Icon,
  tone = 'blue',
  footer,
  className,
}: CrmMetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border border-border/80 bg-card p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-md',
            styles.iconBg,
          )}
          aria-hidden="true"
        >
          <Icon className={cn('size-5', styles.icon)} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {title}
          </h3>
          <p className={cn('mt-2 text-3xl font-bold tabular-nums leading-none', styles.value)}>
            {value}
          </p>
          {secondaryValue != null && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">{secondaryValue}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
        </div>
      </div>
      {footer != null && <div className="mt-auto border-t pt-3">{footer}</div>}
    </article>
  );
}
