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

export function persistQuoteDraft(form: ProductQuoteFormValues): void {
  const hasAny = Object.values(form).some((value) => value.trim());
  if (!hasAny) return;
  storeQuoteProfile(form);
}

export function mergeQuoteForm(
  ...sources: Array<Partial<ProductQuoteFormValues> | null | undefined>
): ProductQuoteFormValues {
  const merged: ProductQuoteFormValues = { ...EMPTY_QUOTE_PROFILE };

  for (const source of sources) {
    if (!source) continue;
    if (!merged.ruc && source.ruc?.trim()) merged.ruc = source.ruc.trim();
    if (!merged.razonSocial && source.razonSocial?.trim()) {
      merged.razonSocial = source.razonSocial.trim();
    }
    if (!merged.atencion && source.atencion?.trim()) merged.atencion = source.atencion.trim();
    if (!merged.celular && source.celular?.trim()) merged.celular = source.celular.trim();
    if (!merged.direccion && source.direccion?.trim()) merged.direccion = source.direccion.trim();
    if (!merged.ciudad && source.ciudad?.trim()) merged.ciudad = source.ciudad.trim();
  }

  return merged;
}

/** Borrador del dispositivo primero, luego perfil de cuenta / WhatsApp. */
export function resolveQuoteFormOnOpen(profile: ProductQuoteFormValues): ProductQuoteFormValues {
  return mergeQuoteForm(readStoredQuoteProfile(), profile);
}
