import { useCallback, useMemo, useReducer } from 'react';

import type { AppliedCheckoutCoupon } from '@/components/checkout/checkout-coupon-field';
import type { CheckoutPaymentProvider, ManualPaymentMethodId } from '@/lib/build-checkout-session-payload';
import { applyCheckoutClientPrefill } from '@/lib/checkout-account-client';
import type { CheckoutPaymentCurrency } from '@/lib/checkout-totals';
import { EMPTY_HAITECH_CLIENT, type HaitechClientFormValues } from '@/lib/haitech-client-schema';

export type CheckoutStep = 1 | 2 | 3;

export interface CheckoutFlowState {
  step: CheckoutStep;
  client: HaitechClientFormValues;
  appliedCoupon: AppliedCheckoutCoupon | null;
  paymentProvider: CheckoutPaymentProvider;
  manualMethod: ManualPaymentMethodId;
  paymentCurrency: CheckoutPaymentCurrency;
  submitError: string | null;
  isSubmitting: boolean;
  completedOrderNumber: string | null;
}

type CheckoutFlowAction =
  | { type: 'SET_STEP'; step: CheckoutStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_CLIENT'; client: HaitechClientFormValues }
  | { type: 'SET_COUPON'; coupon: AppliedCheckoutCoupon | null }
  | { type: 'SET_PAYMENT_PROVIDER'; provider: CheckoutPaymentProvider }
  | { type: 'SET_MANUAL_METHOD'; method: ManualPaymentMethodId }
  | { type: 'SET_PAYMENT_CURRENCY'; currency: CheckoutPaymentCurrency }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_COMPLETED'; orderNumber: string }
  | { type: 'PREFILL_CLIENT'; partial: Partial<HaitechClientFormValues> };

const initialState: CheckoutFlowState = {
  step: 1,
  client: EMPTY_HAITECH_CLIENT,
  appliedCoupon: null,
  paymentProvider: 'manual',
  manualMethod: 'transferencia',
  paymentCurrency: 'PEN',
  submitError: null,
  isSubmitting: false,
  completedOrderNumber: null,
};

function reducer(state: CheckoutFlowState, action: CheckoutFlowAction): CheckoutFlowState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, submitError: null };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(3, state.step + 1) as CheckoutStep, submitError: null };
    case 'PREV_STEP':
      return { ...state, step: Math.max(1, state.step - 1) as CheckoutStep, submitError: null };
    case 'SET_CLIENT':
      return { ...state, client: action.client };
    case 'SET_COUPON':
      return { ...state, appliedCoupon: action.coupon };
    case 'SET_PAYMENT_PROVIDER':
      return { ...state, paymentProvider: action.provider };
    case 'SET_MANUAL_METHOD':
      return { ...state, manualMethod: action.method };
    case 'SET_PAYMENT_CURRENCY':
      return { ...state, paymentCurrency: action.currency };
    case 'SET_ERROR':
      return { ...state, submitError: action.error };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };
    case 'SET_COMPLETED':
      return { ...state, completedOrderNumber: action.orderNumber, isSubmitting: false };
    case 'PREFILL_CLIENT':
      return {
        ...state,
        client: applyCheckoutClientPrefill(state.client, action.partial),
      };
    default:
      return state;
  }
}

export function useCheckoutFlow(initialClient?: Partial<HaitechClientFormValues>) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    client: initialClient ? { ...EMPTY_HAITECH_CLIENT, ...initialClient } : EMPTY_HAITECH_CLIENT,
  });

  const actions = useMemo(
    () => ({
      setStep: (step: CheckoutStep) => dispatch({ type: 'SET_STEP', step }),
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      setClient: (client: HaitechClientFormValues) => dispatch({ type: 'SET_CLIENT', client }),
      setCoupon: (coupon: AppliedCheckoutCoupon | null) => dispatch({ type: 'SET_COUPON', coupon }),
      setPaymentProvider: (provider: CheckoutPaymentProvider) =>
        dispatch({ type: 'SET_PAYMENT_PROVIDER', provider }),
      setManualMethod: (method: ManualPaymentMethodId) =>
        dispatch({ type: 'SET_MANUAL_METHOD', method }),
      setPaymentCurrency: (currency: CheckoutPaymentCurrency) =>
        dispatch({ type: 'SET_PAYMENT_CURRENCY', currency }),
      setError: (error: string | null) => dispatch({ type: 'SET_ERROR', error }),
      setSubmitting: (value: boolean) => dispatch({ type: 'SET_SUBMITTING', value }),
      setCompleted: (orderNumber: string) => dispatch({ type: 'SET_COMPLETED', orderNumber }),
    }),
    [],
  );

  const prefillClient = useCallback((partial: Partial<HaitechClientFormValues>) => {
    dispatch({ type: 'PREFILL_CLIENT', partial });
  }, []);

  return { state, actions, prefillClient };
}
