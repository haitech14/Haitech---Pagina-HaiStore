import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { amountToWordsEs } from '@/lib/amount-to-words-es';
import { formatTpvMoney, tpvCurrencyLabel } from '@/lib/tpv-pricing';
import { PRICE_ROLE_LABELS } from '@/types/product';
import type { CompanySettings } from '@/types/company-settings';
import type { TpvCustomer, TpvDocumentType, TpvLineItem } from '@/types/tpv';
import { TPV_DOCUMENT_META } from '@/types/tpv';

export interface GeneratedTpvDocument {
  blob: Blob;
  filename: string;
  documentNumber: string;
  documentType: TpvDocumentType;
}

type Rgb = [number, number, number];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;

function formatLineAmount(value: number, customer: TpvCustomer): string {
  return formatTpvMoney(value, customer.currency);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return [220, 38, 38];
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function tintRgb([r, g, b]: Rgb, factor: number): Rgb {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ];
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, w: number, title: string, color: Rgb) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(title, x + 3, y + 4.8);
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  maxWidth: number,
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(55, 65, 81);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(23, 23, 23);
  const lines = doc.splitTextToSize(value, maxWidth - labelWidth);
  doc.text(lines, x + labelWidth, y);
  return Array.isArray(lines) ? lines.length : 1;
}

function calcTotals(lines: TpvLineItem[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPricePen * line.quantity, 0);
  const gravada = Math.round((subtotal / 1.18) * 100) / 100;
  const igv = Math.round((subtotal - gravada) * 100) / 100;
  return { subtotal, gravada, igv, total: subtotal };
}

