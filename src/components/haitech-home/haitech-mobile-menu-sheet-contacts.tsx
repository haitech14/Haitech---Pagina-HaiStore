import { useState } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ChevronDown, Headphones, MapPin } from 'lucide-react';

import { HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import {
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SUPPORT_PHONE_DISPLAY,
} from '@/data/site-header';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { cn } from '@/lib/utils';

const PHONE_CLASS = 'text-[14px] font-semibold tracking-[0.02em] text-[#222]';
const LABEL_CLASS = 'text-[11px] font-normal text-[#888]';

type HaitechMobileMenuSheetContactsProps = {
  onNavigate?: () => void;
};

export function HaitechMobileMenuSheetContacts({ onNavigate }: HaitechMobileMenuSheetContactsProps) {
  const { salesLabel, supportLabel, supportHref, locations } = HAITECH_HOME_TOPBAR;
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const [sedesOpen, setSedesOpen] = useState(false);

  return (
    <div className="border-b border-[#E8E8E8] bg-white px-4 py-3">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            requestQuote({ campaign: 'mobile-menu-ventas' });
            onNavigate?.();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-[#ECECEC] bg-[#FAFAFA] px-2.5 py-2.5 text-left transition-colors hover:bg-[#F3F3F3]"
          aria-label={`WhatsApp ${salesLabel}: ${HEADER_SALES_PHONE_DISPLAY}`}
        >
          <span
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-[0.45rem] bg-[#25D366] text-white"
            aria-hidden="true"
          >
            <Icon path={mdiWhatsapp} size={0.72} color="white" />
          </span>
          <span className="min-w-0 flex flex-col leading-[1.15]">
            <span className={LABEL_CLASS}>{salesLabel}</span>
            <span className={PHONE_CLASS}>{HEADER_SALES_PHONE_DISPLAY}</span>
          </span>
        </button>

        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onNavigate?.()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#ECECEC] bg-[#FAFAFA] px-2.5 py-2.5 transition-colors hover:bg-[#F3F3F3]"
          aria-label={`${supportLabel}: ${HEADER_SUPPORT_PHONE_DISPLAY}`}
        >
          <span
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[#25D366]/35 bg-transparent"
            aria-hidden="true"
          >
            <Headphones className="size-4 text-[#25D366]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex flex-col leading-[1.15]">
            <span className={LABEL_CLASS}>{supportLabel}</span>
            <span className={PHONE_CLASS}>{HEADER_SUPPORT_PHONE_DISPLAY}</span>
          </span>
        </a>
      </div>

      <div className="mt-2.5 overflow-hidden rounded-xl border border-[#ECECEC] bg-[#FAFAFA]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
          aria-expanded={sedesOpen}
          aria-controls="haitech-mobile-sedes-panel"
          onClick={() => setSedesOpen((open) => !open)}
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#222]">
            <MapPin className="size-4 shrink-0 text-[#E30613]" strokeWidth={1.75} aria-hidden="true" />
            Sedes
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-[#888] transition-transform duration-200',
              sedesOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        {sedesOpen ? (
          <ul
            id="haitech-mobile-sedes-panel"
            className="flex flex-col gap-0.5 border-t border-[#ECECEC] px-2 pb-2 pt-1"
          >
            {locations.map((loc) => (
              <li key={loc.id}>
                <a
                  href={loc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onNavigate?.()}
                  className="flex items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white"
                >
                  <MapPin
                    className="mt-0.5 size-3.5 shrink-0 text-[#888]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 text-[12px] leading-snug">
                    <span className="block font-semibold text-[#222]">{loc.city}</span>
                    <span className="mt-0.5 block text-[#666]">{loc.address}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
