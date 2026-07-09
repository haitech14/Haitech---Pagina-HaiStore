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

export type AdminResumenQuoteStatus = 'pendiente' | 'en_gestion' | 'cotizado' | 'cerrado';

export interface AdminResumenQuoteRequest {
  id: string;
  requestedAt: Date;
  clientName: string;
  company?: string;
  phone: string;
  email: string;
  productInterest: string;
  status: AdminResumenQuoteStatus;
  source: 'tienda' | 'whatsapp' | 'formulario';
}

export interface AdminResumenVisitorProduct {
  name: string;
  sku?: string;
}

export interface AdminResumenVisitor {
  id: string;
  visitedAt: Date;
  ip: string;
  city: string;
  name: string | null;
  createdAccount: boolean;
  productsViewed: AdminResumenVisitorProduct[];
  pages: number;
}
