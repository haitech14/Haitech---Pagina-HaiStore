import { Link } from 'react-router-dom';
import { ArrowRight, Check, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  HOME_LANDING_LINKS,
  HOME_LANDING_RENTAL_FEATURES,
  HOME_LANDING_RENTAL_PLANS,
  HOME_LANDING_SERVICE_FEATURES,
  HOME_LANDING_SERVICE_IMAGE,
} from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';
import { formatPenInteger } from '@/lib/pen-pricing';

function ServiceFeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[#111111]">
      <span
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"
        aria-hidden="true"
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      <span>{label}</span>
    </li>
  );
}

function RentalPlanCard({
  plan,
}: {
  plan: (typeof HOME_LANDING_RENTAL_PLANS)[number];
}) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-xl border bg-white px-3 pb-4 pt-5 text-center shadow-[0_2px_12px_rgba(15,31,61,0.06)]',
        plan.popular ? 'border-red-600 shadow-[0_4px_20px_rgba(227,6,19,0.12)]' : 'border-border/50',
      )}
    >
      {plan.popular ? (
        <span className="absolute left-1/2 top-0 z-[1] -translate-x-1/2 -translate-y-1/2 rounded bg-red-600 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white">
          Más popular
        </span>
      ) : null}

      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#111111]">{plan.name}</p>
      <p className="mt-1 text-pretty text-[0.625rem] leading-snug text-[#666666]">{plan.subtitle}</p>

      <div className="mx-auto mt-3 flex h-[4.75rem] w-full items-center justify-center sm:h-20">
        <img
          src={plan.image}
          alt={plan.imageAlt}
          width={136}
          height={80}
          className="max-h-full max-w-[5.5rem] object-contain sm:max-w-[6.5rem]"
          loading="lazy"
        />
      </div>

      <p className="mt-2.5 text-sm leading-none">
        <span className="font-medium text-[#666666]">Desde </span>
        <span className="text-base font-bold text-red-600 sm:text-[1.0625rem]">
          {formatPenInteger(plan.priceFromPen)}
        </span>
        <span className="text-[0.6875rem] font-medium text-[#666666]">/mes</span>
      </p>

      <Button
        asChild
        variant={plan.popular ? 'default' : 'outline'}
        className={cn(
          'mt-3 h-9 w-full rounded-full text-xs font-semibold sm:text-sm',
          plan.popular
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'border-red-600 bg-white text-red-600 hover:bg-red-50',
        )}
      >
        <Link to={plan.href}>Cotizar plan</Link>
      </Button>
    </article>
  );
}

export function HomeServiceRentalSection() {
  return (
    <section
      aria-labelledby="home-service-rental-title"
      className="home-landing-sans bg-[#F5F5F5]"
    >
      <div className="container py-8 sm:py-10 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <article className="overflow-hidden rounded-xl border border-border/40 bg-white shadow-[0_4px_18px_rgba(15,31,61,0.06)]">
            <div className="grid md:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)]">
              <div className="relative min-h-[12rem] md:min-h-[22rem]">
                <img
                  src={HOME_LANDING_SERVICE_IMAGE}
                  alt="Técnico especializado realizando mantenimiento a un equipo de impresión"
                  width={480}
                  height={420}
                  className="size-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-7">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-red-600 sm:text-xs">
                  Servicio técnico especializado
                </p>
                <h2
                  id="home-service-rental-title"
                  className="home-section-title mt-2 text-balance text-xl font-bold leading-tight text-[#111111] sm:text-[1.375rem]"
                >
                  Mantenimiento y reparación para el mejor rendimiento
                </h2>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-[#666666]">
                  Diagnóstico, mantenimiento preventivo y reparación con técnicos certificados y repuestos
                  originales para mantener tu operación sin interrupciones.
                </p>

                <ul className="mt-4 space-y-2.5">
                  {HOME_LANDING_SERVICE_FEATURES.map((feature) => (
                    <ServiceFeatureItem key={feature} label={feature} />
                  ))}
                </ul>

                <Button
                  asChild
                  className="mt-5 h-11 w-full rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <Link
                    to={HOME_LANDING_LINKS.technicalService}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <Wrench className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    <span>Solicitar servicio técnico</span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          <article>
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-red-600 sm:text-xs">
              Alquileres para oficinas y negocios
            </p>
            <h3 className="home-section-title mt-2 text-balance text-xl font-bold leading-tight text-[#111111] sm:text-[1.375rem]">
              Soluciones flexibles que se adaptan a ti
            </h3>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-[#666666]">
              Planes mensuales con equipos, mantenimiento y consumibles incluidos para empresas que buscan
              controlar costos sin sacrificar productividad.
            </p>

            <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-2.5">
              {HOME_LANDING_RENTAL_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.id} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-2.5 sm:text-left">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-red-600 text-red-600"
                      aria-hidden="true"
                    >
                      <Icon className="size-3.5" strokeWidth={1.75} fill="none" />
                    </span>
                    <span className="min-w-0 text-pretty text-[0.625rem] font-semibold leading-snug text-[#111111] sm:text-xs">
                      {feature.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:mt-6 sm:gap-3">
              {HOME_LANDING_RENTAL_PLANS.map((plan) => (
                <RentalPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
