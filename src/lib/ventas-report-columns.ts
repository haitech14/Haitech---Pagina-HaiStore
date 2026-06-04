import { formatTpvMoney } from '@/lib/tpv-pricing';
import type { ImportedSaleDocument } from '@/types/imported-sale';

/** Columnas del Reporte de Ventas ERP (fila de encabezado del Excel). */
export const VENTAS_ERP_COLUMN_HEADERS = [
  'FECFAC',
  'FECVEN',
  'DOCUMENTO',
  'SERIE',
  'NUMERO',
  'NRO_RUC',
  'NOMBRE O RAZON SOCIAL',
  'VENDEDOR',
  'USUARIO',
  'MONEDA',
  'TOTAL',
  'T.C',
  'IMPORTE S/',
  'DESCUENTO',
  'F.PAGO1',
  'CUENTA1',
  'N.OPERACION',
  '(M)',
  'IMPORTE',
  'T.C.',
  'DIF.CAMB',
  'MONTO1',
  'F.PAGO2',
  'CUENTA2',
  'N.OPERACION',
  'MONTO2',
  'F.PAGO3',
  'CUENTA3',
  'N.OPERACION',
  'MONTO3',
  'SALDO',
  'OBSERVACION',
  'DOC. RELACIONADO',
  'MAS DATOS',
  'HORA',
] as const;

export type VentasErpColumnId =
  | 'fecfac'
  | 'fecven'
  | 'documento'
  | 'serie'
  | 'numero'
  | 'nro_ruc'
  | 'nombre_razon_social'
  | 'vendedor'
  | 'usuario'
  | 'moneda'
  | 'total'
  | 'tipo_cambio'
  | 'importe_soles'
  | 'descuento'
  | 'f_pago1'
  | 'cuenta1'
  | 'n_operacion1'
  | 'm1'
  | 'importe'
  | 'tc2'
  | 'dif_camb'
  | 'monto1'
  | 'f_pago2'
  | 'cuenta2'
  | 'n_operacion2'
  | 'monto2'
  | 'f_pago3'
  | 'cuenta3'
  | 'n_operacion3'
  | 'monto3'
  | 'saldo'
  | 'observaciones'
  | 'doc_relacionado'
  | 'mas_datos'
  | 'hora';

export interface VentasErpColumnDef {
  id: VentasErpColumnId;
  label: (typeof VENTAS_ERP_COLUMN_HEADERS)[number];
  /** Clave en `report_data` cuando no hay campo dedicado en el documento. */
  reportKey?: string;
  minWidth?: string;
  align?: 'left' | 'right';
  numeric?: boolean;
}

export const VENTAS_ERP_COLUMNS: VentasErpColumnDef[] = [
  { id: 'fecfac', label: 'FECFAC', minWidth: '7.5rem' },
  { id: 'fecven', label: 'FECVEN', minWidth: '7.5rem' },
  { id: 'documento', label: 'DOCUMENTO', minWidth: '6.5rem' },
  { id: 'serie', label: 'SERIE', minWidth: '4.5rem' },
  { id: 'numero', label: 'NUMERO', minWidth: '4.5rem', align: 'right', numeric: true },
  { id: 'nro_ruc', label: 'NRO_RUC', minWidth: '7rem' },
  { id: 'nombre_razon_social', label: 'NOMBRE O RAZON SOCIAL', minWidth: '14rem' },
  { id: 'vendedor', label: 'VENDEDOR', minWidth: '8rem' },
  { id: 'usuario', label: 'USUARIO', minWidth: '8rem' },
  { id: 'moneda', label: 'MONEDA', minWidth: '5.5rem' },
  { id: 'total', label: 'TOTAL', minWidth: '5.5rem', align: 'right', numeric: true },
  { id: 'tipo_cambio', label: 'T.C', minWidth: '4.5rem', align: 'right', numeric: true },
  { id: 'importe_soles', label: 'IMPORTE S/', minWidth: '6rem', align: 'right', numeric: true },
  { id: 'descuento', label: 'DESCUENTO', reportKey: 'descuento', minWidth: '5.5rem', align: 'right', numeric: true },
  { id: 'f_pago1', label: 'F.PAGO1', minWidth: '6.5rem' },
  { id: 'cuenta1', label: 'CUENTA1', reportKey: 'cuenta1', minWidth: '7rem' },
  { id: 'n_operacion1', label: 'N.OPERACION', reportKey: 'n_operacion1', minWidth: '6.5rem' },
  { id: 'm1', label: '(M)', reportKey: 'm1', minWidth: '3rem' },
  { id: 'importe', label: 'IMPORTE', reportKey: 'importe', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'tc2', label: 'T.C.', reportKey: 'tc2', minWidth: '4rem', align: 'right', numeric: true },
  { id: 'dif_camb', label: 'DIF.CAMB', reportKey: 'dif_camb', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'monto1', label: 'MONTO1', reportKey: 'monto1', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'f_pago2', label: 'F.PAGO2', reportKey: 'f_pago2', minWidth: '6.5rem' },
  { id: 'cuenta2', label: 'CUENTA2', reportKey: 'cuenta2', minWidth: '7rem' },
  { id: 'n_operacion2', label: 'N.OPERACION', reportKey: 'n_operacion2', minWidth: '6.5rem' },
  { id: 'monto2', label: 'MONTO2', reportKey: 'monto2', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'f_pago3', label: 'F.PAGO3', reportKey: 'f_pago3', minWidth: '6.5rem' },
  { id: 'cuenta3', label: 'CUENTA3', reportKey: 'cuenta3', minWidth: '7rem' },
  { id: 'n_operacion3', label: 'N.OPERACION', reportKey: 'n_operacion3', minWidth: '6.5rem' },
  { id: 'monto3', label: 'MONTO3', reportKey: 'monto3', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'saldo', label: 'SALDO', reportKey: 'saldo', minWidth: '5rem', align: 'right', numeric: true },
  { id: 'observaciones', label: 'OBSERVACION', minWidth: '10rem' },
  { id: 'doc_relacionado', label: 'DOC. RELACIONADO', minWidth: '10rem' },
  { id: 'mas_datos', label: 'MAS DATOS', reportKey: 'mas_datos', minWidth: '8rem' },
  { id: 'hora', label: 'HORA', minWidth: '4.5rem' },
];

