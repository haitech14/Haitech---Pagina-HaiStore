import type { CustomerRoleGroupKey } from '@/lib/customers-by-role';

export type AdminClientesTab = 'todos' | 'con_cuenta' | 'sin_cuenta' | 'haisupport';

export interface AdminClientesKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'total' | 'new' | 'account' | 'haisupport';
}

export interface AdminClientesRoleDistribution {
  role: CustomerRoleGroupKey;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminClientesAccountDistribution {
  key: Exclude<AdminClientesTab, 'todos'>;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminClientesGrowthPoint {
  date: string;
  value: number;
}

export interface AdminClientesTabCounts {
  todos: number;
  con_cuenta: number;
  sin_cuenta: number;
  haisupport: number;
}
