export type AdminResumenStatus = 'pendiente' | 'en_proceso' | 'resuelto' | 'cancelado';

export type AdminResumenPriority = 'alta' | 'media' | 'baja';

export type AdminResumenModule = 'soporte' | 'ventas' | 'inventario' | 'compras' | 'clientes';

export interface AdminResumenRecord {
  id: string;
  date: Date;
  clientName: string;
  clientRuc: string;
  module: AdminResumenModule;
  status: AdminResumenStatus;
  priority: AdminResumenPriority;
  assigneeName: string;
  assigneeInitials: string;
}

export interface AdminResumenKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'users' | 'sales' | 'orders' | 'sla';
}

export interface AdminResumenStatusDistribution {
  status: AdminResumenStatus;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminResumenPriorityDistribution {
  priority: AdminResumenPriority;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminResumenSlaPoint {
  date: string;
  value: number;
}
