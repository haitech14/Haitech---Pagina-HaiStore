import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import type {
  CreateManualCouponPayload,
  DiscountCoupon,
  ValidateCouponPayload,
  ValidateCouponResult,
} from '@/types/discount-coupon';

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) =>
      apiFetch<ValidateCouponResult>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useCreateRuletaCoupon() {
  return useMutation({
    mutationFn: (payload: { premioId: string; email: string; participantName?: string }) =>
      apiFetch<{ coupon: DiscountCoupon | null; redeemable: boolean }>('/api/coupons/ruleta', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useAdminCouponsQuery(params?: { status?: string; search?: string }) {
  const status = params?.status ?? 'all';
  const search = params?.search ?? '';
  const query = new URLSearchParams();
  if (status !== 'all') query.set('status', status);
  if (search.trim()) query.set('search', search.trim());

  return useQuery({
    queryKey: ['admin-coupons', status, search],
    queryFn: () =>
      apiFetch<{ coupons: DiscountCoupon[] }>(`/api/coupons/admin?${query.toString()}`),
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManualCouponPayload) =>
      apiFetch<{ coupon: DiscountCoupon }>('/api/coupons/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}

export function useCancelAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) =>
      apiFetch<{ coupon: DiscountCoupon }>(`/api/coupons/admin/${couponId}/cancel`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}
