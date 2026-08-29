import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { HAITECH_WHATSAPP_DISPLAY } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

/** Banner de promociones Ricoh en `/tienda` (origen: ChatGPT Image 28 ago 2026, 18_54_00.png). */
const BANNER_SRC = '/home/store-promo-hero-banner.png';

/**
 * Hero de promociones a ancho completo — encima de categorías en Tienda.
 * El CTA del arte («Comprar Ahora») abre cotización por WhatsApp.
 */
export function StorePromoHeroBanner({ className }: { className?: string }) {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  return (
    <section
      aria-labelledby="store-promo-hero-title"
      className={cn('w-full bg-white px-3 pb-2 pt-0 sm:px-4 sm:pb-3 lg:px-5', className)}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <button
          type="button"
          onClick={() =>
            requestQuote({
              campaign: 'tienda-promo-banner',
              extraLines: [
                'Vi el banner de tienda: Gana dinero con tu propia fotocopiadora nueva.',
                'Me interesa comprar ahora.',
              ],
            })
          }
          className={cn(
            'group relative block w-full cursor-pointer overflow-hidden rounded-2xl leading-none',
            'shadow-[0_12px_36px_rgba(15,23,42,0.10)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label={`Comprar ahora por WhatsApp ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <h2 id="store-promo-hero-title" className="sr-only">
            Impulsa tu negocio — Gana dinero con tu propia fotocopiadora nueva
          </h2>
          <img
            src={`${BANNER_SRC}?v=2026-08-28-tienda`}
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
