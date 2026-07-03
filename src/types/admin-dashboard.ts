export type AdminDashboardKpiIcon = 'users' | 'sales' | 'tickets' | 'sla';

export interface AdminDashboardKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: AdminDashboardKpiIcon;
  sparkline: number[];
}

export interface AdminDashboardMonthlySale {
  month: string;
  value: number;
}

export type AdminDashboardStatus = 'pendiente' | 'en_proceso' | 'resuelto' | 'cancelado';

export interface AdminDashboardStatusDistribution {
  status: AdminDashboardStatus;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminDashboardWeeklySlaPoint {
  day: string;
  value: number;
}

export type AdminDashboardPriority = 'alta' | 'media' | 'baja';

export interface AdminDashboardPriorityDistribution {
  priority: AdminDashboardPriority;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminDashboardTechnicianLoad {
  name: string;
  initials: string;
  tickets: number;
}

export type AdminDashboardActivityType =
  | 'ticket-new'
  | 'order'
  | 'ticket-resolved'
  | 'client-new'
  | 'product-updated';

export interface AdminDashboardActivity {
  id: string;
  type: AdminDashboardActivityType;
  title: string;
  timeAgo: string;
}

export interface AdminDashboardTask {
  id: string;
  title: string;
  priority: AdminDashboardPriority;
  dueLabel: string;
  completed: boolean;
}

export interface AdminDashboardTopClient {
  rank: number;
  name: string;
  amount: number;
}

export interface AdminDashboardTopProduct {
  rank: number;
  name: string;
  amount: number;
  imageColor: string;
}
