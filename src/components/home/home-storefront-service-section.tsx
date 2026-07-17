import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import {
  HOME_STOREFRONT_SERVICE,
  STOREFRONT_ORANGE,
  type HomeStorefrontServiceCard,
} from '@/data/home-storefront-mockup';
import { cn } from '@/lib/utils';

function ServiceCard({ card }: { card: HomeStorefrontServiceCard }) {
  const Icon = card.icon;

  return (
    <article className="flex h-full flex-col">
      <Link
        to={card.href}
        className="group relative block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
        aria-label={card.title}
      >
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#F3F6FA]">
          <img
            src={card.imageSrc}
            alt={card.imageAlt}
            width={640}
            height={480}
            className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <span
          className="absolute bottom-0 left-4 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_4px_14px_rgba(227,6,19,0.35)] sm:size-12"
          style={{ backgroundColor: STOREFRONT_ORANGE }}
          aria-hidden="true"
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </Link>

      <div className="mt-7 px-0.5 sm:mt-8">
        <h3 className="text-base font-bold leading-snug text-[#111111] sm:text-lg">
          <Link
            to={card.href}
            className="rounded-sm transition-colors hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
          >
            {card.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-[#6B7280]">
          {card.description}
        </p>
      </div>
    </article>
  );
}

export function HomeStorefrontServiceSection() {
  const service = HOME_STOREFRONT_SERVICE;

  return (
    <section aria-labelledby="home-storefront-service-title" className="bg-white">
      <div className="container py-8 sm:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.75fr)] lg:gap-10 xl:gap-12">
          <div className="flex flex-col justify-center lg:max-w-sm lg:pr-2">
            <p
              className="text-[0.6875rem] font-bold uppercase tracking-[0.12em]"
              style={{ color: STOREFRONT_ORANGE }}
            >
              {service.eyebrow}
            </p>
            <h2
              id="home-storefront-service-title"
              className="mt-2 text-balance text-2xl font-bold leading-tight tracking-tight text-[#111111] sm:text-[1.75rem] lg:text-[2rem]"
            >
              {service.title}
            </h2>
            <span
              className="mt-3 block h-1 w-12 rounded-full"
              style={{ backgroundColor: STOREFRONT_ORANGE }}
              aria-hidden="true"
            />
            <p className="mt-4 text-pretty text-sm leading-relaxed text-[#6B7280] sm:text-[0.9375rem]">
              {service.description}
            </p>
            <Link
              to={service.ctaHref}
              className={cn(
                'mt-6 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold uppercase tracking-wide text-white',
                'transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              )}
              style={{ backgroundColor: STOREFRONT_ORANGE }}
            >
              {service.ctaLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ul
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6"
            role="list"
          >
            {service.cards.map((card) => (
              <li key={card.id}>
                <ServiceCard card={card} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
