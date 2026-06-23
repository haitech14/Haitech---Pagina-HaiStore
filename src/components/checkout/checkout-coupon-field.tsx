import { useEffect, useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValidateCoupon } from '@/hooks/use-discount-coupon';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { cn, formatUsd } from '@/lib/utils';
import type { ValidateCouponLineItem } from '@/types/discount-coupon';

const STORED_COUPON_KEY = 'haistore_ruleta_coupon';

export interface AppliedCheckoutCoupon {
  code: string;
  label: string;
  discountUsd: number;
  discountPen: number;
  freeShipping: boolean;
  message: string;
}

interface CheckoutCouponFieldProps {
  subtotalUsd: number;
  customerEmail?: string | undefined;
  lineItems: ValidateCouponLineItem[];
  applied: AppliedCheckoutCoupon | null;
  onAppliedChange: (coupon: AppliedCheckoutCoupon | null) => void;
}

function readStoredCouponCode(): string {
  try {
    return sessionStorage.getItem(STORED_COUPON_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function clearStoredRuletaCoupon(): void {
  try {
    sessionStorage.removeItem(STORED_COUPON_KEY);
  } catch {
    /* storage no disponible */
  }
}

export function CheckoutCouponField({
  subtotalUsd,
  customerEmail,
  lineItems,
  applied,
  onAppliedChange,
}: CheckoutCouponFieldProps) {
  const validateCoupon = useValidateCoupon();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredCouponCode();
    if (stored) setCode(stored);
  }, []);

  const applyCoupon = async () => {
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Ingresa un código de cupón');
      return;
    }

    try {
      const result = await validateCoupon.mutateAsync({
        code: trimmed,
        subtotalUsd,
        exchangeRate: getUsdToPenSaleRate(),
        customerEmail,
        lineItems,
      });

      if (!result.valid || !result.coupon || result.discountUsd === undefined) {
        setError(result.error ?? 'Cupón no válido');
        return;
      }

      onAppliedChange({
        code: result.coupon.code,
        label: result.coupon.label,
        discountUsd: result.discountUsd,
        discountPen: result.discountPen ?? result.discountUsd * getUsdToPenSaleRate(),
        freeShipping: Boolean(result.freeShipping),
        message: result.message ?? 'Cupón aplicado',
      });
      clearStoredRuletaCoupon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo validar el cupón');
      onAppliedChange(null);
    }
  };

  const removeCoupon = () => {
    setError(null);
    onAppliedChange(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-3">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-primary" aria-hidden="true" />
        <Label htmlFor="checkout-coupon-code" className="text-sm font-semibold">
          Cupón de descuento
        </Label>
      </div>

      {applied ? (
        <div className="flex items-start justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-foreground">{applied.code}</p>
            <p className="text-xs text-muted-foreground">{applied.label}</p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {applied.discountUsd > 0
                ? `− ${formatUsd(applied.discountUsd)}`
                : applied.freeShipping
                  ? 'Envío gratis'
                  : applied.message}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={removeCoupon}
            aria-label="Quitar cupón"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="checkout-coupon-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Ej. HSCOPY-A3F2K9"
            autoComplete="off"
            spellCheck={false}
            className="font-mono uppercase"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'checkout-coupon-error' : undefined}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 shrink-0"
            disabled={validateCoupon.isPending}
            onClick={() => void applyCoupon()}
          >
            {validateCoupon.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Validando…
              </>
            ) : (
              'Aplicar'
            )}
          </Button>
        </div>
      )}

      {error ? (
        <p id="checkout-coupon-error" role="alert" className={cn('text-sm text-red-600')}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
