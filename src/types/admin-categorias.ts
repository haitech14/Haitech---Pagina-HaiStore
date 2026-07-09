export type AdminCategoriaStatus = 'activa' | 'destacada' | 'borrador' | 'archivada';

export type AdminCategoriaTab = 'todos' | AdminCategoriaStatus;

export interface AdminCategoriaRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  parentName: string | null;
  productCount: number;
  assigneeName: string;
  assigneeInitials: string;
  assigneeRole: string;
  status: AdminCategoriaStatus;
}

export interface AdminCategoriaKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'active' | 'subcategories' | 'products' | 'unassigned';
  sparkline: number[];
  trendIsPercent?: boolean;
}

export interface AdminCategoriaTypeDistribution {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminCategoriaProductBar {
  name: string;
  count: number;
  percent: number;
}

export interface AdminCategoriaTopRotation {
  rank: number;
  name: string;
  sales: number;
}
