import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { servicesLandingSpaces } from '@/data/services-landing';
import { cn } from '@/lib/utils';

interface ServicesLandingSpacesSectionProps {
  className?: string;
}

export function ServicesLandingSpacesSection({ className }: ServicesLandingSpacesSectionProps) {
  return (
    <section
      aria-labelledby="servicios-landing-espacios-titulo"
      className={cn('bg-white py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary sm:text-sm">
              {servicesLandingSpaces.eyebrow}
            </p>
            <h2
              id="servicios-landing-espacios-titulo"
              className="mt-2 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl"
            >
              {servicesLandingSpaces.title}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {servicesLandingSpaces.description}
            </p>

            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {servicesLandingSpaces.amenities.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <li
                    key={amenity.id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-[#0f1f3d] sm:text-sm"
                  >
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    {amenity.label}
                  </li>
                );
              })}
            </ul>

            <ul className="mt-4 flex flex-wrap gap-2">
              {servicesLandingSpaces.capacities.map((capacity) => (
                <li
                  key={capacity}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm"
                >
                  {capacity}
                </li>
              ))}
            </ul>

            <Link
              to={servicesLandingSpaces.ctaHref}
              className={cn(
                'mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground',
                'transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {servicesLandingSpaces.ctaLabel}
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-[0_12px_40px_-24px_rgba(15,31,61,0.35)]">
            <img
              src={servicesLandingSpaces.image}
              alt={servicesLandingSpaces.imageAlt}
              className="aspect-[4/3] size-full object-cover object-center lg:aspect-[16/11]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
