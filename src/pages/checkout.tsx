import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-step-summary';
import { CheckoutStepPayment } from '@/components/checkout/checkout-step-payment';
import { CheckoutStepShipping } from '@/components/checkout/checkout-step-shipping';
import { CheckoutStepSummary } from '@/components/checkout/checkout-step-summary';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  useCheckoutPaymentOptions,
  useCheckoutSession,
  useCulqiCharge,
  useMercadoPagoPreference,
} from '@/hooks/use-checkout-session';
import { useCheckoutAccountClient } from '@/hooks/use-checkout-account-client';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';
import { useSeo } from '@/hooks/use-seo';
import { buildCheckoutSessionPayload, manualPaymentLabel } from '@/lib/build-checkout-session-payload';
import {
  buildOrderPdfInputFromCheckout,
  createStoreOrderPdfPreview,
} from '@/lib/store-order-pdf';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { haitechClientSchema } from '@/lib/haitech-client-schema';
import type { CheckoutSessionOrder } from '@/types/checkout';

export function CheckoutPage() {
  useSeo({
    title: 'Checkout | Haitech',
    description: 'Finaliza tu pedido en Haitech.',
    robots: 'noindex,nofollow',
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: companySettings } = useCompanySettings();
  const { items, totalPrice, clear, removeItem } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const { state, actions, prefillClient } = useCheckoutFlow();
  const { accountClient, isLoading: accountClientLoading, isFromAccount } =
    useCheckoutAccountClient();
  const checkoutSession = useCheckoutSession();
  const culqiCharge = useCulqiCharge();
  const mpPreference = useMercadoPagoPreference();
  const { data: paymentOptions } = useCheckoutPaymentOptions();

  const [pendingOrder, setPendingOrder] = useState<CheckoutSessionOrder | null>(null);
  const prefilledRef = useRef(false);

  const currency: 'USD' | 'PEN' =
    displayCurrency === 'PEN' || displayCurrency === 'BOTH' ? 'PEN' : 'USD';

  const discountUsd = state.appliedCoupon?.discountUsd ?? 0;
  const totalAfterDiscount = Math.max(0, totalPrice - discountUsd);
  const totalPen = useMemo(
    () => Math.round(totalAfterDiscount * getUsdToPenSaleRate() * 100) / 100,
    [totalAfterDiscount],
  );

  useEffect(() => {
    if (prefilledRef.current || accountClientLoading || !accountClient) return;
    prefilledRef.current = true;
    prefillClient(accountClient);
  }, [accountClient, accountClientLoading, prefillClient]);

  if (items.length === 0) {
    return <Navigate to="/tienda" replace />;
  }

  const createSession = async () => {
    const parsed = haitechClientSchema.safeParse({
      ...state.client,
      email: state.client.email?.trim() || '',
    });
    if (!parsed.success) {
      actions.setError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return null;
    }
    if (!parsed.data.email?.trim()) {
      actions.setError('El correo electrónico es obligatorio.');
      return null;
    }

    actions.setSubmitting(true);
    actions.setError(null);

    try {
      const result = await checkoutSession.mutateAsync(
        buildCheckoutSessionPayload(
          items,
          parsed.data,
          state.paymentProvider,
          state.paymentProvider === 'manual' ? state.manualMethod : null,
          currency,
          state.appliedCoupon?.code,
        ),
      );
      setPendingOrder(result.order);
      return result.order;
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'No se pudo crear el pedido.',
      );
      return null;
    } finally {
      actions.setSubmitting(false);
    }
  };

  const finishCheckout = async (order: CheckoutSessionOrder) => {
    const paymentMethod =
      order.payment_method ??
      (state.paymentProvider === 'manual'
        ? manualPaymentLabel(state.manualMethod)
        : state.paymentProvider === 'culqi'
          ? 'Tarjeta (Culqi)'
          : state.paymentProvider === 'mercadopago'
            ? 'Mercado Pago'
            : 'Checkout web');

    const company =
      companySettings ??
      queryClient.getQueryData<CompanySettings>(['company-settings']) ??
      DEFAULT_COMPANY_SETTINGS;

    try {
      const preview = await createStoreOrderPdfPreview(
        buildOrderPdfInputFromCheckout(order, items, state.client, totalPen, paymentMethod),
        company,
      );
      clear();
      navigate(
        `/mi-cuenta?tab=pedidos&orden=${encodeURIComponent(order.order_number)}`,
        {
          replace: true,
          state: { orderPdfPreview: preview },
        },
      );
    } catch {
      clear();
      navigate(
        `/mi-cuenta?tab=pedidos&orden=${encodeURIComponent(order.order_number)}`,
        { replace: true },
      );
    }
  };

  const handleConfirmManual = async () => {
    const order = pendingOrder ?? (await createSession());
    if (!order) return;
    finishCheckout(order);
  };

  const handlePrepareOnline = async () => {
    if (pendingOrder) return pendingOrder;
    return createSession();
  };

  const handleCulqiToken = async (token: string) => {
    let order = pendingOrder;
    if (!order) {
      order = await createSession();
    }
    if (!order) return;

    actions.setSubmitting(true);
    actions.setError(null);
    try {
      const result = await culqiCharge.mutateAsync({
        orderId: order.id,
        token,
        ...(state.client.email?.trim() ? { email: state.client.email.trim() } : {}),
      });
      finishCheckout({
        ...order,
        payment_status: result.order.payment_status,
      });
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'No se pudo procesar el pago con tarjeta.',
      );
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleMercadoPago = async () => {
    let order = pendingOrder;
    if (!order) {
      order = await createSession();
    }
    if (!order) return;

    actions.setSubmitting(true);
    actions.setError(null);
    try {
      const result = await mpPreference.mutateAsync({
        orderId: order.id,
        ...(state.client.email?.trim() ? { email: state.client.email.trim() } : {}),
      });
      if (result.initPoint) {
        clear();
        window.location.href = result.initPoint;
        return;
      }
      finishCheckout(order);
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'No se pudo iniciar Mercado Pago.',
      );
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleShippingContinue = () => {
    const parsed = haitechClientSchema.safeParse({
      ...state.client,
      email: state.client.email?.trim() || '',
    });
    if (!parsed.success) {
      actions.setError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    if (!parsed.data.email?.trim()) {
      actions.setError('El correo electrónico es obligatorio.');
      return;
    }
    actions.setError(null);
    actions.nextStep();
  };

  const customerEmail = state.client.email?.trim();

  const handleRemoveItem = (lineId: string) => {
    removeItem(lineId);
    if (state.appliedCoupon) {
      actions.setCoupon(null);
    }
    setPendingOrder(null);
  };

  const sidebar = (
    <CheckoutOrderSummary
      items={items}
      totalPrice={totalPrice}
      appliedCoupon={state.appliedCoupon}
      onCouponChange={state.step === 1 ? actions.setCoupon : () => {}}
      onRemoveItem={handleRemoveItem}
      {...(customerEmail ? { customerEmail } : {})}
      compact={state.step !== 1}
    />
  );

  return (
    <CheckoutLayout currentStep={state.step} sidebar={sidebar}>
      {state.step === 1 ? (
        <CheckoutStepSummary
          items={items}
          totalPrice={totalPrice}
          appliedCoupon={state.appliedCoupon}
          onCouponChange={actions.setCoupon}
          onRemoveItem={handleRemoveItem}
          onContinue={actions.nextStep}
        />
      ) : null}

      {state.step === 2 ? (
        <CheckoutStepShipping
          client={state.client}
          onClientChange={actions.setClient}
          onBack={actions.prevStep}
          onContinue={handleShippingContinue}
          error={state.submitError}
          prefilledFromAccount={isFromAccount}
        />
      ) : null}

      {state.step === 3 ? (
        <div className="space-y-4">
          {state.paymentProvider !== 'manual' && !pendingOrder ? (
            <Button
              type="button"
              className="min-h-11 w-full bg-red-600 font-semibold hover:bg-red-500"
              disabled={state.isSubmitting}
              onClick={() => void handlePrepareOnline()}
            >
              Preparar pedido para pago online
            </Button>
          ) : null}

          <CheckoutStepPayment
            paymentProvider={state.paymentProvider}
            manualMethod={state.manualMethod}
            paymentOptions={paymentOptions}
            email={state.client.email?.trim() ?? ''}
            totalPen={pendingOrder?.total_pen ?? totalPen}
            orderNumber={pendingOrder?.order_number ?? null}
            isSubmitting={state.isSubmitting || checkoutSession.isPending}
            error={state.submitError}
            onPaymentProviderChange={(provider) => {
              actions.setPaymentProvider(provider);
              setPendingOrder(null);
            }}
            onManualMethodChange={actions.setManualMethod}
            onBack={actions.prevStep}
            onConfirmManual={() => void handleConfirmManual()}
            onCulqiToken={(token) => void handleCulqiToken(token)}
            onCulqiError={(message) => actions.setError(message)}
            onMercadoPago={() => void handleMercadoPago()}
          />
        </div>
      ) : null}

      <Button asChild variant="ghost" className="mt-4 min-h-11 w-full sm:w-auto">
        <Link to="/tienda">Seguir comprando</Link>
      </Button>
    </CheckoutLayout>
  );
}