function reportData(doc: ImportedSaleDocument): Record<string, unknown> {
  return doc.report_data ?? {};
}

function formatReportDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function cellText(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return String(value).trim() || '—';
}

function formatCurrencyLabel(currency: string): string {
  if (currency === 'PEN') return 'SOLES';
  if (currency === 'USD') return 'DOLARES';
  return currency;
}

function formatMoneyAmount(amount: number, currency: string): string {
  const c = currency === 'PEN' ? 'PEN' : 'USD';
  return formatTpvMoney(amount, c);
}

export function getVentasErpCellValue(
  doc: ImportedSaleDocument,
  column: VentasErpColumnDef,
): string {
  const data = reportData(doc);

  switch (column.id) {
    case 'fecfac':
      return formatReportDate(doc.invoice_date);
    case 'fecven':
      return doc.due_date ? formatReportDate(doc.due_date) : '—';
    case 'documento':
      return doc.document_type || '—';
    case 'serie':
      return doc.serie || '—';
    case 'numero':
      return doc.numero || '—';
    case 'nro_ruc':
      return doc.tax_id?.trim() || '—';
    case 'nombre_razon_social':
      return (
        doc.customer?.company_name?.trim() ||
        doc.customer?.full_name?.trim() ||
        doc.customer_name ||
        '—'
      );
    case 'vendedor':
      return doc.seller_name?.trim() || '—';
    case 'usuario':
      return doc.user_name?.trim() || '—';
    case 'moneda':
      return formatCurrencyLabel(doc.currency);
    case 'total':
      return formatMoneyAmount(Number(doc.total), doc.currency);
    case 'tipo_cambio':
      return doc.exchange_rate != null ? String(doc.exchange_rate) : cellText(data.tipo_cambio);
    case 'importe_soles':
      return doc.total_pen != null
        ? formatTpvMoney(Number(doc.total_pen), 'PEN')
        : cellText(data.importe_soles);
    case 'f_pago1':
      return doc.payment_date?.trim() || cellText(data.f_pago1);
    case 'observaciones':
      return doc.observations?.trim() || cellText(data.observaciones);
    case 'doc_relacionado':
      return doc.related_doc?.trim() || cellText(data.doc_relacionado);
    case 'hora':
      return doc.hora?.trim() || cellText(data.hora);
    default:
      if (column.reportKey) {
        return cellText(data[column.reportKey]);
      }
      return '—';
  }
}

export function importedSaleMatchesQuery(doc: ImportedSaleDocument, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const data = reportData(doc);
  const haystack = [
    doc.document_type,
    doc.serie,
    doc.numero,
    doc.tax_id,
    doc.customer_name,
    doc.seller_name,
    doc.user_name,
    doc.related_doc,
    doc.observations,
    ...VENTAS_ERP_COLUMNS.map((col) => getVentasErpCellValue(doc, col)),
    ...Object.values(data).map((v) => String(v)),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}
