import type {
  AdminResumenKpi,
  AdminResumenPriorityDistribution,
  AdminResumenRecord,
  AdminResumenSlaPoint,
  AdminResumenStatusDistribution,
} from '@/types/admin-resumen';

export const ADMIN_RESUMEN_KPIS: AdminResumenKpi[] = [
  {
    title: 'Total usuarios',
    value: '243',
    trend: 12.5,
    trendLabel: 'vs. mes anterior',
    icon: 'users',
  },
  {
    title: 'Ventas del mes',
    value: 'S/ 128,530.00',
    trend: 18.7,
    trendLabel: 'vs. mes anterior',
    icon: 'sales',
  },
  {
    title: 'Órdenes abiertas',
    value: '36',
    trend: -8.3,
    trendLabel: 'vs. mes anterior',
    icon: 'orders',
  },
  {
    title: 'Rendimiento (SLA)',
    value: '94.2%',
    trend: 5.6,
    trendLabel: 'vs. mes anterior',
    icon: 'sla',
  },
];

export const ADMIN_RESUMEN_STATUS_DISTRIBUTION: AdminResumenStatusDistribution[] = [
  { status: 'pendiente', label: 'Pendiente', count: 12, percent: 7.7, color: '#3B82F6' },
  { status: 'en_proceso', label: 'En proceso', count: 8, percent: 5.1, color: '#F59E0B' },
  { status: 'resuelto', label: 'Resuelto', count: 120, percent: 76.9, color: '#22C55E' },
  { status: 'cancelado', label: 'Cancelado', count: 5, percent: 3.2, color: '#94A3B8' },
];

export const ADMIN_RESUMEN_PRIORITY_DISTRIBUTION: AdminResumenPriorityDistribution[] = [
  { priority: 'alta', label: 'Alta', count: 38, percent: 24.4, color: '#EF4444' },
  { priority: 'media', label: 'Media', count: 72, percent: 46.2, color: '#F59E0B' },
  { priority: 'baja', label: 'Baja', count: 46, percent: 29.5, color: '#14B8A6' },
];

export const ADMIN_RESUMEN_TOTAL = 156;

export const ADMIN_RESUMEN_SLA_CURRENT = 94.2;

export const ADMIN_RESUMEN_SLA_SERIES: AdminResumenSlaPoint[] = [
  { date: '1 may', value: 88.2 },
  { date: '5 may', value: 89.5 },
  { date: '9 may', value: 90.1 },
  { date: '13 may', value: 91.4 },
  { date: '17 may', value: 92.0 },
  { date: '21 may', value: 93.1 },
  { date: '25 may', value: 93.8 },
  { date: '29 may', value: 94.2 },
];

const SEED_RECORDS: Omit<AdminResumenRecord, 'id' | 'date'>[] = [
  {
    clientName: 'Comercial Andina S.A.C.',
    clientRuc: '20100123456',
    module: 'soporte',
    status: 'en_proceso',
    priority: 'alta',
    assigneeName: 'Carlos Méndez',
    assigneeInitials: 'CM',
  },
  {
    clientName: 'Agro Norte SAC',
    clientRuc: '20455678901',
    module: 'ventas',
    status: 'pendiente',
    priority: 'media',
    assigneeName: 'Ana Torres',
    assigneeInitials: 'AT',
  },
  {
    clientName: 'Distrib. Lima Norte',
    clientRuc: '20547896321',
    module: 'inventario',
    status: 'resuelto',
    priority: 'baja',
    assigneeName: 'Luis Rojas',
    assigneeInitials: 'LR',
  },
  {
    clientName: 'Minera del Sur',
    clientRuc: '20333445566',
    module: 'soporte',
    status: 'cancelado',
    priority: 'alta',
    assigneeName: 'Patricia Vega',
    assigneeInitials: 'PV',
  },
  {
    clientName: 'Tech Solutions EIRL',
    clientRuc: '20666778899',
    module: 'ventas',
    status: 'en_proceso',
    priority: 'media',
    assigneeName: 'Diego Salas',
    assigneeInitials: 'DS',
  },
  {
    clientName: 'Grupo Andino SAC',
    clientRuc: '20111222333',
    module: 'compras',
    status: 'pendiente',
    priority: 'alta',
    assigneeName: 'María López',
    assigneeInitials: 'ML',
  },
  {
    clientName: 'Logística Express',
    clientRuc: '20444555666',
    module: 'inventario',
    status: 'resuelto',
    priority: 'media',
    assigneeName: 'Jorge Huamán',
    assigneeInitials: 'JH',
  },
  {
    clientName: 'Retail Perú',
    clientRuc: '20777888999',
    module: 'clientes',
    status: 'en_proceso',
    priority: 'baja',
    assigneeName: 'Sofía Ruiz',
    assigneeInitials: 'SR',
  },
  {
    clientName: 'Constructora Pacífico',
    clientRuc: '20199887766',
    module: 'ventas',
    status: 'resuelto',
    priority: 'alta',
    assigneeName: 'Carlos Méndez',
    assigneeInitials: 'CM',
  },
  {
    clientName: 'Farmacias Unidos',
    clientRuc: '20555444333',
    module: 'soporte',
    status: 'pendiente',
    priority: 'media',
    assigneeName: 'Ana Torres',
    assigneeInitials: 'AT',
  },
];

