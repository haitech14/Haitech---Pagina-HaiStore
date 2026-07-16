import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export type HaibotWhatsAppIntent =
  | 'price-list'
  | 'stock'
  | 'whatsapp-bot'
  | 'schedule-service';

export type HaibotScheduleServiceDetails = {
  code?: string;
  equipment?: string;
  city?: string;
  scheduledAt?: string;
  scheduledLabel?: string;
};

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

function formatScheduleServiceMessage(details?: HaibotScheduleServiceDetails): string {
  if (!details) return INTENT_MESSAGES['schedule-service'];

  const lines = [
    'Hola, solicito confirmar un servicio técnico agendado desde Haibot.',
    details.code ? `Orden: ${details.code}` : null,
    details.equipment ? `Equipo: ${details.equipment}` : null,
    details.city ? `Ciudad: ${details.city}` : null,
    details.scheduledLabel
      ? `Horario preferido: ${details.scheduledLabel}`
      : details.scheduledAt
        ? `Horario preferido: ${details.scheduledAt}`
        : null,
    'Quedo atento a la confirmación. Gracias.',
  ].filter((line): line is string => line != null && line.length > 0);

  return lines.join('\n');
}

export function buildHaibotWhatsAppUrl(
  intent: HaibotWhatsAppIntent,
  details?: HaibotScheduleServiceDetails,
): string {
  if (intent === 'schedule-service') {
    return buildHaitechWhatsAppUrl(formatScheduleServiceMessage(details));
  }
  return buildHaitechWhatsAppUrl(INTENT_MESSAGES[intent]);
}

export const HAIBOT_WELCOME_MESSAGE =
  '¡Hola! 👋 Soy Haibot, tu asistente en HaiStore.\n\n¿Qué deseas hacer? Elige una opción para continuar:';
