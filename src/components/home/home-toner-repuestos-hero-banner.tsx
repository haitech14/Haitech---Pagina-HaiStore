import { Link } from 'react-router-dom';

import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

const BANNER_BG = '/home/home-toner-repuestos-banner-bg.png';
const BANNER_HREF = HOME_LANDING_LINKS.tonerCatalog;

/**
 * Banner promocional encima de la vitrina Toner: consumibles y repuestos.
 */
export function HomeTonerRepuestosHeroBanner({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-toner-repuestos-hero-title"
      className={cn('bg-[#FAFBFC] py-4 sm:py-5', className)}
    >
      <div className="container">
        <Link
          to={BANNER_HREF}
          className={cn(
            'group relative flex min-h-[8.5rem] overflow-hidden rounded-xl sm:min-h-[9rem]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label="Toner y Repuestos al por mayor y menor"
        >
          <img
            src={BANNER_BG}
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-[#a3050d]/55"
            aria-hidden="true"
          />

          <div className="relative z-[1] flex w-full flex-col items-center justify-center px-4 py-5 text-center sm:px-6 sm:py-6 lg:px-8">
            <h2
              id="home-toner-repuestos-hero-title"
              className="max-w-4xl text-2xl font-extrabold tracking-[0.02em] text-white sm:text-3xl lg:text-[2.25rem] lg:leading-tight"
            >
              Toner y Repuestos al por mayor y menor
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
