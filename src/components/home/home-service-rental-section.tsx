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
  HOME_LANDING_RENTAL_FOOTER,
  HOME_LANDING_RENTAL_PLANS,
  HOME_LANDING_RENTAL_TITLE,
  HOME_LANDING_SERVICE_DESCRIPTION,
  HOME_LANDING_SERVICE_EYEBROW,
  HOME_LANDING_SERVICE_FEATURES,
  HOME_LANDING_SERVICE_HIGHLIGHTS,
  HOME_LANDING_SERVICE_IMAGE,
  HOME_LANDING_SERVICE_TITLE,
  HOME_LANDING_SERVICE_TRUST_ITEMS,
  HOME_LANDING_SERVICE_WHATSAPP_MESSAGE,
} from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';
import { formatPenInteger } from '@/lib/pen-pricing';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const serviceWhatsAppUrl = buildHaitechWhatsAppUrl(HOME_LANDING_SERVICE_WHATSAPP_MESSAGE);

const BRAND_RED = '#E30613';

function ServiceFeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-[#1A1A1A] sm:text-sm">
      <span
        className="mt-0.5 flex size-[1.125rem] shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: BRAND_RED }}
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
        'relative flex h-full flex-col overflow-hidden rounded-xl bg-white pb-5 text-center shadow-[0_2px_12px_rgba(15,31,61,0.06)]',
        plan.popular
          ? 'border-2 border-[#E30613] shadow-[0_4px_20px_rgba(227,6,19,0.14)]'
          : 'border border-[#E5E7EB]',
      )}
    >
      {plan.popular ? (
        <span
          className="absolute left-1/2 top-0 z-[1] -translate-x-1/2 -translate-y-1/2 rounded px-3 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white sm:text-xs"
          style={{ backgroundColor: BRAND_RED }}
        >
          Popular
        </span>
      ) : null}

      <div className="flex h-36 w-full items-center justify-center overflow-hidden bg-[#F7F7F7] sm:h-40">
        <img
          src={plan.image}
          alt={plan.imageAlt}
          width={320}
          height={200}
          loading="lazy"
          className="size-full object-contain object-center p-3"
        />
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-4 sm:px-4 sm:pt-5">
        <p className="text-[0.8125rem] font-bold leading-snug text-[#111111] sm:text-sm">
          {plan.name}
        </p>
        <p className="mt-2.5 text-sm leading-none sm:mt-3">
          <span className="font-medium text-[#666666]">Desde </span>
          <span className="text-lg font-bold tabular-nums sm:text-xl" style={{ color: BRAND_RED }}>
            {formatPenInteger(plan.priceFromPen)}
          </span>
          <span className="text-xs font-medium text-[#666666]"> /mes</span>
        </p>
        <p className="mt-2.5 text-pretty text-xs leading-snug text-[#666666] sm:mt-3">
          {plan.subtitle}
        </p>

        <Button
          asChild
          variant={plan.popular ? 'default' : 'outline'}
          className={cn(
            'mt-auto h-10 w-full rounded-full text-xs font-semibold sm:mt-4 sm:text-sm',
            plan.popular
              ? 'bg-[#E30613] text-white hover:bg-[#c50511]'
              : 'border-[#E30613] bg-white text-[#E30613] hover:bg-red-50',
          )}
        >
          <Link to={plan.href}>Cotizar plan</Link>
        </Button>
      </div>
    </article>
  );
}

