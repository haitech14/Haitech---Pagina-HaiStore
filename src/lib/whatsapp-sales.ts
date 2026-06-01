/** WhatsApp de ventas Haitech (Perú, móvil). */
export const HAITECH_WHATSAPP_MSISDN = '51915149290';

export const HAITECH_WHATSAPP_DISPLAY = '+51 915 149 290';

export const HAITECH_WHATSAPP_URL = `https://wa.me/${HAITECH_WHATSAPP_MSISDN}`;

/** Móvil peruano en WhatsApp: 51 + 9 dígitos que empiezan en 9. */
export function isPeruMobileWhatsAppMsisdn(digits: string): boolean {
  return /^519\d{8}$/.test(digits);
}

export function normalizePeruWhatsAppMsisdn(phone: string | null | undefined): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return HAITECH_WHATSAPP_MSISDN;

  const withCountry = digits.startsWith('51') ? digits : `51${digits}`;
  return isPeruMobileWhatsAppMsisdn(withCountry) ? withCountry : HAITECH_WHATSAPP_MSISDN;
}

export function buildHaitechWhatsAppUrl(text: string): string {
  return `${HAITECH_WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}
