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
      className={cn('w-full bg-white px-4 pb-0 pt-2 sm:px-6 sm:pt-3', className)}
    >
      <div
        className="relative mx-auto overflow-hidden rounded-xl bg-neutral-900 shadow-[0_8px_28px_rgba(15,23,42,0.12)]"
        style={{
          maxWidth: HAITECH_HOME.maxWidth,
          height: 'min(460px, 36vw)',
          minHeight: 240,
        }}
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
              <img
                src={slide.src}
                alt={slide.alt}
                className="absolute inset-0 size-full min-h-full min-w-full object-cover object-[center_72%] scale-[1.1]"
                decoding={slideIndex === 0 ? 'sync' : 'async'}
                fetchPriority={slideIndex === 0 ? 'high' : 'low'}
              />
            </div>
          ))}
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              aria-label="Banner anterior"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-105 sm:left-4"
            >
              <ChevronLeft className="size-5 text-black" strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Banner siguiente"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-105 sm:right-4"
            >
              <ChevronRight className="size-5 text-black" strokeWidth={2} aria-hidden="true" />
            </button>
          </>
        ) : null}

        {showControls ? (
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-3 z-10 flex items-center gap-2 px-4 sm:bottom-4 sm:px-6"
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
                  'size-2 rounded-full transition-colors duration-200',
                  dotIndex === index ? 'bg-[#E30613]' : 'bg-white',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
