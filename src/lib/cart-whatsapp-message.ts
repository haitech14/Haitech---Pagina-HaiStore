import { cartLineUnitUsd } from '@/context/cart-context';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { WA_EMOJI } from '@/lib/whatsapp-encoding';
import type { CartItem } from '@/types/product';

export function buildCartQuoteWhatsAppMessage(items: CartItem[], totalUsd: number): string {
  const itemLines = items.map((item) => {
    const lineUsd = cartLineUnitUsd(item) * item.quantity;
    return `  • ${item.quantity}× ${item.product.name} — $${lineUsd.toFixed(2)}`;
  });

  return [
    `¡Hola equipo Haitech! ${WA_EMOJI.wave}`,
    '',
    `Quiero cotizar mi carrito desde HaiStore ${WA_EMOJI.cart}`,
    '',
    `${WA_EMOJI.bags} *Productos:*`,
    ...itemLines,
    '',
    `${WA_EMOJI.money} *Subtotal estimado:* $${totalUsd.toFixed(2)}`,
    '',
    `¿Me pueden ayudar a completar la cotización o el pedido? ${WA_EMOJI.smile}`,
  ].join('\n');
}

export function openCartQuoteWhatsApp(items: CartItem[], totalUsd: number): boolean {
  const url = buildHaitechWhatsAppUrl(buildCartQuoteWhatsAppMessage(items, totalUsd));
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
