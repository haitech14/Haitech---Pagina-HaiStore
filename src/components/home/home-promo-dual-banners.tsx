import { Link } from 'react-router-dom';

import {
  HOME_PROMO_DUAL_BANNERS_ROW_IMAGE,
  homePromoDualBanners,
  type HomePromoDualBanner,
} from '@/data/home-promo-dual-banners';
import { cn } from '@/lib/utils';

const PROMO_BANNER_ASPECT_CLASS = 'aspect-[512/140]';

function PromoDualBannerCard({ promo }: { promo: HomePromoDualBanner }) {
  return (
    <li className="min-w-0">
      <Link
        to={promo.href}
        className={cn(
          'group block overflow-hidden rounded-xl border border-border/40 shadow-[0_4px_20px_rgba(15,31,61,0.12)]',
          'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,31,61,0.16)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        )}
        aria-label={promo.imageAlt}
      >
        <div
          className={cn(
            PROMO_BANNER_ASPECT_CLASS,
            'w-full bg-[length:200%_100%] bg-no-repeat transition-transform duration-300 group-hover:scale-[1.01]',
          )}
          style={{
            backgroundImage: `url(${HOME_PROMO_DUAL_BANNERS_ROW_IMAGE})`,
            backgroundPosition: `${promo.backgroundPositionX} 0`,
          }}
          role="img"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export function HomePromoDualBanners() {
  return (
    <section aria-labelledby="home-promo-dual-banners-title">
      <div className="container pb-6 pt-2 sm:pb-8 sm:pt-3">
        <h2 id="home-promo-dual-banners-title" className="sr-only">
          Ofertas en impresoras y monitores
        </h2>
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3" role="list">
          {homePromoDualBanners.map((promo) => (
            <PromoDualBannerCard key={promo.id} promo={promo} />
          ))}
        </ul>
      </div>
    </section>
  );
}
