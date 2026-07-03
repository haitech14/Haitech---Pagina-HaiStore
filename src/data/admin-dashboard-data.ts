import type {
  AdminDashboardActivity,
  AdminDashboardKpi,
  AdminDashboardMonthlySale,
  AdminDashboardPriorityDistribution,
  AdminDashboardStatusDistribution,
  AdminDashboardTask,
  AdminDashboardTechnicianLoad,
  AdminDashboardTopClient,
  AdminDashboardTopProduct,
  AdminDashboardWeeklySlaPoint,
} from '@/types/admin-dashboard';

export const ADMIN_DASHBOARD_KPIS: AdminDashboardKpi[] = [
  {
    title: 'Total usuarios',
    value: '243',
    trend: 12.5,
    trendLabel: 'vs. mes anterior',
    icon: 'users',
    sparkline: [198, 205, 212, 220, 228, 235, 240, 243],
  },
  {
    title: 'Ventas del mes',
    value: 'S/ 128,530.00',
    trend: 18.3,
    trendLabel: 'vs. mes anterior',
    icon: 'sales',
    sparkline: [82000, 88000, 95000, 102000, 115000, 122000, 126000, 128530],
  },
  {
    title: 'Tickets abiertos',
    value: '36',
    trend: -8.3,
    trendLabel: 'vs. mes anterior',
    icon: 'tickets',
    sparkline: [42, 41, 40, 39, 38, 37, 36, 36],
  },
  {
    title: 'Rendimiento (SLA)',
    value: '94.2%',
    trend: 5.6,
    trendLabel: 'vs. mes anterior',
    icon: 'sla',
    sparkline: [88, 89, 90, 91, 92, 93, 94, 94.2],
  },
];

export const ADMIN_DASHBOARD_MONTHLY_SALES: AdminDashboardMonthlySale[] = [
  { month: 'Ene', value: 82000 },
  { month: 'Feb', value: 91000 },
  { month: 'Mar', value: 98000 },
  { month: 'Abr', value: 105000 },
  { month: 'May', value: 128530 },
  { month: 'Jun', value: 118000 },
];

export const ADMIN_DASHBOARD_STATUS_TOTAL = 156;

export const ADMIN_DASHBOARD_STATUS_DISTRIBUTION: AdminDashboardStatusDistribution[] = [
  { status: 'pendiente', label: 'Pendiente', count: 12, percent: 7.7, color: '#3B82F6' },
  { status: 'en_proceso', label: 'En proceso', count: 36, percent: 23.1, color: '#F59E0B' },
  { status: 'resuelto', label: 'Resuelto', count: 88, percent: 56.4, color: '#22C55E' },
  { status: 'cancelado', label: 'Cancelado', count: 20, percent: 12.8, color: '#94A3B8' },
];

export const ADMIN_DASHBOARD_SLA_CURRENT = 94.2;

export const ADMIN_DASHBOARD_WEEKLY_SLA: AdminDashboardWeeklySlaPoint[] = [
  { day: 'Lun', value: 91.2 },
  { day: 'Mar', value: 92.5 },
  { day: 'Mié', value: 93.1 },
  { day: 'Jue', value: 93.8 },
  { day: 'Vie', value: 94.0 },
  { day: 'Sáb', value: 94.2 },
  { day: 'Dom', value: 94.2 },
];

export const ADMIN_DASHBOARD_PRIORITY_DISTRIBUTION: AdminDashboardPriorityDistribution[] = [
  { priority: 'alta', label: 'Alta', count: 12, percent: 23.1, color: '#EF4444' },
  { priority: 'media', label: 'Media', count: 24, percent: 46.2, color: '#F59E0B' },
  { priority: 'baja', label: 'Baja', count: 16, percent: 30.8, color: '#22C55E' },
];

export const ADMIN_DASHBOARD_TECHNICIAN_LOAD: AdminDashboardTechnicianLoad[] = [
  { name: 'Carlos Méndez', initials: 'CM', tickets: 23 },
  { name: 'Ana Torres', initials: 'AT', tickets: 19 },
  { name: 'Luis Rojas', initials: 'LR', tickets: 17 },
  { name: 'Patricia Vega', initials: 'PV', tickets: 14 },
  { name: 'Diego Salas', initials: 'DS', tickets: 12 },
];

export const ADMIN_DASHBOARD_MAX_TECHNICIAN_LOAD = 23;

export const ADMIN_DASHBOARD_RECENT_ACTIVITY: AdminDashboardActivity[] = [
  { id: '1', type: 'ticket-new', title: 'Nuevo ticket creado', timeAgo: 'Hace 5 min' },
  { id: '2', type: 'order', title: 'Orden de venta generada', timeAgo: 'Hace 15 min' },
  { id: '3', type: 'ticket-resolved', title: 'Ticket resuelto', timeAgo: 'Hace 32 min' },
  { id: '4', type: 'client-new', title: 'Nuevo cliente registrado', timeAgo: 'Hace 1 h' },
  { id: '5', type: 'product-updated', title: 'Producto actualizado', timeAgo: 'Hace 2 h' },
];

export const ADMIN_DASHBOARD_PENDING_TASKS: AdminDashboardTask[] = [
  {
    id: 't1',
    title: 'Revisar cotización Corp. Petroperú',
    priority: 'alta',
    dueLabel: 'Hoy 18:00',
    completed: false,
  },
  {
    id: 't2',
    title: 'Confirmar stock de tóner Ricoh MP 3554',
    priority: 'media',
    dueLabel: 'Mañana',
    completed: false,
  },
  {
    id: 't3',
    title: 'Llamar a cliente Agro Norte SAC',
    priority: 'alta',
    dueLabel: 'Hoy 16:30',
    completed: false,
  },
  {
    id: 't4',
    title: 'Actualizar lista de precios mayorista',
    priority: 'baja',
    dueLabel: 'Vie 30/05',
    completed: false,
  },
  {
    id: 't5',
    title: 'Enviar reporte semanal de ventas',
    priority: 'media',
    dueLabel: 'Lun 02/06',
    completed: false,
  },
];

export const ADMIN_DASHBOARD_TOP_CLIENTS: AdminDashboardTopClient[] = [
  { rank: 1, name: 'Comercial Andina S.A.C.', amount: 28450 },
  { rank: 2, name: 'Distrib. Lima Norte', amount: 22380 },
  { rank: 3, name: 'Corp. Petroperú S.A.', amount: 19870 },
  { rank: 4, name: 'Tech Solutions EIRL', amount: 16420 },
  { rank: 5, name: 'Minera del Sur', amount: 14250 },
];

export const ADMIN_DASHBOARD_TOP_PRODUCTS: AdminDashboardTopProduct[] = [
  { rank: 1, name: 'Impresora Multifuncional', amount: 18750, imageColor: '#2563eb' },
  { rank: 2, name: 'Tóner Ricoh MP 3554', amount: 12480, imageColor: '#059669' },
  { rank: 3, name: 'Laptop HP ProBook 450', amount: 9860, imageColor: '#7c3aed' },
  { rank: 4, name: 'Monitor Dell UltraSharp 27"', amount: 7420, imageColor: '#0891b2' },
  { rank: 5, name: 'Mouse Logitech MX Master 3S', amount: 5180, imageColor: '#4f46e5' },
];

export function formatDashboardCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
