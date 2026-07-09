import { AdminDashboardKpis } from '@/components/admin/dashboard/admin-dashboard-kpis';
import { AdminDashboardPageHeader } from '@/components/admin/dashboard/admin-dashboard-page-header';
import {
  AdminDashboardMainColumn,
  AdminDashboardUtilityColumn,
} from '@/components/admin/dashboard/admin-dashboard-widgets';

export function AdminDashboardHome() {
  return (
    <div className="space-y-3">
      <AdminDashboardPageHeader />
      <AdminDashboardKpis />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <AdminDashboardMainColumn />
        <AdminDashboardUtilityColumn />
      </div>
    </div>
  );
}
