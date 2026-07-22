import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ShieldCheck, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CarouselDots, type CarouselDotsTheme } from '@/components/ui/carousel-dots';
import { HomeLandingHeroSlideContent } from '@/components/home/home-landing-hero';
import {
  CATEGORY_STRIP_HERO_IMAGE_FRAME_CLASS,
  CATEGORY_STRIP_HERO_IMAGE_ZOOM_CLASS,
  CATEGORY_STRIP_HERO_VERTICAL_CROP,
} from '@/lib/category-strip-layout';
import { heroSingleAssetSources, categoryImageSources } from '@/lib/responsive-image';
import {
  HOME_HERO_WHATSAPP_NUMBER,
  TRUST_ICON_MAP,
  homeHeroSlides,
  type HomeHeroSlide,
} from '@/data/home-hero-slides';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { isHeroWhatsAppHref, openHeroQuoteWhatsApp } from '@/lib/hero-whatsapp-message';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { cn } from '@/lib/utils';

const DiaPapaHomeHero = lazy(() =>
  import('@/components/home/dia-papa-home-hero').then((m) => ({ default: m.DiaPapaHomeHero })),
);

const WhatsAppContactDialog = lazy(() =>
  import('@/components/whatsapp-contact-dialog').then((m) => ({
    default: m.WhatsAppContactDialog,
  })),
);

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4 fill-current', className)} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2.004C6.486 2.004 2 6.49 2 12.004c0 1.77.463 3.433 1.273 4.883L2.05 21.95l5.2-1.193A9.96 9.96 0 0 0 12 22.004c5.514 0 10-4.486 10-10s-4.486-9.996-10-9.996zm0 18.002a8 8 0 0 1-4.08-1.12l-.292-.173-3.086.708.715-3.01-.19-.31A7.96 7.96 0 0 1 4 12.004c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
    </svg>
  );
}

function heroResponsiveSources(imagePath: string, baseWidth: number) {
  const base = imagePath.replace(/\.(png|jpe?g|webp)$/i, '');
  const w = (scale: number) => Math.round(baseWidth * scale);

  return {
    webpSrcSet: `${base}.webp ${w(1)}w, ${base}@2x.webp ${w(2)}w, ${base}@3x.webp ${w(3)}w, ${base}@4x.webp ${w(4)}w, ${base}@5x.webp ${w(5)}w, ${base}@6x.webp ${w(6)}w`,
    fallbackSrcSet: `${base}.png ${w(1)}w, ${base}@2x.png ${w(2)}w, ${base}@3x.png ${w(3)}w, ${base}@4x.png ${w(4)}w`,
    fallbackSrc: `${base}@4x.png`,
  };
}

function HeroImageOnlyCtaOverlay({ onWhatsAppClick }: { onWhatsAppClick: () => void }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-center gap-2 p-3 sm:justify-end sm:p-4',
        'bg-gradient-to-t from-black/50 via-black/20 to-transparent',
      )}
    >
      <Button
        type="button"
        size="sm"
        className="pointer-events-auto min-h-10 gap-1.5 bg-[#25D366] px-4 text-sm font-semibold text-white shadow-md hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
        onClick={onWhatsAppClick}
      >
        <WhatsAppGlyph className="size-[0.85rem]" />
        Solicitar cotización
      </Button>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="pointer-events-auto min-h-10 border-white/40 bg-white/95 px-4 text-sm font-semibold text-[#0f1f3d] shadow-md hover:bg-white focus-visible:ring-white"
      >
        <Link to="/categoria/multifuncionales">Ver multifuncionales</Link>
      </Button>
    </div>
  );
}

function resolveHeroSingleAssetSources(slide: HomeHeroSlide) {
  if (slide.skipHeroWebpVariants) {
    return {
      webpSrcSet: undefined,
      fallbackSrc: slide.backgroundImage,
      sizes: '100vw',
    };
  }
  return heroSingleAssetSources(slide.backgroundImage);
}

