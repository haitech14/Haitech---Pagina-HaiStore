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
    razonSocial: sunat.razonSocial || current.razonSocial,
    direccion: sunat.direccion.trim() || current.direccion,
    ciudad: sunat.ciudad.trim() || current.ciudad,
  };
}

export function applySunatToClientForm(
  current: HaitechClientFormValues,
  sunat: SunatRucResult,
): HaitechClientFormValues {
  return {
    ...current,
    rucDni: sunat.numero,
    nombre: sunat.razonSocial || current.nombre,
    direccion: sunat.direccion.trim() || current.direccion,
    ciudad: sunat.ciudad.trim() || current.ciudad,
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
  return {
    ...current,
    ruc: sunat.numero,
    razonSocial: sunat.razonSocial || current.razonSocial,
    address: sunat.direccion.trim() || current.address,
    city: sunat.ciudad.trim() || current.city,
    district: sunat.distrito.trim() || current.district,
  };
}
