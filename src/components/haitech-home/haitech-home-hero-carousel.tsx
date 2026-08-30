import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { HAITECH_HOME_HERO_SLIDES } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 5000;

type HeroSlide = (typeof HAITECH_HOME_HERO_SLIDES)[number];

const HERO_IMAGE_CLASS = cn(
  'absolute inset-0 h-full object-cover',
  'w-[290%] max-w-none',
  'sm:w-full sm:max-w-full',
);

function heroSlideImageStyle(slide: HeroSlide): CSSProperties {
  const mobilePos =
    'mobileObjectPosition' in slide && slide.mobileObjectPosition
      ? slide.mobileObjectPosition
      : 'left 20%';

  return {
    ['--hero-desktop-pos' as string]: slide.objectPosition,
    objectPosition: mobilePos,
  };
}

function HeroSlidePicture({ slide, index }: { slide: HeroSlide; index: number }) {
  const imageStyle = heroSlideImageStyle(slide);
  const imageClass = cn(HERO_IMAGE_CLASS, 'sm:[object-position:var(--hero-desktop-pos)]');
  const srcPng = 'srcPng' in slide ? slide.srcPng : undefined;
  const loadProps = {
    decoding: index === 0 ? ('sync' as const) : ('async' as const),
    fetchPriority: index === 0 ? ('high' as const) : ('low' as const),
  };

  if (srcPng) {
    return (
      <picture>
        <source srcSet={slide.src} type="image/webp" />
        <img
          src={srcPng}
          alt={slide.alt}
          width={2094}
          height={670}
          className={imageClass}
          style={imageStyle}
          {...loadProps}
        />
      </picture>
    );
  }

  return (
    <img
      src={slide.src}
      alt={slide.alt}
      width={2094}
      height={670}
      className={imageClass}
      style={imageStyle}
      {...loadProps}
    />
  );
}

export function HaitechHomeHeroCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = HAITECH_HOME_HERO_SLIDES.length;
  const showControls = total > 1;
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const slide = HAITECH_HOME_HERO_SLIDES[index]!;

  const handleHeroClick = useCallback(() => {
    requestQuote({ campaign: 'hero-home' });
  }, [requestQuote]);

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
      className={cn('w-full bg-white', className)}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden bg-white',
          'aspect-[16/11] min-h-[248px] max-h-[min(420px,92vw)]',
          'sm:aspect-[2094/670] sm:min-h-[130px] sm:max-h-[min(560px,32vw)]',
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          onClick={handleHeroClick}
          className="absolute inset-0 block cursor-pointer border-0 bg-transparent p-0"
          aria-label="Abrir WhatsApp para comprar o cotizar"
        >
          <HeroSlidePicture slide={slide} index={index} />
        </button>

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
      </div>
    </section>
  );
}
