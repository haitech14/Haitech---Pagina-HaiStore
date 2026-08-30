import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { HAITECH_WHATSAPP_DISPLAY } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

/** Banner desktop en `/tienda` (origen: ChatGPT Image 28 ago 2026, 18_54_00.png). */
const BANNER_DESKTOP_SRC = '/home/store-promo-hero-banner.png';
/** Banner móvil en `/tienda` (origen: ChatGPT Image 29 ago 2026, 22_52_07.png, recorte inferior). */
const BANNER_MOBILE_SRC = '/home/store-promo-hero-banner-mobile.png';
const BANNER_CACHE_VERSION = '2026-08-29-tienda-mobile';

const bannerButtonClass = cn(
  'group relative block w-full cursor-pointer overflow-hidden rounded-2xl leading-none',
  'shadow-[0_12px_36px_rgba(15,23,42,0.10)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
);

/**
 * Hero de promociones a ancho completo — encima de categorías en Tienda.
 * El CTA del arte («Comprar Ahora») abre cotización por WhatsApp.
 */
export function StorePromoHeroBanner({ className }: { className?: string }) {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  const handleClick = () =>
    requestQuote({
      campaign: 'tienda-promo-banner',
      extraLines: [
        'Vi el banner de tienda: Gana dinero con tu propia fotocopiadora nueva.',
        'Me interesa comprar ahora.',
      ],
    });

  return (
    <section
      aria-labelledby="store-promo-hero-title"
      className={cn('w-full bg-white px-3 pb-2 pt-0 sm:px-4 sm:pb-3 lg:px-5', className)}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <h2 id="store-promo-hero-title" className="sr-only">
          Impulsa tu negocio — Gana dinero con tu propia fotocopiadora nueva
        </h2>

        <button
          type="button"
          onClick={handleClick}
          className={cn(bannerButtonClass, 'sm:hidden')}
          aria-label={`Comprar ahora por WhatsApp ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <img
            src={`${BANNER_MOBILE_SRC}?v=${BANNER_CACHE_VERSION}`}
            alt="Impulsa tu negocio. Gana dinero con tu propia fotocopiadora nueva Ricoh. Comprar ahora por WhatsApp."
            width={941}
            height={1304}
            className="block h-auto w-full object-cover object-top"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </button>

        <button
          type="button"
          onClick={handleClick}
          className={cn(bannerButtonClass, 'hidden sm:block')}
          aria-label={`Comprar ahora por WhatsApp ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <img
            src={`${BANNER_DESKTOP_SRC}?v=2026-08-28-tienda`}
            alt="Impulsa tu negocio. Gana dinero con tu propia fotocopiadora nueva Ricoh. Comprar ahora por WhatsApp."
            width={2032}
            height={774}
            className="block h-auto w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </button>
      </div>
    </section>
  );
}
