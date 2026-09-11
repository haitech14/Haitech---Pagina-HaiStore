import { Link } from 'react-router-dom';
import { MoreHorizontal, ShoppingCart } from 'lucide-react';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import {
  ORDER_STATUS_LABEL,
  TIENDANOVA_ORDERS,
  type OrderStatus,
} from '@/data/tiendanova/dashboard';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<OrderStatus, string> = {
  entregado: 'bg-emerald-50 text-[#16A34A]',
  proceso: 'bg-blue-50 text-[#2563EB]',
  pagado: 'bg-violet-50 text-violet-600',
  envio: 'bg-orange-50 text-[#F59E0B]',
  cancelado: 'bg-rose-50 text-[#EF4444]',
};

export function OrdersTable() {
  return (
    <NovaCard className="overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-slate-800">Últimos pedidos</h2>
        </div>
        <Link
          to="/admin/pedidos"
          className="text-[12.5px] font-semibold text-[#2563EB] transition hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="pb-3 pr-3 font-semibold">Pedido</th>
              <th className="pb-3 pr-3 font-semibold">Cliente</th>
              <th className="pb-3 pr-3 font-semibold">Fecha</th>
              <th className="pb-3 pr-3 font-semibold">Estado</th>
              <th className="pb-3 pr-3 font-semibold">Total</th>
              <th className="pb-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {TIENDANOVA_ORDERS.map((order) => (
              <tr key={order.id} className="border-t border-slate-50 transition hover:bg-slate-50/70">
                <td className="py-3.5 pr-3 font-semibold text-slate-800">#{order.id}</td>
                <td className="py-3.5 pr-3 text-slate-600">{order.customer}</td>
                <td className="py-3.5 pr-3 text-slate-500">{order.date}</td>
                <td className="py-3.5 pr-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
                      STATUS_CLASS[order.status],
                    )}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-semibold text-slate-800">{order.total}</td>
                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Acciones del pedido ${order.id}`}
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NovaCard>
  );
}
