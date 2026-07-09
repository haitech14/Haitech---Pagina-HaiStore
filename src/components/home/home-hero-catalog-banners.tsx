import { Link } from 'react-router-dom';

import { homePromoMiniBanners } from '@/data/home-promo-mini-banners';
import { cn } from '@/lib/utils';

const CATALOG_BANNER_ASPECT = 'aspect-[4/1]';
const GRID_GAP_CLASS = 'gap-2.5 sm:gap-3';
const CATALOG_TITLE_ID = 'home-hero-catalog-title';

const stripLinkBaseClass =
  'group relative block w-full overflow-hidden rounded-xl bg-[#F8F9FA] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2';

const bannerImageClass =
  'absolute inset-0 h-full w-full rounded-xl object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]';

export function HomeHeroCatalogBanners() {
  return (
    <section
      aria-labelledby={CATALOG_TITLE_ID}
      className="home-landing-sans border-t border-border/25 bg-white"
    >
      <div className="container pb-6 pt-5 sm:pb-8 sm:pt-6">
        <h2
          id={CATALOG_TITLE_ID}
          className="mb-4 text-center text-base font-semibold tracking-tight text-[#111111] sm:mb-5 sm:text-lg"
        >
          Encuentra el equipo ideal para tu empresa
        </h2>

        <ul
          className={cn('grid grid-cols-1 min-[480px]:grid-cols-3', GRID_GAP_CLASS)}
          role="list"
          aria-labelledby={CATALOG_TITLE_ID}
        >
          {homePromoMiniBanners.map((promo) => (
            <li key={promo.id} className="min-w-0">
              <Link
                to={promo.href}
                className={cn(stripLinkBaseClass, CATALOG_BANNER_ASPECT)}
                aria-label={promo.imageAlt}
              >
                <img
                  src={promo.image}
                  alt=""
                  className={bannerImageClass}
                  loading="lazy"
                  decoding="async"
                />
                <span className="sr-only">{promo.imageAlt}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
