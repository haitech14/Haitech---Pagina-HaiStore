import { servicesLandingServiceCards } from '@/data/services-landing';
import { ServicesLandingServiceCardTile } from '@/components/service-landing/landing/services-landing-service-card';
import { cn } from '@/lib/utils';

interface ServicesLandingServicesGridProps {
  className?: string;
}

export function ServicesLandingServicesGrid({ className }: ServicesLandingServicesGridProps) {
  return (
    <section
      aria-labelledby="servicios-landing-servicios-titulo"
      className={cn('bg-muted/20 py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-primary sm:text-sm">
            Nuestros servicios
          </p>
          <h2
            id="servicios-landing-servicios-titulo"
            className="mt-2 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl"
          >
            Servicios que impulsan tu operación
          </h2>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-6">
          {servicesLandingServiceCards.map((card) => (
            <li key={card.slug} className="min-w-0">
              <ServicesLandingServiceCardTile card={card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
