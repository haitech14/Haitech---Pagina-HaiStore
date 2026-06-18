import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export type HaibotWhatsAppIntent =
  | 'price-list'
  | 'stock'
  | 'whatsapp-bot'
  | 'schedule-service';

const INTENT_MESSAGES: Record<HaibotWhatsAppIntent, string> = {
  'price-list':
    'Hola, soy cliente de HaiStore. Me gustaría recibir la lista de precios actualizada. ¿Me pueden enviarla?',
  stock:
    'Hola, consulto desde HaiStore. Necesito averiguar stock y disponibilidad de un producto. ¿Me pueden ayudar?',
  'whatsapp-bot':
    'Hola, vengo desde HaiStore. Quiero comunicarme con el asistente/chatbot de Haitech por WhatsApp.',
  'schedule-service':
    'Hola, solicito programar un servicio técnico (mantenimiento o reparación). Indico modelo y ubicación cuando me contacten.',
};

export function buildHaibotWhatsAppUrl(intent: HaibotWhatsAppIntent): string {
  return buildHaitechWhatsAppUrl(INTENT_MESSAGES[intent]);
}

export const HAIBOT_WELCOME_MESSAGE =
  '¡Hola! 👋 Soy Haibot, tu asistente en HaiStore.\n\n🔍 Buscar · 💲 Cotización · 📦 Envíos · 🔧 Soporte · 📈 Ventas\n\nUsa las pestañas de abajo o escríbeme para consultar inventario, generar órdenes o ir al CRM.';
