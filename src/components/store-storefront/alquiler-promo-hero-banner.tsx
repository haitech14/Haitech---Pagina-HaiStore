import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { HAITECH_WHATSAPP_DISPLAY } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

/** Banner hero en Alquiler (origen: ChatGPT Image 9 sept 2026, 16_06_32.png). */
const BANNER_SRC = '/home/alquiler-promo-hero-banner.png';
const BANNER_CACHE_VERSION = '2026-09-09-alquiler-h3';

const bannerButtonClass = cn(
  'group relative block w-full cursor-pointer overflow-hidden rounded-2xl leading-none',
  'shadow-[0_12px_36px_rgba(15,23,42,0.10)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
);

/**
 * Hero de promociones a ancho completo en Alquiler.
 * El CTA del arte («Solicita una cotización») abre cotización por WhatsApp.
 */
export function AlquilerPromoHeroBanner({ className }: { className?: string }) {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  const handleClick = () =>
    requestQuote({
      campaign: 'alquiler-promo-banner',
      extraLines: [
        'Vi el banner de alquiler: fotocopiadoras Ricoh desde S/ 599 al mes.',
        'Me interesa solicitar una cotización.',
      ],
    });

  return (
    <section
      aria-labelledby="alquiler-promo-hero-title"
      className={cn('w-full bg-white px-3 pb-2 pt-0 sm:px-4 sm:pb-3 lg:px-5', className)}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <h2 id="alquiler-promo-hero-title" className="sr-only">
          Alquiler de fotocopiadoras Ricoh desde S/ 599 soles mensuales
        </h2>

        <button
          type="button"
          onClick={handleClick}
          className={bannerButtonClass}
          aria-label={`Solicita una cotización por WhatsApp ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <img
            src={`${BANNER_SRC}?v=${BANNER_CACHE_VERSION}`}
            alt="Alquiler de fotocopiadoras Ricoh desde S/ 599 soles mensuales. Equipos multifuncionales para oficina. Solicita una cotización."
            width={1916}
            height={821}
            className="mx-auto block h-[12.5rem] w-auto max-w-full object-contain sm:h-[14.5rem] md:h-[16rem] lg:h-[17.5rem] xl:h-[18.5rem] transition-transform duration-500 group-hover:scale-[1.01]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </button>
      </div>
    </section>
  );
}
