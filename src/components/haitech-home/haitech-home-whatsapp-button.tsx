import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { HAITECH_HOME_WHATSAPP_URL } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

export function HaitechHomeWhatsAppButton({ className }: { className?: string }) {
  return (
    <a
      href={HAITECH_HOME_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Compra por WhatsApp"
      className={cn(
        'fixed bottom-4 right-3 z-[80] inline-flex items-center justify-center gap-2',
        'size-14 rounded-full bg-[#25D366] text-white sm:right-[25px] sm:h-[45px] sm:w-[220px] sm:rounded-full',
        'shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.03]',
        'text-[14px] font-semibold',
        className,
      )}
    >
      <Icon path={mdiWhatsapp} size={1.05} className="sm:size-[0.95]" aria-hidden="true" />
      <span className="hidden sm:inline">Compra por WhatsApp</span>
    </a>
  );
}
