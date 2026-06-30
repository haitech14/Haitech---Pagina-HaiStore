import { CheckoutBillingShippingForm } from '@/components/checkout/checkout-billing-shipping-form';
import { CheckoutMobileActionBar } from '@/components/checkout/checkout-mobile-action-bar';
import { Button } from '@/components/ui/button';
import { validateCheckoutClientForm, type HaitechClientFormValues } from '@/lib/haitech-client-schema';

interface CheckoutStepShippingProps {
  client: HaitechClientFormValues;
  onClientChange: (client: HaitechClientFormValues) => void;
  onBack: () => void;
  onContinue: () => void;
  error: string | null;
  prefilledFromAccount?: boolean;
}

export function CheckoutStepShipping({
  client,
  onClientChange,
  onBack,
  onContinue,
  error,
  prefilledFromAccount = false,
}: CheckoutStepShippingProps) {
  const validationError = validateCheckoutClientForm(client);

  const handleContinue = () => {
    if (validationError) return;
    onContinue();
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Facturación y envío</h2>
        <p className="text-sm text-muted-foreground">
          Completa la información de facturación y entrega para continuar con el pago.
        </p>
      </header>

      <CheckoutBillingShippingForm
        value={client}
        onChange={onClientChange}
        idPrefix="checkout"
        prefilledFromAccount={prefilledFromAccount}
      />

      {error || validationError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? validationError}
        </p>
      ) : null}

      <div className="hidden flex-col gap-3 pt-1 sm:flex sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 flex-1">
          Volver
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={Boolean(validationError)}
          className="min-h-11 flex-1 bg-red-600 text-base font-semibold hover:bg-red-500"
        >
          Continuar al pago
        </Button>
      </div>

      <CheckoutMobileActionBar>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack} className="min-h-11 flex-1">
            Volver
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={Boolean(validationError)}
            className="min-h-11 flex-1 bg-red-600 text-base font-semibold hover:bg-red-500"
          >
            Continuar al pago
          </Button>
        </div>
      </CheckoutMobileActionBar>
    </div>
  );
}
