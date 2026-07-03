import { AdminResumenKpis } from '@/components/admin/resumen/admin-resumen-kpis';
import { AdminResumenPageHeader } from '@/components/admin/resumen/admin-resumen-page-header';
import { AdminResumenTablePanel } from '@/components/admin/resumen/admin-resumen-table-panel';
import { AdminResumenWidgets } from '@/components/admin/resumen/admin-resumen-widgets';

export function AdminResumenDashboard() {
  return (
    <div className="space-y-6">
      <AdminResumenPageHeader />
      <AdminResumenKpis />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminResumenTablePanel />
        <AdminResumenWidgets />
      </div>
    </div>
  );
}
