import type { ReactNode } from 'react';

import { CHECKOUT_TOTALS_PRICE_CLASS } from '@/components/checkout/checkout-layout';
import { cn } from '@/lib/utils';

interface CheckoutTotalsRowProps {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function CheckoutTotalsRow({
  label,
  value,
  labelClassName,
  valueClassName,
  className,
}: CheckoutTotalsRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 text-sm sm:gap-4', className)}>
      <span className={cn('min-w-0 max-w-[52%] shrink text-muted-foreground', labelClassName)}>
        {label}
      </span>
      <span className={cn(CHECKOUT_TOTALS_PRICE_CLASS, valueClassName)}>{value}</span>
    </div>
  );
}
