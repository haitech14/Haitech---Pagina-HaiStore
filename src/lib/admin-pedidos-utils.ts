import {
  calcTrendPercent,
  getPreviousPeriod,
  isDateInRange,
  type AdminDateRange,
} from '@/components/admin/AdminDateRangePicker';
import { formatOrderTotal } from '@/lib/admin-order-status';
import type {
  AdminPedidosChannel,
  AdminPedidosKpi,
  AdminPedidosPaymentDistribution,
  AdminPedidosSalesPoint,
  AdminPedidosStatusDistribution,
  AdminPedidosTab,
  AdminPedidosTabCounts,
} from '@/types/admin-pedidos';
import type { StoreOrder, StoreOrderStatus, StorePaymentStatus } from '@/types/store';

const STATUS_COLORS: Record<Exclude<AdminPedidosTab, 'todos'>, string> = {
  pendiente: '#3B82F6',
  en_proceso: '#F59E0B',
  entregado: '#22C55E',
  cancelado: '#94A3B8',
};

const PAYMENT_COLORS: Record<StorePaymentStatus, string> = {
  pending: '#F59E0B',
  paid: '#22C55E',
  failed: '#EF4444',
  refunded: '#94A3B8',
};

const PAYMENT_LABELS: Record<StorePaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

const TAB_LABELS: Record<Exclude<AdminPedidosTab, 'todos'>, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function mapOrderToPedidosTab(order: StoreOrder): Exclude<AdminPedidosTab, 'todos'> {
  if (order.status === 'cancelled') return 'cancelado';
  if (order.status === 'delivered') return 'entregado';
  if (order.status === 'pending_payment' || order.payment_status === 'pending') return 'pendiente';
  return 'en_proceso';
}

export function mapOrderChannel(order: StoreOrder): AdminPedidosChannel {
  const provider = (order.payment_provider ?? '').toLowerCase();
  const method = (order.payment_method ?? '').toLowerCase();

  if (provider.includes('mercadopago') || method.includes('mercadopago')) return 'mercadopago';
  if (method.includes('transfer') || method.includes('deposito')) return 'transferencia';
  if (method.includes('tpv') || method.includes('mostrador')) return 'tpv';
  if (order.user_id) return 'web';
  return 'otro';
}

