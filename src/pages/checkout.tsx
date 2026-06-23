import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import {
  CheckoutCouponField,
  type AppliedCheckoutCoupon,
} from '@/components/checkout/checkout-coupon-field';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cartLineUnitUsd, useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useCheckoutOrder } from '@/hooks/use-checkout-order';
import { buildCheckoutOrderPayload } from '@/lib/build-checkout-order-payload';
import { haitechFormToClient } from '@/lib/haitech-client-mappers';
import {
  EMPTY_HAITECH_CLIENT,
  haitechClientSchema,
} from '@/lib/haitech-client-schema';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { cn, formatUsd } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';

const PAYMENT_METHODS = [
  { id: 'transferencia', label: 'Transferencia bancaria / depósito' },
  { id: 'yape-plin', label: 'Yape / Plin' },
  { id: 'contra-entrega', label: 'Pago contra entrega (Lima)' },
] as const;

type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

export function CheckoutPage() {
  const { items, totalPrice, clear } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const { data: companySettings } = useCompanySettings();
  const checkoutOrder = useCheckoutOrder();

  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('transferencia');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCheckoutCoupon | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; orderNumber: string | null } | null>(
    null,
  );

  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const currency: 'USD' | 'PEN' =
    displayCurrency === 'PEN' || displayCurrency === 'BOTH' ? 'PEN' : 'USD';

  const bankLines = useMemo(
    () => company.bankAccountsText.split('\n').map((line) => line.trim()).filter(Boolean),
    [company.bankAccountsText],
  );

  const couponLineItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        category: item.product.category,
        lineTotalUsd: cartLineUnitUsd(item) * item.quantity,
      })),
    [items],
  );

  const discountUsd = appliedCoupon?.discountUsd ?? 0;
  const totalAfterDiscount = Math.max(0, totalPrice - discountUsd);

  if (items.length === 0 && !confirmedOrder) {
    return <Navigate to="/tienda" replace />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    const methodLabel =
      PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? paymentMethod;

    try {
      const result = await checkoutOrder.mutateAsync(
        buildCheckoutOrderPayload(
          items,
          haitechFormToClient(parsed.data),
          methodLabel,
          currency,
          appliedCoupon?.code,
        ),
      );
      setConfirmedOrder({
        id: result.order.id,
        orderNumber: result.order.order_number ?? null,
      });
      clear();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el pedido. Inténtelo nuevamente.',
      );
    }
  };

  if (confirmedOrder) {
    return (
      <div className="container max-w-lg px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              Pedido registrado
            </CardTitle>
            <CardDescription>
              Hemos recibido tu solicitud de compra. Un asesor confirmará el pago y coordinará el
              envío.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Referencia:{' '}
              <span className="font-mono font-semibold text-foreground">
                {confirmedOrder.orderNumber ?? confirmedOrder.id}
              </span>
            </p>
            <Button asChild className="min-h-11 bg-red-600 hover:bg-red-500">
              <Link to="/tienda">Seguir comprando</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/mi-cuenta?tab=pedidos">Ver mis pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Finalizar compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa tu pedido, completa tus datos y confirma para proceder al pago.
          </p>
        </header>

        <form
          onSubmit={(event) => void onSubmit(event)}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start"
          noValidate
        >
          <section aria-labelledby="checkout-summary-title" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle
                  id="checkout-summary-title"
                  className="flex items-center gap-2 text-lg"
                >
                  <ShoppingBag className="size-5 text-red-600" aria-hidden="true" />
                  Resumen del pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="divide-y divide-border" aria-label="Productos">
                  {items.map((item) => {
                    const imageUrl = resolveProductImageUrl(item.product);
                    const lineUsd = cartLineUnitUsd(item) * item.quantity;
                    return (
                      <li key={item.lineId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 p-1">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground" aria-hidden="true">
                              {item.product.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug">
                            {item.product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.quantity} × {formatUsd(cartLineUnitUsd(item))}
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            <DualPrice usd={lineUsd} />
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <CheckoutCouponField
                  subtotalUsd={totalPrice}
                  customerEmail={client.email}
                  lineItems={couponLineItems}
                  applied={appliedCoupon}
                  onAppliedChange={setAppliedCoupon}
                />
                {appliedCoupon && discountUsd > 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Descuento ({appliedCoupon.code})</span>
                    <span className="font-semibold text-primary">− <DualPrice usd={discountUsd} /></span>
                  </div>
                ) : null}
                {appliedCoupon?.freeShipping ? (
                  <p className="text-sm font-medium text-primary" role="status">
                    Envío gratis incluido con tu cupón
                  </p>
                ) : null}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">
                    <DualPrice usd={totalAfterDiscount} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="checkout-details-title" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle id="checkout-details-title" className="text-lg">
                  Datos de facturación y envío
                </CardTitle>
                <CardDescription>Mismos campos que usamos en cotizaciones HaiSupport.</CardDescription>
              </CardHeader>
              <CardContent>
                <HaitechClientForm value={client} onChange={setClient} idPrefix="checkout" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Forma de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <fieldset>
                  <legend className="sr-only">Seleccione forma de pago</legend>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => {
                      const selected = paymentMethod === method.id;
                      return (
                        <label
                          key={method.id}
                          className={cn(
                            'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                            selected
                              ? 'border-red-600 bg-red-50/60'
                              : 'border-border hover:bg-muted/30',
                          )}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={method.id}
                            checked={selected}
                            onChange={() => setPaymentMethod(method.id)}
                            className="size-4 accent-red-600"
                          />
                          <span className="font-medium">{method.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {paymentMethod === 'transferencia' && bankLines.length > 0 ? (
                  <div
                    className="rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground"
                    role="note"
                  >
                    <p className="mb-1 font-semibold text-foreground">Cuentas bancarias</p>
                    <ul className="space-y-1">
                      {bankLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {paymentMethod === 'yape-plin' ? (
                  <p className="text-xs text-muted-foreground" role="note">
                    Tras confirmar, un asesor te enviará el número Yape/Plin por WhatsApp al{' '}
                    {company.phone}.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {submitError ? (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={checkoutOrder.isPending}
              className="min-h-11 w-full bg-red-600 text-base font-semibold hover:bg-red-500"
            >
              {checkoutOrder.isPending ? 'Procesando…' : 'Confirmar pedido y pagar'}
            </Button>

            <Button asChild variant="ghost" className="min-h-11 w-full">
              <Link to="/tienda">Seguir comprando</Link>
            </Button>
          </section>
        </form>
      </div>
    </div>
  );
}
