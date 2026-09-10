import type { ProductQuoteFormValues } from '@/lib/generate-product-quote-from-contact';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';

export interface SunatRucResult {
  numero: string;
  razonSocial: string;
  direccion: string;
  ciudad: string;
  estado: string | null;
  condicion: string | null;
}

export function normalizeRucInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function isCompleteRuc(value: string): boolean {
  return /^\d{11}$/.test(normalizeRucInput(value));
}

export function applySunatToQuoteForm(
  current: ProductQuoteFormValues,
  sunat: SunatRucResult,
): ProductQuoteFormValues {
  return {
    ...current,
    ruc: sunat.numero,
    razonSocial: sunat.razonSocial,
    direccion: current.direccion.trim() ? current.direccion : sunat.direccion || current.direccion,
    ciudad: current.ciudad.trim() ? current.ciudad : sunat.ciudad || current.ciudad,
  };
}

export function applySunatToClientForm(
  current: HaitechClientFormValues,
  sunat: SunatRucResult,
): HaitechClientFormValues {
  return {
    ...current,
    rucDni: sunat.numero,
    nombre: sunat.razonSocial,
    direccion: current.direccion.trim() ? current.direccion : sunat.direccion || current.direccion,
    ciudad: current.ciudad.trim() ? current.ciudad : sunat.ciudad || current.ciudad,
  };
}
