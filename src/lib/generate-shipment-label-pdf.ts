import { jsPDF } from 'jspdf';

import {
  getShipmentLabelPageSpec,
  shipmentLabelFormatSlug,
  type ShipmentLabelFormat,
} from '@/lib/shipment-label-format';
import type { CompanySettings } from '@/types/company-settings';
import type { ShipmentRecord } from '@/types/shipping';

const LABEL_HERO_IMAGE = '/promotions/promo-hero-multifuncionales.png';

export interface ShipmentLabelContext {
  carrierName: string;
  zoneName: string;
}

const NBN_SERVICES = [
  'Importador – distribuidor mayorista en:',
  '> Venta y alquiler de fotocopiadoras RICOH NUEVAS y SEMINUEVAS',
  '> Distribución permanente de TONER y REPUESTOS',
  '> Soporte técnico a nivel nacional',
] as const;

export interface GeneratedShipmentLabel {
  blob: Blob;
  filename: string;
}

export interface BuildShipmentLabelPdfOptions {
  format?: ShipmentLabelFormat;
}

async function loadImageDataUrl(
  src: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!src) return null;

  const loadFromDataUrl = (dataUrl: string) =>
    new Promise<{ dataUrl: string; width: number; height: number } | null>((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ dataUrl, width: image.width, height: image.height });
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });

  if (src.startsWith('data:')) return loadFromDataUrl(src);

  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return loadFromDataUrl(dataUrl);
  } catch {
    return null;
  }
}

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
  return 'PNG';
}

function fitImage(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = width / height;
  let w = maxWidth;
  let h = w / ratio;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }
  return { width: w, height: h };
}

function addFittedImage(
  doc: jsPDF,
  image: { dataUrl: string; width: number; height: number },
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const size = fitImage(image.width, image.height, maxWidth, maxHeight);
  const offsetX = x + (maxWidth - size.width) / 2;
  const offsetY = y + (maxHeight - size.height) / 2;
  doc.addImage(
    image.dataUrl,
    imageFormat(image.dataUrl),
    offsetX,
    offsetY,
    size.width,
    size.height,
  );
}

export function isShipmentLabelFieldEmpty(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed === '—' || trimmed === '-';
}

/** Etiqueta y valor en la misma fila; línea guía solo si falta dato. */
function drawCustomerFieldRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  labelSize: number,
  valueSize: number,
): number {
  const empty = isShipmentLabelFieldEmpty(value);
  const displayValue = empty ? '' : value.trim();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelSize);
  doc.setTextColor(0, 0, 0);
  const labelText = `${label} `;
  const labelWidth = doc.getTextWidth(labelText);
  doc.text(labelText, x, y);

  const valueX = x + labelWidth;
  const valueMaxW = Math.max(width - labelWidth - 1, 8);

  if (!empty) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(valueSize);
    const lines = doc.splitTextToSize(displayValue, valueMaxW);
    doc.text(lines, valueX, y);
    const lineCount = Array.isArray(lines) ? lines.length : 1;
    const lineHeight = valueSize * 0.42;
    return y + Math.max(lineCount * lineHeight, lineHeight + 2) + 4;
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  const underlineY = y + 2.5;
  doc.line(valueX, underlineY, x + width, underlineY);
  return y + labelSize * 0.55 + 8;
}

interface CustomerFieldSizes {
  label: number;
  value: number;
}

