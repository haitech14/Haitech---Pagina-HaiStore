import { ArrowRight, Leaf, Printer, ShieldCheck, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RENTAL_LANDING_CALCULATOR_ID } from '@/data/rental-landing-pricing';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const HERO_BG = '/home/alquiler-hero-bg.png?v=2026-09-09-bg1';

const HERO_BENEFITS = [
  { id: 'equipos', label: 'Equipos multifuncionales', icon: Printer },
  { id: 'confianza', label: 'Confiabilidad RICOH', icon: ShieldCheck },
  { id: 'productividad', label: 'Mayor productividad', icon: Zap },
  { id: 'sostenible', label: 'Tu oficina más sostenible', icon: Leaf },
] as const;

export const RENTAL_CALCULATOR_REVEAL_EVENT = 'haitech:rental-calculator-reveal';

function scrollToCalculator() {
  window.dispatchEvent(new Event(RENTAL_CALCULATOR_REVEAL_EVENT));
  document.getElementById(RENTAL_LANDING_CALCULATOR_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function RentalHeroSection() {
  const advisorHref = buildHaitechWhatsAppUrl(
    'Hola, quiero hablar con un asesor sobre leasing o alquiler de fotocopiadoras RICOH.',
  );

  return (
    <section
      aria-labelledby="rental-hero-title"
      className="relative isolate overflow-hidden bg-white"
    >
      <img
        src={HERO_BG}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-cover object-[72%_center] sm:object-[right_center]"
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/30 sm:via-white/65 sm:to-transparent"
        aria-hidden="true"
      />

      <div
        className={cn(
          'container relative z-10 px-4 py-10 sm:px-6 sm:py-12',
          'min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] lg:py-14',
        )}
      >
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E30613] sm:text-xs">
            Oficinas más productivas
          </p>
          <h1
            id="rental-hero-title"
            className="mt-3 text-balance text-[2rem] font-black leading-[1.08] tracking-tight text-[#111111] sm:text-5xl"
          >
            Calcula tu plan de
            <br />
            leasing o alquiler
            <br />
            <span className="text-[#E30613]">RICOH</span>
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-[#4B5563] sm:text-base">
            Elige la modalidad, volumen y plazo y obtén una cuota estimada en segundos.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="h-11 min-h-11 gap-1.5 bg-[#E30613] px-5 text-sm font-semibold text-white hover:bg-[#c40511]"
              onClick={scrollToCalculator}
            >
              Calcular ahora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 min-h-11 border-[#D1D5DB] bg-white px-5 text-sm font-semibold text-[#111111] hover:bg-[#F9FAFB]"
            >
              <a href={advisorHref} target="_blank" rel="noopener noreferrer">
                Hablar con un asesor
              </a>
            </Button>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            {HERO_BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex flex-col items-start gap-1.5">
                  <Icon className="size-5 text-[#E30613]" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-[11px] font-medium leading-snug text-[#374151] sm:text-xs">
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
