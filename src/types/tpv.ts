import type { PriceRole } from '@/types/product';

export type TpvDocumentType = 'proforma' | 'factura' | 'boleta';

export type TpvCurrency = 'PEN' | 'USD';

export interface TpvLineItem {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  quantity: number;
  unitPricePen: number;
  imageUrl?: string | null;
}

export interface TpvCustomer {
  razonSocial: string;
  /** RUC (factura) o DNI/RUC (boleta). */
  documento: string;
  atencion: string;
  celular: string;
  direccion: string;
  /** Lista de precios del inventario a aplicar al carrito. */
  priceList: PriceRole;
  /** Moneda de visualización y del comprobante. */
  currency: TpvCurrency;
  /** Cliente vinculado en Supabase (opcional). */
  storeCustomerId?: string | null;
}

export interface TpvDocumentMeta {
  type: TpvDocumentType;
  label: string;
  badgeTitle: string;
  detailSectionTitle: string;
  seriesPrefix: string;
  requiresRuc: boolean;
  documentFieldLabel: string;
  footerNote: string;
  validityDays: number;
}

export const TPV_DOCUMENT_META: Record<TpvDocumentType, TpvDocumentMeta> = {
  proforma: {
    type: 'proforma',
    label: 'Proforma',
    badgeTitle: 'PROFORMA',
    detailSectionTitle: 'DETALLE DE LA PROFORMA',
    seriesPrefix: 'PRF',
    requiresRuc: false,
    documentFieldLabel: 'RUC / DNI',
    footerNote: 'Documento sin validez tributaria. No sustituye factura ni boleta.',
    validityDays: 7,
  },
  factura: {
    type: 'factura',
    label: 'Factura',
    badgeTitle: 'FACTURA',
    detailSectionTitle: 'DETALLE DE LA FACTURA',
    seriesPrefix: 'F001',
    requiresRuc: true,
    documentFieldLabel: 'RUC',
    footerNote: 'Comprobante de pago válido. Crédito fiscal sujeto a normativa SUNAT.',
    validityDays: 0,
  },
  boleta: {
    type: 'boleta',
    label: 'Boleta de venta',
    badgeTitle: 'BOLETA DE VENTA',
    detailSectionTitle: 'DETALLE DE LA BOLETA',
    seriesPrefix: 'B001',
    requiresRuc: false,
    documentFieldLabel: 'DNI / RUC',
    footerNote: 'Comprobante de venta al consumidor final.',
    validityDays: 0,
  },
};
