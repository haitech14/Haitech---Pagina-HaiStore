import type {
  AdminResumenKpi,
  AdminResumenPriorityDistribution,
  AdminResumenQuoteRequest,
  AdminResumenRecord,
  AdminResumenSlaPoint,
  AdminResumenStatusDistribution,
  AdminResumenVisitor,
} from '@/types/admin-resumen';

export const ADMIN_RESUMEN_KPIS: AdminResumenKpi[] = [
  {
    title: 'Cotizaciones solicitadas',
    value: '0',
    trend: 0,
    trendLabel: 'vs. semana anterior',
    icon: 'orders',
  },
  {
    title: 'Visitantes únicos',
    value: '0',
    trend: 0,
    trendLabel: 'vs. semana anterior',
    icon: 'users',
  },
  {
    title: 'Cuentas creadas',
    value: '0',
    trend: 0,
    trendLabel: 'vs. semana anterior',
    icon: 'sales',
  },
  {
    title: 'Productos revisados',
    value: '0',
    trend: 0,
    trendLabel: 'vs. semana anterior',
    icon: 'sla',
  },
];

export const ADMIN_RESUMEN_STATUS_DISTRIBUTION: AdminResumenStatusDistribution[] = [];
export const ADMIN_RESUMEN_PRIORITY_DISTRIBUTION: AdminResumenPriorityDistribution[] = [];
export const ADMIN_RESUMEN_TOTAL = 0;
export const ADMIN_RESUMEN_SLA_CURRENT = 0;
export const ADMIN_RESUMEN_SLA_SERIES: AdminResumenSlaPoint[] = [];
export const ADMIN_RESUMEN_RECORDS: AdminResumenRecord[] = [];

export const ADMIN_RESUMEN_TAB_COUNTS = {
  todos: 0,
  pendiente: 0,
  en_proceso: 0,
  resuelto: 0,
  cancelado: 0,
};

export const ADMIN_RESUMEN_QUOTE_REQUESTS: AdminResumenQuoteRequest[] = [];
export const ADMIN_RESUMEN_VISITORS: AdminResumenVisitor[] = [];
