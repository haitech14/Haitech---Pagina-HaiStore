import type { WhatsAppContact } from '@/lib/whatsapp-contact';

/** Datos de cliente para cotización PDF (sin depender de jspdf). */
export interface QuoteClientData {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  ciudad: string;
}

/** Mapea el contacto WhatsApp al bloque cliente de una cotización. */
export function contactToQuoteClient(contact: WhatsAppContact): QuoteClientData {
  const companyOrRuc = contact.companyOrRuc.trim();
  const digitsOnly = companyOrRuc.replace(/\D/g, '');
  const looksLikeRuc =
    digitsOnly.length >= 8 &&
    digitsOnly.length <= 11 &&
    digitsOnly === companyOrRuc.replace(/\s/g, '');

  if (looksLikeRuc) {
    return {
      razonSocial: contact.name.trim(),
      ruc: digitsOnly,
      atencion: contact.name.trim(),
      celular: '—',
      ciudad: contact.city.trim(),
    };
  }

  return {
    razonSocial: companyOrRuc || contact.name.trim(),
    ruc: digitsOnly.length >= 8 && digitsOnly.length <= 11 ? digitsOnly : 'S/D',
    atencion: contact.name.trim(),
    celular: '—',
    ciudad: contact.city.trim(),
  };
}
