import type { LucideIcon } from 'lucide-react';
import {
  CircleDollarSign,
  ListOrdered,
  MessageCircle,
  PackageSearch,
  Search,
  TrendingUp,
  Truck,
  Wrench,
} from 'lucide-react';

import type { HaibotSearchFocus } from '@/lib/haibot-inventory-search';
import type { HaibotWhatsAppIntent } from '@/lib/haibot-messages';

export type HaibotWorkflowId = 'support' | 'shipping' | 'sales';

type HaibotQuickActionBase = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent?: 'whatsapp';
};

export type HaibotQuickAction =
  | (HaibotQuickActionBase & { kind: 'search'; focus: HaibotSearchFocus })
  | (HaibotQuickActionBase & { kind: 'workflow'; workflow: HaibotWorkflowId })
  | (HaibotQuickActionBase & { kind: 'navigate'; to: string })
  | (HaibotQuickActionBase & { kind: 'whatsapp'; intent: HaibotWhatsAppIntent });

/** Pestañas principales sobre el chat (modo consulta + flujos operativos). */
export const HAIBOT_PRIMARY_ACTIONS: HaibotQuickAction[] = [
  {
    id: 'search',
    label: 'Buscar',
    icon: Search,
    kind: 'search',
    focus: 'all',
  },
  {
    id: 'quote',
    label: 'Cotización',
    icon: CircleDollarSign,
    kind: 'search',
    focus: 'price',
  },
  {
    id: 'shipping',
    label: 'Envíos',
    icon: Truck,
    kind: 'workflow',
    workflow: 'shipping',
  },
  {
    id: 'support',
    label: 'Soporte',
    icon: Wrench,
    kind: 'workflow',
    workflow: 'support',
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: TrendingUp,
    kind: 'workflow',
    workflow: 'sales',
  },
];

/** Acciones secundarias (WhatsApp, pedidos, listas). */
export const HAIBOT_SECONDARY_ACTIONS: HaibotQuickAction[] = [
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
    icon: PackageSearch,
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

/** @deprecated Usar HAIBOT_PRIMARY_ACTIONS + HAIBOT_SECONDARY_ACTIONS */
export const HAIBOT_QUICK_ACTIONS: HaibotQuickAction[] = [
  ...HAIBOT_PRIMARY_ACTIONS,
  ...HAIBOT_SECONDARY_ACTIONS,
];

export function getHaibotQuickActionUserMessage(actionId: string): string {
  const action = HAIBOT_QUICK_ACTIONS.find((item) => item.id === actionId);
  return action?.label ?? 'Consulta';
}

export function getHaibotQuickActionReply(actionId: string): string {
  switch (actionId) {
    case 'search':
      return 'Modo buscador activado 🔍 Escribe marca, modelo o código y te muestro precio y stock del inventario.';
    case 'quote':
      return 'Modo cotización 💲 Escribe el producto que buscas (ej. Ricoh IM 430F o su código).';
    case 'shipping':
      return 'Completa el formulario de envíos 📦 y genera la orden lista para copiar.';
    case 'support':
      return 'Registra una orden de servicio 🔧 con los datos del cliente y el equipo.';
    case 'sales':
      return 'Accede al CRM 📈 para crear leads y dar seguimiento comercial.';
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

export function isHaibotSearchAction(action: HaibotQuickAction): action is HaibotQuickAction & {
  kind: 'search';
} {
  return action.kind === 'search';
}

export function isHaibotWorkflowAction(action: HaibotQuickAction): action is HaibotQuickAction & {
  kind: 'workflow';
} {
  return action.kind === 'workflow';
}
