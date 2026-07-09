import { Link2, Package, ShoppingBag, Sparkles } from 'lucide-react';

import { ADMIN_PRODUCT_OPTIONS_KPIS } from '@/data/admin-variantes-data';
import { cn } from '@/lib/utils';

const iconMap = {
  total: Link2,
  cross_sell: ShoppingBag,
  upsell: Sparkles,
  optional: Package,
} as const;

const iconStyles = {
  total: 'bg-blue-50 text-blue-600',
  cross_sell: 'bg-emerald-50 text-emerald-600',
  upsell: 'bg-violet-50 text-violet-600',
  optional: 'bg-amber-50 text-amber-600',
} as const;

interface AdminProductOptionsKpisProps {
  values: {
    total: string;
    crossSell: string;
    upsell: string;
    optional: string;
  };
}

const kpiValueByIcon = {
  total: 'total',
  cross_sell: 'crossSell',
  upsell: 'upsell',
  optional: 'optional',
} as const;

export function AdminProductOptionsKpis({ values }: AdminProductOptionsKpisProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_PRODUCT_OPTIONS_KPIS.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const valueKey = kpiValueByIcon[kpi.icon];
        const displayValue = values[valueKey];

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
                  {displayValue}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconStyles[kpi.icon],
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{kpi.trendLabel}</p>
          </article>
        );
      })}
    </div>
  );
}
