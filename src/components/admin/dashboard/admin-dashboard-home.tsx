import { AdminDashboardChartsRow, AdminDashboardBottomRow, AdminDashboardMiddleRow } from '@/components/admin/dashboard/admin-dashboard-widgets';
import { AdminDashboardKpis } from '@/components/admin/dashboard/admin-dashboard-kpis';
import { AdminDashboardPageHeader } from '@/components/admin/dashboard/admin-dashboard-page-header';

export function AdminDashboardHome() {
  return (
    <div className="space-y-6">
      <AdminDashboardPageHeader />
      <AdminDashboardKpis />
      <AdminDashboardChartsRow />
      <AdminDashboardMiddleRow />
      <AdminDashboardBottomRow />
    </div>
  );
}