export function HomeServiceRentalSection() {
  const mid = Math.ceil(HOME_LANDING_SERVICE_FEATURES.length / 2);
  const featureColLeft = HOME_LANDING_SERVICE_FEATURES.slice(0, mid);
  const featureColRight = HOME_LANDING_SERVICE_FEATURES.slice(mid);

  return (
    <section
      aria-labelledby="home-service-rental-title"
      className="home-landing-sans bg-[#F5F5F5]"
    >
      <div className="container space-y-6 py-8 sm:space-y-8 sm:py-10 lg:py-12">
        {/* —— Soporte técnico —— */}
        <article className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_8px_28px_rgba(15,31,61,0.07)]">
          <div className="grid lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.35fr)_minmax(11rem,0.7fr)]">
            <div className="relative min-h-[14rem] sm:min-h-[18rem] lg:min-h-0">
              <img
                src={HOME_LANDING_SERVICE_IMAGE}
                alt="Técnico certificado realizando mantenimiento a un equipo de impresión"
                width={520}
                height={560}
                className="absolute inset-0 size-full object-cover object-center"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
              <p
                className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] sm:text-xs"
                style={{ color: BRAND_RED }}
              >
                <ShieldEyebrowIcon />
                {HOME_LANDING_SERVICE_EYEBROW}
              </p>

              <h2
                id="home-service-rental-title"
                className="home-section-title mt-2.5 text-balance text-[1.375rem] font-bold leading-[1.2] text-[#111111] sm:text-[1.625rem] lg:text-[1.75rem]"
              >
                {HOME_LANDING_SERVICE_TITLE.lead}{' '}
                <span style={{ color: BRAND_RED }}>{HOME_LANDING_SERVICE_TITLE.accent}</span>
              </h2>

              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-[#444444] sm:text-[0.9375rem]">
                {HOME_LANDING_SERVICE_DESCRIPTION}
              </p>

              <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <ul className="space-y-3">
                  {featureColLeft.map((feature) => (
                    <ServiceFeatureItem key={feature} label={feature} />
                  ))}
                </ul>
                <ul className="space-y-3">
                  {featureColRight.map((feature) => (
                    <ServiceFeatureItem key={feature} label={feature} />
                  ))}
                </ul>
              </div>

              <Button
                asChild
                className="mt-6 h-12 w-full rounded-full px-5 text-sm font-semibold text-white hover:brightness-95 sm:w-auto sm:min-w-[20rem]"
                style={{ backgroundColor: BRAND_RED }}
              >
                <a
                  href={serviceWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Icon path={mdiWhatsapp} size={0.9} className="text-white" aria-hidden="true" />
                  <span>Solicitar diagnóstico por WhatsApp</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </Button>

              <ul className="mt-5 flex flex-wrap items-center gap-x-0 gap-y-2 text-[0.6875rem] text-[#6B7280] sm:text-xs">
                {HOME_LANDING_SERVICE_TRUST_ITEMS.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <li key={item.id} className="flex items-center">
                      {index > 0 ? (
                        <span
                          className="mx-2.5 hidden h-3.5 w-px bg-[#D1D5DB] sm:mx-3 sm:block"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <ItemIcon className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-[#EEEEEE] p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-5">
              <ul className="grid h-full grid-cols-2 gap-3 sm:gap-3.5">
                {HOME_LANDING_SERVICE_HIGHLIGHTS.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-2.5 py-4 text-center sm:py-5"
                    >
                      <span
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(15,31,61,0.08)]"
                        style={{ color: BRAND_RED }}
                        aria-hidden="true"
                      >
                        <ItemIcon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-pretty text-[0.6875rem] font-semibold leading-snug text-[#111111] sm:text-xs">
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </article>

        {/* —— Alquiler de equipos —— */}
        <article
          aria-labelledby="home-rental-title"
          className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_8px_28px_rgba(15,31,61,0.07)]"
        >
          <div className="px-5 pb-2 pt-7 text-center sm:px-8 sm:pt-8 lg:px-10">
            <p
              className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] sm:text-xs"
              style={{ color: BRAND_RED }}
            >
              {HOME_LANDING_RENTAL_EYEBROW}
            </p>
            <h3
              id="home-rental-title"
              className="home-section-title mt-2 text-balance text-[1.375rem] font-bold leading-tight text-[#111111] sm:text-[1.625rem] lg:text-[1.75rem]"
            >
              {HOME_LANDING_RENTAL_TITLE}
            </h3>
            <p className="mx-auto mt-2.5 max-w-2xl text-pretty text-sm leading-relaxed text-[#666666]">
              {HOME_LANDING_RENTAL_DESCRIPTION}
            </p>
          </div>

          <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(12rem,0.85fr)_minmax(0,2.4fr)] lg:items-stretch lg:gap-8 lg:px-10 lg:pb-8 lg:pt-5">
            <div className="flex flex-col justify-center gap-5 lg:pr-2">
              <ul className="space-y-4">
                {HOME_LANDING_RENTAL_FEATURES.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <li key={feature.id} className="flex items-center gap-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F8F8F8]"
                        style={{ color: BRAND_RED }}
                        aria-hidden="true"
                      >
                        <FeatureIcon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-pretty text-sm font-semibold leading-snug text-[#111111]">
                        {feature.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Button
                asChild
                className="h-11 w-full rounded-full px-5 text-sm font-semibold text-white hover:brightness-95 sm:w-fit"
                style={{ backgroundColor: BRAND_RED }}
              >
                <Link to={HOME_LANDING_LINKS.rentalCatalog} className="inline-flex items-center gap-2">
                  Ver todos los equipos
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3.5 lg:gap-4">
              {HOME_LANDING_RENTAL_PLANS.map((plan) => (
                <RentalPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>

          <div className="border-t border-[#EEEEEE] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {HOME_LANDING_RENTAL_FOOTER.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2.5 px-1 text-left sm:justify-center sm:px-3 sm:text-center',
                      index > 0 && 'lg:border-l lg:border-[#E5E7EB]',
                    )}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center"
                      style={{ color: BRAND_RED }}
                      aria-hidden="true"
                    >
                      <ItemIcon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-pretty text-[0.6875rem] font-medium leading-snug text-[#4B5563] sm:text-xs">
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

function ShieldEyebrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1.2 2.5 3.4v4.1c0 3.35 2.2 5.9 5.5 7.1 3.3-1.2 5.5-3.75 5.5-7.1V3.4L8 1.2Zm0 2.05 3.9 1.5v2.75c0 2.25-1.4 4.05-3.9 5.05-2.5-1-3.9-2.8-3.9-5.05V4.75L8 3.25Z" />
      <path d="M7.15 9.9 5.2 7.95l.85-.85 1.1 1.1 2.55-2.55.85.85-3.4 3.4Z" />
    </svg>
  );
}
