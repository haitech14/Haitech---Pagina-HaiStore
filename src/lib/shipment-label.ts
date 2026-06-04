import {
  buildShipmentLabelPdf,
  downloadShipmentLabelPdf,
  type GeneratedShipmentLabel,
  type ShipmentLabelContext,
} from '@/lib/generate-shipment-label-pdf';
import type { ShipmentLabelFormat } from '@/lib/shipment-label-format';

export type { ShipmentLabelContext };
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import type { ShipmentRecord } from '@/types/shipping';

export interface ShipmentLabelPreview {
  url: string;
  blob: Blob;
  filename: string;
  documentLabel: string;
  documentNumber: string;
  format: ShipmentLabelFormat;
}

export async function createShipmentLabelPreview(
  shipment: ShipmentRecord,
  context: ShipmentLabelContext,
  company: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  format: ShipmentLabelFormat,
): Promise<ShipmentLabelPreview> {
  const generated = await buildShipmentLabelPdf(shipment, company, context, { format });
  const pdfBlob =
    generated.blob.type === 'application/pdf'
      ? generated.blob
      : new Blob([generated.blob], { type: 'application/pdf' });
  return {
    url: URL.createObjectURL(pdfBlob),
    blob: pdfBlob,
    filename: generated.filename,
    documentLabel: 'Rótulo de envío',
    documentNumber: shipment.orderRef,
    format,
  };
}

export async function printShipmentLabel(
  shipment: ShipmentRecord,
  context: ShipmentLabelContext,
  company: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  format: ShipmentLabelFormat,
): Promise<GeneratedShipmentLabel> {
  const generated = await buildShipmentLabelPdf(shipment, company, context, { format });
  const url = URL.createObjectURL(
    generated.blob.type === 'application/pdf'
      ? generated.blob
      : new Blob([generated.blob], { type: 'application/pdf' }),
  );
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    URL.revokeObjectURL(url);
    downloadShipmentLabelPdf(generated.blob, generated.filename);
    return generated;
  }
  popup.addEventListener('load', () => {
    popup.focus();
    popup.print();
  });
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return generated;
}
