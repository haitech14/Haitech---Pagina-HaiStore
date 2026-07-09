import { Link } from 'react-router-dom';

import { homePromoMiniBanners, type HomePromoMiniBanner } from '@/data/home-promo-mini-banners';
import { cn } from '@/lib/utils';

const PROMO_BANNER_ASPECT_CLASS = 'aspect-[2086/636]';

function PromoMiniBannerCard({ promo }: { promo: HomePromoMiniBanner }) {
  return (
    <li className="min-w-0">
      <Link
        to={promo.href}
        className={cn(
          'group block overflow-hidden rounded-xl',
          'transition-transform duration-200 hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        )}
        aria-label={promo.imageAlt}
      >
        <img
          src={promo.image}
          alt=""
          className={cn(
            PROMO_BANNER_ASPECT_CLASS,
            'w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]',
          )}
          loading="lazy"
          decoding="async"
        />
        <span className="sr-only">{promo.imageAlt}</span>
      </Link>
    </li>
  );
}

export function HomePromoMiniBanners() {
  return (
    <section aria-labelledby="home-promo-mini-banners-title" className="home-landing-sans relative z-20 -mt-6 bg-[#F8F9FA] sm:-mt-8">
      <div className="container pb-3 pt-0 sm:pb-4">
        <h2 id="home-promo-mini-banners-title" className="sr-only">
          Promociones Ricoh destacadas
        </h2>
        <ul className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-3 sm:gap-3" role="list">
          {homePromoMiniBanners.map((promo) => (
            <PromoMiniBannerCard key={promo.id} promo={promo} />
          ))}
        </ul>
      </div>
    </section>
  );
}
