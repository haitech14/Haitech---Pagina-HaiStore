import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { buildCheckoutShippingNotes } from '@/lib/checkout-shipping-options';
import { storeCustomerToTpvCustomer } from '@/lib/tpv-customer';
import type { HaitechClient } from '@/types/haitech-domain';
import type { StoreCustomerSearchResult } from '@/types/store-customer';
import type { TpvCustomer, TpvCurrency } from '@/types/tpv';

export function searchResultToHaitechClient(row: StoreCustomerSearchResult): HaitechClientFormValues {
  const tpv = storeCustomerToTpvCustomer(row);
  return {
    storeCustomerId: row.id,
    haisupportClientId: row.source === 'haisupport' ? row.id : null,
    nombre: tpv.razonSocial,
    nombreContacto: tpv.atencion,
    rucDni: tpv.documento,
    telefono: tpv.celular,
    direccion: tpv.direccion,
    ciudad: tpv.ciudad ?? 'Lima',
    tipoCliente: tpv.priceList,
    email: row.email ?? '',
    notas: '',
  };
}

export function haitechFormToClient(values: HaitechClientFormValues): HaitechClient {
  const shippingInput: Parameters<typeof buildCheckoutShippingNotes>[0] = {};
  if (values.destinoEnvio) shippingInput.destinoEnvio = values.destinoEnvio;
  if (values.transporteLima) shippingInput.transporteLima = values.transporteLima;
  if (values.agenciaProvincia) shippingInput.agenciaProvincia = values.agenciaProvincia;
  if (values.modalidadProvincia) shippingInput.modalidadProvincia = values.modalidadProvincia;
  if (values.atencionEntrega?.trim()) shippingInput.atencionEntrega = values.atencionEntrega.trim();
  if (values.dniEntrega?.trim()) shippingInput.dniEntrega = values.dniEntrega.trim();
  if (values.ciudad?.trim()) shippingInput.ciudad = values.ciudad.trim();

  const shippingNotes = buildCheckoutShippingNotes(shippingInput);
  const baseNotes = values.notas?.trim() || '';
  const notas = shippingNotes
    ? baseNotes
      ? `${baseNotes} | ${shippingNotes}`
      : shippingNotes
    : baseNotes || null;

  return {
    storeCustomerId: values.storeCustomerId ?? null,
    haisupportClientId: values.haisupportClientId ?? null,
    nombre: values.nombre.trim(),
    nombreContacto: values.nombreContacto.trim(),
    rucDni: values.rucDni.trim(),
    telefono: values.telefono.trim(),
    direccion: values.direccion.trim(),
    ciudad: values.ciudad.trim(),
    tipoCliente: values.tipoCliente,
    email: values.email?.trim() || null,
    notas,
    source: 'haistore',
  };
}

export function haitechFormToTpvCustomer(
  values: HaitechClientFormValues,
  currency: TpvCurrency = 'PEN',
): TpvCustomer {
  return {
    storeCustomerId: values.storeCustomerId ?? null,
    razonSocial: values.nombre.trim(),
    documento: values.rucDni.trim(),
    atencion: values.nombreContacto.trim(),
    celular: values.telefono.trim(),
    direccion: values.direccion.trim(),
    ciudad: values.ciudad.trim(),
    priceList: values.tipoCliente,
    currency,
  };
}

export function tpvCustomerToHaitechForm(customer: TpvCustomer): HaitechClientFormValues {
  return {
    storeCustomerId: customer.storeCustomerId ?? null,
    haisupportClientId: null,
    nombre: customer.razonSocial,
    nombreContacto: customer.atencion,
    rucDni: customer.documento,
    telefono: customer.celular,
    direccion: customer.direccion,
    ciudad: customer.ciudad ?? 'Lima',
    tipoCliente: customer.priceList,
    email: '',
    notas: '',
  };
}

export function quoteFormToHaitechClient(values: {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  ciudad: string;
}): HaitechClient {
  return {
    nombre: values.razonSocial.trim(),
    nombreContacto: values.atencion.trim(),
    rucDni: values.ruc.trim(),
    telefono: values.celular.trim(),
    direccion: values.ciudad.trim(),
    ciudad: values.ciudad.trim(),
    tipoCliente: 'public',
    source: 'haistore',
  };
}