export const CHANNEL_LABELS: Record<AdminPedidosChannel, string> = {
  web: 'Tienda web',
  tpv: 'Punto de venta',
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

export function orderCustomerLabel(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.company_name?.trim() ||
    customer?.full_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

export function orderCustomerRuc(order: StoreOrder): string {
  return order.customer?.tax_id?.trim() || '—';
}

export function filterOrdersInRange(orders: StoreOrder[], range: AdminDateRange) {
  return orders.filter((order) => isDateInRange(order.created_at, range));
}

export function computePedidosTabCounts(orders: StoreOrder[]): AdminPedidosTabCounts {
  const counts: AdminPedidosTabCounts = {
    todos: orders.length,
    pendiente: 0,
    en_proceso: 0,
    entregado: 0,
    cancelado: 0,
  };

  for (const order of orders) {
    const tab = mapOrderToPedidosTab(order);
    counts[tab] += 1;
  }

  return counts;
}

export function computeStatusDistribution(orders: StoreOrder[]): AdminPedidosStatusDistribution[] {
  const counts = computePedidosTabCounts(orders);
  const total = Math.max(orders.length, 1);

  return (['pendiente', 'en_proceso', 'entregado', 'cancelado'] as const).map((status) => ({
    status,
    label: TAB_LABELS[status],
    count: counts[status],
    percent: Number(((counts[status] / total) * 100).toFixed(1)),
    color: STATUS_COLORS[status],
  }));
}

export function computePaymentDistribution(orders: StoreOrder[]): AdminPedidosPaymentDistribution[] {
  const total = Math.max(orders.length, 1);
  const tally: Record<StorePaymentStatus, number> = {
    pending: 0,
    paid: 0,
    failed: 0,
    refunded: 0,
  };

  for (const order of orders) {
    tally[order.payment_status] += 1;
  }

  return (Object.keys(tally) as StorePaymentStatus[]).map((paymentStatus) => ({
    paymentStatus,
    label: PAYMENT_LABELS[paymentStatus],
    count: tally[paymentStatus],
    percent: Number(((tally[paymentStatus] / total) * 100).toFixed(1)),
    color: PAYMENT_COLORS[paymentStatus],
  }));
}

export function computeSalesSeries(orders: StoreOrder[], range: AdminDateRange): AdminPedidosSalesPoint[] {
  const paidInRange = filterOrdersInRange(
    orders.filter((order) => order.payment_status === 'paid' && order.status !== 'cancelled'),
    range,
  );

  const byDay = new Map<string, number>();
  for (const order of paidInRange) {
    const key = order.created_at.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + (order.total_pen ?? order.total_usd * 3.5));
  }

  const points: AdminPedidosSalesPoint[] = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const key = cursor.toISOString().slice(0, 10);
    const day = cursor.getDate();
    const month = cursor.toLocaleDateString('es-PE', { month: 'short' });
    points.push({
      date: `${day} ${month}`,
      value: Math.round(byDay.get(key) ?? 0),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (points.length > 12) {
    const step = Math.ceil(points.length / 8);
    return points.filter((_, index) => index % step === 0 || index === points.length - 1);
  }

  return points;
}

export function computePedidosKpis(orders: StoreOrder[], range: AdminDateRange): AdminPedidosKpi[] {
  const previous = getPreviousPeriod(range);
  const current = filterOrdersInRange(orders, range);
  const prev = filterOrdersInRange(orders, previous);

  const paidCurrent = current.filter(
    (order) => order.payment_status === 'paid' && order.status !== 'cancelled',
  );
  const paidPrev = prev.filter(
    (order) => order.payment_status === 'paid' && order.status !== 'cancelled',
  );

  const salesCurrent = paidCurrent.reduce(
    (sum, order) => sum + (order.total_pen ?? order.total_usd * 3.5),
    0,
  );
  const salesPrev = paidPrev.reduce(
    (sum, order) => sum + (order.total_pen ?? order.total_usd * 3.5),
    0,
  );


  const pendingCurrent = current.filter((order) => order.payment_status === 'pending').length;
  const pendingPrev = prev.filter((order) => order.payment_status === 'pending').length;

  const deliveredCurrent = current.filter((order) => order.status === 'delivered').length;
  const deliveredPrev = prev.filter((order) => order.status === 'delivered').length;

  return [
    {
      title: 'Total pedidos',
      value: String(current.length),
      trend: calcTrendPercent(current.length, prev.length) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'orders',
    },
    {
      title: 'Ventas del periodo',
      value: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(salesCurrent),
      trend: calcTrendPercent(salesCurrent, salesPrev) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'sales',
    },
    {
      title: 'Pendientes de pago',
      value: String(pendingCurrent),
      trend: calcTrendPercent(pendingCurrent, pendingPrev) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'pending',
    },
    {
      title: 'Pedidos entregados',
      value: String(deliveredCurrent),
      trend: calcTrendPercent(deliveredCurrent, deliveredPrev) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'delivered',
    },
  ];
}

export function matchesPedidosSearch(order: StoreOrder, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    order.id.toLowerCase().includes(normalized) ||
    order.order_number.toLowerCase().includes(normalized) ||
    orderCustomerLabel(order).toLowerCase().includes(normalized) ||
    orderCustomerRuc(order).includes(normalized) ||
    CHANNEL_LABELS[mapOrderChannel(order)].toLowerCase().includes(normalized)
  );
}

export function filterPedidosOrders(options: {
  orders: StoreOrder[];
  tab: AdminPedidosTab;
  search: string;
  statusFilter: string;
  paymentFilter: string;
  channelFilter: string;
  range: AdminDateRange;
}) {
  const { orders, tab, search, statusFilter, paymentFilter, channelFilter, range } = options;

  return filterOrdersInRange(orders, range).filter((order) => {
    if (tab !== 'todos' && mapOrderToPedidosTab(order) !== tab) return false;
    if (statusFilter !== 'todos' && order.status !== statusFilter) return false;
    if (paymentFilter !== 'todos' && order.payment_status !== paymentFilter) return false;
    if (channelFilter !== 'todos' && mapOrderChannel(order) !== channelFilter) return false;
    return matchesPedidosSearch(order, search);
  });
}

export function formatPedidosOrderTotal(order: StoreOrder) {
  return formatOrderTotal(order.total_usd, order.total_pen, order.currency);
}

export function orderStatusLabel(status: StoreOrderStatus) {
  const labels: Record<StoreOrderStatus, string> = {
    pending_payment: 'Pago pendiente',
    confirmed: 'Confirmado',
    processing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return labels[status];
}
