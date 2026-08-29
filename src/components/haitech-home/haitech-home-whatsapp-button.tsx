import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { cn } from '@/lib/utils';

export function HaitechHomeWhatsAppButton({ className }: { className?: string }) {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  return (
    <button
      type="button"
      onClick={() => requestQuote({ campaign: 'whatsapp-floating' })}
      aria-label="¿Necesitas ayuda? Escríbenos por WhatsApp"
      title="¿Necesitas Ayuda? Escríbenos"
      className={cn(
        'fixed z-[80] inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white',
        'shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.03]',
        'right-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]',
        'sm:bottom-6 sm:right-[25px]',
        className,
      )}
    >
      <Icon path={mdiWhatsapp} size={1.2} aria-hidden="true" />
    </button>
  );
}
