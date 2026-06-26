import { servicesLandingStats } from '@/data/services-landing';
import { cn } from '@/lib/utils';

interface ServicesLandingStatsBarProps {
  className?: string;
}

export function ServicesLandingStatsBar({ className }: ServicesLandingStatsBarProps) {
  return (
    <section aria-label="Indicadores de servicio" className={cn('bg-[#0f1f3d] py-8 sm:py-10', className)}>
      <div className="container px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {servicesLandingStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <li key={stat.id} className="flex flex-col items-center text-center">
                <Icon className="mb-2 size-5 text-red-400 sm:size-6" aria-hidden="true" strokeWidth={1.75} />
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-pretty text-xs text-white/80 sm:text-sm">{stat.label}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
