import type { PriceRole } from '@/types/product';

export type TpvDocumentType = 'proforma' | 'factura' | 'boleta' | 'guia_remision';

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
  ciudad?: string;
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
    label: 'Cotización',
    badgeTitle: 'COTIZACIÓN',
    detailSectionTitle: 'DETALLE DE LA COTIZACIÓN',
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
  guia_remision: {
    type: 'guia_remision',
    label: 'Guía de remisión',
    badgeTitle: 'GUÍA DE REMISIÓN',
    detailSectionTitle: 'DETALLE DEL TRASLADO',
    seriesPrefix: 'T001',
    requiresRuc: true,
    documentFieldLabel: 'RUC',
    footerNote: 'Documento de traslado de mercancía. No constituye comprobante de pago.',
    validityDays: 0,
  },
};
