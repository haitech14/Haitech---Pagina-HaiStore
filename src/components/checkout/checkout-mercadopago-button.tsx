import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckoutMercadoPagoButtonProps {
  onPay: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function CheckoutMercadoPagoButton({
  onPay,
  disabled,
  loading,
  className,
}: CheckoutMercadoPagoButtonProps) {
  return (
    <Button
      type="button"
      className={cn('min-h-11 w-full bg-[#009ee3] font-semibold text-white hover:bg-[#008ecf]', className)}
      disabled={disabled || loading}
      onClick={onPay}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      Pagar con tarjeta
    </Button>
  );
}
