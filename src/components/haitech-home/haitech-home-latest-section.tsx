import { ClientRecommendationsSection } from '@/components/client-recommendations-section';
import { ClientsSection } from '@/components/clients-section';
import { HAITECH_SHOP } from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

const sectionTitleClass =
  'flex items-center gap-2.5 font-[family-name:var(--font-infobox)] text-[20px] font-bold text-[#111111] sm:text-[24px] lg:text-[26px]';

/**
 * Sección de prueba social: fotos de testimonios + logos de clientes.
 */
export function HaitechHomeLatestSection({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white', className)}
      aria-labelledby="haitech-testimonials-title"
    >
      <div
        className="mx-auto px-3 pb-6 pt-2 sm:px-4 sm:pb-[35px] sm:pt-3 xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <header className="mb-4 sm:mb-6">
          <h2 id="haitech-testimonials-title" className={sectionTitleClass}>
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Fotos de testimonios de clientes que nos respaldan
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] text-[#666] sm:text-sm">
            Experiencias reales de compra, entrega y soporte. Toca una foto para verla en grande.
          </p>
        </header>

        <ClientRecommendationsSection embedded />

        <header className="mb-4 mt-8 sm:mb-6 sm:mt-10">
          <h2 id="haitech-clients-title" className={sectionTitleClass}>
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Algunos de nuestros clientes
          </h2>
        </header>

        <ClientsSection embedded />
      </div>
    </section>
  );
}
