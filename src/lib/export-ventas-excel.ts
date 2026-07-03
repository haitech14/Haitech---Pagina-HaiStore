import * as XLSX from 'xlsx';

import {
  STORE_ORDER_STATUS_LABELS,
  STORE_PAYMENT_STATUS_LABELS,
} from '@/lib/admin-order-status';
import {
  VENTAS_ERP_COLUMNS,
  VENTAS_ERP_COLUMN_HEADERS,
  type VentasErpColumnDef,
} from '@/lib/ventas-report-columns';
import type { ImportedSaleDocument } from '@/types/imported-sale';
import { PROFORMA_FOLLOW_UP_LABELS, type ProformaRecord } from '@/types/proforma';
import type { StoreOrder } from '@/types/store';

export type VentasUnifiedExportRow =
  | { kind: 'venta'; order: StoreOrder }
  | { kind: 'cotizacion'; proforma: ProformaRecord }
  | { kind: 'historico'; doc: ImportedSaleDocument };

function formatExportDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return iso;
  }
}

function formatExportCurrency(currency: string): string {
  if (currency === 'PEN') return 'SOLES';
  if (currency === 'USD') return 'DOLARES';
  return currency;
}

function cellExportValue(value: unknown): string | number {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return String(value).trim();
}

function getVentasErpExportValue(
  doc: ImportedSaleDocument,
  column: VentasErpColumnDef,
): string | number {
  const data = doc.report_data ?? {};

  switch (column.id) {
    case 'fecfac':
      return formatExportDate(doc.invoice_date);
    case 'fecven':
      return doc.due_date ? formatExportDate(doc.due_date) : '';
    case 'documento':
      return doc.document_type || '';
    case 'serie':
      return doc.serie || '';
    case 'numero':
      return doc.numero || '';
    case 'nro_ruc':
      return doc.tax_id?.trim() || '';
    case 'nombre_razon_social':
      return (
        doc.customer?.company_name?.trim() ||
        doc.customer?.full_name?.trim() ||
        doc.customer_name ||
        ''
      );
    case 'vendedor':
      return doc.seller_name?.trim() || '';
    case 'usuario':
      return doc.user_name?.trim() || '';
    case 'moneda':
      return formatExportCurrency(doc.currency);
    case 'total':
      return Number(doc.total) || 0;
    case 'tipo_cambio':
      return doc.exchange_rate ?? cellExportValue(data.tipo_cambio);
    case 'importe_soles':
      return doc.total_pen ?? cellExportValue(data.importe_soles);
    case 'f_pago1':
      return doc.payment_date?.trim() || cellExportValue(data.f_pago1);
    case 'observaciones':
      return doc.observations?.trim() || cellExportValue(data.observaciones);
    case 'doc_relacionado':
      return doc.related_doc?.trim() || cellExportValue(data.doc_relacionado);
    case 'hora':
      return doc.hora?.trim() || cellExportValue(data.hora);
    default:
      if (column.reportKey) {
        return cellExportValue(data[column.reportKey]);
      }
      return '';
  }
}

function importedSaleToErpRow(doc: ImportedSaleDocument): Array<string | number> {
  return VENTAS_ERP_COLUMNS.map((column) => getVentasErpExportValue(doc, column));
}

function orderCustomerLabel(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

function importedCustomerLabel(doc: ImportedSaleDocument): string {
  const linked = doc.customer;
  return (
    linked?.company_name?.trim() ||
    linked?.full_name?.trim() ||
    doc.customer_name ||
    'Cliente'
  );
}

function unifiedRowToRecord(row: VentasUnifiedExportRow): Record<string, string | number> {
  if (row.kind === 'venta') {
    const order = row.order;
    const customer = order.customer;
    return {
      Origen: 'Venta tienda',
      'Tipo documento': 'Pedido',
      Número: order.order_number,
      Cliente: orderCustomerLabel(order),
      'RUC/DNI': customer?.tax_id?.trim() || '',
      Email: customer?.email?.trim() || '',
      Teléfono: customer?.phone?.trim() || '',
      Vendedor: '',
      Estado: STORE_ORDER_STATUS_LABELS[order.status],
      'Estado pago': STORE_PAYMENT_STATUS_LABELS[order.payment_status],
      Fecha: formatExportDate(order.created_at),
      Moneda: order.currency,
      Total: order.total_usd,
      'Total S/': order.total_pen ?? '',
      Observaciones: order.notes?.trim() || '',
    };
  }

  if (row.kind === 'cotizacion') {
    const proforma = row.proforma;
    return {
      Origen: 'Cotización',
      'Tipo documento': proforma.documentType,
      Número: proforma.documentNumber,
      Cliente: proforma.customer.razonSocial,
      'RUC/DNI': proforma.customer.documento,
      Email: '',
      Teléfono: proforma.customer.celular,
      Vendedor: proforma.sellerName,
      Estado: PROFORMA_FOLLOW_UP_LABELS[proforma.followUpStatus],
      'Estado pago': '',
      Fecha: formatExportDate(proforma.createdAt),
      Moneda: proforma.currency,
      Total: proforma.totalPen,
      'Total S/': proforma.currency === 'PEN' ? proforma.totalPen : '',
      Observaciones: proforma.notes?.trim() || '',
    };
  }

  const doc = row.doc;
  return {
    Origen: 'Histórico HaiSales',
    'Tipo documento': doc.document_type,
    Número: `${doc.serie}-${doc.numero}`,
    Cliente: importedCustomerLabel(doc),
    'RUC/DNI': doc.tax_id?.trim() || '',
    Email: doc.customer?.email?.trim() || '',
    Teléfono: '',
    Vendedor: doc.seller_name?.trim() || '',
    Estado: doc.document_type,
    'Estado pago': '',
    Fecha: formatExportDate(doc.invoice_date),
    Moneda: doc.currency,
    Total: Number(doc.total) || 0,
    'Total S/': doc.total_pen ?? '',
    Observaciones: doc.observations?.trim() || '',
  };
}

function writeWorkbook(filename: string, sheetName: string, worksheet: XLSX.WorkSheet) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function exportImportedSalesToExcel(
  documents: ImportedSaleDocument[],
  filenamePrefix = 'ventas-haisales',
): boolean {
  if (documents.length === 0) return false;

  const headerRow = [...VENTAS_ERP_COLUMN_HEADERS];
  const dataRows = documents.map(importedSaleToErpRow);
  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  const date = new Date().toISOString().slice(0, 10);
  writeWorkbook(`${filenamePrefix}-${date}.xlsx`, 'Reporte Ventas', worksheet);
  return true;
}

export function exportUnifiedVentasToExcel(
  rows: VentasUnifiedExportRow[],
  filenamePrefix = 'ventas',
): boolean {
  if (rows.length === 0) return false;

  const worksheet = XLSX.utils.json_to_sheet(rows.map(unifiedRowToRecord));
  const date = new Date().toISOString().slice(0, 10);
  writeWorkbook(`${filenamePrefix}-${date}.xlsx`, 'Ventas', worksheet);
  return true;
}
