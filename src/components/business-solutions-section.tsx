import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

import { promoCards, type PromoCard } from '@/data/business-solutions';
import { cn } from '@/lib/utils';

function PromoCardButton({
  label,
  variant,
  href,
}: {
  label: string;
  variant: PromoCard['buttonVariant'];
  href: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variant === 'red' &&
          'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600 focus-visible:ring-offset-[#0a1628]',
        variant === 'navy' &&
          'bg-[#0d1b2e] text-white hover:bg-[#152238] focus-visible:ring-[#0d1b2e] focus-visible:ring-offset-white',
      )}
    >
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function DarkWavePattern() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f2038] via-[#0a1628] to-[#060d18]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-0 size-64 rounded-full bg-[#1a3050]/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-[#0f2848]/50 blur-3xl"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full opacity-[0.07]"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
      >
        <path
          d="M0,180 C80,120 160,220 260,160 C340,110 380,140 400,100 L400,300 L0,300 Z"
          fill="white"
        />
        <path
          d="M0,220 C100,160 200,260 320,200 C360,175 390,190 400,170 L400,300 L0,300 Z"
          fill="white"
          opacity="0.6"
        />
      </svg>
    </>
  );
}

function B2bPromoCard({ card }: { card: PromoCard }) {
  return (
    <article className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.45)] sm:min-h-[24rem] lg:min-h-0 lg:h-[19.5rem]">
      <DarkWavePattern />

      <div className="relative flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6 lg:max-w-[58%] lg:p-7">
          <div>
            <h3 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="mt-2 text-base font-semibold text-white/90 sm:text-lg">
                {card.subtitle}
              </p>
            )}
            {card.features && (
              <ul className="mt-5 space-y-2.5">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/90">
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-600"
                      aria-hidden="true"
                    >
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <PromoCardButton label={card.buttonLabel} variant={card.buttonVariant} href={card.href} />
        </div>

        <div className="relative flex items-end justify-center px-4 pb-0 pt-2 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[48%] lg:px-0 lg:pt-0">
          <img
            src={card.image}
            alt={card.imageAlt}
            className="max-h-44 w-auto object-contain object-bottom sm:max-h-52 lg:absolute lg:bottom-0 lg:right-0 lg:max-h-none lg:h-full lg:w-full lg:object-cover lg:object-right-bottom"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  );
}

function ServicePromoCard({ card }: { card: PromoCard }) {
  return (
    <article className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:min-h-[24rem] lg:min-h-0 lg:h-[19.5rem]">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6 lg:max-w-[55%] lg:p-7">
          <div>
            <h3 className="text-balance text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {card.title}
            </h3>
            {card.description && (
              <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {card.description}
              </p>
            )}
          </div>
          <PromoCardButton label={card.buttonLabel} variant={card.buttonVariant} href={card.href} />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] bg-gradient-to-r from-white via-white/80 to-transparent lg:block"
        />
        <div className="relative h-44 shrink-0 sm:h-52 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[58%]">
          <img
            src={card.image}
            alt={card.imageAlt}
            className="size-full object-cover object-right"
            loading="lazy"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white to-transparent lg:w-2/5"
          />
        </div>
      </div>
    </article>
  );
}

function OffersPromoCard({ card }: { card: PromoCard }) {
  return (
    <article className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.45)] sm:min-h-[24rem] lg:min-h-0 lg:h-[19.5rem]">
      <DarkWavePattern />

      <div className="relative flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6 lg:max-w-[58%] lg:p-7">
          <div>
            <h3 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
              {card.title}
            </h3>
            {card.description && (
              <p className="mt-4 text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
                {card.description}
              </p>
            )}
          </div>
          <PromoCardButton label={card.buttonLabel} variant={card.buttonVariant} href={card.href} />
        </div>

        <div className="relative flex items-center justify-center px-4 pb-4 pt-2 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[48%] lg:items-end lg:justify-end lg:p-0">
          <img
            src={card.image}
            alt={card.imageAlt}
            className="max-h-40 w-auto object-contain sm:max-h-48 lg:absolute lg:bottom-0 lg:right-0 lg:max-h-none lg:h-full lg:w-full lg:object-cover lg:object-center"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  );
}

function PromoCardItem({ card }: { card: PromoCard }) {
  switch (card.variant) {
    case 'dark-b2b':
      return <B2bPromoCard card={card} />;
    case 'light-service':
      return <ServicePromoCard card={card} />;
    case 'dark-offers':
      return <OffersPromoCard card={card} />;
  }
}

export function BusinessSolutionsSection() {
  return (
    <section aria-labelledby="promo-cards-titulo" className="bg-background py-10 sm:py-12 lg:py-14">
      <h2 id="promo-cards-titulo" className="sr-only">
        Soluciones, servicio técnico y ofertas
      </h2>
      <div className="container">
        <ul className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:auto-rows-fr lg:items-stretch lg:gap-5 xl:gap-6">
          {promoCards.map((card) => (
            <li key={card.id} className="h-full">
              <PromoCardItem card={card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