const MODULES = ['soporte', 'ventas', 'inventario', 'compras', 'clientes'] as const;
const STATUSES = ['pendiente', 'en_proceso', 'resuelto', 'cancelado'] as const;
const PRIORITIES = ['alta', 'media', 'baja'] as const;
const ASSIGNEES = [
  { name: 'Carlos Méndez', initials: 'CM' },
  { name: 'Ana Torres', initials: 'AT' },
  { name: 'Luis Rojas', initials: 'LR' },
  { name: 'Patricia Vega', initials: 'PV' },
  { name: 'Diego Salas', initials: 'DS' },
  { name: 'María López', initials: 'ML' },
];

const CLIENTS = [
  { name: 'Industrias del Norte SAC', ruc: '20123456789' },
  { name: 'Comercial Sur EIRL', ruc: '20234567890' },
  { name: 'Servicios Integrales', ruc: '20345678901' },
  { name: 'Distribuidora Central', ruc: '20456789012' },
  { name: 'Tecnología Avanzada', ruc: '20567890123' },
];

function buildRecord(index: number): AdminResumenRecord {
  if (index < SEED_RECORDS.length) {
    const seed = SEED_RECORDS[index];
    const day = 30 - Math.floor(index / 3);
    const hour = 16 - index;
    const minute = 28 - index * 3;
    return {
      id: `REQ-${1256 - index}`,
      date: new Date(2026, 4, Math.max(day, 1), Math.max(hour, 8), Math.max(minute, 5)),
      ...seed,
    };
  }

  const client = CLIENTS[index % CLIENTS.length];
  const assignee = ASSIGNEES[index % ASSIGNEES.length];
  const day = 28 - (index % 28);

  return {
    id: `REQ-${1256 - index}`,
    date: new Date(2026, 4, Math.max(day, 1), 9 + (index % 8), (index * 7) % 60),
    clientName: client.name,
    clientRuc: client.ruc,
    module: MODULES[index % MODULES.length],
    status: STATUSES[index % STATUSES.length],
    priority: PRIORITIES[index % PRIORITIES.length],
    assigneeName: assignee.name,
    assigneeInitials: assignee.initials,
  };
}

export const ADMIN_RESUMEN_RECORDS: AdminResumenRecord[] = Array.from(
  { length: ADMIN_RESUMEN_TOTAL },
  (_, index) => buildRecord(index),
);

export const ADMIN_RESUMEN_TAB_COUNTS = {
  todos: ADMIN_RESUMEN_TOTAL,
  pendiente: ADMIN_RESUMEN_STATUS_DISTRIBUTION.find((s) => s.status === 'pendiente')!.count,
  en_proceso: ADMIN_RESUMEN_STATUS_DISTRIBUTION.find((s) => s.status === 'en_proceso')!.count,
  resuelto: ADMIN_RESUMEN_STATUS_DISTRIBUTION.find((s) => s.status === 'resuelto')!.count,
  cancelado: ADMIN_RESUMEN_STATUS_DISTRIBUTION.find((s) => s.status === 'cancelado')!.count,
};
