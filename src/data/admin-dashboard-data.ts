export function formatDashboardCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type DashboardOrderStatus =
  | 'pago_recibido'
  | 'en_preparacion'
  | 'enviado'
  | 'pendiente'
  | 'cancelado';

export interface DashboardKpiMock {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'sales' | 'orders' | 'low-stock' | 'clients';
  sparkline: number[];
  iconClassName: string;
  sparklineColor: string;
}

export interface DashboardSalesDay {
  day: string;
  sales: number;
  average: number;
}

export interface DashboardRecentOrder {
  id: string;
  customer: string;
  status: DashboardOrderStatus;
  total: string;
}

export interface DashboardCatalogStat {
  label: string;
  value: string;
  icon: 'products' | 'categories' | 'brands' | 'critical';
  tone?: 'critical';
}

export interface DashboardCampaign {
  name: string;
  type: string;
  status: 'activa' | 'programada';
  usage: string;
  endsAt: string;
}

export interface DashboardModuleUsage {
  label: string;
  percent: number;
}

export interface DashboardOperationalStatus {
  label: string;
  status: 'operativo' | 'advertencia';
}

export interface DashboardQuickAction {
  label: string;
  icon: string;
}

export const ADMIN_DASHBOARD_UPDATED_AT = new Date();

export const ADMIN_DASHBOARD_KPIS: DashboardKpiMock[] = [
  {
    title: 'Ventas del mes',
    value: formatDashboardCurrency(0),
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'sales',
    sparkline: [0],
    iconClassName: 'bg-blue-50 text-blue-600',
    sparklineColor: '#3B82F6',
  },
  {
    title: 'Pedidos activos',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'orders',
    sparkline: [0],
    iconClassName: 'bg-emerald-50 text-emerald-600',
    sparklineColor: '#22C55E',
  },
  {
    title: 'Productos con stock bajo',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'low-stock',
    sparkline: [0],
    iconClassName: 'bg-orange-50 text-orange-600',
    sparklineColor: '#F97316',
  },
  {
    title: 'Clientes nuevos',
    value: '0',
    trend: 0,
    trendLabel: 'vs. mes anterior',
    icon: 'clients',
    sparkline: [0],
    iconClassName: 'bg-violet-50 text-violet-600',
    sparklineColor: '#8B5CF6',
  },
];

export const ADMIN_DASHBOARD_SALES_PERFORMANCE: DashboardSalesDay[] = [];
export const ADMIN_DASHBOARD_RECENT_ORDERS: DashboardRecentOrder[] = [];
export const ADMIN_DASHBOARD_CATALOG_STATS: DashboardCatalogStat[] = [
  { label: 'Productos', value: '0', icon: 'products' },
  { label: 'Categorías', value: '0', icon: 'categories' },
  { label: 'Marcas', value: '0', icon: 'brands' },
  { label: 'Stock crítico', value: '0', icon: 'critical', tone: 'critical' },
];
export const ADMIN_DASHBOARD_CAMPAIGNS: DashboardCampaign[] = [];

export const ADMIN_DASHBOARD_SUPPORT_SUMMARY = {
  newClients: 0,
  openTickets: 0,
  ticketBreakdown: [] as Array<{ label: string; count: number; color: string }>,
};

export const ADMIN_DASHBOARD_FINANCE_SUMMARY = {
  invoicesThisMonth: 0,
  cashBalance: formatDashboardCurrency(0),
};

export const ADMIN_DASHBOARD_SYSTEM_SUMMARY = {
  users: 0,
  integrations: 0,
  configurationPercent: 0,
};

export const ADMIN_DASHBOARD_MODULE_USAGE: DashboardModuleUsage[] = [];
export const ADMIN_DASHBOARD_OPERATIONAL_STATUS: DashboardOperationalStatus[] = [];
export const ADMIN_DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [];

export const DASHBOARD_ORDER_STATUS_LABELS: Record<DashboardOrderStatus, string> = {
  pago_recibido: 'Pago recibido',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
};

export const DASHBOARD_ORDER_STATUS_STYLES: Record<DashboardOrderStatus, string> = {
  pago_recibido: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  en_preparacion: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  enviado: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  pendiente: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  cancelado: 'bg-red-50 text-red-700 ring-red-600/20',
};
