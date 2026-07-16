import { Clock, MapPin, Truck } from 'lucide-react';

import {
  HEADER_BUSINESS_HOURS,
  HEADER_LIMA_MAPS_LINK,
  HEADER_TOPBAR_ADDRESS,
} from '@/data/site-header';
import { HeaderStoreCurrencyExchangeBlock } from '@/components/layout/header-currency-control';
import { cn } from '@/lib/utils';

const topBarMutedClass = 'text-[#9a9a9a]';

const topBarLinkClass = cn(
  'inline-flex items-center gap-1 whitespace-nowrap transition-colors',
  topBarMutedClass,
  'hover:text-[#b8b8b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
);

/** Franja superior: dirección, horario, envío y T.C. (contacto WA vive en el header). */
export function HeaderTopBar({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-white/10 bg-black', className)}>
      <div
        className={cn(
          'container flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1',
          'text-[0.6875rem] leading-none sm:gap-x-4 sm:text-xs',
          topBarMutedClass,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
          <a
            href={HEADER_LIMA_MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              topBarLinkClass,
              'hidden min-w-0 max-w-[16rem] min-[420px]:inline-flex sm:max-w-[20rem] md:max-w-none',
            )}
            title={`Lima: ${HEADER_TOPBAR_ADDRESS}`}
            aria-label={`Dirección Lima: ${HEADER_TOPBAR_ADDRESS}`}
          >
            <MapPin className="size-3 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">Lima: {HEADER_TOPBAR_ADDRESS}</span>
          </a>

          <span className="hidden items-center gap-1.5 lg:inline-flex" title={HEADER_BUSINESS_HOURS}>
            <Clock className="size-3 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden="true" />
            <span className="whitespace-nowrap">{HEADER_BUSINESS_HOURS}</span>
          </span>

          <span
            className="hidden items-center gap-1.5 xl:inline-flex"
            title="Envío gratis en Lima Metropolitana por compras mayores a S/ 299"
          >
            <Truck className="size-3 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden="true" />
            <span className="whitespace-nowrap">Envío gratis Lima +S/ 299</span>
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end">
          <HeaderStoreCurrencyExchangeBlock
            className="inline-flex px-0 py-0 text-[0.6875rem] text-[#9a9a9a] sm:text-xs"
            muted
          />
        </div>
      </div>
    </div>
  );
}
