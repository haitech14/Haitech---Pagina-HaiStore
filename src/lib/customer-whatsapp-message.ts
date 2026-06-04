import { buildWhatsAppShareUrl } from '@/lib/proforma-whatsapp-message';
import { getPersonaCellValue } from '@/lib/persona-report-columns';
import type { StoreCustomerWithRole } from '@/types/store';

export function getCustomerWhatsAppPhone(customer: StoreCustomerWithRole): string {
  return getPersonaCellValue(customer, 'telefono_principal') || customer.phone?.trim() || '';
}

export function buildCustomerWhatsAppMessage(
  customer: StoreCustomerWithRole,
  productNames: string[] = [],
): string {
  const name =
    getPersonaCellValue(customer, 'nombre_razon_social') ||
    customer.full_name?.trim() ||
    'estimado cliente';

  const lines = [`¡Hola ${name}! 👋`, '', 'Te escribimos desde HaiStore.'];

  if (productNames.length > 0) {
    lines.push('', 'Productos de tu interés:', ...productNames.map((p) => `  • ${p}`));
  }

  lines.push('', '¿En qué podemos ayudarte?');
  return lines.join('\n');
}

export function openCustomerWhatsApp(
  customer: StoreCustomerWithRole,
  productNames: string[] = [],
): boolean {
  const phone = getCustomerWhatsAppPhone(customer);
  const message = buildCustomerWhatsAppMessage(customer, productNames);
  const url = buildWhatsAppShareUrl(phone, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
