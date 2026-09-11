import type { ProductQuoteFormValues } from '@/lib/generate-product-quote-from-contact';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';

export interface SunatRucResult {
  numero: string;
  razonSocial: string;
  direccion: string;
  ciudad: string;
  distrito: string;
  departamento: string;
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

export function applySunatToVisitFields<
  T extends {
    ruc: string;
    razonSocial: string;
    address: string;
    city: string;
    district: string;
  },
>(current: T, sunat: SunatRucResult): T {
  const city = current.city.trim();
  const keepCity = city.length > 0 && city.toLowerCase() !== 'lima';
  return {
    ...current,
    ruc: sunat.numero,
    razonSocial: sunat.razonSocial || current.razonSocial,
    address: current.address.trim() ? current.address : sunat.direccion || current.address,
    city: keepCity ? current.city : sunat.ciudad || current.city,
    district: current.district.trim() ? current.district : sunat.distrito || current.district,
  };
}
