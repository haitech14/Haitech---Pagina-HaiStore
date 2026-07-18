import { FileText, Wrench } from 'lucide-react';

import { SupportScheduleForm } from '@/components/services-storefront/support-schedule-form';
import { Button } from '@/components/ui/button';
import { SERVICES_CATALOG_ID } from '@/data/services-catalog';
import { soporteTecnicoLanding } from '@/data/service-landings';
import { cn } from '@/lib/utils';

const SUPPORT_HERO_IMAGE = '/promotions/promo-hero-servicio.webp';

interface ServicesSupportHeroProps {
  className?: string;
}

/** Hero compacto de Soporte técnico + formulario de agenda a la derecha. */
export function ServicesSupportHero({ className }: ServicesSupportHeroProps) {
  const scrollToCatalog = () => {
    document.getElementById(SERVICES_CATALOG_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      aria-labelledby="servicios-soporte-hero-titulo"
      className={cn('relative w-full overflow-hidden', className)}
    >
      <div className="relative">
        <img
          src={SUPPORT_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[center_30%]"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/72 to-black/50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40"
          aria-hidden="true"
        />

        <div className="container relative z-10 px-4 py-5 sm:px-6 sm:py-6 lg:py-7">
          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
            <div className="flex min-w-0 max-w-xl flex-col items-start text-left lg:pr-2">
              <p className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-red-400">
                <Wrench className="size-3" aria-hidden />
                {soporteTecnicoLanding.badge}
              </p>
              <h1
                id="servicios-soporte-hero-titulo"
                className="mt-1.5 text-balance font-hero text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.75rem] lg:leading-tight"
              >
                {soporteTecnicoLanding.title}{' '}
                <span className="text-red-400">{soporteTecnicoLanding.titleHighlight}</span>
              </h1>
              <p className="mt-2 max-w-lg text-pretty text-xs leading-relaxed text-white/85 sm:text-sm lg:line-clamp-2">
                {soporteTecnicoLanding.subtitle}
              </p>

              {soporteTecnicoLanding.bullets.length > 0 ? (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {soporteTecnicoLanding.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[0.625rem] font-semibold text-white/90"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-3.5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-white/40 bg-white/95 px-4 text-xs font-semibold text-neutral-950 hover:bg-white sm:text-sm"
                  onClick={scrollToCatalog}
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  Ver servicios técnicos
                </Button>
              </div>
            </div>

            <div className="flex w-full min-w-0 justify-start lg:justify-end">
              <SupportScheduleForm />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Técnico especializado en mantenimiento de equipos de impresión</span>
    </section>
  );
}
