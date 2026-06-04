import { Download } from 'lucide-react';

import { AdminDateRangePicker } from '@/components/admin/AdminDateRangePicker';
import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import { Button } from '@/components/ui/button';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import {
  useAdminDashboardKpis,
  useAdminInventoryByCategory,
} from '@/hooks/use-admin-dashboard';
import { cn } from '@/lib/utils';

function exportDashboardCsv(
  range: AdminDateRange,
  kpis: ReturnType<typeof useAdminDashboardKpis>['kpis'],
  inventory: ReturnType<typeof useAdminInventoryByCategory>['data'],
) {
  const lines = [
    'Sección,Valor',
    `Rango,${range.from.toISOString()} - ${range.to.toISOString()}`,
    `Ventas totales,${kpis.totalSales.value}`,
    `Pedidos,${kpis.orders.value}`,
    `Clientes nuevos,${kpis.newCustomers.value}`,
    `Tasa conversión,${kpis.conversionRate.value ?? '—'}`,
    '',
    'Inventario por categoría,Total,Stock bajo,% saludable',
    ...inventory.map(
      (row) => `${row.category},${row.total},${row.lowStock},${row.healthyPercent}%`,
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'panel-admin-resumen.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

interface AdminDashboardToolbarActionsProps {
  className?: string;
}

export function AdminDashboardToolbarActions({ className }: AdminDashboardToolbarActionsProps) {
  const { range, setRange } = useAdminDateRange();
  const { kpis } = useAdminDashboardKpis(range);
  const inventory = useAdminInventoryByCategory();

  return (
    <div className={cn('flex shrink-0 flex-nowrap items-center justify-end gap-2', className)}>
      <AdminDateRangePicker variant="toolbar" value={range} onChange={setRange} />
      <Button
        type="button"
        variant="outline"
        className="h-8 shrink-0 px-2.5 text-xs sm:text-sm"
        onClick={() => exportDashboardCsv(range, kpis, inventory.data)}
      >
        <Download className="size-4" aria-hidden="true" />
        Exportar
      </Button>
    </div>
  );
}
