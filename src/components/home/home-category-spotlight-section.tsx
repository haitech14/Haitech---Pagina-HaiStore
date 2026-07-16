import { Link } from 'react-router-dom';
import { Check, ChevronRight, Printer } from 'lucide-react';

import type {
  HomeCategorySpotlightConfig,
  HomeSpotlightFeaturedCard,
  HomeSpotlightThumbCard,
} from '@/data/home-category-spotlights';
import { cn } from '@/lib/utils';

const ACCENT = '#E30613';

function FeaturedCard({ card }: { card: HomeSpotlightFeaturedCard }) {
  const features = card.features?.slice(0, 3) ?? [];

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white',
        'shadow-[0_4px_20px_rgba(15,31,61,0.06)] sm:min-h-[15rem] sm:flex-row',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <p
          className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem] lg:text-[2rem]"
          style={{ color: ACCENT }}
        >
          {card.model}
        </p>
        <p className="mt-1 text-sm font-medium text-[#4b5563] sm:text-[0.9375rem]">{card.subtitle}</p>

        {features.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-xs text-[#374151] sm:text-sm">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 sm:size-4"
                  style={{ color: ACCENT }}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          to={card.href}
          className={cn(
            'mt-4 inline-flex h-9 w-fit items-center gap-1 rounded-md px-3.5 text-xs font-bold text-white sm:h-10 sm:px-4 sm:text-sm',
            'transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          style={{ backgroundColor: ACCENT }}
        >
          Más información
          <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-[42%]">
        <div
          className="absolute left-1/2 top-1/2 size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(227,6,19,0.14) 0%, rgba(227,6,19,0.06) 45%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <img
          src={card.image}
          alt={card.imageAlt}
          className="relative z-[1] size-full object-contain object-center p-3 sm:p-4 lg:p-5"
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  );
}

function ThumbCard({ card }: { card: HomeSpotlightThumbCard }) {
  return (
    <Link
      to={card.href}
      className={cn(
        'group relative flex aspect-[5/4] flex-col overflow-hidden rounded-xl border border-[#e8e8e8] bg-white',
        'shadow-[0_2px_12px_rgba(15,31,61,0.05)] transition-shadow hover:shadow-[0_4px_18px_rgba(15,31,61,0.1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
      aria-label={`${card.model} ${card.brand}`}
    >
      <p className="relative z-10 px-2.5 pt-2.5 text-[0.6875rem] font-bold leading-tight sm:px-3 sm:pt-3 sm:text-xs">
        <span style={{ color: ACCENT }}>{card.model}</span>
        <span className="text-[#111111]"> | {card.brand}</span>
      </p>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3 pt-1">
        <img
          src={card.image}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        {card.badgeImage ? (
          <img
            src={card.badgeImage}
            alt=""
            className="absolute bottom-2 right-2 size-12 object-contain sm:size-14"
            loading="lazy"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </Link>
  );
}

export function HomeCategorySpotlightSection({
  config,
  className,
}: {
  config: HomeCategorySpotlightConfig;
  className?: string;
}) {
  const titleId = `home-spotlight-${config.id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn('home-landing-sans bg-white py-6 sm:py-8', className)}
    >
      <div className="container">
        <header className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12"
            style={{ backgroundColor: ACCENT }}
            aria-hidden="true"
          >
            <Printer className="size-5 text-white sm:size-6" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl font-extrabold tracking-wide sm:text-2xl"
              style={{ color: ACCENT }}
            >
              {config.title}
            </h2>
            <p className="mt-0.5 text-sm text-[#555555] sm:text-[0.9375rem]">{config.sectionSubtitle}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {config.featured.map((card) => (
            <FeaturedCard key={card.id} card={card} />
          ))}
        </div>

        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:grid-cols-4 sm:gap-3" role="list">
          {config.thumbs.map((card) => (
            <li key={card.id} className="min-w-0">
              <ThumbCard card={card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