function customerFieldSizes(format: ShipmentLabelFormat): CustomerFieldSizes {
  switch (format) {
    case 'a4-landscape':
      return { label: 11, value: 20 };
    case 'a5':
      return { label: 9, value: 16 };
    case 'thermal-80mm':
      return { label: 7, value: 11 };
    case 'sticker':
      return { label: 7.5, value: 12 };
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

function drawServicesBlock(
  doc: jsPDF,
  x: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  lineGap: number,
): number {
  let y = startY;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(fontSize);
  doc.setTextColor(30, 30, 30);

  for (const line of NBN_SERVICES) {
    const isRicoh = line.includes('RICOH');
    if (isRicoh) {
      const before = '> Venta y alquiler de fotocopiadoras ';
      const after = ' NUEVAS y SEMINUEVAS';
      doc.setTextColor(30, 30, 30);
      doc.text(before, x, y, { maxWidth });
      const wBefore = doc.getTextWidth(before);
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bolditalic');
      doc.text('RICOH', x + wBefore, y);
      const wRicoh = doc.getTextWidth('RICOH');
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(30, 30, 30);
      doc.text(after, x + wBefore + wRicoh, y, { maxWidth: maxWidth - wBefore - wRicoh });
    } else {
      doc.text(line, x, y, { maxWidth });
    }
    y += lineGap;
  }
  return y;
}

function drawCompanyHeader(
  doc: jsPDF,
  company: CompanySettings,
  logo: { dataUrl: string; width: number; height: number } | null,
  hero: { dataUrl: string; width: number; height: number } | null,
  shipment: ShipmentRecord,
  pageW: number,
  margin: number,
  format: ShipmentLabelFormat,
): number {
  const compact = format === 'thermal-80mm' || format === 'sticker';
  const landscape = format === 'a4-landscape';

  let y = margin;
  const logoBox = compact ? 14 : landscape ? 26 : 22;
  const textX = margin + (logo ? logoBox + 2 : 0);
  const contentW = pageW - margin * 2;

  if (logo) {
    addFittedImage(doc, logo, margin, y, logoBox, logoBox);
  }

  const nameSize = compact ? 7.5 : landscape ? 11 : 9;
  const detailSize = compact ? 6 : landscape ? 8 : 7;
  const textW = compact
    ? contentW - (logo ? logoBox + 2 : 0)
    : landscape
      ? contentW * 0.42
      : contentW * 0.55;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(nameSize);
  doc.setTextColor(0, 0, 0);
  doc.text(company.legalName.toUpperCase(), textX, y + (compact ? 4 : 5), { maxWidth: textW });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(detailSize);
  let ty = y + (compact ? 8 : landscape ? 11 : 10);
  const headerLines = [
    `RUC ${company.ruc}`,
    `Cel: ${company.phone.replace(/^\+51\s?/, '').replace(/\s+/g, ' ')}`,
    company.address,
    `Visítanos en ${company.website.replace(/^https?:\/\//, '')}`,
  ];
  for (const line of headerLines) {
    if (line.includes('Visítanos')) {
      doc.setFont('helvetica', 'bold');
      doc.text(line, textX, ty, { maxWidth: textW });
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(line, textX, ty, { maxWidth: textW });
    }
    ty += compact ? 3.2 : landscape ? 4 : 3.6;
  }

  if (!compact) {
    const orderX = pageW - margin - (landscape ? 48 : 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(landscape ? 9 : 8);
    doc.setTextColor(80, 80, 80);
    doc.text('N.º PEDIDO', orderX, y + 2);
    doc.setFontSize(landscape ? 16 : 14);
    doc.setTextColor(185, 28, 28);
    doc.text(shipment.orderRef, orderX, y + (landscape ? 10 : 9));

    if (hero && landscape) {
      addFittedImage(doc, hero, pageW - margin - 52, y, 52, 34);
    } else if (hero && format === 'a5') {
      addFittedImage(doc, hero, pageW - margin - 38, y, 38, 28);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`Pedido: ${shipment.orderRef}`, margin, ty + 2, { maxWidth: contentW });
    ty += 5;
  }

  const headerBottom = compact ? ty + 3 : landscape ? 46 : 42;
  let blockY = headerBottom;

  if (!compact) {
    const servicesX = landscape ? pageW - margin - 92 : margin;
    const servicesW = landscape ? 92 : contentW;
    blockY = drawServicesBlock(
      doc,
      servicesX,
      landscape ? headerBottom - 4 : headerBottom + 2,
      servicesW,
      landscape ? 7.5 : 7,
      landscape ? 4.5 : 4,
    );
    blockY += landscape ? 4 : 6;
  }

  return Math.max(blockY, compact ? ty + 6 : landscape ? 58 : 52);
}

export async function buildShipmentLabelPdf(
  shipment: ShipmentRecord,
  company: CompanySettings,
  _context: ShipmentLabelContext,
  options: BuildShipmentLabelPdfOptions = {},
): Promise<GeneratedShipmentLabel> {
  const format = options.format ?? 'a4-landscape';
  const page = getShipmentLabelPageSpec(format);

  const doc = new jsPDF({
    unit: 'mm',
    format: page.jsPdfFormat,
    orientation: page.orientation,
  });

  const pageW = page.width;
  const margin = page.margin;
  const contentW = pageW - margin * 2;

  const logo = company.logoUrl ? await loadImageDataUrl(company.logoUrl) : null;
  const showHero = format === 'a4-landscape' || format === 'a5';
  const hero = showHero ? await loadImageDataUrl(LABEL_HERO_IMAGE) : null;

  const razon = shipment.razonSocial?.trim() || shipment.customerName.trim();
  const direccion = shipment.address?.trim() || '—';
  const ciudad =
    shipment.destination?.trim() || shipment.district?.trim() || company.city || '—';

  const sizes = customerFieldSizes(format);
  let y = drawCompanyHeader(doc, company, logo, hero, shipment, pageW, margin, format);
  y += format === 'a4-landscape' ? 6 : format === 'a5' ? 4 : 3;

  y = drawCustomerFieldRow(
    doc,
    'RAZÓN SOCIAL:',
    razon,
    margin,
    y,
    contentW,
    sizes.label,
    sizes.value,
  );
  y = drawCustomerFieldRow(
    doc,
    'DIRECCIÓN:',
    direccion,
    margin,
    y,
    contentW,
    sizes.label,
    sizes.value,
  );
  drawCustomerFieldRow(doc, 'CIUDAD:', ciudad, margin, y, contentW, sizes.label, sizes.value);

  const slug = shipmentLabelFormatSlug(format);
  const filename = `rotulo-${slug}-${shipment.orderRef.replace(/\s+/g, '-')}.pdf`;
  return {
    blob: doc.output('blob'),
    filename,
  };
}

export function downloadShipmentLabelPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
