import { MessageCircle } from 'lucide-react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { HAITECH_LANDING_COLORS, HAITECH_LANDING_MAX_WIDTH } from '@/data/haitech-home-landing-section';
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
      className={cn('w-full bg-[#f5f5f5] px-4 py-8 sm:px-6 sm:py-10', className)}
      aria-label="Asesoría por WhatsApp"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_LANDING_MAX_WIDTH }}>
        <div className="relative overflow-hidden rounded-2xl shadow-[0_10px_32px_rgba(227,6,19,0.22)]">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, #b8000c 0%, #d4000f 38%, #e30613 62%, #ff2430 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10 blur-2xl sm:size-52"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-6 size-36 rounded-full bg-black/10 blur-2xl sm:size-48"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center gap-6 px-5 py-7 text-center sm:flex-row sm:justify-between sm:px-8 sm:py-8 sm:text-left lg:px-10 lg:py-9">
            <div className="flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
              <span
                className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/35 bg-white/10 backdrop-blur-sm sm:size-16"
                aria-hidden="true"
              >
                <MessageCircle className="size-7 text-white sm:size-8" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[17px] font-bold uppercase tracking-[0.04em] text-white sm:text-[19px] lg:text-[20px]">
                  ¿Necesitas asesoría?
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/90 sm:text-[14px]">
                  Nuestro equipo comercial y técnico está listo para ayudarte con cotizaciones,
                  equipos y soporte.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-white px-5 text-[12px] font-bold uppercase tracking-[0.06em] shadow-[0_4px_14px_rgba(0,0,0,0.15)]',
                'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.2)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e30613]',
              )}
              style={{ color: HAITECH_LANDING_COLORS.primary }}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#25D366]/15">
                <Icon path={mdiWhatsapp} size={0.95} className="text-[#25D366]" aria-hidden="true" />
              </span>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
