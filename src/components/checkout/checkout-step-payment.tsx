import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

import { CheckoutCulqiForm } from '@/components/checkout/checkout-culqi-form';
import { CheckoutManualInstructions } from '@/components/checkout/checkout-manual-instructions';
import { CheckoutMercadoPagoButton } from '@/components/checkout/checkout-mercadopago-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type CheckoutPaymentProvider,
  type ManualPaymentMethodId,
} from '@/lib/build-checkout-session-payload';
import type { CheckoutPaymentCurrency } from '@/lib/checkout-totals';
import { cn } from '@/lib/utils';
import type { CheckoutPaymentOptions } from '@/types/checkout';

const MANUAL_METHODS: Array<{ id: ManualPaymentMethodId; label: string }> = [
  { id: 'transferencia', label: 'Transferencia bancaria / depósito' },
  { id: 'yape-plin', label: 'Yape / Plin' },
  { id: 'contra-entrega', label: 'Pago contra entrega (Lima)' },
];

const PAYMENT_CURRENCIES: Array<{ id: CheckoutPaymentCurrency; label: string }> = [
  { id: 'PEN', label: 'Soles (PEN)' },
  { id: 'USD', label: 'Dólares (USD)' },
];

interface CheckoutStepPaymentProps {
  paymentProvider: CheckoutPaymentProvider;
  manualMethod: ManualPaymentMethodId;
  paymentCurrency: CheckoutPaymentCurrency;
  paymentOptions: CheckoutPaymentOptions | undefined;
  email: string;
  totalPen: number;
  orderNumber: string | null;
  isSubmitting: boolean;
  error: string | null;
  onPaymentProviderChange: (provider: CheckoutPaymentProvider) => void;
  onManualMethodChange: (method: ManualPaymentMethodId) => void;
  onPaymentCurrencyChange: (currency: CheckoutPaymentCurrency) => void;
  onBack: () => void;
  onConfirmManual: () => void;
  onConfirmCard: () => void;
  onEnsureOrderForCard: () => Promise<string | null>;
  onCulqiToken: (token: string) => void;
  onCulqiError: (message: string) => void;
  onMercadoPago: () => void;
}

export function CheckoutStepPayment({
  paymentProvider,
  manualMethod,
  paymentCurrency,
  paymentOptions,
  email,
  totalPen,
  orderNumber,
  isSubmitting,
  error,
  onPaymentProviderChange,
  onManualMethodChange,
  onPaymentCurrencyChange,
  onBack,
  onConfirmManual,
  onConfirmCard,
  onEnsureOrderForCard,
  onCulqiToken,
  onCulqiError,
  onMercadoPago,
}: CheckoutStepPaymentProps) {
  const culqiEnabled = Boolean(paymentOptions?.culqi && paymentOptions.culqiPublicKey);

  const providerOptions = useMemo(() => {
    const options: Array<{ id: CheckoutPaymentProvider; label: string; enabled: boolean }> = [
      { id: 'manual', label: 'Pago manual', enabled: paymentOptions?.manual !== false },
      {
        id: 'culqi',
        label: 'Pago con Tarjeta de Crédito/Débito (Recargo 5%)',
        enabled: true,
      },
    ];
    if (paymentOptions?.mercadopago) {
      options.push({ id: 'mercadopago', label: 'Mercado Pago', enabled: true });
    }
    return options.filter((option) => option.enabled);
  }, [paymentOptions]);

  const handleOpenCulqi = async () => {
    const ensuredOrderNumber = orderNumber ?? (await onEnsureOrderForCard());
    if (!ensuredOrderNumber || !paymentOptions?.culqiPublicKey) return;
    return ensuredOrderNumber;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Forma de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset>
            <legend className="sr-only">Seleccione forma de pago</legend>
            <div className="space-y-2">
              {providerOptions.map((option) => {
                const selected = paymentProvider === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                      selected
                        ? 'border-red-600 bg-red-50/60'
                        : 'border-border hover:bg-muted/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment-provider"
                      value={option.id}
                      checked={selected}
                      onChange={() => onPaymentProviderChange(option.id)}
                      className="size-4 accent-red-600"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Moneda de pago
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_CURRENCIES.map((currency) => {
                const selected = paymentCurrency === currency.id;
                return (
                  <label
                    key={currency.id}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                      selected
                        ? 'border-red-600 bg-red-50/60 text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment-currency"
                      value={currency.id}
                      checked={selected}
                      onChange={() => onPaymentCurrencyChange(currency.id)}
                      className="sr-only"
                    />
                    {currency.label}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              El total del resumen se mostrará priorizando la moneda seleccionada.
            </p>
          </fieldset>

          {paymentProvider === 'manual' ? (
            <div className="space-y-3">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">Método manual</legend>
                <div className="space-y-2">
                  {MANUAL_METHODS.map((method) => {
                    const selected = manualMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
                          selected ? 'border-red-600/60 bg-muted/30' : 'border-border',
                        )}
                      >
                        <input
                          type="radio"
                          name="manual-method"
                          value={method.id}
                          checked={selected}
                          onChange={() => onManualMethodChange(method.id)}
                          className="size-4 accent-red-600"
                        />
                        <span>{method.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <CheckoutManualInstructions method={manualMethod} />
            </div>
          ) : null}

          {paymentProvider === 'culqi' ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground" role="note">
                Se aplicará un recargo del 5% por pago con tarjeta. El total actualizado aparece en el
                resumen del pedido.
              </p>
              {culqiEnabled && paymentOptions?.culqiPublicKey ? (
                <CheckoutCulqiForm
                  publicKey={paymentOptions.culqiPublicKey}
                  email={email}
                  amountPen={totalPen}
                  orderNumber={orderNumber}
                  onBeforeOpen={handleOpenCulqi}
                  onToken={onCulqiToken}
                  onError={onCulqiError}
                  disabled={isSubmitting}
                />
              ) : (
                <p className="text-xs text-muted-foreground" role="note">
                  Un asesor te contactará para coordinar el pago con tarjeta y confirmar el pedido.
                </p>
              )}
            </div>
          ) : null}

          {paymentProvider === 'mercadopago' ? (
            <CheckoutMercadoPagoButton
              onPay={onMercadoPago}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 flex-1">
          Volver
        </Button>
        {paymentProvider === 'manual' ? (
          <Button
            type="button"
            onClick={onConfirmManual}
            disabled={isSubmitting}
            className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Procesando…
              </>
            ) : (
              'Confirmar pedido'
            )}
          </Button>
        ) : null}
        {paymentProvider === 'culqi' && !culqiEnabled ? (
          <Button
            type="button"
            onClick={onConfirmCard}
            disabled={isSubmitting}
            className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Procesando…
              </>
            ) : (
              'Confirmar pedido con tarjeta'
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
