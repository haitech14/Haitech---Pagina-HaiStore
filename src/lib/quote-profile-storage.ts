import type { ProductQuoteFormValues } from '@/lib/generate-product-quote-from-contact';

const STORAGE_KEY = 'haistore_quote_profile_v1';

export const EMPTY_QUOTE_PROFILE: ProductQuoteFormValues = {
  ruc: '',
  razonSocial: '',
  atencion: '',
  celular: '',
  direccion: '',
  ciudad: '',
};

export function readStoredQuoteProfile(): ProductQuoteFormValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProductQuoteFormValues>;
    const profile: ProductQuoteFormValues = {
      ruc: parsed.ruc?.trim() ?? '',
      razonSocial: parsed.razonSocial?.trim() ?? '',
      atencion: parsed.atencion?.trim() ?? '',
      celular: parsed.celular?.trim() ?? '',
      direccion: parsed.direccion?.trim() ?? '',
      ciudad: parsed.ciudad?.trim() ?? '',
    };
    const hasAny = Object.values(profile).some(Boolean);
    return hasAny ? profile : null;
  } catch {
    return null;
  }
}

export function storeQuoteProfile(profile: ProductQuoteFormValues): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
