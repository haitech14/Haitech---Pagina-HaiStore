import { AdminPedidosKpis } from '@/components/admin/pedidos/admin-pedidos-kpis';
import { AdminPedidosPageHeader } from '@/components/admin/pedidos/admin-pedidos-page-header';
import { AdminPedidosTablePanel } from '@/components/admin/pedidos/admin-pedidos-table-panel';
import { AdminPedidosWidgets } from '@/components/admin/pedidos/admin-pedidos-widgets';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import { useAdminOrdersList } from '@/hooks/use-admin-orders';

export function AdminPedidosDashboard() {
  const { range, setRange } = useAdminDateRange();
  const { data: orders = [], isLoading } = useAdminOrdersList();

  const pendingCount = orders.filter((order) => order.payment_status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPedidosPageHeader pendingCount={pendingCount} />
      <AdminPedidosKpis orders={orders} range={range} isLoading={isLoading} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminPedidosTablePanel
          orders={orders}
          range={range}
          onRangeChange={setRange}
          isLoading={isLoading}
        />
        <AdminPedidosWidgets orders={orders} range={range} />
      </div>
    </div>
  );
}
