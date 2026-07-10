export type AdminListaPreciosStatus = 'activa' | 'borrador' | 'inactiva';

export type AdminListaPreciosRoleKey = 'public' | 'distribuidor' | 'mayorista' | 'compra';

export interface AdminListaPreciosRecord {
  id: string;
  parentCategory: string;
  /** Agrupación de filas: B/N|Color · Formato A4|A3, Sin clasificar, o categoría padre. */
  divisionLabel: string;
  name: string;
  subtitle: string;
  sku: string;
  imageUrl?: string | null;
  imageColor: string;
  prices: Record<AdminListaPreciosRoleKey, number>;
  status: AdminListaPreciosStatus;
}

export interface AdminListaPreciosKpi {
  title: string;
  value: string;
  detail: string;
  icon: 'lists' | 'priced' | 'roles' | 'exchange';
  sparkline: number[];
}

export interface AdminListaPreciosRoleSlice {
  role: AdminListaPreciosRoleKey;
  label: string;
  averagePen: number;
  color: string;
}

export interface AdminListaPreciosMarginProduct {
  id: string;
  name: string;
  marginPercent: number;
  color: string;
}

export interface AdminListaPreciosCurrencySlice {
  label: string;
  percent: number;
  color: string;
}

export interface AdminListaPreciosRoleAverage {
  role: AdminListaPreciosRoleKey;
  label: string;
  averagePen: number;
  color: string;
  bgClass: string;
}
