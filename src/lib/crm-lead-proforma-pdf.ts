import { formatCrmLeadAddress } from '@/lib/crm-lead-address';
import { parseLeadValueAmount } from '@/lib/crm-lead-form';
import { computeLeadLinesTotal } from '@/lib/crm-lead-products';
import { formatLeadCelularDisplay } from '@/lib/crm-lead-whatsapp-message';
import { leadAmountInPen } from '@/lib/crm-lead-form';
import { downloadProformaPdf, regenerateProformaPdf } from '@/lib/regenerate-proforma-pdf';
import { nextTpvDocumentNumber } from '@/lib/tpv-document-serial';
import { TPV_DOCUMENT_META } from '@/types/tpv';
import type { CompanySettings } from '@/types/company-settings';
import type { CrmLeadLineItem } from '@/types/crm-lead-form';
import type { CrmPipelineLead } from '@/types/crm-pipeline';
import type { ProformaLineItem, ProformaRecord } from '@/types/proforma';
import type { PriceRole } from '@/types/product';

function leadLineToProformaLine(line: CrmLeadLineItem, index: number): ProformaLineItem {
  const unit = parseLeadValueAmount(line.unitPrice);
  const item: ProformaLineItem = {
    name: line.productName.trim() || 'Producto',
    sku: line.productId?.slice(0, 12) || `L${index + 1}`,
    brand: '—',
    quantity: Math.max(1, Math.floor(line.quantity) || 1),
    unitPricePen: unit,
    imageUrl: null,
  };
  if (line.productId) item.productId = line.productId;
  return item;
}

function buildProformaLinesFromLead(lead: CrmPipelineLead): ProformaLineItem[] {
  const items = lead.lineItems ?? [];
  if (items.length > 0) {
    return items.map(leadLineToProformaLine);
  }

  const name = lead.productName.trim() || lead.title;
  const total =
    lead.valueAmount > 0
      ? lead.valueAmount
      : parseLeadValueAmount(lead.formSnapshot.valueAmount);

  return [
    {
      name,
      sku: '—',
      brand: '—',
      quantity: 1,
      unitPricePen: total,
      imageUrl: null,
    },
  ];
}

export function leadToProformaRecord(
  lead: CrmPipelineLead,
  company: CompanySettings,
  options: {
    documentNumber?: string;
    sellerEmail?: string;
    usdToPenRate?: number;
  } = {},
): ProformaRecord {
  const form = lead.formSnapshot;
  const lineItems = buildProformaLinesFromLead(lead);
  const linesTotal = computeLeadLinesTotal(lead.lineItems ?? []);
  const valueAmount =
    (lead.lineItems?.length ?? 0) > 0
      ? linesTotal
      : lead.valueAmount || parseLeadValueAmount(form.valueAmount);
  const usdToPenRate = options.usdToPenRate ?? company.usdToPenExchangeRate;
  const totalPen = leadAmountInPen(
    { ...lead, valueAmount, currency: lead.currency },
    usdToPenRate,
  );
  const subtotalPen =
    lead.currency === 'PEN' ? valueAmount : Math.round(valueAmount * usdToPenRate * 100) / 100;

  const celularRaw = formatLeadCelularDisplay(lead);
  const celular = celularRaw === '—' ? '' : celularRaw;

  return {
    id: lead.id,
    documentNumber: options.documentNumber ?? nextTpvDocumentNumber('proforma'),
    source: 'tpv',
    documentType: 'proforma',
    customer: {
      razonSocial: lead.organization !== '—' ? lead.organization : lead.contactName || lead.title,
      documento: '',
      atencion: lead.contactName || form.contactName.trim() || '—',
      celular,
      direccion: formatCrmLeadAddress(form) || 'Lima',
      ciudad: form.city.trim() || 'Lima',
      storeCustomerId: null,
    },
    lineItems,
    currency: lead.currency,
    priceList: (form.customerRole as PriceRole) ?? 'public',
    subtotalPen,
    totalPen,
    sellerName: lead.sellerName,
    sellerEmail: options.sellerEmail ?? company.email,
    followUpStatus: 'pending',
    notes: form.notes?.trim() ?? '',
    validityDays: TPV_DOCUMENT_META.proforma.validityDays,
    createdAt: lead.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

export async function downloadLeadProformaPdf(
  lead: CrmPipelineLead,
  company: CompanySettings,
  options?: { sellerEmail?: string; usdToPenRate?: number },
): Promise<{ documentNumber: string; filename: string }> {
  const proforma = leadToProformaRecord(lead, company, options);
  await downloadProformaPdf(proforma, company);
  return {
    documentNumber: proforma.documentNumber,
    filename: `proforma-${proforma.documentNumber}.pdf`,
  };
}

export async function previewLeadProformaPdf(
  lead: CrmPipelineLead,
  company: CompanySettings,
  options?: { sellerEmail?: string; usdToPenRate?: number },
): Promise<{ url: string; documentNumber: string }> {
  const proforma = leadToProformaRecord(lead, company, options);
  const { blob } = await regenerateProformaPdf(proforma, company);
  const url = URL.createObjectURL(blob);
  return { url, documentNumber: proforma.documentNumber };
}
