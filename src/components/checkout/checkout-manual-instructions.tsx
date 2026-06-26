import { useCompanySettings } from '@/hooks/use-company-settings';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { ManualPaymentMethodId } from '@/lib/build-checkout-session-payload';

interface CheckoutManualInstructionsProps {
  method: ManualPaymentMethodId;
}

export function CheckoutManualInstructions({ method }: CheckoutManualInstructionsProps) {
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const bankLines = company.bankAccountsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (method === 'transferencia' && bankLines.length > 0) {
    return (
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
        <p className="mt-2 text-muted-foreground">
          A nombre de{' '}
          <span className="font-semibold text-foreground">{company.legalName}</span>
        </p>
        <p className="mt-2">
          Tras confirmar, un asesor validará tu transferencia y coordinará el envío.
        </p>
      </div>
    );
  }

  if (method === 'yape-plin') {
    return (
      <div
        className="rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground"
        role="note"
      >
        <p className="mb-2 font-semibold text-foreground">Pago con Yape / Plin</p>
        <div className="flex flex-col items-center gap-2">
          <img
            src="/payments/yape-qr.webp"
            alt={`Código QR de Yape para pagar a ${company.legalName}`}
            width={200}
            height={200}
            className="size-48 max-w-full rounded-md border border-border bg-background object-contain"
            loading="lazy"
            decoding="async"
          />
          <p className="text-center text-muted-foreground">
            Titular:{' '}
            <span className="font-semibold text-foreground">{company.legalName}</span>
          </p>
        </div>
        <p className="mt-2">
          Escanea el código QR, realiza el pago y confirma tu pedido. Un asesor validará tu
          comprobante y coordinará el envío.
        </p>
      </div>
    );
  }

  if (method === 'contra-entrega') {
    return (
      <p className="text-xs text-muted-foreground" role="note">
        Pagarás al recibir tu pedido en Lima metropolitana. Un asesor confirmará disponibilidad
        de envío.
      </p>
    );
  }

  return null;
}
