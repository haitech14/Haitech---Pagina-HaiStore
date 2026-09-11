import { cn } from '@/lib/utils';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const SUPPORT_HERO_IMAGE = '/promotions/promo-hero-servicio-tecnico.png?v=2026-09-10-1738';

interface ServicesSupportHeroProps {
  className?: string;
}

/** Hero de servicio técnico: solo el banner gráfico (el copy ya viene en la imagen). */
export function ServicesSupportHero({ className }: ServicesSupportHeroProps) {
  const serviceHref = buildHaitechWhatsAppUrl(
    'Hola, quiero solicitar servicio técnico especializado para mi empresa.',
  );

  return (
    <section
      aria-labelledby="servicios-soporte-hero-titulo"
      className={cn('relative w-full overflow-hidden bg-white', className)}
    >
      <h1 id="servicios-soporte-hero-titulo" className="sr-only">
        Servicio técnico especializado para su empresa
      </h1>

      <div className="relative mx-auto w-full max-w-[1400px]">
        <img
          src={SUPPORT_HERO_IMAGE}
          alt="Servicio técnico especializado Ricoh — preventivo, correctivo y planes de mantenimiento"
          width={2084}
          height={754}
          className="block h-auto w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />

        {/* Zona clicable sobre el CTA «Solicitar servicio» del banner */}
        <a
          href={serviceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[16%] left-[3.5%] h-[9%] w-[min(42%,17.5rem)] rounded-full sm:bottom-[15%] sm:left-[4%] sm:h-[10%] md:bottom-[14.5%] md:h-[9%]"
          aria-label="Solicitar servicio por WhatsApp al 915 149 290"
        />
      </div>
    </section>
  );
}
