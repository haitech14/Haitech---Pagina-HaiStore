import { RENTAL_SOLUTION_CONFIGURATOR_ID } from '@/data/rental-solution-configurator';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const HERO_BG = '/home/alquiler-hero-bg.png?v=2026-09-10-banner';

export const RENTAL_CALCULATOR_REVEAL_EVENT = 'haitech:rental-calculator-reveal';

function scrollToCalculator() {
  window.dispatchEvent(new Event(RENTAL_CALCULATOR_REVEAL_EVENT));
  document.getElementById(RENTAL_SOLUTION_CONFIGURATOR_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/** Hero de alquiler: solo el banner gráfico (el copy ya viene en la imagen). */
export function RentalHeroSection() {
  const advisorHref = buildHaitechWhatsAppUrl(
    'Hola, quiero hablar con un asesor sobre alquiler de equipos RICOH.',
  );

  return (
    <section
      aria-labelledby="rental-hero-title"
      className="relative isolate bg-[#F4F5F7] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 lg:px-5"
    >
      <h1 id="rental-hero-title" className="sr-only">
        Alquiler de equipos Ricoh
      </h1>

      <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.10)]">
        <img
          src={HERO_BG}
          alt="Alquiler de equipos Ricoh — equipos seminuevos con servicio integral incluido"
          className="block h-auto w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />

        {/* Zonas clicables sobre los CTAs del banner */}
        <div
          className={cn(
            'absolute inset-0',
            'grid grid-cols-1 content-end gap-2 px-[5%] pb-[8%] sm:pb-[7%] md:content-center md:pb-0',
            'md:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]',
          )}
        >
          <div className="flex max-w-md flex-col justify-end gap-2 sm:gap-2.5 md:translate-y-[18%] lg:translate-y-[22%]">
            <button
              type="button"
              onClick={scrollToCalculator}
              className="h-10 w-[min(100%,11.5rem)] rounded-md bg-transparent sm:h-11 sm:w-[13rem]"
              aria-label="Cotiza tu alquiler"
            />
            <a
              href={advisorHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-10 w-[min(100%,12.5rem)] rounded-md sm:h-11 sm:w-[14rem]"
              aria-label="Habla con un asesor"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
