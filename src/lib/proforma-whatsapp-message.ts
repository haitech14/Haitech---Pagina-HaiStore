import type { CompanySettings } from '@/types/company-settings';
import type { ProformaRecord } from '@/types/proforma';
import { formatTpvMoney } from '@/lib/tpv-pricing';

function formatExpiryDate(createdAt: string, validityDays: number): string {
  const expiry = new Date(createdAt);
  expiry.setDate(expiry.getDate() + validityDays);
  return expiry.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function buildProformaWhatsAppMessage(
  proforma: ProformaRecord,
  company: Pick<CompanySettings, 'legalName' | 'supportPhone' | 'supportEmail'>,
): string {
  const greeting = proforma.customer.atencion.trim() || proforma.customer.razonSocial;
  const total = formatTpvMoney(proforma.totalPen, proforma.currency);
  const validUntil = formatExpiryDate(proforma.createdAt, proforma.validityDays);

  const lines = proforma.lineItems
    .slice(0, 8)
    .map(
      (line) =>
        `  • ${line.quantity}× ${line.name} — ${formatTpvMoney(line.unitPricePen * line.quantity, proforma.currency)}`,
    );

  if (proforma.lineItems.length > 8) {
    lines.push(`  • … y ${proforma.lineItems.length - 8} producto(s) más`);
  }

  const contactParts = [
    company.supportPhone ? `📞 ${company.supportPhone}` : null,
    company.supportEmail ? `✉️ ${company.supportEmail}` : null,
  ].filter(Boolean);

  return [
    `¡Hola ${greeting}! 👋`,
    '',
    `Te comparto la *proforma ${proforma.documentNumber}* de *${company.legalName}*:`,
    '',
    `📋 *Cliente:* ${proforma.customer.razonSocial}`,
    proforma.customer.documento ? `🪪 *RUC/DNI:* ${proforma.customer.documento}` : null,
    `💰 *Total:* ${total}`,
    `📅 *Válida hasta:* ${validUntil}`,
    '',
    '🛒 *Detalle:*',
    ...lines,
    '',
    '¿Te ayudo con alguna consulta o para confirmar tu pedido? 😊',
    '',
    `Saludos cordiales,`,
    `*${proforma.sellerName}*`,
    proforma.sellerEmail ? `_${proforma.sellerEmail}_` : null,
    contactParts.length > 0 ? '' : null,
    ...contactParts,
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function buildWhatsAppShareUrl(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  const normalized = digits.startsWith('51') ? digits : `51${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
