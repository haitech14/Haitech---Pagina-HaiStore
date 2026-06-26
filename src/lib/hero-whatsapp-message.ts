import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';

export interface HeroWhatsAppMessageContext {
  campaign?: string;
}

export function buildHeroQuoteWhatsAppMessage(
  contact: WhatsAppContact,
  context: HeroWhatsAppMessageContext = {},
): string {
  return [
    `¡Hola! Soy *${contact.name.trim()}*`,
    '',
    'Solicito cotización desde HaiStore.',
    context.campaign ? `Referencia: ${context.campaign}` : null,
    '',
    '*Mis datos:*',
    `RUC/Empresa: ${contact.companyOrRuc.trim()}`,
    `Ciudad: ${contact.city.trim()}`,
    '',
    'Me interesan las promociones de fotocopiadoras Ricoh. ¿Podrían asesorarme?',
    '¡Gracias!',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function openHeroQuoteWhatsApp(
  contact: WhatsAppContact,
  context: HeroWhatsAppMessageContext = {},
): boolean {
  const url = buildHaitechWhatsAppUrl(buildHeroQuoteWhatsAppMessage(contact, context));
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function isHeroWhatsAppHref(href: string | undefined): boolean {
  if (!href) return false;
  return href.includes('wa.me') || href.startsWith('whatsapp:');
}
