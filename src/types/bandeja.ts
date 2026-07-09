export type BandejaChannel = 'whatsapp' | 'email' | 'facebook' | 'web' | 'instagram';

export type BandejaPriority = 'alta' | 'media' | 'baja';

export type BandejaStatus = 'abierto' | 'en_progreso' | 'pendiente' | 'resuelto';

export type BandejaTab = 'todos' | 'sin_leer' | 'menciones' | 'asignados' | 'resueltos' | 'spam';

export interface BandejaAssignee {
  name: string;
  initials: string;
  color: string;
}

export interface BandejaMessage {
  id: string;
  author: 'customer' | 'agent';
  text: string;
  time: string;
}

export interface BandejaOrderRef {
  number: string;
  date: string;
  total: string;
}

export interface BandejaConversation {
  id: string;
  date: string;
  senderName: string;
  senderContact: string;
  subject: string;
  preview: string;
  channel: BandejaChannel;
  assignedTo: BandejaAssignee;
  priority: BandejaPriority;
  status: BandejaStatus;
  unread: boolean;
  isMention: boolean;
  isSpam: boolean;
  isResolved: boolean;
  phone?: string;
  frequentCustomer?: boolean;
  orderRef?: BandejaOrderRef;
  messages: BandejaMessage[];
}

export interface BandejaKpi {
  id: string;
  title: string;
  value: number;
  trend: number;
  trendLabel: string;
  sparkline: number[];
  color: string;
}

export interface BandejaChannelStat {
  channel: BandejaChannel;
  label: string;
  count: number;
  color: string;
}

export interface BandejaSlaTeam {
  team: string;
  percent: number;
  color: string;
}

export interface BandejaUrgentItem {
  id: string;
  channel: BandejaChannel;
  name: string;
  issue: string;
  time: string;
  priority: BandejaPriority;
}
