import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminOrderStatusBadge } from '@/components/admin/AdminOrderStatusBadge';
import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import type { StoreOrder } from '@/types/store';

function customerLabel(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

const paymentLabels: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

interface SalesListPanelProps {
  orders: StoreOrder[];
  isLoading: boolean;
}

export function SalesListPanel({ orders, isLoading }: SalesListPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
        <span className="sr-only">Cargando ventas…</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <AdminEmptyState
        title="Aún no hay ventas registradas"
        description="Las ventas de la tienda en línea aparecerán aquí. Usa «Nuevo» para registrar una venta en tienda con el punto de venta."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Nº venta</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Pago</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-semibold tabular-nums">{order.order_number}</td>
              <td className="px-4 py-3">{customerLabel(order)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3">
                <AdminOrderStatusBadge status={mapStoreOrderStatusToBadge(order.status)} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {paymentLabels[order.payment_status] ?? order.payment_status}
                {order.payment_method ? ` · ${order.payment_method}` : ''}
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {orders.length} venta{orders.length === 1 ? '' : 's'} mostrada{orders.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}
