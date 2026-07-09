import type { ShipmentStatus } from '@/types/shipping';

export type AdminEnviosTab =
  | 'todos'
  | 'en_transito'
  | 'entregados'
  | 'pendientes'
  | 'devueltos'
  | 'incidencias';

export type AdminEnviosKpiIcon = 'transit' | 'delivered' | 'pending' | 'avgTime';

export interface AdminEnviosKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: AdminEnviosKpiIcon;
  sparkline: number[];
}

export interface AdminEnviosStatusSlice {
  status: ShipmentStatus | 'incidencia';
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminEnviosZoneSlice {
  zoneKey: string;
  label: string;
  count: number;
  percent: number;
  total: number;
}

export interface AdminEnviosDelayedOrder {
  orderRef: string;
  destination: string;
  delayDays: number;
}
