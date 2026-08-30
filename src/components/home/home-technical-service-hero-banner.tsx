import { Link } from 'react-router-dom';

import { ResponsivePromoBannerImage } from '@/components/home/responsive-promo-banner-image';
import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

/** Banner «Somos Distribuidor Autorizado RICOH» (margen blanco recortado). */
const BANNER_SRC = '/home/home-ricoh-distributor-banner.png';
const BANNER_HREF = `${HOME_LANDING_LINKS.allProducts}?q=ricoh`;

/**
 * Banner hero estilo franja promocional: Distribuidor Autorizado RICOH.
 */
export function HomeTechnicalServiceHeroBanner({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-ricoh-distributor-hero-title"
      className={cn('bg-white py-0', className)}
    >
      <div className="container">
        <Link
          to={BANNER_HREF}
          className={cn(
            'group relative block leading-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label="Somos Distribuidor Autorizado RICOH. Ver equipos"
        >
          <h2 id="home-ricoh-distributor-hero-title" className="sr-only">
            Somos Distribuidor Autorizado RICOH
          </h2>
          <ResponsivePromoBannerImage
            src={`${BANNER_SRC}?v=4`}
            alt="Somos Distribuidor Autorizado RICOH. Equipos originales, garantía oficial y soporte certificado. Multifuncionales, impresoras, plotters y consumibles."
            width={2084}
            height={408}
            mobileFocus="center"
          />
        </Link>
      </div>
    </section>
  );
}
