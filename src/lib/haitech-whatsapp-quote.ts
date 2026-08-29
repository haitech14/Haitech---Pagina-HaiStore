import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export type HaitechWhatsAppQuoteContext = {
  campaign?: string;
  /** Líneas adicionales antes del cierre (p. ej. promo o producto). */
  extraLines?: string[];
};

export function buildHaitechSalesWhatsAppMessage(
  contact: WhatsAppContact,
  context: HaitechWhatsAppQuoteContext = {},
): string {
  return [
    `¡Hola! Soy *${contact.name.trim()}*`,
    '',
    'Contacto desde HaiStore — Ventas / Alquiler.',
    context.campaign ? `Referencia: ${context.campaign}` : null,
    '',
    '*Mis datos:*',
    `RUC/Empresa: ${contact.companyOrRuc.trim()}`,
    `Ciudad: ${contact.city.trim()}`,
    ...(context.extraLines?.length ? ['', ...context.extraLines] : []),
    '',
    'Me interesa cotizar equipos o alquiler. ¿Podrían asesorarme?',
    '¡Gracias!',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function openHaitechSalesWhatsApp(
  contact: WhatsAppContact,
  context: HaitechWhatsAppQuoteContext = {},
): boolean {
  const url = buildHaitechWhatsAppUrl(buildHaitechSalesWhatsAppMessage(contact, context));
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
