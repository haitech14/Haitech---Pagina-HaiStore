import { Link } from 'react-router-dom';

import { HOME_HERO_SERVICES_BAR } from '@/data/home-hero-services-bar';
import { cn } from '@/lib/utils';

const BRAND_RED = '#E30613';
const TITLE_COLOR = '#111111';

type HomeHeroServicesBarProps = {
  className?: string;
};

/**
 * Barra flotante blanca sobre la parte inferior del hero (dentro del banner).
 */
export function HomeHeroServicesBar({ className }: HomeHeroServicesBarProps) {
  return (
    <div
      className={cn(
        // Más abajo: anclada al borde inferior y un poco colgando fuera del hero.
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-[42%] sm:translate-y-[45%]',
        className,
      )}
    >
      <div className="container pointer-events-auto px-2 sm:px-3 lg:px-4">
        <nav
          aria-label="Soluciones HaiTech"
          className="mx-auto max-w-5xl rounded-2xl border border-black/[0.04] bg-white px-1.5 py-2 shadow-[0_10px_40px_rgba(15,31,61,0.12)] sm:px-2 sm:py-2.5 lg:max-w-6xl lg:rounded-[1.25rem] lg:px-3 lg:py-3"
        >
          <ul className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
            {HOME_HERO_SERVICES_BAR.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className={cn(
                    'min-w-0',
                    index > 0 && 'lg:border-l lg:border-[#EEE]',
                  )}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors',
                      'hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                      'sm:gap-2.5 sm:px-2.5 lg:px-3',
                    )}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center sm:size-9"
                      style={{ color: BRAND_RED }}
                      aria-hidden="true"
                    >
                      <Icon className="size-[1.15rem] sm:size-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-pretty text-[0.75rem] font-bold leading-snug sm:text-[0.8125rem]"
                        style={{ color: TITLE_COLOR }}
                      >
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-pretty text-[0.625rem] leading-snug text-[#888888] sm:text-[0.6875rem]">
                        {item.subtitle}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
