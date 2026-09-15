import { useCallback, useEffect, useState, type CSSProperties } from 'react';

import { CarouselDots } from '@/components/ui/carousel-dots';
import { HAITECH_HOME, HAITECH_HOME_HERO_SLIDES } from '@/data/haitech-home-shell';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 9000;
const FADE_MS_CLASS = 'duration-1000';

type HeroSlide = (typeof HAITECH_HOME_HERO_SLIDES)[number];

const HERO_IMAGE_CLASS = cn(
  'absolute inset-0 h-full object-cover',
  // Móvil: un poco de recorte para encuadrar el titular, sin acercar tanto las impresoras.
  'w-[165%] max-w-none',
  // Desktop: mismo recuadro; acerca la foto y recorta piso/bordes, no el titular.
  'sm:left-0 sm:w-full sm:max-w-full sm:origin-[center_30%] sm:object-cover sm:object-center sm:scale-[1.1]',
);

function heroSlideImageStyle(slide: HeroSlide): CSSProperties {
  const mobilePos =
    'mobileObjectPosition' in slide && slide.mobileObjectPosition
      ? slide.mobileObjectPosition
      : 'center center';

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
          height={751}
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
      height={751}
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
      className={cn('w-full bg-white px-3 pb-0 pt-0 sm:px-4 lg:px-5', className)}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl bg-white',
            'aspect-[16/11] min-h-[236px] max-h-[min(360px,90vw)]',
            'sm:aspect-[3.15/1] sm:min-h-[160px] sm:max-h-[min(480px,32vw)]',
          )}
        >
          {HAITECH_HOME_HERO_SLIDES.map((heroSlide, slideIndex) => (
            <div
              key={heroSlide.id}
              className={cn(
                'absolute inset-0 transition-opacity ease-in-out',
                FADE_MS_CLASS,
                slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={slideIndex !== index}
            >
              <HeroSlidePicture slide={heroSlide} index={slideIndex} />
            </div>
          ))}

          <button
            type="button"
            onClick={handleHeroClick}
            className="absolute inset-0 z-[1] block cursor-pointer border-0 bg-transparent p-0"
            aria-label="Abrir WhatsApp para comprar o cotizar"
          />

          {showControls ? (
            <CarouselDots
              count={total}
              selectedIndex={index}
              onSelect={goTo}
              ariaLabel="Seleccionar banner"
              size="lg"
              inactiveClassName="border-neutral-500 bg-white"
              activeClassName="border-red-600 bg-red-600"
              className="pointer-events-none absolute bottom-2.5 left-1/2 z-[2] w-max -translate-x-1/2 gap-0 rounded-full bg-black/35 px-1 py-0.5 backdrop-blur-[2px] sm:bottom-3 [&_button]:pointer-events-auto [&_button]:size-5"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
