import type {
  AdminServicioRecord,
  AdminServiciosCategoryDistribution,
  AdminServiciosKpi,
  AdminServiciosRequestUsage,
  AdminServiciosTopDemand,
} from '@/types/admin-servicios';

export const ADMIN_SERVICIOS_UPDATED_AT = new Date();

export const ADMIN_SERVICIOS_KPIS: AdminServiciosKpi[] = [
  {
    title: 'Servicios activos',
    value: '0',
    icon: 'active',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
  {
    title: 'Planes vigentes',
    value: '0',
    icon: 'plans',
    delta: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
  {
    title: 'Solicitudes hoy',
    value: '0',
    icon: 'requests',
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
  },
  {
    title: 'Cobertura disponible',
    value: '0%',
    icon: 'coverage',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    sparkline: [0],
  },
];

export const ADMIN_SERVICIO_RECORDS: AdminServicioRecord[] = [];

export const ADMIN_SERVICIOS_CATEGORY_DISTRIBUTION: AdminServiciosCategoryDistribution[] = [];
export const ADMIN_SERVICIOS_REQUEST_USAGE: AdminServiciosRequestUsage[] = [];
export const ADMIN_SERVICIOS_TOP_DEMAND: AdminServiciosTopDemand[] = [];
