import type { MarketingChannel, MarketingInboxFilter, MarketingNavItem } from '@/types/marketing-inbox';

export const MARKETING_HELP_BANNER =
  '¿Tienes dudas sobre esta funcionalidad? Aprende a usar sus herramientas principales con estos videotutoriales';

export const MARKETING_INBOX_NAV: MarketingNavItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: 'inbox',
    children: [
      { id: 'assigned', label: 'Asignadas a mi' },
      { id: 'favorites', label: 'Favoritas' },
      { id: 'all', label: 'Todas' },
      { id: 'unassigned', label: 'Sin asignar' },
      { id: 'mentions', label: 'Menciones' },
    ],
  },
  { id: 'users', label: 'Usuarios', icon: 'users' },
  { id: 'channels', label: 'Canales', icon: 'channels' },
  { id: 'attributes', label: 'Atributos', icon: 'attributes' },
];

export const MARKETING_INBOX_FILTERS: MarketingInboxFilter[] = [
  { id: 'open', label: 'Abiertas' },
  { id: 'snoozed', label: 'Pospuestas' },
  { id: 'closed', label: 'Cerradas' },
];

export const MARKETING_CHANNELS: MarketingChannel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    subtitle: 'API oficial',
    brandClass: 'bg-[#25D366] text-white',
    monogram: 'WA',
    available: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    subtitle: 'Mensajes directos',
    brandClass: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white',
    monogram: 'IG',
    available: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    subtitle: 'Messenger',
    brandClass: 'bg-[#1877F2] text-white',
    monogram: 'f',
    available: true,
  },
  {
    id: 'livechat',
    name: 'Live Chat',
    subtitle: 'Widget web',
    brandClass: 'bg-violet-600 text-white',
    monogram: 'LC',
    available: true,
  },
  {
    id: 'email',
    name: 'Correo',
    subtitle: 'Bandeja compartida',
    brandClass: 'bg-slate-600 text-white',
    monogram: '@',
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    subtitle: 'Próximamente',
    brandClass: 'bg-[#0A66C2]/40 text-white',
    monogram: 'in',
    available: false,
  },
];

export const MARKETING_ONBOARDING = {
  title: 'Todas tus conversaciones, en un solo lugar.',
  description:
    'Conecta tus canales de WhatsApp, Instagram, Facebook y más para responder desde una única bandeja. Tus clientes te escriben donde prefieren; tu equipo responde desde HaiStore.',
  emptyInboxTitle: 'Aún no hay conversaciones',
  emptyInboxDescription:
    'Cuando conectes un canal, los mensajes entrantes aparecerán aquí.',
};
