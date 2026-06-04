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
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'HAITECH',
  legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
  tagline: 'Soluciones de impresión y equipos de oficina',
  businessDescription:
    'Venta y alquiler de equipos de impresión, repuestos, tóner y servicio técnico especializado.',
  ruc: '20612146561',
  address: 'Av. Petit Thouars 1931 - Lince',
  city: 'Lima',
  phone: '926 224 243 – 965 805 873',
  email: 'ventas@nbntecnologia.com',
  website: 'www.nbntecnologia.com',
  logoUrl: '/logo.png',
  quoteDocumentLabel: 'PROFORMA',
  quoteNumberPrefix: 'COT01',
  quoteNextNumber: 15,
  currencyLabel: 'SOLES (PEN)',
  defaultClientType: 'Corporativo',
  bankAccountsText: [
    'BCP SOLES: 194-123456789-0-12 — CCI 00219400123456789012',
    'BCP DÓLARES: 194-987654321-1-99 — CCI 00219400987654321999',
    'BBVA SOLES: 0011-0123-456789012345 — CCI 0110123001234567890123',
    'BBVA DÓLARES: 0011-0987-654321098765 — CCI 0110123098765432109876',
  ].join('\n'),
  supportUrl: 'https://soporte.haitech.pe/',
  quoteFooterText:
    'Representación impresa con fines informativos. Consulte el enlace de soporte o escanee el código QR para referencia.',
  quoteTermsText: [
    'Validez de la oferta: 3 días calendario o hasta agotar stock.',
    'Los precios pueden variar sin previo aviso por fluctuaciones del proveedor o tipo de cambio.',
    'Instalación y capacitación básica incluidas en Lima Metropolitana, salvo indicación contraria.',
    'Forma de pago: transferencia bancaria o depósito a las cuentas indicadas.',
  ].join('\n'),
  quoteValidityDays: 3,
  primaryColor: '#1e40af',
  usdToPenExchangeRate: 3.7,
  usdToPenPurchaseExchangeRate: 3.7,
};
