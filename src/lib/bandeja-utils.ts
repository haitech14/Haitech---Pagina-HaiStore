import type { BandejaConversation, BandejaTab } from '@/types/bandeja';

export function filterBandejaByTab(
  conversations: BandejaConversation[],
  tab: BandejaTab,
): BandejaConversation[] {
  switch (tab) {
    case 'sin_leer':
      return conversations.filter((item) => item.unread);
    case 'menciones':
      return conversations.filter((item) => item.isMention);
    case 'asignados':
      return conversations.filter(
        (item) => item.assignedTo.name !== 'Sin asignar' && !item.isResolved,
      );
    case 'resueltos':
      return conversations.filter((item) => item.isResolved);
    case 'spam':
      return conversations.filter((item) => item.isSpam);
    case 'todos':
    default:
      return conversations.filter((item) => !item.isSpam);
  }
}

export function computeBandejaTabCounts(conversations: BandejaConversation[]) {
  const nonSpam = conversations.filter((item) => !item.isSpam);
  return {
    todos: nonSpam.length,
    sin_leer: nonSpam.filter((item) => item.unread).length,
    menciones: nonSpam.filter((item) => item.isMention).length,
    asignados: nonSpam.filter(
      (item) => item.assignedTo.name !== 'Sin asignar' && !item.isResolved,
    ).length,
    resueltos: conversations.filter((item) => item.isResolved).length,
    spam: conversations.filter((item) => item.isSpam).length,
  };
}

export function filterBandejaConversations(
  conversations: BandejaConversation[],
  options: {
    tab: BandejaTab;
    search: string;
    channel: string;
    team: string;
    assignee: string;
    status: string;
  },
): BandejaConversation[] {
  const query = options.search.trim().toLowerCase();

  return filterBandejaByTab(conversations, options.tab).filter((item) => {
    if (query) {
      const haystack = `${item.senderName} ${item.senderContact} ${item.subject} ${item.preview}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (options.channel !== 'Todos') {
      const channelMap: Record<string, BandejaConversation['channel']> = {
        WhatsApp: 'whatsapp',
        Email: 'email',
        Web: 'web',
        Facebook: 'facebook',
        Instagram: 'instagram',
      };
      const mapped = channelMap[options.channel];
      if (mapped && item.channel !== mapped) return false;
    }

    if (options.team !== 'Todos') {
      const teamMap: Record<string, string> = {
        'Soporte 1': 'Luis Rojas',
        Postventa: 'Sofía Castro',
        Comercial: 'Ana Paredes',
        'Soporte TI': 'Pedro Vargas',
      };
      if (teamMap[options.team] && item.assignedTo.name !== teamMap[options.team]) {
        return false;
      }
    }

    if (options.assignee !== 'Todos' && item.assignedTo.name !== options.assignee) {
      return false;
    }

    if (options.status !== 'Todos') {
      const statusMap: Record<string, BandejaConversation['status']> = {
        Abierto: 'abierto',
        'En progreso': 'en_progreso',
        Pendiente: 'pendiente',
        Resuelto: 'resuelto',
      };
      const mapped = statusMap[options.status];
      if (mapped && item.status !== mapped) return false;
    }

    return true;
  });
}
