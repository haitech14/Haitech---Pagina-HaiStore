import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CreditCard, Truck } from 'lucide-react';

import { QTC, QTC_HERO_SLIDES } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 5000;

export function QtcHeroCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = QTC_HERO_SLIDES.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [goTo, index, paused]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones QTC"
      className={cn('relative w-full overflow-hidden bg-black', className)}
      style={{ height: 'min(500px, 56vw)', minHeight: 280 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative size-full">
        {QTC_HERO_SLIDES.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            aria-hidden={slideIndex !== index}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="size-full object-cover object-center"
              decoding={slideIndex === 0 ? 'sync' : 'async'}
              fetchPriority={slideIndex === 0 ? 'high' : 'low'}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Banner anterior"
        onClick={() => goTo(index - 1)}
        className="absolute left-[42px] top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-105"
      >
        <ChevronLeft className="size-5 text-black" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Banner siguiente"
        onClick={() => goTo(index + 1)}
        className="absolute right-[42px] top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-105"
      >
        <ChevronRight className="size-5 text-black" strokeWidth={2} aria-hidden="true" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col gap-2 px-4 sm:bottom-4 sm:px-8">
        <p className="max-w-[40%] text-[9px] leading-snug text-white/75 sm:text-[10px]">
          *Descuentos aplicables según stock y vigencia de campaña. Consulta condiciones en tienda.
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-2" role="tablist" aria-label="Indicadores">
            {QTC_HERO_SLIDES.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Ir al banner ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
                className={cn(
                  'size-2 rounded-full transition-colors duration-200',
                  dotIndex === index ? 'bg-[color:var(--qtc-orange)]' : 'bg-white',
                )}
                style={{ ['--qtc-orange' as string]: QTC.orange }}
              />
            ))}
          </div>

          <div className="pointer-events-none flex items-center gap-2">
            <div className="flex h-[35px] items-center gap-1.5 rounded-md bg-white px-2.5 text-[10px] font-bold uppercase leading-tight text-[#4A1F9B] shadow-sm sm:text-[11px]">
              <CreditCard className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>
                Cuotas sin
                <br />
                intereses
              </span>
            </div>
            <div className="flex h-[35px] items-center gap-1.5 rounded-md bg-white px-2.5 text-[10px] font-bold uppercase leading-tight text-[#4A1F9B] shadow-sm sm:text-[11px]">
              <Truck className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Envío gratis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
