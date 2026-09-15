import { MAINTENANCE_PLAN_CALCULATOR_ID } from '@/data/maintenance-plan';
import type { MaintenanceServiceModeId } from '@/data/maintenance-plan';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const HERO_BG = '/home/servicio-tecnico-hero-bg.png?v=2026-09-10-1738';

interface MaintenanceHeroProps {
  className?: string;
  onSelectMode?: (mode: MaintenanceServiceModeId) => void;
}

function scrollToCalculator() {
  document.getElementById(MAINTENANCE_PLAN_CALCULATOR_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/** Hero de servicio técnico: solo el banner gráfico (el copy ya viene en la imagen). */
export function MaintenanceHero({ className, onSelectMode }: MaintenanceHeroProps) {
  const serviceHref = buildHaitechWhatsAppUrl(
    'Hola, quiero solicitar servicio técnico especializado para mi empresa.',
  );

  const selectMode = (mode: MaintenanceServiceModeId) => {
    onSelectMode?.(mode);
    scrollToCalculator();
  };

  return (
    <section
      aria-labelledby="maintenance-hero-title"
      className={cn('relative isolate overflow-hidden bg-[#F4F5F7]', className)}
    >
      <h1 id="maintenance-hero-title" className="sr-only">
        Servicio técnico especializado para su empresa
      </h1>

      <div className="relative mx-auto w-full max-w-[1400px]">
        <img
          src={HERO_BG}
          alt="Servicio técnico especializado Ricoh — preventivo, correctivo y planes de mantenimiento"
          width={2084}
          height={754}
          className="block h-auto w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />

        <a
          href={serviceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[16%] left-[3.5%] h-[9%] w-[min(42%,17.5rem)] rounded-full sm:bottom-[15%] sm:left-[4%] sm:h-[10%] md:bottom-[14.5%] md:h-[9%]"
          aria-label="Solicitar servicio por WhatsApp al 915 149 290"
        />

        <div
          className={cn(
            'pointer-events-none absolute right-[3%] top-[20%] hidden h-[52%] w-[46%] grid-cols-3 gap-[1.4%] md:grid',
          )}
        >
          <button
            type="button"
            onClick={() => selectMode('individual')}
            className="pointer-events-auto h-full w-full rounded-xl bg-transparent"
            aria-label="Elegir visita a demanda: correctivo desde S/ 120"
          />
          <button
            type="button"
            onClick={() => selectMode('individual')}
            className="pointer-events-auto h-full w-full rounded-xl bg-transparent"
            aria-label="Elegir visita a demanda: preventivo desde S/ 150"
          />
          <button
            type="button"
            onClick={() => selectMode('plan')}
            className="pointer-events-auto h-full w-full rounded-xl bg-transparent"
            aria-label="Elegir plan desde S/ 1,299 + IGV al año"
          />
        </div>
      </div>
    </section>
  );
}
