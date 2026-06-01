export interface WhatsAppContact {
  name: string;
  phone: string;
  city: string;
}

const STORAGE_KEY = 'haistore_whatsapp_contact_v1';

export function cityFromBilling(billing: Record<string, unknown> | null | undefined): string {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.city ?? billing.ciudad ?? billing.address_level2;
  return typeof raw === 'string' ? raw.trim() : '';
}

export function readStoredWhatsAppContact(): WhatsAppContact | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WhatsAppContact>;
    const name = parsed.name?.trim() ?? '';
    const phone = parsed.phone?.trim() ?? '';
    const city = parsed.city?.trim() ?? '';
    if (!name || !phone || !city) return null;
    return { name, phone, city };
  } catch {
    return null;
  }
}

export function storeWhatsAppContact(contact: WhatsAppContact): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
}

export function isCompleteWhatsAppContact(
  contact: Partial<WhatsAppContact> | null | undefined,
): contact is WhatsAppContact {
  return Boolean(contact?.name?.trim() && contact?.phone?.trim() && contact?.city?.trim());
}
