import type { StoreOrderStatus, StorePaymentStatus } from '@/types/store';

export type AdminPedidosTab = 'todos' | 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

export type AdminPedidosChannel = 'web' | 'tpv' | 'mercadopago' | 'transferencia' | 'otro';

export interface AdminPedidosKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'orders' | 'sales' | 'pending' | 'delivered';
}

export interface AdminPedidosStatusDistribution {
  status: AdminPedidosTab;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminPedidosPaymentDistribution {
  paymentStatus: StorePaymentStatus;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminPedidosSalesPoint {
  date: string;
  value: number;
}

export interface AdminPedidosTabCounts {
  todos: number;
  pendiente: number;
  en_proceso: number;
  entregado: number;
  cancelado: number;
}

export type AdminPedidosOrderRow = {
  order: import('@/types/store').StoreOrder;
  tab: Exclude<AdminPedidosTab, 'todos'>;
  channel: AdminPedidosChannel;
};

export const PEDIDOS_OPEN_STATUSES: StoreOrderStatus[] = [
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
];
