export type DiscountCouponType = 'percent' | 'fixed_usd' | 'fixed_pen';
export type DiscountCouponStatus = 'active' | 'used' | 'expired' | 'cancelled';
export type DiscountCouponScope = 'all' | 'category' | 'free_shipping';

export interface DiscountCoupon {
  id: string;
  code: string;
  label: string;
  description?: string | null;
  discountType: DiscountCouponType;
  discountValue: number;
  scope: DiscountCouponScope | string;
  categorySlug?: string | null;
  premioId?: string | null;
  campaign?: string | null;
  assignedEmail?: string | null;
  minOrderUsd: number;
  maxUses: number;
  usedCount: number;
  status: DiscountCouponStatus;
  expiresAt: string;
  usedAt?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponLineItem {
  productId: string;
  category?: string | null;
  categorySlug?: string | null;
  lineTotalUsd: number;
}

export interface ValidateCouponPayload {
  code: string;
  subtotalUsd: number;
  exchangeRate: number;
  customerEmail?: string | undefined;
  lineItems: ValidateCouponLineItem[];
}

export interface ValidateCouponResult {
  valid: boolean;
  coupon?: DiscountCoupon;
  discountUsd?: number;
  discountPen?: number;
  freeShipping?: boolean;
  message?: string;
  error?: string;
}

export interface CreateManualCouponPayload {
  label: string;
  discountType: DiscountCouponType;
  discountValue: number;
  scope?: DiscountCouponScope | string;
  categorySlug?: string;
  assignedEmail?: string | undefined;
  code?: string;
  validHours?: number;
  maxUses?: number;
  minOrderUsd?: number;
  campaign?: string;
}
