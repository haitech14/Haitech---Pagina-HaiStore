import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CircleDollarSign,
  ListOrdered,
  MessageCircle,
  PackageSearch,
  Search,
  Truck,
} from 'lucide-react';

import type { HaibotSearchFocus } from '@/lib/haibot-inventory-search';
import type { HaibotWhatsAppIntent } from '@/lib/haibot-messages';

type HaibotQuickActionBase = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent?: 'whatsapp';
};

export type HaibotQuickAction =
  | (HaibotQuickActionBase & { kind: 'navigate'; to: string })
  | (HaibotQuickActionBase & { kind: 'whatsapp'; intent: HaibotWhatsAppIntent })
  | (HaibotQuickActionBase & { kind: 'search'; focus: HaibotSearchFocus });

/** Acciones visibles sobre el campo de mensaje del chat. */
export const HAIBOT_QUICK_ACTIONS: HaibotQuickAction[] = [
  {
    id: 'search',
    label: 'Buscar',
    icon: Search,
    kind: 'search',
    focus: 'all',
  },
  {
    id: 'prices',
    label: 'Precio',
    icon: CircleDollarSign,
    kind: 'search',
    focus: 'price',
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: PackageSearch,
    kind: 'search',
    focus: 'stock',
  },
  {
    id: 'service',
    label: 'Servicio',
    icon: CalendarClock,
    kind: 'navigate',
    to: '/contacto?tema=servicio',
  },
  {
    id: 'price-list',
    label: 'Lista precios',
    icon: ListOrdered,
    kind: 'whatsapp',
    intent: 'price-list',
  },
  {
    id: 'orders',
    label: 'Pedidos',
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
    case 'search':
      return 'Modo buscador activado. Escribe marca, modelo o código y te muestro precio y stock del inventario.';
    case 'prices':
      return 'Consulta de precios. Escribe el producto que buscas (ej. Ricoh IM 430F o su código).';
    case 'stock':
      return 'Consulta de stock. Indica marca, modelo o código y verifico la disponibilidad.';
    case 'service':
      return 'Te abro el formulario para programar servicio técnico. Indica modelo, ciudad y el detalle del problema.';
    case 'price-list':
      return 'Abriré WhatsApp para solicitar tu lista de precios según tu perfil comercial.';
    case 'orders':
      return 'Revisa el estado de tus pedidos en Mi cuenta. Si no aparece, usa el mismo correo de la compra.';
    case 'whatsapp-bot':
      return 'Te redirijo al chatbot de Haitech en WhatsApp para atención inmediata.';
    default:
      return 'Un momento, te ayudo con eso.';
  }
}
