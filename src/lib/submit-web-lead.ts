import { apiFetch } from '@/lib/api';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';

export type WebLeadChannel =
  | 'whatsapp-product'
  | 'whatsapp-header'
  | 'whatsapp-cotizar'
  | 'whatsapp-hero'
  | 'whatsapp-floating'
  | 'whatsapp-home'
  | 'whatsapp-rental'
  | 'contact-page'
  | 'quote-pdf'
  | 'account-login'
  | string;

export type SubmitWebLeadInput = {
  contact: Pick<WhatsAppContact, 'name' | 'companyOrRuc' | 'city'> & {
    email?: string;
    phone?: string;
    direccion?: string;
  };
  channel: WebLeadChannel;
  message?: string;
  productName?: string;
  productId?: string;
  createProforma?: boolean;
};

/** Registra el lead en Cotizaciones (proforma + cliente) con IP del servidor. */
export async function submitWebLead(input: SubmitWebLeadInput): Promise<void> {
  const name = input.contact.name?.trim();
  if (!name || name.length < 2) return;

  try {
    await apiFetch('/api/leads/web', {
      method: 'POST',
      body: JSON.stringify({
        name,
        companyOrRuc: input.contact.companyOrRuc?.trim() || undefined,
        city: input.contact.city?.trim() || undefined,
        email: input.contact.email?.trim() || undefined,
        phone: input.contact.phone?.trim() || undefined,
        direccion: input.contact.direccion?.trim() || undefined,
        channel: input.channel,
        message: input.message,
        productName: input.productName,
        productId: input.productId,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        createProforma: input.createProforma !== false,
      }),
    });
  } catch {
    /* No bloquear WhatsApp / UX si el registro falla */
  }
}
