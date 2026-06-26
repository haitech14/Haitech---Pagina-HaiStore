import { z } from 'zod';

import { PRICE_ROLES } from '@/types/product';

export const CHECKOUT_COMPROBANTE_TYPES = ['factura', 'boleta'] as const;
export const CHECKOUT_DESTINO_ENVIO = ['lima', 'provincia'] as const;

export type CheckoutComprobanteType = (typeof CHECKOUT_COMPROBANTE_TYPES)[number];
export type CheckoutDestinoEnvio = (typeof CHECKOUT_DESTINO_ENVIO)[number];

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

export function validateCheckoutClientForm(client: HaitechClientFormValues): string | null {
  const withEmail = { ...client, email: client.email?.trim() || '' };
  const parsed = haitechClientSchema.safeParse(withEmail);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? 'Datos inválidos';
  }

  const tipoComprobante = parsed.data.tipoComprobante ?? 'boleta';
  const documentError = validateCheckoutDocument(tipoComprobante, parsed.data.rucDni);
  if (documentError) return documentError;

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
};
