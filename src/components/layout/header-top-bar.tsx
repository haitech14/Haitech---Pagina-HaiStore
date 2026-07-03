import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { MapPin, Mail } from 'lucide-react';

import {
  HEADER_SALES_EMAIL,
  HEADER_SALES_EMAIL_MAILTO,
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SALES_WHATSAPP_LINK,
  HEADER_SUPPORT_PHONE_DISPLAY,
  HEADER_SUPPORT_PHONE_TEL,
  HEADER_TOPBAR_ADDRESS,
} from '@/data/site-header';
import { cn } from '@/lib/utils';

const topBarLinkClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export function HeaderTopBar({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-white/10 bg-black', className)}>
      <div className="container flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-1.5 text-[0.6875rem] sm:text-xs lg:text-[0.8125rem]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          <p className="inline-flex min-w-0 items-center gap-1.5 text-white/80">
            <MapPin className="size-3.5 shrink-0 text-white/65" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{HEADER_TOPBAR_ADDRESS}</span>
          </p>

          <a
            href={HEADER_SALES_EMAIL_MAILTO}
            className={topBarLinkClass}
            aria-label={`Correo de ventas ${HEADER_SALES_EMAIL}`}
          >
            <Mail className="size-3.5 shrink-0 text-white/65" strokeWidth={1.75} aria-hidden="true" />
            <span>{HEADER_SALES_EMAIL}</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          <a
            href={HEADER_SALES_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={topBarLinkClass}
            aria-label={`WhatsApp ventas ${HEADER_SALES_PHONE_DISPLAY}`}
          >
            <Icon path={mdiWhatsapp} size={0.75} className="text-[#25D366]" aria-hidden="true" />
            <span>
              Ventas <span className="font-semibold text-white">{HEADER_SALES_PHONE_DISPLAY}</span>
            </span>
          </a>

          <a href={HEADER_SUPPORT_PHONE_TEL} className={topBarLinkClass}>
            <span>
              Soporte{' '}
              <span className="font-semibold text-white">{HEADER_SUPPORT_PHONE_DISPLAY}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
