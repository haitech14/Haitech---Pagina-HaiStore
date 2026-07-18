import { useCallback, useEffect, useRef, useState } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Clock, Headphones, Headset, Wrench } from 'lucide-react';

import { HeaderWhatsAppContactAction } from '@/components/layout/header-whatsapp-contact-action';
import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { TechnicalServiceRequestDialog } from '@/components/layout/technical-service-request-dialog';
import {
  HEADER_BUSINESS_HOURS,
  HEADER_BUY_RENT_WHATSAPP_LABEL,
  HEADER_CUSTOMER_SERVICE_LABEL,
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SERVICE_WHATSAPP_LABEL,
  HEADER_SUPPORT_PHONE_DISPLAY,
} from '@/data/site-header';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

type HeaderCustomerServiceActionProps = {
  className?: string;
  /** Menú móvil: lista expandida sin popover. */
  variant?: 'desktop' | 'mobile';
};

/** Unifica Ventas/Alquiler + Soporte + horario en «Atención al cliente». */
export function HeaderCustomerServiceAction({
  className,
  variant = 'desktop',
}: HeaderCustomerServiceActionProps) {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  if (variant === 'mobile') {
    return (
      <details
        className={cn(
          'group overflow-hidden rounded-lg border border-white/15 bg-white/5',
          className,
        )}
      >
        <summary
          className={cn(
            'flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5',
            'text-sm font-semibold text-white marker:content-none',
            '[&::-webkit-details-marker]:hidden',
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Headset className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {HEADER_CUSTOMER_SERVICE_LABEL}
          </span>
          <Clock className="size-3.5 shrink-0 text-white/55 group-open:hidden" strokeWidth={1.75} aria-hidden="true" />
        </summary>
        <div className="flex flex-col gap-2 border-t border-white/10 px-3 pb-3 pt-2">
          <p className="inline-flex items-center gap-1.5 text-xs text-white/70">
            <Clock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {HEADER_BUSINESS_HOURS}
          </p>
          <HeaderWhatsAppContactAction
            topic="ventas"
            variant="mobile"
            label={HEADER_BUY_RENT_WHATSAPP_LABEL}
            phoneDisplay={HEADER_SALES_PHONE_DISPLAY}
            icon={
              <Icon path={mdiWhatsapp} size={0.72} className="shrink-0 text-[#25D366]" aria-hidden="true" />
            }
          />
          <HeaderWhatsAppContactAction
            topic="soporte"
            variant="mobile"
            label={HEADER_SERVICE_WHATSAPP_LABEL}
            phoneDisplay={HEADER_SUPPORT_PHONE_DISPLAY}
            icon={<Headphones className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
          />
          <button
            type="button"
            className={cn(
              'inline-flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-white/90',
              'hover:bg-white/10 hover:text-white',
            )}
            onClick={() => setScheduleOpen(true)}
          >
            <Wrench className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Agendar servicio técnico
          </button>
          <TechnicalServiceRequestDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
        </div>
      </details>
    );
  }

  return (
    <div
      className={cn('relative shrink-0', className)}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={HEADER_CUSTOMER_SERVICE_LABEL}
        onFocus={openMenu}
        className={cn(headerDarkUtilityButtonClass(), 'h-auto items-center gap-1.5 py-1.5')}
      >
        <Headset className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="flex flex-col gap-0 text-left text-[0.6875rem] leading-none">
          <span className="font-semibold">{HEADER_CUSTOMER_SERVICE_LABEL}</span>
          <span className="mt-0.5 max-w-[7.5rem] truncate font-normal text-white/75">
            {HEADER_BUSINESS_HOURS.replace('Lun - Vie: ', '')}
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-1 w-[16.5rem] rounded-lg border border-white/15',
            'bg-[#1A1A1A] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
          )}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <p className="mb-1.5 px-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/55">
            {HEADER_CUSTOMER_SERVICE_LABEL}
          </p>
          <p className="mb-2 inline-flex items-center gap-1.5 px-2 text-[0.7rem] text-white/75">
            <Clock className="size-3 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden="true" />
            {HEADER_BUSINESS_HOURS}
          </p>
          <div className="flex flex-col gap-0.5">
            <HeaderWhatsAppContactAction
              topic="ventas"
              label={HEADER_BUY_RENT_WHATSAPP_LABEL}
              phoneDisplay={HEADER_SALES_PHONE_DISPLAY}
              className="w-full justify-start rounded-md px-2"
              icon={
                <Icon
                  path={mdiWhatsapp}
                  size={0.72}
                  className="shrink-0 text-[#25D366]"
                  aria-hidden="true"
                />
              }
            />
            <HeaderWhatsAppContactAction
              topic="soporte"
              label={HEADER_SERVICE_WHATSAPP_LABEL}
              phoneDisplay={HEADER_SUPPORT_PHONE_DISPLAY}
              className="w-full justify-start rounded-md px-2"
              icon={<Headphones className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
            />
            <button
              type="button"
              role="menuitem"
              className={cn(
                'inline-flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.8125rem] font-medium text-white/90',
                'hover:bg-white/10 hover:text-white',
              )}
              onClick={() => {
                setOpen(false);
                setScheduleOpen(true);
              }}
            >
              <Wrench className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              Agendar servicio técnico
            </button>
          </div>
        </div>
      ) : null}

      <TechnicalServiceRequestDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </div>
  );
}
