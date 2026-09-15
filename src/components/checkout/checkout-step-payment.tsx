import { useCallback, useMemo, useRef, useState } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Loader2 } from 'lucide-react';

import { CheckoutCulqiForm } from '@/components/checkout/checkout-culqi-form';
import { CheckoutManualInstructions } from '@/components/checkout/checkout-manual-instructions';
import { CheckoutMercadoPagoButton } from '@/components/checkout/checkout-mercadopago-button';
import { CheckoutMobileActionBar } from '@/components/checkout/checkout-mobile-action-bar';
import { CheckoutPaymentProofField } from '@/components/checkout/checkout-payment-proof-field';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import {
  type CheckoutPaymentProvider,
  type ManualPaymentMethodId,
} from '@/lib/build-checkout-session-payload';
import { openCartQuoteWhatsApp } from '@/lib/cart-whatsapp-message';
import type { CheckoutPaymentCurrency } from '@/lib/checkout-totals';
import { cn } from '@/lib/utils';
import type { CheckoutPaymentOptions } from '@/types/checkout';

const MANUAL_METHODS: Array<{ id: ManualPaymentMethodId; label: string; description: string }> = [
  { id: 'transferencia', label: 'Transferencia Bancaria', description: 'Depósito a cuenta Haitech' },
  { id: 'yape-plin', label: 'Yape / Plin', description: 'Pago con QR' },
  { id: 'contra-entrega', label: 'Contraentrega', description: 'Pagas al recibir (Lima)' },
];

const PAYMENT_CURRENCIES: Array<{ id: CheckoutPaymentCurrency; label: string }> = [
  { id: 'PEN', label: 'Soles (PEN)' },
  { id: 'USD', label: 'Dólares (USD)' },
];

type CardGateway = Extract<CheckoutPaymentProvider, 'culqi' | 'mercadopago'>;

const CARD_GATEWAYS: Array<{ id: CardGateway; label: string }> = [
  { id: 'culqi', label: 'Tarjeta con Culqi (recargo 5%)' },
  { id: 'mercadopago', label: 'Mercado Pago' },
];

function isCardProvider(provider: CheckoutPaymentProvider): provider is CardGateway {
  return provider === 'culqi' || provider === 'mercadopago';
}

interface CheckoutStepPaymentProps {
  paymentProvider: CheckoutPaymentProvider;
  manualMethod: ManualPaymentMethodId;
  paymentCurrency: CheckoutPaymentCurrency;
  paymentOptions: CheckoutPaymentOptions | undefined;
  email: string;
  totalUsd: number;
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
  proofFile?: File | null;
  onProofFileChange?: (file: File | null) => void;
}

