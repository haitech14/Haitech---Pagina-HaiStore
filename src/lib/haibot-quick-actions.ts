import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CircleDollarSign,
  ListOrdered,
  MessageCircle,
  PackageSearch,
  Truck,
} from 'lucide-react';

import type { HaibotWhatsAppIntent } from '@/lib/haibot-messages';

type HaibotQuickActionBase = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent?: 'whatsapp';
};

export type HaibotQuickAction =
  | (HaibotQuickActionBase & { kind: 'navigate'; to: string })
  | (HaibotQuickActionBase & { kind: 'whatsapp'; intent: HaibotWhatsAppIntent });

export const HAIBOT_QUICK_ACTIONS: HaibotQuickAction[] = [
  {
    id: 'service',
    label: 'Servicio técnico',
    icon: CalendarClock,
    kind: 'navigate',
    to: '/contacto?tema=servicio',
  },
  {
    id: 'prices',
    label: 'Precios',
    icon: CircleDollarSign,
    kind: 'navigate',
    to: '/tienda',
  },
  {
    id: 'price-list',
    label: 'Lista de precios',
    icon: ListOrdered,
    kind: 'whatsapp',
    intent: 'price-list',
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: PackageSearch,
    kind: 'whatsapp',
    intent: 'stock',
  },
  {
    id: 'orders',
    label: 'Mis pedidos',
    icon: Truck,
    kind: 'navigate',
    to: '/mi-cuenta',
  },
  {
    id: 'whatsapp-bot',
    label: 'WhatsApp',
    icon: MessageCircle,
    kind: 'whatsapp',
    intent: 'whatsapp-bot',
    accent: 'whatsapp',
  },
];

export function getHaibotQuickActionUserMessage(actionId: string): string {
  const action = HAIBOT_QUICK_ACTIONS.find((item) => item.id === actionId);
  return action?.label ?? 'Consulta';
}

export function getHaibotQuickActionReply(actionId: string): string {
  switch (actionId) {
    case 'service':
      return 'Perfecto. Te abro el formulario para programar servicio técnico. Indica modelo, ciudad y el detalle del problema.';
    case 'prices':
      return 'Te llevo al catálogo con precios y ofertas actualizadas.';
    case 'price-list':
      return 'Abriré WhatsApp para solicitar tu lista de precios según tu perfil comercial.';
    case 'stock':
      return 'Te conecto por WhatsApp para consultar disponibilidad. Ten a mano marca y modelo del equipo.';
    case 'orders':
      return 'Revisa el estado de tus pedidos en Mi cuenta. Si no aparece, usa el mismo correo de la compra.';
    case 'whatsapp-bot':
      return 'Te redirijo al chatbot de Haitech en WhatsApp para atención inmediata.';
    default:
      return 'Un momento, te ayudo con eso.';
  }
}
