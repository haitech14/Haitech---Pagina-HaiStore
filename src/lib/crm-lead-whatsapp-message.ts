import { buildWhatsAppShareUrl } from '@/lib/proforma-whatsapp-message';
import { formatLeadDealValueDual, formatLeadProductDisplay } from '@/lib/crm-pipeline-utils';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { CrmPipelineLead } from '@/types/crm-pipeline';
import type { CompanySettings } from '@/types/company-settings';

function primaryPhoneFromForm(form: CrmNewLeadFormValues): string {
  const phones = form.phones ?? [];
  const celular = phones.find((p) => p.type === 'celular' && p.number.trim());
  if (celular) {
    const cc = celular.countryCode?.trim().replace(/\D/g, '') || '51';
    return `${cc}${celular.number.replace(/\D/g, '')}`;
  }
  const first = phones.find((p) => p.number.trim());
  if (!first) return '';
  const cc = first.countryCode?.trim().replace(/\D/g, '') || '51';
  return `${cc}${first.number.replace(/\D/g, '')}`;
}

export function getLeadCelularDigits(lead: CrmPipelineLead): string {
  return primaryPhoneFromForm(lead.formSnapshot);
}

export function formatLeadCelularDisplay(lead: CrmPipelineLead): string {
  const phones = lead.formSnapshot.phones ?? [];
  const entry =
    phones.find((p) => p.type === 'celular' && p.number.trim()) ??
    phones.find((p) => p.number.trim());
  if (!entry) return '—';
  const cc = entry.countryCode?.trim() || '+51';
  const number = entry.number.trim();
  return `${cc} ${number}`.replace(/\s+/g, ' ');
}

export function getLeadContactDisplay(lead: CrmPipelineLead): string {
  const name = lead.contactName.trim() || lead.formSnapshot.contactName.trim();
  return name || '—';
}

export function buildLeadFollowUpWhatsAppMessage(
  lead: CrmPipelineLead,
  company?: Pick<CompanySettings, 'legalName' | 'phone'>,
  usdToPenRate = 3.7,
): string {
  const greeting = getLeadContactDisplay(lead);
  const saludo = greeting === '—' ? 'estimado cliente' : greeting;
  const producto = formatLeadProductDisplay(lead.productName, lead.lineItems);
  const valor = formatLeadDealValueDual(lead.valueAmount, lead.currency, usdToPenRate);
  const empresa = lead.organization !== '—' ? lead.organization : '';
  const vendedor = lead.sellerName;

  const lines = [
    `¡Hola ${saludo}! 👋`,
    '',
    `Te escribo de *${company?.legalName ?? 'NBN Tecnología Total S.A.C.'}* para dar seguimiento a tu pedido:`,
    '',
    `📋 *${lead.title}*`,
    empresa ? `🏢 ${empresa}` : null,
    producto !== '—' ? `🖨️ *Producto:* ${producto}` : null,
    `💰 *Valor referencial:* ${valor}`,
    lead.followUpLabel !== 'Seguimiento: Sin fecha' ? `📅 ${lead.followUpLabel}` : null,
    '',
    '¿En qué podemos ayudarte para avanzar con tu compra o cotización? 😊',
    '',
    `Saludos,`,
    `*${vendedor}*`,
    company?.phone ? `📞 ${company.phone}` : null,
  ].filter((line): line is string => line != null && line !== '');

  return lines.join('\n');
}

export function openLeadFollowUpWhatsApp(
  lead: CrmPipelineLead,
  company?: Pick<CompanySettings, 'legalName' | 'phone'>,
  usdToPenRate?: number,
): boolean {
  const phone = getLeadCelularDigits(lead);
  const message = buildLeadFollowUpWhatsAppMessage(lead, company, usdToPenRate);
  const url = buildWhatsAppShareUrl(phone, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
