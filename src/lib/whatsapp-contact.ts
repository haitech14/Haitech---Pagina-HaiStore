export interface WhatsAppContact {
  name: string;
  companyOrRuc: string;
  city: string;
}

const STORAGE_KEY = 'haistore_whatsapp_contact_v2';
const LEGACY_STORAGE_KEY = 'haistore_whatsapp_contact_v1';

export function cityFromBilling(billing: Record<string, unknown> | null | undefined): string {
  if (!billing || typeof billing !== 'object') return '';
  const raw = billing.city ?? billing.ciudad ?? billing.address_level2;
  return typeof raw === 'string' ? raw.trim() : '';
}

function companyOrRucFromParts(
  companyName?: string | null,
  taxId?: string | null,
): string {
  const company = companyName?.trim() ?? '';
  const tax = taxId?.trim() ?? '';
  if (tax && company) return `${tax} · ${company}`;
  return company || tax;
}

export function companyOrRucFromAccountRow(row: {
  company_name?: string | null;
  tax_id?: string | null;
} | null | undefined): string {
  return companyOrRucFromParts(row?.company_name, row?.tax_id);
}

function readLegacyContact(): WhatsAppContact | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; phone?: string; city?: string };
    const name = parsed.name?.trim() ?? '';
    const city = parsed.city?.trim() ?? '';
    if (!name || !city) return null;
    return { name, companyOrRuc: '', city };
  } catch {
    return null;
  }
}

export function readStoredWhatsAppContact(): WhatsAppContact | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return readLegacyContact();
    const parsed = JSON.parse(raw) as Partial<WhatsAppContact>;
    const name = parsed.name?.trim() ?? '';
    const companyOrRuc = parsed.companyOrRuc?.trim() ?? '';
    const city = parsed.city?.trim() ?? '';
    if (!name || !companyOrRuc || !city) return null;
    return { name, companyOrRuc, city };
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
  return Boolean(
    contact?.name?.trim() && contact?.companyOrRuc?.trim() && contact?.city?.trim(),
  );
}

/** Combina fuentes de prellenado; los valores posteriores solo rellenan campos vacíos. */
export function mergeWhatsAppContactPrefill(
  ...sources: Array<Partial<WhatsAppContact> | null | undefined>
): WhatsAppContact {
  const merged: WhatsAppContact = { name: '', companyOrRuc: '', city: '' };

  for (const source of sources) {
    if (!source) continue;
    if (!merged.name && source.name?.trim()) merged.name = source.name.trim();
    if (!merged.companyOrRuc && source.companyOrRuc?.trim()) {
      merged.companyOrRuc = source.companyOrRuc.trim();
    }
    if (!merged.city && source.city?.trim()) merged.city = source.city.trim();
  }

  return merged;
}

export function companyOrRucFromCheckoutParts(
  rucDni?: string | null,
  companyName?: string | null,
): string {
  return companyOrRucFromParts(companyName, rucDni);
}

export function parseCompanyOrRucForStorage(companyOrRuc: string): {
  companyName: string | null;
  taxId: string | null;
} {
  const trimmed = companyOrRuc.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const looksLikeRuc =
    digitsOnly.length >= 8 && digitsOnly.length <= 11 && digitsOnly === trimmed.replace(/\s/g, '');

  if (looksLikeRuc) {
    return { companyName: null, taxId: digitsOnly };
  }

  const rucMatch = trimmed.match(/^(\d{8,11})\s*[·\-–]\s*(.+)$/);
  if (rucMatch) {
    return { companyName: rucMatch[2]?.trim() || null, taxId: rucMatch[1] ?? null };
  }

  return { companyName: trimmed, taxId: null };
}
