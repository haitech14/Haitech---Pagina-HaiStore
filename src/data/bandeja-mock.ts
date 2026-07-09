import type {
  BandejaChannelStat,
  BandejaConversation,
  BandejaKpi,
  BandejaSlaTeam,
  BandejaUrgentItem,
} from '@/types/bandeja';

export const BANDEJA_KPIS: BandejaKpi[] = [
  {
    id: 'nuevos',
    title: 'Mensajes nuevos',
    value: 0,
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
    color: '#22C55E',
  },
  {
    id: 'sin-leer',
    title: 'Sin leer',
    value: 0,
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
    color: '#F97316',
  },
  {
    id: 'pendientes',
    title: 'Pendientes',
    value: 0,
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
    color: '#A855F7',
  },
  {
    id: 'resueltos',
    title: 'Resueltos hoy',
    value: 0,
    trend: 0,
    trendLabel: 'vs. ayer',
    sparkline: [0],
    color: '#3B82F6',
  },
];

export const BANDEJA_CHANNEL_STATS: BandejaChannelStat[] = [
  { channel: 'whatsapp', label: 'WhatsApp', count: 0, color: '#25D366' },
  { channel: 'email', label: 'Email', count: 0, color: '#3B82F6' },
  { channel: 'web', label: 'Web', count: 0, color: '#6366F1' },
  { channel: 'facebook', label: 'Facebook', count: 0, color: '#1877F2' },
  { channel: 'instagram', label: 'Instagram', count: 0, color: '#E4405F' },
];

export const BANDEJA_CHANNEL_TOTAL = BANDEJA_CHANNEL_STATS.reduce((sum, item) => sum + item.count, 0);

export const BANDEJA_SLA_TEAMS: BandejaSlaTeam[] = [];

export const BANDEJA_SLA_TARGET = 90;

export const BANDEJA_URGENT_ITEMS: BandejaUrgentItem[] = [];

export const BANDEJA_CONVERSATIONS: BandejaConversation[] = [];

export const BANDEJA_TEAMS = ['Todos', 'Soporte 1', 'Postventa', 'Comercial', 'Soporte TI'] as const;

export const BANDEJA_ASSIGNEES = ['Todos', 'Sin asignar'] as const;

export const BANDEJA_STATUSES = ['Todos', 'Abierto', 'En progreso', 'Pendiente', 'Resuelto'] as const;

export const BANDEJA_CHANNELS_FILTER = ['Todos', 'WhatsApp', 'Email', 'Web', 'Facebook', 'Instagram'] as const;
