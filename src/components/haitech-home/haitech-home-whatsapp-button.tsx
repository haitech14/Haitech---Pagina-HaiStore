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
      className={cn(
        'fixed bottom-4 right-[25px] z-[80] inline-flex h-[45px] w-[220px] items-center justify-center gap-2',
        'rounded-full bg-[#25D366] text-[14px] font-semibold text-white',
        'shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.03]',
        className,
      )}
    >
      <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
      Compra por WhatsApp
    </a>
  );
}
