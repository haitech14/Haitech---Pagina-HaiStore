/**
 * Emojis vía `String.fromCodePoint` en getters (sin literales UTF-8 en el bundle).
 * El minificador convierte `\u{…}` a caracteres multibyte; en Windows eso puede
 * corromperse al parsear el JS si el charset no es UTF-8.
 */

function cp(...codePoints: number[]): string {
  return String.fromCodePoint(...codePoints);
}

export const WA_EMOJI = {
  get wave() {
    return cp(0x1f44b);
  },
  get pray() {
    return cp(0x1f64f);
  },
  get smile() {
    return cp(0x1f60a);
  },
  get package() {
    return cp(0x1f4e6);
  },
  get label() {
    return cp(0x1f3f7, 0xfe0f);
  },
  get dollar() {
    return cp(0x1f4b5);
  },
  get money() {
    return cp(0x1f4b0);
  },
  get link() {
    return cp(0x1f517);
  },
  get clipboard() {
    return cp(0x1f4cb);
  },
  get mobile() {
    return cp(0x1f4f1);
  },
  get pin() {
    return cp(0x1f4cd);
  },
  get phone() {
    return cp(0x1f4de);
  },
  get email() {
    return cp(0x1f4e7);
  },
  get idCard() {
    return cp(0x1faaa);
  },
  get calendar() {
    return cp(0x1f4c5);
  },
  get cart() {
    return cp(0x1f6d2);
  },
  get bags() {
    return cp(0x1f6cd, 0xfe0f);
  },
  get printer() {
    return cp(0x1f5a8, 0xfe0f);
  },
  get building() {
    return cp(0x1f3e2);
  },
  get creditCard() {
    return cp(0x1f4b3);
  },
} as const;

/** Codifica texto para parámetro `text` de WhatsApp (UTF-8 / NFC, un solo paso). */
export function encodeWhatsAppText(text: string): string {
  return encodeURIComponent(text.normalize('NFC'));
}

function normalizeWhatsAppPhoneDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  return digits.startsWith('51') ? digits : `51${digits}`;
}

/**
 * Enlace `wa.me` con `text` codificado en UTF-8 (emojis como secuencias %F0%9F…).
 * @see https://developers.facebook.com/docs/whatsapp/
 */
export function buildWhatsAppMeUrl(phone: string, text: string): string | null {
  const normalized = normalizeWhatsAppPhoneDigits(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeWhatsAppText(text)}`;
}

/** Mismo encoding que `buildWhatsAppMeUrl`, formato api.whatsapp.com (admin / CRM). */
export function buildWhatsAppShareUrl(phone: string, text: string): string | null {
  const normalized = normalizeWhatsAppPhoneDigits(phone);
  if (!normalized) return null;
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodeWhatsAppText(text)}`;
}