export async function buildTpvDocumentPdf(
  documentType: TpvDocumentType,
  documentNumber: string,
  customer: TpvCustomer,
  lines: TpvLineItem[],
  company: CompanySettings,
): Promise<GeneratedTpvDocument> {
  const meta = TPV_DOCUMENT_META[documentType];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const primary = hexToRgb(company.primaryColor || '#dc2626');
  const primarySoft = tintRgb(primary, 0.88);
  const primaryLight = tintRgb(primary, 0.94);
  const contentW = PAGE_W - MARGIN * 2;
  const { gravada, igv, total } = calcTotals(lines);

  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  if (meta.validityDays > 0) {
    expiryDate.setDate(expiryDate.getDate() + meta.validityDays);
  }

  let y = MARGIN;

  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName, MARGIN, y + 7);
  doc.setFontSize(8.5);
  doc.text(company.legalName, MARGIN, y + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`RUC emisor: ${company.ruc}`, MARGIN, y + 17);

  const badgeW = 52;
  const badgeX = PAGE_W - MARGIN - badgeW;
  doc.setFillColor(...primary);
  doc.roundedRect(badgeX, y, badgeW, 26, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(meta.badgeTitle, badgeX + badgeW / 2, y + 8, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(documentNumber, badgeX + badgeW / 2, y + 14, { align: 'center' });
  doc.text(formatShortDate(issueDate), badgeX + badgeW / 2, y + 19, { align: 'center' });
  if (documentType === 'factura' || documentType === 'guia_remision') {
    doc.setFontSize(6);
    doc.text('TPV — Tienda física', badgeX + badgeW / 2, y + 23, { align: 'center' });
  }

  y += 32;

  const boxGap = 4;
  const boxW = (contentW - boxGap) / 2;
  const boxH = 38;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + boxGap;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, boxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  drawSectionTitle(doc, leftX, y, boxW, 'DATOS DEL CLIENTE', primary);
  drawSectionTitle(doc, rightX, y, boxW, meta.detailSectionTitle, primary);

  let rowY = y + 11;
  const clientRows: [string, string][] = [
    ['CLIENTE:', customer.razonSocial],
    [`${meta.documentFieldLabel}:`, customer.documento],
    ['DIRECCIÓN:', customer.direccion],
    ['ATENCIÓN:', customer.atencion],
    ['CELULAR:', customer.celular],
  ];
  clientRows.forEach(([label, value]) => {
    const lineCount = drawLabelValue(doc, label, value || '—', leftX + 3, rowY, 20, boxW - 6);
    rowY += Math.max(lineCount, 1) * 3.8 + 1;
  });

  rowY = y + 11;
  const detailRows: [string, string][] = [
    ['FECHA EMISIÓN:', formatShortDate(issueDate)],
    ...(meta.validityDays > 0
      ? [['FECHA DE VENC.:', formatShortDate(expiryDate)] as [string, string]]
      : []),
    ['LISTA DE PRECIO:', PRICE_ROLE_LABELS[customer.priceList]],
    ['MONEDA:', tpvCurrencyLabel(customer.currency)],
    ['ÍTEMS:', String(lines.length)],
    [
      'FORMA DE PAGO:',
      documentType === 'proforma'
        ? 'Por definir'
        : documentType === 'guia_remision'
          ? 'Traslado'
          : 'Contado / transferencia',
    ],
  ];
  detailRows.forEach(([label, value]) => {
    const lineCount = drawLabelValue(doc, label, value, rightX + 3, rowY, 26, boxW - 6);
    rowY += Math.max(lineCount, 1) * 3.8 + 1;
  });

  y += boxH + 5;

  const tableX = MARGIN;
  const tableW = contentW;
  const col = { n: 8, code: 24, desc: 78, qty: 14, unit: 28, amount: 28 };
  const headerH = 8;
  const rowH = 10;

  const drawTableHeader = (startY: number) => {
    doc.setFillColor(...primary);
    doc.roundedRect(tableX, startY, tableW, headerH, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    let cx = tableX + 2;
    doc.text('N°', cx + 2, startY + 5.2);
    cx += col.n;
    doc.text('CÓDIGO', cx + 1, startY + 5.2);
    cx += col.code;
    doc.text('DESCRIPCIÓN', cx + 1, startY + 5.2);
    cx += col.desc;
    doc.text('CANT.', cx + 2, startY + 5.2);
    cx += col.qty;
    doc.text('P/U', cx + 4, startY + 5.2);
    cx += col.unit;
    doc.text('IMPORTE', cx + 2, startY + 5.2);
    return startY + headerH;
  };

  y = drawTableHeader(y);

  lines.forEach((line, index) => {
    if (y + rowH > PAGE_H - 55) {
      doc.addPage();
      y = MARGIN;
      y = drawTableHeader(y);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(tableX, y, tableW, rowH, 'FD');

    let cx = tableX + 2;
    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(String(index + 1), cx + 2, y + 6.5);
    cx += col.n;

    doc.text(line.sku || line.productId.slice(0, 12), cx + 1, y + 6.5);
    cx += col.code;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    const desc = doc.splitTextToSize(`${line.name} — ${line.brand}`, col.desc - 2);
    doc.text(desc.slice(0, 2), cx + 1, y + 5);
    cx += col.desc;

    doc.setFont('helvetica', 'bold');
    doc.text(String(line.quantity), cx + 4, y + 6.5);
    cx += col.qty;
    doc.text(formatLineAmount(line.unitPricePen, customer), cx + 1, y + 6.5);
    cx += col.unit;
    doc.text(formatLineAmount(line.unitPricePen * line.quantity, customer), cx + 1, y + 6.5);

    y += rowH;
  });

  y += 4;

  const totalsW = 62;
  const totalsX = PAGE_W - MARGIN - totalsW;
  const totalsRowH = 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('GRAVADA:', totalsX, y + 4);
  doc.text(formatLineAmount(gravada, customer), totalsX + totalsW, y + 4, { align: 'right' });
  y += totalsRowH;
  doc.text('IGV 18.00 %:', totalsX, y + 4);
  doc.text(formatLineAmount(igv, customer), totalsX + totalsW, y + 4, { align: 'right' });
  y += totalsRowH + 1;

  doc.setFillColor(...primary);
  doc.roundedRect(totalsX - 2, y, totalsW + 2, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', totalsX, y + 5.5);
  doc.text(formatLineAmount(total, customer), totalsX + totalsW, y + 5.5, { align: 'right' });
  y += 12;

  doc.setFillColor(...primaryLight);
  doc.setDrawColor(...primarySoft);
  doc.roundedRect(MARGIN, y, contentW, 10, 2, 2, 'FD');
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    `IMPORTE EN LETRAS: ${amountToWordsEs(total, customer.currency === 'USD' ? 'DÓLARES' : 'SOLES')}`,
    MARGIN + 4,
    y + 6.5,
  );
  y += 14;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const noteLines = doc.splitTextToSize(meta.footerNote, contentW);
  doc.text(noteLines, MARGIN, y);
  y += noteLines.length * 3.5 + 4;

  const footerBoxH = 36;
  if (y + footerBoxH > PAGE_H - 20) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, footerBoxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, footerBoxH, 2, 2, 'FD');
  drawSectionTitle(doc, leftX, y, boxW, 'CUENTAS BANCARIAS', primary);
  drawSectionTitle(doc, rightX, y, boxW, 'OBSERVACIONES', primary);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const bankLines = company.bankAccountsText.split('\n').filter(Boolean).slice(0, 4);
  let bankY = y + 11;
  bankLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, leftX + 3, bankY);
    bankY += wrapped.length * 3.4 + 1;
  });

  const obs =
    documentType === 'proforma'
      ? 'Cotización sujeta a stock disponible. Precios en soles con IGV incluido.'
      : documentType === 'guia_remision'
        ? 'Traslado de bienes según normativa SUNAT. Verifique datos del destinatario y punto de llegada.'
        : 'Gracias por su preferencia. Conserve este comprobante para garantía y soporte.';
  const obsLines = doc.splitTextToSize(obs, boxW - 6);
  doc.text(obsLines, rightX + 3, y + 11);

  const barH = 14;
  const barY = PAGE_H - barH;
  doc.setFillColor(...primary);
  doc.rect(0, barY, PAGE_W, barH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const footerText = `${meta.badgeTitle} ${documentNumber} · ${company.companyName} · ${company.supportUrl}`;
  doc.text(footerText, MARGIN, barY + 5);

  try {
    const qrUrl = `${company.supportUrl}?doc=${encodeURIComponent(documentNumber)}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 0,
      width: 200,
      color: { dark: '#ffffff', light: '#00000000' },
    });
    doc.addImage(qrDataUrl, 'PNG', PAGE_W - MARGIN - 12, barY + 1, 12, 12);
  } catch {
    /* QR opcional */
  }

  const safeName = customer.razonSocial.replace(/[^\w\s-]/g, '').trim().slice(0, 24) || 'cliente';
  const filename = `${meta.seriesPrefix}-${documentNumber.replace(/[^\dA-Z-]/gi, '')}-${safeName}.pdf`.toLowerCase();

  return {
    blob: doc.output('blob'),
    filename,
    documentNumber,
    documentType,
  };
}
