import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Headphones, MapPin } from 'lucide-react';

import { HeaderStoreCurrencyExchangeBlock } from '@/components/layout/header-currency-control';
import {
  HEADER_BUY_RENT_WHATSAPP_LABEL,
  HEADER_BUY_RENT_WHATSAPP_LINK,
  HEADER_LIMA_MAPS_LINK,
  HEADER_PIURA_ADDRESS,
  HEADER_PIURA_MAPS_LINK,
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SERVICE_WHATSAPP_LABEL,
  HEADER_SERVICE_WHATSAPP_LINK,
  HEADER_SUPPORT_PHONE_DISPLAY,
  HEADER_TOPBAR_ADDRESS,
} from '@/data/site-header';
import { cn } from '@/lib/utils';

const topBarMutedClass = 'text-[#9a9a9a]';
const topBarLabelClass = 'font-semibold text-white';
const topBarLinkClass =
  'inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40';

const TOPBAR_LOCATIONS = [
  {
    id: 'lima',
    city: 'Lima',
    address: HEADER_TOPBAR_ADDRESS,
    href: HEADER_LIMA_MAPS_LINK,
  },
  {
    id: 'piura',
    city: 'Piura',
    address: HEADER_PIURA_ADDRESS,
    href: HEADER_PIURA_MAPS_LINK,
  },
] as const;

/**
 * Franja superior: Ventas/Alquiler · Soporte · sedes · T.C.
 */
export function HeaderTopBar({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-white/10 bg-black', className)}>
      <div
        className={cn(
          'container flex min-h-8 items-center gap-x-3 py-1',
          'text-[0.625rem] leading-tight sm:min-h-9 sm:gap-x-4 sm:text-[0.6875rem]',
          topBarMutedClass,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-4 [&::-webkit-scrollbar]:hidden">
          <a
            href={HEADER_BUY_RENT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(topBarLinkClass, 'shrink-0')}
            aria-label={`${HEADER_BUY_RENT_WHATSAPP_LABEL}: ${HEADER_SALES_PHONE_DISPLAY}`}
          >
            <Icon
              path={mdiWhatsapp}
              size={0.62}
              className="shrink-0 text-[#25D366]"
              aria-hidden="true"
            />
            <span className={topBarLabelClass}>{HEADER_BUY_RENT_WHATSAPP_LABEL}</span>
            <span className="tabular-nums">{HEADER_SALES_PHONE_DISPLAY}</span>
          </a>

          <span className="hidden h-3 w-px shrink-0 bg-white/15 sm:block" aria-hidden="true" />

          <a
            href={HEADER_SERVICE_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(topBarLinkClass, 'shrink-0')}
            aria-label={`${HEADER_SERVICE_WHATSAPP_LABEL}: ${HEADER_SUPPORT_PHONE_DISPLAY}`}
          >
            <Headphones className="size-3 shrink-0 text-white/80" strokeWidth={1.75} aria-hidden="true" />
            <span className={topBarLabelClass}>{HEADER_SERVICE_WHATSAPP_LABEL}</span>
            <span className="tabular-nums">{HEADER_SUPPORT_PHONE_DISPLAY}</span>
          </a>

          <span className="hidden h-3 w-px shrink-0 bg-white/15 md:block" aria-hidden="true" />

          <ul className="hidden min-w-0 items-center gap-x-3 md:flex lg:gap-x-4">
            {TOPBAR_LOCATIONS.map(({ id, city, address, href }) => (
              <li key={id} className="min-w-0">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(topBarLinkClass, 'max-w-[18rem] lg:max-w-none')}
                  title={`${city}: ${address}`}
                >
                  <MapPin
                    className="size-3 shrink-0 text-white/80"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">
                    <span className={topBarLabelClass}>{city}</span>
                    <span className="ml-1 font-normal">{address}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end">
          <HeaderStoreCurrencyExchangeBlock
            className="inline-flex px-0 py-0 text-[0.625rem] text-[#9a9a9a] sm:text-[0.6875rem]"
            muted
          />
        </div>
      </div>
    </div>
  );
}
