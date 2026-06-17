import { MapPin } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import {
  HAITECH_WHATSAPP_DISPLAY,
  HAITECH_WHATSAPP_URL,
} from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const HEADER_TOP_BAR_ADDRESS = 'Lima: Av. Petit Thouars 1964 - Lince';

const linkClass =
  'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-sm text-neutral-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export function HeaderTopBar() {
  return (
    <div className="border-b border-white/10 bg-neutral-900 text-neutral-100">
      <div className="container flex items-center justify-between gap-3 py-1.5 text-xs sm:gap-4 sm:py-2 sm:text-sm">
        <a
          href={HAITECH_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={`Contactar por WhatsApp al ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
          <span className="font-medium tabular-nums">915 149 290</span>
        </a>

        <p
          className={cn(
            'flex min-w-0 items-center gap-1 text-neutral-300',
            'justify-end sm:justify-start',
          )}
        >
          <MapPin className="size-3.5 shrink-0 text-neutral-400 sm:size-4" aria-hidden="true" />
          <span className="truncate sm:whitespace-nowrap">{HEADER_TOP_BAR_ADDRESS}</span>
        </p>
      </div>
    </div>
  );
}
