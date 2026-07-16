import { Link } from 'react-router-dom';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  HOME_LANDING_LINKS,
  HOME_LANDING_RENTAL_DESCRIPTION,
  HOME_LANDING_RENTAL_EYEBROW,
  HOME_LANDING_RENTAL_FEATURES,
  HOME_LANDING_RENTAL_TITLE,
  HOME_LANDING_SERVICE_DESCRIPTION,
  HOME_LANDING_SERVICE_EYEBROW,
  HOME_LANDING_SERVICE_FEATURES,
  HOME_LANDING_SERVICE_IMAGE,
  HOME_LANDING_SERVICE_TITLE,
  HOME_LANDING_SERVICE_WHATSAPP_MESSAGE,
} from '@/data/home-landing-sections';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const serviceWhatsAppUrl = buildHaitechWhatsAppUrl(HOME_LANDING_SERVICE_WHATSAPP_MESSAGE);

const BRAND_RED = '#E30613';

const SERVICE_FEATURES_COMPACT = HOME_LANDING_SERVICE_FEATURES.slice(0, 4);
const RENTAL_FEATURES_COMPACT = HOME_LANDING_RENTAL_FEATURES.slice(0, 3);

const SERVICE_GALLERY_IMAGES = [
  {
    id: 'tecnico',
    src: HOME_LANDING_SERVICE_IMAGE,
    alt: 'Técnico certificado en mantenimiento de equipos de impresión',
  },
  {
    id: 'preventivo',
    src: '/services/servicio-tecnico/preventivo.png',
    alt: 'Mantenimiento preventivo en taller',
  },
  {
    id: 'entrega',
    src: '/clients/recommendations/cliente-entrega-combobox-pro.png',
    alt: 'Entrega e instalación de equipos en oficina',
  },
  {
    id: 'correctivo',
    src: '/services/servicio-tecnico/correctivo.png',
    alt: 'Reparación correctiva con repuestos',
  },
] as const;

function CompactFeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 text-[0.8125rem] leading-snug text-[#1A1A1A] sm:text-sm">
      <span
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: BRAND_RED }}
        aria-hidden="true"
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      <span>{label}</span>
    </li>
  );
}

export function HomeServiceRentalSection() {
  return (
    <section
      aria-labelledby="home-service-rental-title"
      className="home-landing-sans bg-[#F5F5F5]"
    >
      <div className="container py-6 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {/* —— Soporte técnico —— */}
          <article className="flex flex-col rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,31,61,0.06)] sm:p-6">
            <p
              className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] sm:text-xs"
              style={{ color: BRAND_RED }}
            >
              {HOME_LANDING_SERVICE_EYEBROW}
            </p>

            <h2
              id="home-service-rental-title"
              className="home-section-title mt-2 text-balance text-lg font-bold leading-snug text-[#111111] sm:text-xl"
            >
              {HOME_LANDING_SERVICE_TITLE.lead}{' '}
              <span style={{ color: BRAND_RED }}>{HOME_LANDING_SERVICE_TITLE.accent}</span>
            </h2>

            <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-[#555555]">
              {HOME_LANDING_SERVICE_DESCRIPTION}
            </p>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {SERVICE_FEATURES_COMPACT.map((feature) => (
                <CompactFeatureItem key={feature} label={feature} />
              ))}
            </ul>

            <Button
              asChild
              className="mt-auto h-11 w-full rounded-full text-sm font-semibold text-white hover:brightness-95"
              style={{ backgroundColor: BRAND_RED }}
            >
              <a
                href={serviceWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2"
              >
                <Icon path={mdiWhatsapp} size={0.85} className="text-white" aria-hidden="true" />
                <span>Solicitar diagnóstico</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </Button>
          </article>

          {/* —— Alquiler —— */}
          <article
            aria-labelledby="home-rental-title"
            className="flex flex-col rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,31,61,0.06)] sm:p-6"
          >
            <p
              className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] sm:text-xs"
              style={{ color: BRAND_RED }}
            >
              {HOME_LANDING_RENTAL_EYEBROW}
            </p>

            <h3
              id="home-rental-title"
              className="home-section-title mt-2 text-balance text-lg font-bold leading-snug text-[#111111] sm:text-xl"
            >
              {HOME_LANDING_RENTAL_TITLE}
            </h3>

            <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-[#555555]">
              {HOME_LANDING_RENTAL_DESCRIPTION}
            </p>

            <ul className="mt-4 space-y-2">
              {RENTAL_FEATURES_COMPACT.map((feature) => (
                <CompactFeatureItem key={feature.id} label={feature.label} />
              ))}
            </ul>

            <Button
              asChild
              variant="outline"
              className="mt-auto h-11 w-full rounded-full border-[#E30613] text-sm font-semibold text-[#E30613] hover:bg-red-50"
            >
              <Link to={HOME_LANDING_LINKS.rentalCatalog} className="inline-flex items-center gap-2">
                Ver equipos en alquiler
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </Button>
          </article>

          {/* —— Tercera parte: galería de imágenes —— */}
          <article
            aria-labelledby="home-service-gallery-title"
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_4px_18px_rgba(15,31,61,0.06)]"
          >
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <p
                className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] sm:text-xs"
                style={{ color: BRAND_RED }}
              >
                En acción
              </p>
              <h3
                id="home-service-gallery-title"
                className="home-section-title mt-2 text-balance text-lg font-bold leading-snug text-[#111111] sm:text-xl"
              >
                Servicio y entregas{' '}
                <span style={{ color: BRAND_RED }}>reales</span>
              </h3>
            </div>

            <div className="mt-4 grid flex-1 grid-cols-2 gap-1.5 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4">
              {SERVICE_GALLERY_IMAGES.map((image, index) => (
                <div
                  key={image.id}
                  className={
                    index === 0
                      ? 'relative col-span-2 aspect-[16/9] overflow-hidden rounded-xl'
                      : 'relative aspect-[4/3] overflow-hidden rounded-xl'
                  }
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={index === 0 ? 640 : 320}
                    height={index === 0 ? 360 : 240}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-full border-[#E30613] text-sm font-semibold text-[#E30613] hover:bg-red-50"
              >
                <Link
                  to={HOME_LANDING_LINKS.technicalService}
                  className="inline-flex items-center gap-2"
                >
                  Ver servicio técnico
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
