import { Link } from 'react-router-dom';

import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

/** Banner recortado (origen: `ChatGPT Image 29 ago 2026, 12_11_53.png`). */
const BANNER_SRC = '/home/home-equipos-banner-cropped.png';
const BANNER_HREF = HOME_LANDING_LINKS.allProducts;

/**
 * Banner promocional encima de «Somos Distribuidor Autorizado RICOH».
 */
export function HomeEquiposHeroBanner({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-equipos-hero-title"
      className={cn('bg-white py-0', className)}
    >
      <div className="container">
        <Link
          to={BANNER_HREF}
          className={cn(
            'group relative block overflow-hidden rounded-xl leading-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label="Explora nuestros equipos. Ir a la Tienda"
        >
          <h2 id="home-equipos-hero-title" className="sr-only">
            Explora nuestros equipos
          </h2>
          <img
            src={`${BANNER_SRC}?v=2`}
            alt="Explora nuestros equipos. Soluciones de impresión que se adaptan a las necesidades de tu negocio. Ir a la Tienda."
            width={2059}
            height={528}
            className="block h-auto w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>
    </section>
  );
}
