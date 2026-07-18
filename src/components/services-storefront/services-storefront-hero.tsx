import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Droplets, FileText, Headphones, Printer, Wrench } from 'lucide-react';

import { RentalHeroQuoteCard } from '@/components/rental/rental-hero-quote-card';
import { ServicesSupportHero } from '@/components/services-storefront/services-support-hero';
import { Button } from '@/components/ui/button';
import { getServiceLandingBySlug, type ServiceLandingSlug } from '@/data/service-landings';
import { SERVICES_CATALOG_ID } from '@/data/services-catalog';
import { getServiceHubHeroBanners } from '@/lib/service-hub-heroes';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const RENTAL_HERO_BG = '/promotions/promo-hero-servicio.webp';
const RENTAL_HERO_PRODUCT = '/products/ricoh-im-6010.webp';

const RENTAL_HERO_FEATURES = [
  { id: 'tech', label: 'Equipos de última tecnología', icon: Printer },
  { id: 'maint', label: 'Mantenimiento incluido', icon: Wrench },
  { id: 'toner', label: 'Tóner y repuestos sin costo adicional', icon: Droplets },
  { id: 'support', label: 'Soporte técnico rápido y especializado', icon: Headphones },
] as const;

interface ServicesStorefrontHeroProps {
  section: ServiceLandingSlug;
  className?: string;
}

function ServicesGenericSectionHero({
  section,
  className,
}: {
  section: ServiceLandingSlug;
  className?: string;
}) {
  const landing = getServiceLandingBySlug(section);
  const banner = getServiceHubHeroBanners().find((item) => item.slug === section);
  const whatsappHref = buildHaitechWhatsAppUrl(
    `Hola, vengo desde HaiStore. Me interesa el servicio de ${landing?.metaTitle ?? section}.`,
  );

  const scrollToCatalog = () => {
    document.getElementById(SERVICES_CATALOG_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      aria-labelledby="servicios-storefront-hero-titulo"
      className={cn('relative w-full overflow-hidden', className)}
    >
      <div className="relative">
        <img
          src={banner?.image ?? '/services/landing/hero-servicios.png'}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/88 via-black/70 to-black/50"
          aria-hidden="true"
        />

        <div className="container relative z-10 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="max-w-xl">
            <h1
              id="servicios-storefront-hero-titulo"
              className="text-balance font-hero text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.85rem]"
            >
              {landing?.title}{' '}
              {landing?.titleHighlight ? (
                <span className="text-red-400">{landing.titleHighlight}</span>
              ) : null}
            </h1>
            <p className="mt-2.5 text-pretty text-xs leading-relaxed text-white/85 sm:text-sm">
              {landing?.subtitle ?? banner?.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-white/40 bg-white/95 px-4 text-xs font-semibold text-neutral-950 hover:bg-white sm:h-10 sm:text-sm"
                onClick={scrollToCatalog}
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Ver catálogo
              </Button>
              <Button
                asChild
                className="h-9 gap-1.5 bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 sm:h-10 sm:text-sm"
              >
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Icon
                    path={mdiWhatsapp}
                    size={0.7}
                    className="text-white"
                    aria-hidden="true"
                  />
                  Cotizar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesRentalHero({ className }: { className?: string }) {
  const whatsappHref = buildHaitechWhatsAppUrl(
    'Hola, vengo desde HaiStore. Me interesa cotizar alquiler de equipos.',
  );

  const scrollToCatalog = () => {
    document.getElementById(SERVICES_CATALOG_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      aria-labelledby="servicios-alquiler-hero-titulo"
      className={cn('relative w-full overflow-hidden', className)}
    >
      <div className="relative">
        <img
          src={RENTAL_HERO_BG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[center_30%]"
          fetchPriority="high"
          decoding="async"
        />
        {/* Máscara oscura uniforme + degradado lateral para legibilidad */}
        <div className="pointer-events-none absolute inset-0 bg-black/65" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45"
          aria-hidden="true"
        />

        <div className="container relative z-10 px-4 py-4 sm:px-6 sm:py-5 lg:py-6">
          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-5 xl:gap-6">
            <div className="flex min-w-0 flex-col items-start text-left">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-500 sm:text-sm">
                Alquiler de equipos
              </p>
              <h1
                id="servicios-alquiler-hero-titulo"
                className="mt-1.5 max-w-xl text-balance font-hero text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-[2.35rem] lg:leading-[1.12]"
              >
                Equipos profesionales,{' '}
                <span className="text-red-500">resultados inteligentes.</span>
              </h1>
              <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-white/90 sm:text-base lg:line-clamp-2">
                Alquila fotocopiadoras e impresoras Ricoh con todo incluido. Mantenimiento, tóner y
                soporte técnico durante todo el contrato.
              </p>

              <ul className="mt-3.5 grid w-full max-w-xl grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4 sm:gap-3">
                {RENTAL_HERO_FEATURES.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <li key={feature.id} className="flex flex-col items-start gap-1.5">
                      <FeatureIcon
                        className="size-5 text-red-500 sm:size-6"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="text-xs font-medium leading-snug text-white/90 sm:text-[0.8125rem]">
                        {feature.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
                <Button
                  type="button"
                  className="h-10 gap-1.5 bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 sm:h-11 sm:text-[0.9375rem]"
                  onClick={scrollToCatalog}
                >
                  <FileText className="size-4" aria-hidden="true" />
                  Ver catálogo de equipos
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 gap-1.5 border-white/80 bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-white/95 sm:h-11 sm:text-[0.9375rem]"
                >
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Icon
                      path={mdiWhatsapp}
                      size={0.75}
                      className="text-[#25D366]"
                      aria-hidden="true"
                    />
                    Cotizar por WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[220px] items-end justify-center lg:flex xl:max-w-[250px]">
              <div
                className="pointer-events-none absolute inset-x-6 bottom-2 h-8 rounded-[100%] bg-black/40 blur-xl"
                aria-hidden
              />
              <img
                src={RENTAL_HERO_PRODUCT}
                alt="Multifuncional Ricoh en alquiler"
                className="relative z-[1] max-h-[220px] w-auto object-contain drop-shadow-[0_20px_32px_rgba(0,0,0,0.5)] xl:max-h-[240px]"
                decoding="async"
              />
            </div>

            <div className="flex w-full min-w-0 justify-start lg:justify-end">
              <RentalHeroQuoteCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Hero de /servicios según la sección activa (Alquiler, Soporte, etc.). */
export function ServicesStorefrontHero({ section, className }: ServicesStorefrontHeroProps) {
  const classNameProp = className != null ? { className } : {};
  if (section === 'alquiler') {
    return <ServicesRentalHero {...classNameProp} />;
  }
  if (section === 'servicio-tecnico') {
    return <ServicesSupportHero {...classNameProp} />;
  }
  return <ServicesGenericSectionHero section={section} {...classNameProp} />;
}
