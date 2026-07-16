import { HEADER_SUPPORT_WHATSAPP_URL } from '@/data/site-header';
import { encodeWhatsAppText } from '@/lib/whatsapp-encoding';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

function buildHeaderWhatsAppMessage(
  contact: WhatsAppContact,
  topic: 'ventas' | 'soporte',
): string {
  const intro =
    topic === 'ventas'
      ? 'Contacto desde HaiStore — Ventas / Alquiler.'
      : 'Contacto desde HaiStore — Soporte técnico.';
  const closing =
    topic === 'ventas'
      ? 'Me interesa cotizar equipos o alquiler. ¿Podrían asesorarme?'
      : 'Necesito soporte técnico. ¿Podrían ayudarme?';

  return [
    `¡Hola! Soy *${contact.name.trim()}*`,
    '',
    intro,
    '',
    '*Mis datos:*',
    `RUC/Empresa: ${contact.companyOrRuc.trim()}`,
    `Ciudad: ${contact.city.trim()}`,
    '',
    closing,
    '¡Gracias!',
  ].join('\n');
}

export function openHeaderSalesWhatsApp(contact: WhatsAppContact): boolean {
  const url = buildHaitechWhatsAppUrl(buildHeaderWhatsAppMessage(contact, 'ventas'));
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function openHeaderSupportWhatsApp(contact: WhatsAppContact): boolean {
  const url = `${HEADER_SUPPORT_WHATSAPP_URL}?text=${encodeWhatsAppText(
    buildHeaderWhatsAppMessage(contact, 'soporte'),
  )}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
