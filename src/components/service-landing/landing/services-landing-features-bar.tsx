import { servicesLandingFeatures } from '@/data/services-landing';
import { cn } from '@/lib/utils';

interface ServicesLandingFeaturesBarProps {
  className?: string;
}

export function ServicesLandingFeaturesBar({ className }: ServicesLandingFeaturesBarProps) {
  return (
    <section aria-label="Beneficios de nuestros servicios" className={cn('bg-white py-8 sm:py-10', className)}>
      <div className="container px-4 sm:px-6">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {servicesLandingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.id} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span
                  className="flex size-12 items-center justify-center rounded-full border-2 border-primary/25 bg-primary/5 text-primary"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="mt-3 text-sm font-bold text-[#0f1f3d] sm:text-base">{feature.title}</p>
                <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
