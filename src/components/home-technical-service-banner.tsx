import { Link } from 'react-router-dom';
import { Clock, Cog, UserCheck, Wrench } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { Button } from '@/components/ui/button';
import { serviceHubPath } from '@/lib/service-hub';
import { buildHaibotWhatsAppUrl } from '@/lib/haibot-messages';
import { cn } from '@/lib/utils';

const TECH_SERVICE_IMAGE = '/promo-cards/technician-service.webp';
const TECH_SERVICE_WHATSAPP_URL = buildHaibotWhatsAppUrl('schedule-service');

const FEATURES = [
  { id: 'rapida', label: 'Atención rápida', icon: Clock },
  { id: 'certificados', label: 'Técnicos certificados', icon: UserCheck },
  { id: 'repuestos', label: 'Repuestos originales', icon: Cog },
] as const;

export function HomeTechnicalServiceBanner() {
  return (
    <section aria-labelledby="home-servicio-tecnico-titulo" className="py-6 sm:py-8">
      <div className="container">
        <div
          className={cn(
            'overflow-hidden rounded-2xl border border-border/60',
            'bg-gradient-to-r from-neutral-100 via-white to-neutral-50',
            'shadow-[0_4px_24px_rgba(15,31,61,0.08)]',
          )}
        >
          <div className="flex flex-col lg:min-h-[13.5rem] lg:flex-row lg:items-stretch">
            <div className="relative h-44 shrink-0 sm:h-52 lg:h-auto lg:w-[30%] xl:w-[28%]">
              <img
                src={TECH_SERVICE_IMAGE}
                alt="Técnico especializado reparando un equipo de impresión"
                width={480}
                height={360}
                className="size-full object-cover object-center"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent lg:from-white/25"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-6 lg:p-7 xl:gap-8">
              <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                <span
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-md sm:size-16"
                  aria-hidden="true"
                >
                  <Wrench className="size-7 sm:size-8" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 space-y-2">
                  <h2
                    id="home-servicio-tecnico-titulo"
                    className="text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl lg:text-[1.35rem]"
                  >
                    Servicio técnico especializado
                  </h2>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                    Diagnóstico, mantenimiento y reparación de equipos de impresión. Técnicos
                    certificados y repuestos originales.
                  </p>
                  <Link
                    to={serviceHubPath('servicio-tecnico')}
                    className="inline-flex text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  >
                    Ver servicios técnicos
                  </Link>
                </div>
              </div>

              <ul className="flex shrink-0 flex-col gap-3 sm:gap-3.5 lg:min-w-[11rem] xl:min-w-[12.5rem]">
                {FEATURES.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <li key={feature.id} className="flex items-center gap-2.5">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-600/25 bg-red-50 text-red-600"
                        aria-hidden="true"
                      >
                        <FeatureIcon className="size-4" strokeWidth={1.75} />
                      </span>
                      <span className="text-sm font-semibold text-[#0f1f3d]">{feature.label}</span>
                    </li>
                  );
                })}
              </ul>

              <aside
                className="shrink-0 rounded-xl border border-border/50 bg-white p-4 shadow-[0_8px_28px_rgba(15,31,61,0.1)] sm:p-5 lg:w-[15.5rem] xl:w-[16.5rem]"
                aria-label="Contacto por WhatsApp"
              >
                <p className="text-base font-bold text-[#0f1f3d]">¿Necesitas ayuda?</p>
                <p className="mt-1 text-sm text-muted-foreground">Contáctanos por WhatsApp</p>
                <Button
                  asChild
                  className="mt-4 h-11 w-full rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
                >
                  <a href={TECH_SERVICE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
                    Chatear por WhatsApp
                  </a>
                </Button>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