export function CheckoutStepPayment({
  paymentProvider,
  manualMethod,
  paymentCurrency,
  paymentOptions,
  email,
  totalUsd,
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
  proofFile = null,
  onProofFileChange,
}: CheckoutStepPaymentProps) {
  const { items, totalPrice } = useCart();
  const culqiEnabled = Boolean(paymentOptions?.culqi && paymentOptions.culqiPublicKey);
  const mercadoPagoEnabled = Boolean(paymentOptions?.mercadopago);
  const cardPaymentSelected = isCardProvider(paymentProvider);
  const culqiOpenRef = useRef<(() => Promise<void>) | null>(null);
  const [culqiStatus, setCulqiStatus] = useState({ ready: false, loading: false });

  const handleBindCulqiOpen = useCallback((open: () => Promise<void>) => {
    culqiOpenRef.current = open;
  }, []);

  const availableCardGateways = useMemo(
    () =>
      CARD_GATEWAYS.filter((gateway) =>
        gateway.id === 'culqi' ? culqiEnabled : mercadoPagoEnabled,
      ),
    [culqiEnabled, mercadoPagoEnabled],
  );

  const showProofUpload = paymentProvider === 'manual' && (manualMethod === 'transferencia' || manualMethod === 'yape-plin');

  const handleSelectPaymentGroup = (group: 'manual' | 'card') => {
    if (group === 'manual') {
      onPaymentProviderChange('manual');
      return;
    }

    const preferredGateway =
      availableCardGateways.find((gateway) => gateway.id === 'mercadopago')?.id ??
      availableCardGateways.find((gateway) => gateway.id === paymentProvider)?.id ??
      availableCardGateways[0]?.id ??
      'mercadopago';
    onPaymentProviderChange(preferredGateway);
  };

  const handleSelectCheckoutMethod = (choice: ManualPaymentMethodId | 'card') => {
    if (choice === 'card') {
      handleSelectPaymentGroup('card');
      return;
    }
    onPaymentProviderChange('manual');
    onManualMethodChange(choice);
  };

  const handleOpenCulqi = async () => {
    const ensuredOrderNumber = orderNumber ?? (await onEnsureOrderForCard());
    if (!ensuredOrderNumber || !paymentOptions?.culqiPublicKey) return;
    return ensuredOrderNumber;
  };

  const actionButtons = (
    <>
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
      {cardPaymentSelected && paymentProvider === 'culqi' && !culqiEnabled ? (
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
      {cardPaymentSelected && paymentProvider === 'culqi' && culqiEnabled ? (
        <Button
          type="button"
          onClick={() => void culqiOpenRef.current?.()}
          disabled={isSubmitting || !culqiStatus.ready || culqiStatus.loading}
          className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
        >
          {isSubmitting || culqiStatus.loading || !culqiStatus.ready ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              {culqiStatus.ready ? 'Abriendo…' : 'Cargando…'}
            </>
          ) : (
            'Pagar con tarjeta'
          )}
        </Button>
      ) : null}
      {cardPaymentSelected && paymentProvider !== 'culqi' ? (
        <Button
          type="button"
          onClick={onMercadoPago}
          disabled={isSubmitting}
          className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Redirigiendo…
            </>
          ) : (
            'Pagar con tarjeta'
          )}
        </Button>
      ) : null}
    </>
  );

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
              {MANUAL_METHODS.map((method) => {
                const selected = paymentProvider === 'manual' && manualMethod === method.id;
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
                      name="checkout-method"
                      value={method.id}
                      checked={selected}
                      onChange={() => handleSelectCheckoutMethod(method.id)}
                      className="size-4 accent-red-600"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{method.label}</span>
                      <span className="block text-xs text-muted-foreground">{method.description}</span>
                    </span>
                  </label>
                );
              })}
              <label
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  cardPaymentSelected
                    ? 'border-red-600 bg-red-50/60'
                    : 'border-border hover:bg-muted/30',
                )}
              >
                <input
                  type="radio"
                  name="checkout-method"
                  value="card"
                  checked={cardPaymentSelected}
                  onChange={() => handleSelectCheckoutMethod('card')}
                  className="size-4 accent-red-600"
                />
                <span className="min-w-0">
                  <span className="block font-medium">Pago con tarjeta</span>
                  <span className="block text-xs text-muted-foreground">
                    Visa, Mastercard y más · serás redirigido a pagar
                  </span>
                </span>
              </label>
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
              <CheckoutManualInstructions method={manualMethod} />
              {showProofUpload && onProofFileChange ? (
                <CheckoutPaymentProofField
                  file={proofFile}
                  onFileChange={onProofFileChange}
                  disabled={isSubmitting}
                  hint={
                    manualMethod === 'yape-plin'
                      ? 'Sube la captura de Yape o Plin (JPG, PNG, WEBP o PDF, máx. 5 MB).'
                      : 'Sube el voucher o captura de tu transferencia (JPG, PNG, WEBP o PDF, máx. 5 MB).'
                  }
                />
              ) : null}
            </div>
          ) : null}

          {cardPaymentSelected ? (
            <div className="space-y-3">
              {paymentProvider === 'culqi' && culqiEnabled && paymentOptions?.culqiPublicKey ? (
                <>
                  <p className="text-xs text-muted-foreground" role="note">
                    Se aplicará un recargo del 5% por pago con tarjeta. El total actualizado aparece en
                    el resumen del pedido.
                  </p>
                  <CheckoutCulqiForm
                    publicKey={paymentOptions.culqiPublicKey}
                    email={email}
                    amountPen={totalPen}
                    orderNumber={orderNumber}
                    onBeforeOpen={handleOpenCulqi}
                    onToken={onCulqiToken}
                    onError={onCulqiError}
                    disabled={isSubmitting}
                    className="hidden sm:inline-flex"
                    onBindOpen={handleBindCulqiOpen}
                    onStatusChange={setCulqiStatus}
                  />
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground" role="note">
                    Al continuar te redirigiremos a la pasarela segura para pagar con tarjeta.
                  </p>
                  <CheckoutMercadoPagoButton
                    onPay={onMercadoPago}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="hidden sm:inline-flex"
                  />
                </>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="hidden min-h-11 w-full gap-2 border-[#25D366]/50 text-[#128C7E] hover:bg-[#ecfdf5] sm:inline-flex sm:w-auto"
        onClick={() => openCartQuoteWhatsApp(items, totalPrice)}
      >
        <Icon path={mdiWhatsapp} size={0.85} aria-hidden="true" />
        Completar con un asesor por WhatsApp
      </Button>

      <div className="hidden flex-col gap-2 sm:flex sm:flex-row">{actionButtons}</div>

      <CheckoutMobileActionBar>
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-base font-bold leading-tight">
                <DualPrice
                  usd={totalUsd}
                  allowZero
                  compact
                  preferCurrency={paymentCurrency}
                />
              </p>
            </div>
          </div>
          <div className="flex gap-2">{actionButtons}</div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2 border-[#25D366]/50 text-sm text-[#128C7E] hover:bg-[#ecfdf5]"
            onClick={() => openCartQuoteWhatsApp(items, totalPrice)}
          >
            <Icon path={mdiWhatsapp} size={0.75} aria-hidden="true" />
            Completar con un asesor
          </Button>
        </div>
      </CheckoutMobileActionBar>
    </div>
  );
}
