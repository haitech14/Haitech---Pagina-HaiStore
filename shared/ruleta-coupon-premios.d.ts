/** Premios de la ruleta que generan cupón canjeable en checkout. */
export const RULETA_REDEEMABLE_PREMIO_IDS: ReadonlySet<string>;

export const RULETA_COUPON_PREMIO_CONFIG: Record<
  string,
  {
    codePrefix: string;
    label: string;
    discountType: 'percent' | 'fixed_usd' | 'fixed_pen';
    discountValue: number;
    scope: 'all' | 'category' | 'free_shipping';
    categorySlug?: string;
    validHours: number;
  }
>;

export function isRuletaRedeemablePremio(premioId: string): boolean;
export function getRuletaCouponPremioConfig(premioId: string): (typeof RULETA_COUPON_PREMIO_CONFIG)[string] | null;
