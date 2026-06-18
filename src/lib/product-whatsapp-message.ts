import { buildWhatsAppMeUrl, WA_EMOJI } from '@/lib/whatsapp-encoding';
import {
  HAITECH_WHATSAPP_MSISDN,
  normalizePeruWhatsAppMsisdn,
} from '@/lib/whatsapp-sales';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { formatPenFromUsd, formatUsd } from '@/lib/utils';

export { HAITECH_WHATSAPP_MSISDN };

export interface ProductWhatsAppLineItem {
  id?: string;
  name: string;
  priceUsd: number;
  category?: string | null;
  brand?: string | null;
  productUrl?: string;
  quantity?: number;
}

export function buildProductWhatsAppMessage(
  product: ProductWhatsAppLineItem,
  contact: WhatsAppContact,
): string {
  const priceUsd = formatUsd(product.priceUsd);
  const pricePen = formatPenFromUsd(product.priceUsd);
  const meta = [product.brand?.trim(), product.category?.trim()].filter(Boolean).join(' · ');

  return [
    `¡Hola! ${WA_EMOJI.wave} Soy *${contact.name.trim()}*`,
    '',
    'Me interesa este producto de la tienda:',
    '',
    `${WA_EMOJI.package} *${product.name.trim()}*`,
    meta ? `${WA_EMOJI.label} ${meta}` : null,
    product.quantity != null && product.quantity > 1
      ? `${WA_EMOJI.package} Cantidad: *${product.quantity}*`
      : null,
    `${WA_EMOJI.dollar} *${priceUsd}* · *${pricePen}*`,
    product.productUrl ? `${WA_EMOJI.link} ${product.productUrl}` : null,
    '',
    `${WA_EMOJI.clipboard} *Mis datos:*`,
    `${WA_EMOJI.mobile} Celular: ${contact.phone.trim()}`,
    `${WA_EMOJI.pin} Ciudad: ${contact.city.trim()}`,
    '',
    `¿Podrían brindarme más información o una cotización? ${WA_EMOJI.pray}`,
    `¡Gracias! ${WA_EMOJI.smile}`,
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function openProductWhatsAppChat(
  product: ProductWhatsAppLineItem,
  contact: WhatsAppContact,
  businessPhone = HAITECH_WHATSAPP_MSISDN,
): boolean {
  const message = buildProductWhatsAppMessage(product, contact);
  const msisdn = normalizePeruWhatsAppMsisdn(businessPhone);
  const url = buildWhatsAppMeUrl(msisdn, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
