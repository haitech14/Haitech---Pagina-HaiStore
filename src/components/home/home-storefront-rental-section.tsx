import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import {
  HOME_STOREFRONT_RENTAL,
  STOREFRONT_BLUE,
  type HomeStorefrontRentalPlan,
} from '@/data/home-storefront-mockup';
import { cn } from '@/lib/utils';

const TONE_CLASS: Record<HomeStorefrontRentalPlan['tone'], string> = {
  blue: 'bg-[#F3F8FF]',
  mint: 'bg-[#F1FAF5]',
  peach: 'bg-[#FFF6F0]',
};

function RentalPlanCard({ plan }: { plan: HomeStorefrontRentalPlan }) {
  return (
    <article
      className={cn(
        'relative flex min-h-[11.5rem] overflow-hidden rounded-2xl border border-[#E6EAF0] p-5 sm:min-h-[12.5rem] sm:p-6',
        TONE_CLASS[plan.tone],
      )}
    >
      <div className="relative z-[1] flex max-w-[58%] flex-col">
        <h3 className="text-lg font-bold text-[#111111] sm:text-xl">{plan.title}</h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-[#5B6470]">{plan.description}</p>
        <Link
          to={plan.href}
          className={cn(
            'mt-auto inline-flex h-9 w-fit items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white',
            'transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          style={{ backgroundColor: STOREFRONT_BLUE }}
        >
          Ver planes
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <img
        src={plan.imageSrc}
        alt={plan.imageAlt}
        width={220}
        height={180}
        className="pointer-events-none absolute bottom-0 right-[-4%] h-[78%] w-auto max-w-[48%] object-contain object-bottom drop-shadow-[0_8px_18px_rgba(15,31,61,0.12)]"
        loading="lazy"
        decoding="async"
      />
    </article>
  );
}

export function HomeStorefrontRentalSection() {
  const rental = HOME_STOREFRONT_RENTAL;

  return (
    <section aria-labelledby="home-storefront-rental-title" className="bg-white">
      <div className="container pb-10 pt-2 sm:pb-12 sm:pt-3">
        <div className="mb-6 text-center">
          <h2
            id="home-storefront-rental-title"
            className="text-2xl font-bold tracking-tight sm:text-[1.75rem]"
            style={{ color: STOREFRONT_BLUE }}
          >
            {rental.title}
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280] sm:text-base">{rental.subtitle}</p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3" role="list">
          {rental.plans.map((plan) => (
            <li key={plan.id}>
              <RentalPlanCard plan={plan} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
