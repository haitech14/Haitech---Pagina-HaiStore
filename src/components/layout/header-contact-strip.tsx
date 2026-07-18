import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Headphones } from 'lucide-react';

import { HeaderWhatsAppContactAction } from '@/components/layout/header-whatsapp-contact-action';
import {
  HEADER_BUY_RENT_WHATSAPP_LABEL,
  HEADER_SALES_PHONE_DISPLAY,
  HEADER_SUPPORT_PHONE_DISPLAY,
} from '@/data/site-header';
import { cn } from '@/lib/utils';

const HEADER_SUPPORT_TECHNICAL_LABEL = 'Soporte técnico';

type HeaderContactStripProps = {
  className?: string;
};

/**
 * Ventas/Alquiler + Soporte técnico (números) — franja clara junto al logo.
 */
export function HeaderContactStrip({ className }: HeaderContactStripProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center gap-3 sm:gap-4 xl:gap-5', className)}
      aria-label="Contacto comercial y soporte"
    >
      <HeaderWhatsAppContactAction
        topic="ventas"
        variant="strip"
        label={HEADER_BUY_RENT_WHATSAPP_LABEL}
        phoneDisplay={HEADER_SALES_PHONE_DISPLAY}
        icon={
          <Icon
            path={mdiWhatsapp}
            size={0.95}
            className="shrink-0 text-[#25D366]"
            aria-hidden="true"
          />
        }
      />
      <HeaderWhatsAppContactAction
        topic="soporte"
        variant="strip"
        label={HEADER_SUPPORT_TECHNICAL_LABEL}
        phoneDisplay={HEADER_SUPPORT_PHONE_DISPLAY}
        icon={<Headphones className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden="true" />}
      />
    </div>
  );
}
