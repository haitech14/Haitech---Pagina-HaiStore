import { Link } from 'react-router-dom';

import { HAITECH_SHOP, HAITECH_SHOP_PROMO_BANNERS } from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

/**
 * Tres banners promocionales horizontales.
 */
export function HaitechHomePromoBanners({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} aria-label="Promociones destacadas">
      <div
        className="mx-auto px-4 pb-2 pt-10 xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {HAITECH_SHOP_PROMO_BANNERS.map((banner) => (
            <li key={banner.id}>
              <Link
                to={banner.href}
                className={cn(
                  'relative flex h-[230px] flex-col justify-between overflow-hidden rounded-xl p-6',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/50',
                )}
                style={{ background: banner.gradient }}
              >
                {/* Franja inferior tipo “pasto” pixel */}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3 opacity-90"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #4caf50 0 8px, #66bb6a 8px 16px, #388e3c 16px 24px)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-[1]">
                  <p className="text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-[30px]">
                    {banner.title}
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-white/90 sm:text-base">
                    {banner.subtitle}
                  </p>
                </div>

                <span className="relative z-[1] inline-flex h-9 w-fit items-center rounded-full bg-white px-5 text-[13px] font-bold shadow-sm"
                  style={{ color: HAITECH_SHOP.brand }}
                >
                  {banner.cta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