function HeroSlideContent({
  slide,
  index,
  sectionHeadingId = 'hero-titulo',
  onWhatsAppClick,
}: {
  slide: HomeHeroSlide;
  index: number;
  sectionHeadingId?: string;
  onWhatsAppClick: (campaign?: string) => void;
}) {
  const headingId = index === 0 ? sectionHeadingId : `${sectionHeadingId}-${slide.id}`;

  if (slide.layout === 'home-landing') {
    return (
      <HomeLandingHeroSlideContent headingId={headingId} onQuoteClick={onWhatsAppClick} />
    );
  }

  if (slide.layout === 'dia-papa-home') {
    return (
      <Suspense fallback={<div className="min-h-[12rem] bg-muted animate-pulse" aria-hidden="true" />}>
        <DiaPapaHomeHero
          headingId={headingId}
          shopHref={slide.linkHref ?? '/tienda'}
          imageAlt={slide.imageAlt ?? 'Día del Padre — HaiStore'}
        />
      </Suspense>
    );
  }

  if (slide.imageOnly) {
    const imageWidth = slide.imageWidth ?? 1920;
    const displayHeight = slide.imageHeight ?? 400;
    const href = slide.linkHref ?? '/tienda';
    const isExternal = href.startsWith('http');
    const isWhatsAppLink = isHeroWhatsAppHref(href);
    const isPriority = index === 0;
    const showCtaOverlay = slide.compact === true && slide.ctaOverlay === true;
    const openWhatsAppLead = () => onWhatsAppClick(slide.imageAlt ?? slide.id);

    const imageNode = slide.singleAsset ? (
      slide.compact ? (
        (() => {
          const verticalCrop = slide.heroVerticalCrop ?? CATEGORY_STRIP_HERO_VERTICAL_CROP;
          const objectFit = slide.objectFit ?? 'cover';
          const heightClass = slide.compactMaxHeightClass ?? '';
          const fixedRowHeight = /\bh-\[/.test(heightClass);
          const { webpSrcSet, fallbackSrc, sizes } = resolveHeroSingleAssetSources(slide);
          const imageFrameClass = slide.compactImageFrameClass ?? CATEGORY_STRIP_HERO_IMAGE_FRAME_CLASS;
          const imageZoomClass = slide.compactImageZoomClass ?? CATEGORY_STRIP_HERO_IMAGE_ZOOM_CLASS;
          return (
            <div
              className={cn(
                'relative flex w-full items-center justify-center overflow-hidden',
                heightClass,
              )}
              style={
                fixedRowHeight
                  ? undefined
                  : {
                      aspectRatio: `${imageWidth} / ${Math.round(displayHeight * verticalCrop)}`,
                    }
              }
            >
              <picture className={cn('block', imageFrameClass)}>
                {webpSrcSet ? (
                  <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
                ) : null}
                <img
                  src={fallbackSrc}
                  width={imageWidth}
                  height={displayHeight}
                  alt=""
                  decoding="async"
                  fetchPriority={isPriority ? 'high' : 'low'}
                  loading={isPriority ? 'eager' : 'lazy'}
                  sizes={sizes}
                  className={cn(
                    'size-full',
                    objectFit === 'contain'
                      ? 'object-contain object-center'
                      : cn(
                          'object-cover',
                          slide.objectPositionClass ?? 'object-[center_50%]',
                          imageZoomClass,
                        ),
                  )}
                />
              </picture>
            </div>
          );
        })()
      ) : (
        (() => {
          const { webpSrcSet, fallbackSrc, sizes } = resolveHeroSingleAssetSources(slide);
          return (
            <picture
              className="block w-full overflow-hidden"
              style={{ aspectRatio: `${imageWidth} / ${displayHeight}` }}
            >
              {webpSrcSet ? (
                <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
              ) : null}
              <img
                src={fallbackSrc}
                width={imageWidth}
                height={displayHeight}
                alt=""
                decoding="async"
                fetchPriority={isPriority ? 'high' : 'low'}
                loading={isPriority ? 'eager' : 'lazy'}
                sizes={sizes}
                className="size-full object-contain object-center"
              />
            </picture>
          );
        })()
      )
    ) : (
      (() => {
        const { webpSrcSet, fallbackSrcSet, fallbackSrc } = heroResponsiveSources(
          slide.backgroundImage,
          imageWidth,
        );

        return (
          <picture
            className="block w-full overflow-hidden"
            style={{ aspectRatio: `${imageWidth} / ${displayHeight}` }}
          >
            <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />
            <img
              src={fallbackSrc}
              srcSet={fallbackSrcSet}
              sizes="100vw"
              width={imageWidth}
              height={displayHeight}
              alt=""
              decoding="async"
              fetchPriority={isPriority ? 'high' : 'low'}
              loading={isPriority ? 'eager' : 'lazy'}
              className="size-full object-cover object-center"
            />
          </picture>
        );
      })()
    );

    const linkClassName =
      'block w-full leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    const renderImageLink = () => {
      if (isWhatsAppLink) {
        return (
          <button type="button" onClick={openWhatsAppLead} className={cn(linkClassName, 'cursor-pointer')}>
            {imageNode}
          </button>
        );
      }
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {imageNode}
          </a>
        );
      }
      return (
        <Link to={href} className={linkClassName}>
          {imageNode}
        </Link>
      );
    };

    return (
      <div className="relative w-full overflow-hidden">
        <h1 id={headingId} className="sr-only">
          {slide.imageAlt}
        </h1>
        {showCtaOverlay ? (
          <>
            {renderImageLink()}
            <HeroImageOnlyCtaOverlay onWhatsAppClick={openWhatsAppLead} />
          </>
        ) : (
          renderImageLink()
        )}
      </div>
    );
  }

  const HeadingTag = index === 0 ? 'h1' : 'h2';

  return (
    <div className="relative min-h-[min(40vh,16rem)] sm:min-h-[min(44vh,17.5rem)] lg:min-h-[min(46vh,19.5rem)] xl:min-h-[min(48vh,21rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      >
        {(() => {
          const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(slide.backgroundImage);
          return (
            <picture className="absolute inset-0 block size-full">
              <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
              <img
                src={fallbackSrc}
                alt=""
                sizes={sizes}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'low'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 size-full origin-[65%_center] scale-[1.05] object-contain object-[65%_center] lg:scale-[1.12]"
              />
            </picture>
          );
        })()}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15"
      />

      <div className="container relative flex min-h-[inherit] flex-col justify-center py-3 sm:py-4 lg:py-5">
        <div className="relative flex max-w-2xl flex-col items-start gap-2 sm:gap-2.5">
        <span className="-mb-0.5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 pb-0.5 pt-1 text-[0.6875rem] font-bold uppercase leading-none tracking-[0.16em] text-white sm:text-xs">
          <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
          {slide.eyebrow}
        </span>

        <HeadingTag
          id={headingId}
          className="font-hero text-3xl font-bold uppercase leading-[0.92] tracking-normal sm:text-4xl lg:text-5xl xl:text-6xl"
        >
          {slide.titleLines?.map((line) => (
            <span
              key={line.text}
              className={cn('block', line.variant === 'white' ? 'text-white' : 'text-[#FF3333]')}
            >
              {line.text}
            </span>
          ))}
        </HeadingTag>

        <p className="max-w-xl text-xs leading-snug text-white sm:text-sm lg:text-base">
          {slide.subtitle}
        </p>

        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2">
          {slide.trustBadges?.map((badge) => {
            const BadgeIcon = TRUST_ICON_MAP[badge.icon];
            return (
              <li key={badge.title} className="flex items-start gap-2">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9',
                    'border border-white/25 bg-white/10 text-white',
                  )}
                  aria-hidden="true"
                >
                  <BadgeIcon className="size-3.5 sm:size-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-white sm:text-sm">{badge.title}</p>
                  <p className="text-[0.65rem] leading-snug text-white/60 sm:text-xs">{badge.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          {slide.primaryCta?.kind === 'whatsapp' ? (
            <Button
              type="button"
              className="h-10 rounded-md bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all hover:bg-[#20bd5a] focus-visible:ring-[#25D366] focus-visible:ring-offset-black"
              onClick={() => onWhatsAppClick(slide.imageAlt ?? slide.id)}
            >
              <WhatsAppGlyph />
              Cotizar por WhatsApp · {HOME_HERO_WHATSAPP_NUMBER}
            </Button>
          ) : slide.primaryCta?.kind === 'link' ? (
            <Button
              asChild
              className={cn(
                'h-10 rounded-md px-4 text-sm font-semibold text-white focus-visible:ring-offset-black',
                slide.primaryCta.style === 'green'
                  ? 'bg-[#25D366] shadow-[0_0_24px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] focus-visible:ring-[#25D366]'
                  : 'bg-[#FF3333] shadow-[0_0_24px_rgba(255,51,51,0.35)] hover:bg-red-500 focus-visible:ring-red-600',
              )}
            >
              {slide.primaryCta.href.startsWith('http') ? (
                <a href={slide.primaryCta.href} target="_blank" rel="noopener noreferrer">
                  {slide.primaryCta.label}
                </a>
              ) : (
                <Link to={slide.primaryCta.href}>{slide.primaryCta.label}</Link>
              )}
            </Button>
          ) : null}

          {slide.secondaryCta ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-md border-white/25 bg-black/40 px-4 text-sm font-semibold text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-black"
          >
            {slide.secondaryCta.external || slide.secondaryCta.href.startsWith('http') ? (
              <a href={slide.secondaryCta.href} target="_blank" rel="noopener noreferrer">
                {slide.secondaryCta.label.includes('WhatsApp') ? (
                  <WhatsAppGlyph />
                ) : (
                  <ShoppingCart aria-hidden="true" />
                )}
                {slide.secondaryCta.label}
              </a>
            ) : (
              <Link to={slide.secondaryCta.href}>
                <ShoppingCart aria-hidden="true" />
                {slide.secondaryCta.label}
              </Link>
            )}
          </Button>
          ) : null}
        </div>

        {slide.footerNote ? (
        <p className="flex items-center gap-1.5 text-[0.65rem] text-white/55 sm:text-xs">
          <ShieldCheck className="size-3.5 text-red-600 sm:size-4" aria-hidden="true" />
          {slide.footerNote}
        </p>
        ) : null}
        </div>
      </div>
    </div>
  );
}

export function HeroBanner({
  slides = homeHeroSlides,
  headingId = 'hero-titulo',
  autoplayIntervalMs = 7000,
}: {
  slides?: HomeHeroSlide[];
  headingId?: string;
  autoplayIntervalMs?: number;
} = {}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [whatsappCampaign, setWhatsappCampaign] = useState<string | undefined>();
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const showCarouselControls = slides.length > 1;
  const activeSlide = slides[selectedIndex];
  const carouselDotTheme: CarouselDotsTheme =
    activeSlide?.dotTheme ?? (activeSlide?.layout === 'home-landing' ? 'light' : 'dark');

  const openWhatsAppDialog = useCallback((campaign?: string) => {
    setWhatsappCampaign(campaign);
    setWhatsappDialogOpen(true);
  }, []);

  const handleWhatsAppSubmit = async (nextContact: WhatsAppContact) => {
    await saveContact(nextContact);
    const opened = openHeroQuoteWhatsApp(
      nextContact,
      whatsappCampaign ? { campaign: whatsappCampaign } : {},
    );
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
    }
  };

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());

    updateSnaps();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateSnaps);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateSnaps);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || !showCarouselControls) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      emblaApi.scrollNext();
    }, autoplayIntervalMs);

    const onVisibility = () => {
      if (!document.hidden) emblaApi.reInit();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [autoplayIntervalMs, emblaApi, autoplayPaused, showCarouselControls]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  if (slides.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription={showCarouselControls ? 'carrusel' : undefined}
      className="relative w-full leading-none"
      onMouseEnter={pauseAutoplay}
      onFocus={pauseAutoplay}
    >
      <div className="relative w-full">
        <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex">
              {slides.map((slide, index) => (
                <li
                  key={slide.id}
                  className="relative min-w-0 flex-[0_0_100%]"
                  aria-hidden={selectedIndex !== index}
                >
                  <HeroSlideContent
                    slide={slide}
                    index={index}
                    sectionHeadingId={headingId}
                    onWhatsAppClick={openWhatsAppDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
      </div>

      {showCarouselControls ? (
        <CarouselDots
          count={scrollSnaps.length}
          selectedIndex={selectedIndex}
          onSelect={scrollTo}
          ariaLabel="Slides del banner principal"
          theme={carouselDotTheme}
          size="lg"
          className={cn(
            'absolute inset-x-0 z-10 gap-0',
            'bottom-3 sm:bottom-3.5 lg:bottom-4',
          )}
        />
      ) : null}

      {whatsappDialogOpen ? (
        <Suspense fallback={null}>
          <WhatsAppContactDialog
            open={whatsappDialogOpen}
            onOpenChange={setWhatsappDialogOpen}
            initial={contact ?? undefined}
            isSubmitting={isSaving}
            showQuoteCheckbox={false}
            title="Solicitar cotización"
            description="Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para enviar a nuestro equipo de ventas."
            submitLabel="Continuar a WhatsApp"
            onSubmit={async (nextContact) => {
              await handleWhatsAppSubmit(nextContact);
            }}
          />
        </Suspense>
      ) : null}
    </section>
  );
}
