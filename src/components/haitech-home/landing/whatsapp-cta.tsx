import { MessageCircle } from 'lucide-react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { HAITECH_LANDING_COLORS } from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

export function WhatsAppCta({
  whatsappUrl,
  className,
}: {
  whatsappUrl: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'flex flex-col items-start justify-between gap-5 rounded-[7px] px-5 py-6 sm:flex-row sm:items-center sm:px-7 sm:py-7',
        className,
      )}
      style={{ backgroundColor: HAITECH_LANDING_COLORS.primary, minHeight: 105 }}
      aria-label="Asesoría por WhatsApp"
    >
      <div className="flex items-center gap-4">
        <MessageCircle
          className="size-11 shrink-0 text-white sm:size-12"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <div>
          <p className="text-[16px] font-bold uppercase tracking-wide text-white sm:text-[18px]">
            ¿Necesitas asesoría?
          </p>
          <p className="mt-1 text-[13px] text-white/90 sm:text-[14px]">
            Nuestro equipo está listo para ayudarte.
          </p>
        </div>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-[5px] bg-white px-4 text-[12px] font-bold uppercase tracking-wide',
          'transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e30613]',
        )}
        style={{ color: HAITECH_LANDING_COLORS.primary }}
      >
        <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
        Hablar por WhatsApp
      </a>
    </section>
  );
}
