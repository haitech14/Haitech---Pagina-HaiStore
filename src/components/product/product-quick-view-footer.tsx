import { CreditCard, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductQuickViewFooterProps {
  className?: string;
}

export function ProductQuickViewFooter({ className }: ProductQuickViewFooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4',
        className,
      )}
      aria-label="Confianza y medios de pago"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-6">
          <p className="flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
            <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Compra 100% segura
          </p>
          <p className="flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
            <CreditCard className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            Aceptamos tarjetas débito y crédito
          </p>
        </div>

        <img
          src="/mediosdepago2.png"
          alt="Visa, Mastercard, American Express, Yape, Plin y otros medios de pago"
          className="h-6 w-auto max-w-full object-contain object-left sm:h-7 lg:object-right"
          loading="lazy"
          width={320}
          height={28}
        />
      </div>
    </footer>
  );
}
