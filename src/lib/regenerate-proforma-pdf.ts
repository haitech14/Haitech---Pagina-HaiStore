import { buildProductQuotePdf } from '@/lib/generate-product-quote-pdf';
import { buildTpvDocumentPdf } from '@/lib/generate-tpv-document-pdf';
import { downloadQuotePdf } from '@/lib/generate-product-quote-pdf';
import type { CompanySettings } from '@/types/company-settings';
import type { ProformaRecord } from '@/types/proforma';
import type { PriceRole } from '@/types/product';
import type { TpvCustomer, TpvLineItem } from '@/types/tpv';

function toTpvCustomer(proforma: ProformaRecord): TpvCustomer {
  return {
    razonSocial: proforma.customer.razonSocial,
    documento: proforma.customer.documento,
    atencion: proforma.customer.atencion,
    celular: proforma.customer.celular,
    direccion: proforma.customer.direccion ?? 'Lima',
    priceList: (proforma.priceList as PriceRole) ?? 'public',
    currency: proforma.currency,
    storeCustomerId: proforma.customer.storeCustomerId ?? null,
  };
}

function toTpvLines(proforma: ProformaRecord): TpvLineItem[] {
  return proforma.lineItems.map((line) => ({
    productId: line.productId ?? line.sku,
    name: line.name,
    sku: line.sku,
    brand: line.brand,
    quantity: line.quantity,
    unitPricePen: line.unitPricePen,
    imageUrl: line.imageUrl,
  }));
}

export async function regenerateProformaPdf(
  proforma: ProformaRecord,
  company: CompanySettings,
): Promise<{ blob: Blob; filename: string }> {
  if (proforma.source === 'product' && proforma.lineItems.length > 0) {
    const line = proforma.lineItems[0]!;
    const generated = await buildProductQuotePdf(
      {
        razonSocial: proforma.customer.razonSocial,
        ruc: proforma.customer.documento,
        atencion: proforma.customer.atencion,
        celular: proforma.customer.celular,
        ciudad: proforma.customer.ciudad ?? proforma.customer.direccion ?? 'Lima',
      },
      {
        name: line.name,
        sku: line.sku,
        brand: line.brand,
        pricePen: line.unitPricePen,
        quantity: line.quantity,
        imageUrl: line.imageUrl,
      },
      company,
    );
    return { blob: generated.blob, filename: generated.filename };
  }

  const generated = await buildTpvDocumentPdf(
    'proforma',
    proforma.documentNumber,
    toTpvCustomer(proforma),
    toTpvLines(proforma),
    company,
  );
  return { blob: generated.blob, filename: generated.filename };
}

export async function downloadProformaPdf(
  proforma: ProformaRecord,
  company: CompanySettings,
): Promise<void> {
  const { blob, filename } = await regenerateProformaPdf(proforma, company);
  downloadQuotePdf(blob, filename);
}
