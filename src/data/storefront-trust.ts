/**
 * Fuente única de mensajes de confianza / entrega para home, header y PDP.
 * Mantener alineado con HEADER_TOPBAR_PROMO_TEXT en site-header.
 */
export const STOREFRONT_FREE_SHIPPING_LIMA = 'Envío gratis desde S/ 299 (Lima)';

export const STOREFRONT_SHIPPING_NATIONAL = 'Envío a todo el Perú';

export const STOREFRONT_WARRANTY = 'Compra segura y garantizada';

export const STOREFRONT_SUPPORT = 'Soporte técnico especializado';

export const STOREFRONT_PARTNER = 'Distribuidor Autorizado Ricoh';

export const STOREFRONT_PURCHASE_TRUST_ITEMS = [
  { id: 'entrega', label: 'Envío gratis desde S/ 299' },
  { id: 'garantia', label: STOREFRONT_WARRANTY },
  { id: 'soporte', label: STOREFRONT_SUPPORT },
] as const;
