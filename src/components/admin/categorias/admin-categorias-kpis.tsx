import { FolderTree, Package, Tags, Unlink } from 'lucide-react';

import type { AdminCategoriaKpi, AdminCategoriaRecord } from '@/types/admin-categorias';
import { cn } from '@/lib/utils';

const iconMap = {
  active: Tags,
  subcategories: FolderTree,
  products: Package,
  unassigned: Unlink,
} as const;

const iconStyles = {
  active: 'bg-blue-50 text-blue-600',
  subcategories: 'bg-amber-50 text-amber-600',
  products: 'bg-violet-50 text-violet-600',
  unassigned: 'bg-sky-50 text-sky-600',
} as const;

function buildKpis(records: AdminCategoriaRecord[]): AdminCategoriaKpi[] {
  const roots = records.filter((record) => !record.parentName).length;
  const subcategories = records.filter((record) => Boolean(record.parentName)).length;
  const products = records.reduce((sum, record) => sum + record.productCount, 0);
  const unassigned = records.filter((record) => record.productCount <= 0).length;

  return [
    {
      title: 'Categorías activas',
      value: String(roots),
      trend: 0,
      trendLabel: 'raíces',
      icon: 'active',
      sparkline: [roots],
    },
    {
      title: 'Subcategorías',
      value: String(subcategories),
      trend: 0,
      trendLabel: 'en árbol',
      icon: 'subcategories',
      sparkline: [subcategories],
    },
    {
      title: 'Productos asociados',
      value: String(products),
      trend: 0,
      trendLabel: 'en catálogo',
      icon: 'products',
      sparkline: [products],
    },
    {
      title: 'Sin productos',
      value: String(unassigned),
      trend: 0,
      trendLabel: 'categorías',
      icon: 'unassigned',
      sparkline: [unassigned],
    },
  ];
}

export function AdminCategoriasKpis({ records = [] }: { records?: AdminCategoriaRecord[] }) {
  const kpis = buildKpis(records);

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
                  {kpi.value}
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

            <p className="mt-2.5 text-xs text-muted-foreground">{kpi.trendLabel}</p>
          </article>
        );
      })}
    </div>
  );
}
