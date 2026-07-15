import { useMemo } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';
import {
  calculateCardPaymentPreview,
  calculateIgvBreakdown,
  calculateInstallmentPreview,
  formatPenAmount,
  INSTALLMENT_COUNT,
  penAmountToUsd,
} from '@/lib/checkout-totals';
import { cn, formatUsd } from '@/lib/utils';

import { CheckoutTotalsRow } from '@/components/checkout/checkout-totals-row';

export type CheckoutTotalsBreakdownSection = 'tax' | 'payment-options';

interface CheckoutTotalsBreakdownProps {
  baseUsd: number;
  section: CheckoutTotalsBreakdownSection;
  showSubtotal?: boolean;
  showCardPreview?: boolean;
  shippingPen?: number | null;
  shippingLabel?: string | null;
  freeShipping?: boolean;
  className?: string;
}

export function CheckoutTotalsBreakdown({
  baseUsd,
  section,
  showSubtotal = true,
  showCardPreview = true,
  shippingPen = null,
  shippingLabel = null,
  freeShipping = false,
  className,
}: CheckoutTotalsBreakdownProps) {
  const igv = useMemo(() => calculateIgvBreakdown(baseUsd), [baseUsd]);
  const paymentBaseUsd = useMemo(
    () => baseUsd + (freeShipping ? 0 : Math.max(0, shippingPen ?? 0) > 0 ? penAmountToUsd(shippingPen ?? 0) : 0),
    [baseUsd, freeShipping, shippingPen],
  );
  const cardPreview = useMemo(() => calculateCardPaymentPreview(paymentBaseUsd), [paymentBaseUsd]);
  const installmentPreview = useMemo(
    () => calculateInstallmentPreview(paymentBaseUsd),
    [paymentBaseUsd],
  );

  if (baseUsd <= 0) return null;

  const priceProps = { className: 'justify-end', allowZero: true as const };

  if (section === 'tax') {
    return (
      <div className={cn('space-y-2.5', className)}>
        {showSubtotal ? (
          <CheckoutTotalsRow
            label="Subtotal"
            value={<DualPrice usd={igv.gravadaUsd} {...priceProps} />}
            valueClassName="font-medium"
          />
        ) : null}
        <CheckoutTotalsRow
          label="IGV (18%)"
          value={<DualPrice usd={igv.igvUsd} {...priceProps} />}
          valueClassName="font-medium"
        />
        {shippingPen != null ? (
          <CheckoutTotalsRow
            label={
              <span>
                Envío
                {shippingLabel ? (
                  <span className="mt-0.5 block text-xs font-normal leading-snug text-muted-foreground/85">
                    {shippingLabel}
                  </span>
                ) : null}
              </span>
            }
            value={
              freeShipping || shippingPen === 0 ? (
                <span className="font-medium text-primary">Gratis</span>
              ) : (
                <span className="font-medium tabular-nums">~{formatPenAmount(shippingPen)}</span>
              )
            }
            valueClassName="font-medium"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'space-y-2 rounded-lg border border-border/40 bg-muted/15 px-3 py-2 sm:px-3.5',
        className,
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground/90">
        Referencia de pago
      </p>

      {showCardPreview && cardPreview.surchargeUsd > 0 ? (
        <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5 text-xs">
          <span className="min-w-0 text-muted-foreground">Pago con Tarjeta (5% Adicional)</span>
          <DualPrice
            usd={cardPreview.totalWithCardUsd}
            allowZero
            className="shrink-0 text-xs font-medium text-foreground [&_.text-red-600]:text-red-600/85"
          />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3 text-xs">
        <div className="min-w-0 space-y-0.5">
          <p className="text-muted-foreground">Pago 6 Cuotas (Sin intereses)</p>
          <p className="text-[0.65rem] leading-snug text-muted-foreground/80">
            Total{' '}
            <span className="tabular-nums">
              {formatPenAmount(installmentPreview.totalWithInstallmentPen)}
            </span>
            {' · '}
            <span className="tabular-nums">
              {formatUsd(installmentPreview.totalWithInstallmentUsd)}
            </span>
          </p>
        </div>
        <div className="shrink-0 space-y-0.5 text-right">
          <DualPrice
            usd={installmentPreview.perInstallmentUsd}
            allowZero
            stacked
            className="text-sm font-semibold text-foreground [&_.text-red-600]:text-red-600"
            aria-label={`${INSTALLMENT_COUNT} cuotas de ${formatUsd(installmentPreview.perInstallmentUsd)} o ${formatPenAmount(installmentPreview.perInstallmentPen)} cada una`}
          />
          <p className="text-[0.65rem] text-muted-foreground/80">
            {INSTALLMENT_COUNT} cuotas · c/u
          </p>
        </div>
      </div>
    </div>
  );
}
