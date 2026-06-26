import { cartLineUnitUsd } from '@/context/cart-context';
import {
  formatCheckoutAmount,
  type CheckoutPaymentCurrency,
} from '@/lib/checkout-totals';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { buildWhatsAppMeUrl, WA_EMOJI } from '@/lib/whatsapp-encoding';
import type { CartItem } from '@/types/product';

export interface CheckoutOrderWhatsAppInput {
  orderNumber: string;
  items: CartItem[];
  paymentMethod: string;
  paymentCurrency: CheckoutPaymentCurrency;
  totalUsd: number;
  totalPen: number;
  client: HaitechClientFormValues;
}

export function buildCheckoutOrderWhatsAppMessage(input: CheckoutOrderWhatsAppInput): string {
  const totalLabel = formatCheckoutAmount(input.totalUsd, input.totalPen, input.paymentCurrency);
  const itemLines = input.items.map((item) => {
    const lineUsd = cartLineUnitUsd(item) * item.quantity;
    return `  • ${item.quantity}× ${item.product.name} — $${lineUsd.toFixed(2)}`;
  });

  return [
    `¡Hola equipo Haitech! ${WA_EMOJI.wave}`,
    '',
    `Acabo de realizar un pedido en la tienda web ${WA_EMOJI.cart}`,
    '',
    `${WA_EMOJI.clipboard} *Pedido:* ${input.orderNumber}`,
    `${WA_EMOJI.creditCard} *Pago:* ${input.paymentMethod}`,
    `${WA_EMOJI.money} *Total:* ${totalLabel}`,
    '',
    `${WA_EMOJI.building} *Cliente:* ${input.client.nombre.trim()}`,
    `${WA_EMOJI.idCard} *RUC/DNI:* ${input.client.rucDni.trim()}`,
    `${WA_EMOJI.mobile} *Teléfono:* ${input.client.telefono.trim()}`,
    `${WA_EMOJI.pin} *Envío:* ${input.client.direccion.trim()}, ${input.client.ciudad.trim()}`,
    '',
    `${WA_EMOJI.bags} *Productos:*`,
    ...itemLines,
    '',
    `Quedo atento a la confirmación. ${WA_EMOJI.smile}`,
  ].join('\n');
}

export function openCheckoutOrderWhatsApp(
  companyPhone: string,
  input: CheckoutOrderWhatsAppInput,
): boolean {
  const url = buildWhatsAppMeUrl(companyPhone, buildCheckoutOrderWhatsAppMessage(input));
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
