/** Premios de la ruleta que generan cupón canjeable en checkout. */
export const RULETA_REDEEMABLE_PREMIO_IDS = new Set([
  'parts-10',
  'copy-50',
  'toner-5',
  'free-shipping',
]);

/** @type {Record<string, {
 *   codePrefix: string;
 *   label: string;
 *   discountType: 'percent' | 'fixed_usd' | 'fixed_pen';
 *   discountValue: number;
 *   scope: 'all' | 'category' | 'free_shipping';
 *   categorySlug?: string;
 *   validHours: number;
 * }>} */
export const RULETA_COUPON_PREMIO_CONFIG = {
  'parts-10': {
    codePrefix: 'HSPART',
    label: '10% Repuestos',
    discountType: 'percent',
    discountValue: 10,
    scope: 'category',
    categorySlug: 'repuestos',
    validHours: 72,
  },
  'copy-50': {
    codePrefix: 'HSCOPY',
    label: 'S/ 50 dto. Fotocopia',
    discountType: 'fixed_pen',
    discountValue: 50,
    scope: 'all',
    validHours: 72,
  },
  'toner-5': {
    codePrefix: 'HSTONR',
    label: '$5 USD Tóner',
    discountType: 'fixed_usd',
    discountValue: 5,
    scope: 'category',
    categorySlug: 'toner',
    validHours: 72,
  },
  'free-shipping': {
    codePrefix: 'HSENVI',
    label: 'Envío gratis',
    discountType: 'fixed_pen',
    discountValue: 1,
    scope: 'free_shipping',
    validHours: 72,
  },
};

export function isRuletaRedeemablePremio(premioId) {
  return RULETA_REDEEMABLE_PREMIO_IDS.has(premioId);
}

export function getRuletaCouponPremioConfig(premioId) {
  return RULETA_COUPON_PREMIO_CONFIG[premioId] ?? null;
}
