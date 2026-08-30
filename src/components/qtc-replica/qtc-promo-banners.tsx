import { QTC, QTC_PROMO_BANNERS } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

/**
 * Tres banners promocionales horizontales (OPPO / Xiaomi / DJI).
 */
export function QtcPromoBanners({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} aria-label="Promociones destacadas">
      <div
        className="mx-auto px-4 pb-2 pt-10 xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {QTC_PROMO_BANNERS.map((banner) => (
            <li key={banner.id}>
              <a
                href="#ofertas"
                className={cn(
                  'relative flex h-[230px] flex-col justify-between overflow-hidden rounded-xl p-6',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7228F5]/50',
                )}
                style={{ background: banner.gradient }}
              >
                <div>
                  <p
                    className={cn(
                      'text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]',
                      'darkText' in banner && banner.darkText ? 'text-[#1A1A1A]' : 'text-white',
                    )}
                    style={'darkText' in banner && banner.darkText ? undefined : { color: banner.accent }}
                  >
                    {banner.title}
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-[15px] font-semibold sm:text-base',
                      'darkText' in banner && banner.darkText ? 'text-[#333]' : 'text-white/90',
                    )}
                  >
                    {banner.subtitle}
                  </p>
                </div>

                {banner.cta ? (
                  <span
                    className="inline-flex h-9 w-fit items-center rounded-md bg-white px-4 text-[13px] font-bold text-black shadow-sm"
                  >
                    {banner.cta}
                  </span>
                ) : (
                  <span
                    className="inline-block size-16 self-end rounded-full opacity-30"
                    style={{ backgroundColor: banner.accent }}
                    aria-hidden="true"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
