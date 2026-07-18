import { Truck } from 'lucide-react';

import { HEADER_TOPBAR_PROMO_TEXT } from '@/data/site-header';
import { HeaderStoreCurrencyExchangeBlock } from '@/components/layout/header-currency-control';
import { cn } from '@/lib/utils';

const topBarMutedClass = 'text-[#9a9a9a]';

/**
 * Franja superior ligera: promo de envío + T.C.
 * Dirección → Contacto/footer. Horario → Atención al cliente.
 */
export function HeaderTopBar({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-white/10 bg-black', className)}>
      <div
        className={cn(
          'container flex min-h-7 items-center justify-between gap-x-2 py-0.5',
          'text-[0.625rem] leading-none sm:min-h-8 sm:gap-x-4 sm:py-1 sm:text-xs',
          topBarMutedClass,
        )}
      >
        <div className="flex min-w-0 items-center gap-x-2 sm:gap-x-4">
          <span
            className="inline-flex min-w-0 items-center gap-1 sm:gap-1.5"
            title={HEADER_TOPBAR_PROMO_TEXT}
          >
            <Truck className="size-3 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate sm:whitespace-nowrap">{HEADER_TOPBAR_PROMO_TEXT}</span>
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end">
          <HeaderStoreCurrencyExchangeBlock
            className="inline-flex px-0 py-0 text-[0.625rem] text-[#9a9a9a] sm:text-xs"
            muted
          />
        </div>
      </div>
    </div>
  );
}
