import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import {
  HEADER_LIMA_MAPS_LINK,
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SALES_WHATSAPP_LINK,
  HEADER_SUPPORT_PHONE_DISPLAY,
  HEADER_SUPPORT_PHONE_TEL,
  HEADER_TOPBAR_ADDRESS,
} from '@/data/site-header';
import { HeaderStoreCurrencyExchangeBlock } from '@/components/layout/header-currency-control';
import { cn } from '@/lib/utils';

const topBarLinkClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const topBarPhoneNumberClass = 'font-medium text-white';

export function HeaderTopBar({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-white/10 bg-black', className)}>
      <div className="container flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-1.5 text-[0.6875rem] sm:gap-x-4 sm:text-xs lg:text-[0.8125rem]">
        <a
          href={HEADER_LIMA_MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            topBarLinkClass,
            'hidden min-w-0 max-w-[48%] min-[420px]:inline-flex sm:max-w-[55%] md:max-w-none',
          )}
          title={HEADER_TOPBAR_ADDRESS}
          aria-label={`Dirección: ${HEADER_TOPBAR_ADDRESS}`}
        >
          <span className="truncate">{HEADER_TOPBAR_ADDRESS}</span>
        </a>

        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-x-3 sm:gap-x-4">
          <a
            href={HEADER_SALES_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={topBarLinkClass}
            aria-label={`WhatsApp ventas ${HEADER_SALES_PHONE_DISPLAY}`}
          >
            <Icon path={mdiWhatsapp} size={0.75} className="text-[#25D366]" aria-hidden="true" />
            <span>
              Ventas:{' '}
              <span className={topBarPhoneNumberClass}>{HEADER_SALES_PHONE_DISPLAY}</span>
            </span>
          </a>

          <span className="text-white/35" aria-hidden="true">
            |
          </span>

          <a href={HEADER_SUPPORT_PHONE_TEL} className={topBarLinkClass} aria-label={`Soporte ${HEADER_SUPPORT_PHONE_DISPLAY}`}>
            <span>
              Soporte:{' '}
              <span className={topBarPhoneNumberClass}>{HEADER_SUPPORT_PHONE_DISPLAY}</span>
            </span>
          </a>

          <HeaderStoreCurrencyExchangeBlock className="inline-flex px-0 py-0" />
        </div>
      </div>
    </div>
  );
}
