import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  CheckoutSuccessModal,
  type CheckoutSuccessOrder,
} from '@/components/checkout/checkout-success-modal';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-step-summary';
import { CheckoutStepPayment } from '@/components/checkout/checkout-step-payment';
import { CheckoutStepShipping } from '@/components/checkout/checkout-step-shipping';
import { CheckoutStepSummary } from '@/components/checkout/checkout-step-summary';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import {
  useCheckoutPaymentOptions,
  useCheckoutSession,
  useCulqiCharge,
  useMercadoPagoPreference,
} from '@/hooks/use-checkout-session';
import { useCheckoutAccountClient } from '@/hooks/use-checkout-account-client';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useSeo } from '@/hooks/use-seo';
import { buildCheckoutSessionPayload, manualPaymentLabel } from '@/lib/build-checkout-session-payload';
import { calculateCheckoutTotals } from '@/lib/checkout-totals';
import {
  buildOrderPdfInputFromCheckout,
  createStoreOrderPdfPreview,
} from '@/lib/store-order-pdf';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import { haitechClientSchema } from '@/lib/haitech-client-schema';
import type { CheckoutSessionOrder } from '@/types/checkout';
import type { CartItem } from '@/types/product';

export function CheckoutPage() {
  useSeo({
    title: 'Checkout | Haitech',
    description: 'Finaliza tu pedido en Haitech.',
    robots: 'noindex,nofollow',
  });

  const queryClient = useQueryClient();
  const { data: companySettings } = useCompanySettings();
  const { items, totalPrice, clear, removeItem } = useCart();
  const { state, actions, prefillClient } = useCheckoutFlow();
  const { accountClient, isLoading: accountClientLoading, isFromAccount } =
    useCheckoutAccountClient();
  const checkoutSession = useCheckoutSession();
  const culqiCharge = useCulqiCharge();
  const mpPreference = useMercadoPagoPreference();
  const { data: paymentOptions } = useCheckoutPaymentOptions();

  const [pendingOrder, setPendingOrder] = useState<CheckoutSessionOrder | null>(null);
  const [successOrder, setSuccessOrder] = useState<CheckoutSuccessOrder | null>(null);
  const [orderPdfPreview, setOrderPdfPreview] = useState<QuotePdfPreview | null>(null);
  const [orderPdfLoading, setOrderPdfLoading] = useState(false);
  const prefilledRef = useRef(false);

  const discountUsd = state.appliedCoupon?.discountUsd ?? 0;
  const checkoutTotals = useMemo(
    () =>
      calculateCheckoutTotals({
        subtotalUsd: totalPrice,
        discountUsd,
        paymentProvider: state.paymentProvider,
      }),
    [totalPrice, discountUsd, state.paymentProvider],
  );

  useEffect(() => {
    if (prefilledRef.current || accountClientLoading || !accountClient) return;
    prefilledRef.current = true;
    prefillClient(accountClient);
  }, [accountClient, accountClientLoading, prefillClient]);

  const revokePreviewUrl = useCallback((preview: QuotePdfPreview | null) => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
  }, []);

  useEffect(
    () => () => {
      revokePreviewUrl(orderPdfPreview);
    },
    [orderPdfPreview, revokePreviewUrl],
  );

  if (items.length === 0 && !successOrder) {
    return <Navigate to="/tienda" replace />;
  }

  const validateClient = () => {
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
    return parsed.data;
  };

  const createSession = async () => {
    const parsed = validateClient();
    if (!parsed) return null;

    actions.setSubmitting(true);
    actions.setError(null);

    try {
      const result = await checkoutSession.mutateAsync(
        buildCheckoutSessionPayload(
          items,
          parsed,
          state.paymentProvider,
          state.paymentProvider === 'manual' ? state.manualMethod : null,
          state.paymentCurrency,
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

  const resolvePaymentMethod = (order: CheckoutSessionOrder) =>
    order.payment_method ??
    (state.paymentProvider === 'manual'
      ? manualPaymentLabel(state.manualMethod)
      : state.paymentProvider === 'culqi'
        ? 'Tarjeta de crédito/débito (recargo 5%)'
        : state.paymentProvider === 'mercadopago'
          ? 'Mercado Pago'
          : 'Checkout web');

  const generatePdfInBackground = (
    order: CheckoutSessionOrder,
    snapshotItems: CartItem[],
    snapshotClient: typeof state.client,
    totalPen: number,
    paymentMethod: string,
  ) => {
    const company =
      companySettings ??
      queryClient.getQueryData<CompanySettings>(['company-settings']) ??
      DEFAULT_COMPANY_SETTINGS;

    setOrderPdfLoading(true);
    void createStoreOrderPdfPreview(
      buildOrderPdfInputFromCheckout(order, snapshotItems, snapshotClient, totalPen, paymentMethod),
      company,
    )
      .then((preview) => {
        revokePreviewUrl(orderPdfPreview);
        setOrderPdfPreview(preview);
      })
      .catch(() => {
        /* el usuario puede reintentar desde el modal */
      })
      .finally(() => {
        setOrderPdfLoading(false);
      });
  };

  const finishCheckout = (order: CheckoutSessionOrder) => {
    const paymentMethod = resolvePaymentMethod(order);
    const snapshotItems = [...items];
    const snapshotClient = { ...state.client };

    const successPayload: CheckoutSuccessOrder = {
      orderNumber: order.order_number,
      paymentMethod,
      paymentProvider: state.paymentProvider,
      paymentCurrency: state.paymentCurrency,
      items: snapshotItems,
      subtotalUsd: totalPrice,
      discountUsd,
      couponCode: state.appliedCoupon?.code ?? null,
      client: snapshotClient,
    };

    clear();
    actions.setCompleted(order.order_number);
    setSuccessOrder(successPayload);
    setPendingOrder(null);

    const totalPen = order.total_pen ?? checkoutTotals.totalPen;
    generatePdfInBackground(order, snapshotItems, snapshotClient, totalPen, paymentMethod);
  };

  const handleConfirmManual = async () => {
    const order = pendingOrder ?? (await createSession());
    if (!order) return;
    finishCheckout(order);
  };

  const handleConfirmCard = async () => {
    const order = pendingOrder ?? (await createSession());
    if (!order) return;
    finishCheckout(order);
  };

  const handleEnsureOrderForCard = async (): Promise<string | null> => {
    const order = pendingOrder ?? (await createSession());
    return order?.order_number ?? null;
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
    const parsed = validateClient();
    if (!parsed) return;
    actions.setError(null);
    actions.nextStep();
  };

  const handleSuccessClose = (open: boolean) => {
    if (!open) {
      revokePreviewUrl(orderPdfPreview);
      setOrderPdfPreview(null);
      setSuccessOrder(null);
    }
  };

  const handleViewPdf = () => {
    if (orderPdfPreview || !successOrder) return;
    const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
    setOrderPdfLoading(true);
    void createStoreOrderPdfPreview(
      buildOrderPdfInputFromCheckout(
        {
          id: '',
          order_number: successOrder.orderNumber,
          status: 'confirmed',
          payment_status: 'pending',
          payment_provider: successOrder.paymentProvider,
          total_usd: checkoutTotals.totalUsd,
          total_pen: checkoutTotals.totalPen,
          currency: successOrder.paymentCurrency,
          payment_method: successOrder.paymentMethod,
        },
        successOrder.items,
        successOrder.client,
        checkoutTotals.totalPen,
        successOrder.paymentMethod,
      ),
      company,
    )
      .then((preview) => {
        revokePreviewUrl(orderPdfPreview);
        setOrderPdfPreview(preview);
      })
      .finally(() => setOrderPdfLoading(false));
  };

  const customerEmail = state.client.email?.trim();

  const handleRemoveItem = (lineId: string) => {
    removeItem(lineId);
    if (state.appliedCoupon) {
      actions.setCoupon(null);
    }
    setPendingOrder(null);
  };

  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const totalPenForPayment = pendingOrder?.total_pen ?? checkoutTotals.totalPen;

  const sidebar =
    state.step === 1 ? undefined : (
      <CheckoutOrderSummary
        items={items}
        totalPrice={totalPrice}
        appliedCoupon={state.appliedCoupon}
        onCouponChange={() => {}}
        onRemoveItem={handleRemoveItem}
        {...(customerEmail ? { customerEmail } : {})}
        compact
        {...(state.step === 3 && state.paymentProvider != null && state.paymentCurrency != null
          ? {
              paymentProvider: state.paymentProvider,
              paymentCurrency: state.paymentCurrency,
            }
          : {})}
      />
    );

  return (
    <>
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
          <CheckoutStepPayment
            paymentProvider={state.paymentProvider}
            manualMethod={state.manualMethod}
            paymentCurrency={state.paymentCurrency}
            paymentOptions={paymentOptions}
            email={state.client.email?.trim() ?? ''}
            totalPen={totalPenForPayment}
            orderNumber={pendingOrder?.order_number ?? null}
            isSubmitting={state.isSubmitting || checkoutSession.isPending}
            error={state.submitError}
            onPaymentProviderChange={(provider) => {
              actions.setPaymentProvider(provider);
              setPendingOrder(null);
            }}
            onManualMethodChange={actions.setManualMethod}
            onPaymentCurrencyChange={actions.setPaymentCurrency}
            onBack={actions.prevStep}
            onConfirmManual={() => void handleConfirmManual()}
            onConfirmCard={() => void handleConfirmCard()}
            onEnsureOrderForCard={handleEnsureOrderForCard}
            onCulqiToken={(token) => void handleCulqiToken(token)}
            onCulqiError={(message) => actions.setError(message)}
            onMercadoPago={() => void handleMercadoPago()}
          />
        ) : null}

        <Button asChild variant="ghost" className="mt-4 min-h-11 w-full sm:w-auto">
          <Link to="/tienda">Seguir comprando</Link>
        </Button>
      </CheckoutLayout>

      <CheckoutSuccessModal
        order={successOrder}
        pdfPreview={orderPdfPreview}
        pdfLoading={orderPdfLoading}
        companyPhone={company.phone}
        onOpenChange={handleSuccessClose}
        onViewPdf={handleViewPdf}
      />
    </>
  );
}
