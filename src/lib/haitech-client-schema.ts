import { z } from 'zod';

import { PRICE_ROLES } from '@/types/product';

export const CHECKOUT_COMPROBANTE_TYPES = ['factura', 'boleta'] as const;
export const CHECKOUT_DESTINO_ENVIO = ['lima', 'provincia'] as const;
export const CHECKOUT_LIMA_TRANSPORTE = ['camioneta', 'minivan', 'motorizado'] as const;
export const CHECKOUT_PROVINCIA_AGENCIAS = ['olva', 'shalom', 'urbano'] as const;
export const CHECKOUT_PROVINCIA_ENTREGA = ['agencia', 'domicilio'] as const;

export type CheckoutComprobanteType = (typeof CHECKOUT_COMPROBANTE_TYPES)[number];
export type CheckoutDestinoEnvio = (typeof CHECKOUT_DESTINO_ENVIO)[number];
export type CheckoutLimaTransporte = (typeof CHECKOUT_LIMA_TRANSPORTE)[number];
export type CheckoutProvinciaAgencia = (typeof CHECKOUT_PROVINCIA_AGENCIAS)[number];
export type CheckoutProvinciaEntrega = (typeof CHECKOUT_PROVINCIA_ENTREGA)[number];

export const haitechClientSchema = z.object({
  storeCustomerId: z.string().nullable().optional(),
  haisupportClientId: z.string().nullable().optional(),
  nombre: z.string().min(2, 'Indique la razón social.'),
  nombreContacto: z.string().min(2, 'Indique el contacto.'),
  rucDni: z
    .string()
    .min(8, 'El RUC/DNI debe tener al menos 8 caracteres.')
    .max(11, 'El RUC/DNI no puede superar 11 caracteres.'),
  telefono: z.string().min(9, 'Introduce un teléfono válido.'),
  direccion: z.string().min(3, 'Indique la dirección.'),
  ciudad: z.string().min(2, 'Indique la ciudad.'),
  tipoCliente: z.enum(PRICE_ROLES),
  email: z.string().email('Correo inválido.').optional().or(z.literal('')),
  notas: z.string().optional(),
  tipoComprobante: z.enum(CHECKOUT_COMPROBANTE_TYPES).optional(),
  destinoEnvio: z.enum(CHECKOUT_DESTINO_ENVIO).optional(),
  transporteLima: z.enum(CHECKOUT_LIMA_TRANSPORTE).optional().nullable(),
  agenciaProvincia: z.enum(CHECKOUT_PROVINCIA_AGENCIAS).optional().nullable(),
  atencionEntrega: z.string().optional(),
  dniEntrega: z.string().optional(),
  modalidadProvincia: z.enum(CHECKOUT_PROVINCIA_ENTREGA).optional().nullable(),
});

export type HaitechClientFormValues = z.infer<typeof haitechClientSchema>;

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCheckoutDocument(
  tipoComprobante: CheckoutComprobanteType,
  rucDni: string,
): string | null {
  const doc = normalizeDigits(rucDni);
  if (tipoComprobante === 'factura') {
    if (doc.length !== 11) {
      return 'La factura requiere un RUC válido de 11 dígitos.';
    }
    return null;
  }
  if (doc.length !== 8 && doc.length !== 11) {
    return 'La boleta requiere DNI (8 dígitos) o RUC (11 dígitos).';
  }
  return null;
}

export function validateCheckoutShipping(client: HaitechClientFormValues): string | null {
  const destino = client.destinoEnvio ?? 'lima';

  if (destino === 'lima') {
    if (!client.transporteLima) {
      return 'Selecciona el tipo de transporte para Lima metropolitana.';
    }
    return null;
  }

  if (!client.agenciaProvincia) {
    return 'Selecciona la agencia de envío para provincia.';
  }
  if (!client.modalidadProvincia) {
    return 'Indica si el pedido es recojo en agencia o entrega a domicilio.';
  }
  if (!client.atencionEntrega?.trim()) {
    return 'Indica la persona de atención para la entrega.';
  }
  if (!client.dniEntrega?.trim()) {
    return 'Indica el DNI de la persona que recibirá el pedido.';
  }
  const dni = normalizeDigits(client.dniEntrega);
  if (dni.length !== 8) {
    return 'El DNI de entrega debe tener 8 dígitos.';
  }

  return null;
}

export function validateCheckoutClientForm(client: HaitechClientFormValues): string | null {
  const withEmail = { ...client, email: client.email?.trim() || '' };
  const parsed = haitechClientSchema.safeParse(withEmail);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? 'Datos inválidos';
  }

  const tipoComprobante = parsed.data.tipoComprobante ?? 'boleta';
  const documentError = validateCheckoutDocument(tipoComprobante, parsed.data.rucDni);
  if (documentError) return documentError;

  const shippingError = validateCheckoutShipping(parsed.data);
  if (shippingError) return shippingError;

  if (parsed.data.email?.trim()) {
    const emailParsed = z.string().email('Correo inválido.').safeParse(parsed.data.email.trim());
    if (!emailParsed.success) {
      return emailParsed.error.issues[0]?.message ?? 'Correo inválido.';
    }
  }

  return null;
}

export const EMPTY_HAITECH_CLIENT: HaitechClientFormValues = {
  storeCustomerId: null,
  haisupportClientId: null,
  nombre: '',
  nombreContacto: '',
  rucDni: '',
  telefono: '',
  direccion: '',
  ciudad: 'Lima',
  tipoCliente: 'public',
  email: '',
  notas: '',
  tipoComprobante: 'boleta',
  destinoEnvio: 'lima',
  transporteLima: null,
  agenciaProvincia: null,
  atencionEntrega: '',
  dniEntrega: '',
  modalidadProvincia: null,
};
