import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { HAITECH_HOME, HAITECH_HOME_HERO_SLIDES } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 5000;

export function HaitechHomeHeroCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = HAITECH_HOME_HERO_SLIDES.length;
  const showControls = total > 1;

  const goTo = useCallback(
    (next: number) => {
      if (total <= 1) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (!showControls || paused) return;
    const id = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [goTo, index, paused, showControls]);

  return (
    <section
      aria-roledescription={showControls ? 'carrusel' : undefined}
      aria-label="Promociones HAITECH"
      className={cn('w-full bg-white px-3 pb-0 pt-2 sm:px-4 sm:pt-3 lg:px-5', className)}
    >
      <div
        className={cn(
          'relative mx-auto overflow-hidden rounded-lg bg-neutral-900 shadow-[0_8px_28px_rgba(15,23,42,0.12)] sm:rounded-xl',
          'h-[min(320px,82vw)] min-h-[240px]',
          'sm:h-[min(320px,42vw)] sm:min-h-[220px]',
          'lg:h-[min(480px,34vw)] lg:min-h-[260px]',
        )}
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0">
          {HAITECH_HOME_HERO_SLIDES.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-300',
                slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={slideIndex !== index}
            >
              <a
                href={slide.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 block cursor-pointer"
                aria-label={
                  slide.id === 'hero-1'
                    ? 'Abrir WhatsApp para comprar o cotizar'
                    : 'Abrir WhatsApp con la promoción Ricoh'
                }
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className={cn(
                    'absolute inset-0 size-full min-h-full min-w-full object-cover scale-100 sm:scale-[1.02]',
                    slideIndex === 0
                      ? 'object-[center_50%] sm:object-[center_52%]'
                      : 'object-[center_58%] sm:object-[center_62%]',
                  )}
                  decoding={slideIndex === 0 ? 'sync' : 'async'}
                  fetchPriority={slideIndex === 0 ? 'high' : 'low'}
                />
              </a>
            </div>
          ))}
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              aria-label="Banner anterior"
              onClick={() => goTo(index - 1)}
              className="absolute left-1.5 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] sm:left-2 sm:size-8"
            >
              <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Banner siguiente"
              onClick={() => goTo(index + 1)}
              className="absolute right-1.5 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] sm:right-2 sm:size-8"
            >
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </>
        ) : null}

        {showControls ? (
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5 px-3 sm:bottom-4 sm:justify-start sm:gap-2 sm:px-6"
            role="tablist"
            aria-label="Indicadores"
          >
            {HAITECH_HOME_HERO_SLIDES.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Ir al banner ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
                className={cn(
                  'size-1.5 rounded-full transition-colors duration-200 sm:size-2',
                  dotIndex === index ? 'bg-[#E30613]' : 'bg-[#6B7280]',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
