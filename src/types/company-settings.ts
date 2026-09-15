import { SITE_LOGO_ASSET_PATH } from '@/lib/site-logo-asset';
import { DEFAULT_BULK_DISCOUNT_TIERS } from '@/lib/bulk-discount-tiers';
import type { BulkDiscountTier } from '@/types/product-detail';

export interface CompanySettings {
  companyName: string;
  legalName: string;
  tagline: string;
  businessDescription: string;
  ruc: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  quoteDocumentLabel: string;
  quoteNumberPrefix: string;
  quoteNextNumber: number;
  currencyLabel: string;
  defaultClientType: string;
  bankAccountsText: string;
  supportUrl: string;
  quoteFooterText: string;
  quoteTermsText: string;
  quoteValidityDays: number;
  primaryColor: string;
  /** Tipo de cambio venta USD → PEN (precios al cliente, tienda, TPV). */
  usdToPenExchangeRate: number;
  /** Tipo de cambio compra USD → PEN (costos, proveedores, columna Compra). */
  usdToPenPurchaseExchangeRate: number;
  /** Tramos de descuento por volumen en ficha de producto. */
  bulkDiscountTiers: BulkDiscountTier[];
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'HAITECH',
  legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
  tagline: 'Soluciones de impresión y equipos de oficina',
  businessDescription:
    'Venta y alquiler de equipos de impresión, repuestos, tóner y servicio técnico especializado.',
  ruc: '20612146561',
  address: 'Av. Petit Thouars 1935 - Lince, Lima - Perú',
  city: 'Lima',
  phone: '915 149 290 – 965 805 873',
  email: 'ventas@haitech.pe',
  website: 'www.haitech.pe',
  logoUrl: SITE_LOGO_ASSET_PATH,
  quoteDocumentLabel: 'PROFORMA',
  quoteNumberPrefix: 'COT01',
  quoteNextNumber: 15,
  currencyLabel: 'SOLES (PEN)',
  defaultClientType: 'Corporativo',
  bankAccountsText: [
    'BCP',
    'Soles: 193-42000064-0-88',
    'Dólares: 193-42000068-1-38',
    'BBVA',
    'Soles: 0011-0161-0100004744-2',
    'Dólares: 0011-0161-0100004753-1',
    'Interbank',
    'Soles: 200-3005987-782',
    'Dólares: 200-3005987-790',
    'Yape 915 149 290 NBN TECNOLOGIA TOTAL SAC',
  ].join('\n'),
  supportUrl: 'https://soporte.haitech.pe/',
  quoteFooterText:
    'Gracias por confiar en HAITECH | Conoce más soluciones en: www.haitech.pe',
  quoteTermsText: [
    'Validez de la oferta: 3 días calendario o hasta agotar stock.',
    'Los precios pueden variar sin previo aviso por fluctuaciones del proveedor o tipo de cambio.',
    'Instalación y capacitación básica incluidas en Lima Metropolitana, salvo indicación contraria.',
    'Forma de pago: transferencia bancaria o depósito a las cuentas indicadas.',
  ].join('\n'),
  quoteValidityDays: 3,
  primaryColor: '#dc2626',
  usdToPenExchangeRate: 3.42,
  usdToPenPurchaseExchangeRate: 3.42,
  bulkDiscountTiers: DEFAULT_BULK_DISCOUNT_TIERS,
};
