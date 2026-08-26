import { Gift } from 'lucide-react';

import { HaitechHomeProductCarousel } from '@/components/haitech-home/haitech-home-product-carousel';
import { HAITECH_SHOP, HAITECH_SHOP_LATEST_PRODUCTS } from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

/**
 * Sección “Lo último” + segundo carrusel.
 */
export function HaitechHomeLatestSection({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full', className)}
      style={{ backgroundColor: HAITECH_SHOP.grayBg }}
      aria-labelledby="haitech-latest-title"
    >
      <div
        className="mx-auto px-3 py-6 sm:px-4 sm:py-[35px] xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-2.5">
          <Gift
            className="size-6 shrink-0 sm:size-8"
            style={{ color: HAITECH_SHOP.brand }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <h2
            id="haitech-latest-title"
            className="font-[family-name:var(--font-infobox)] text-[18px] font-bold text-black sm:text-[22px]"
          >
            Lo último
          </h2>
        </div>

        <HaitechHomeProductCarousel
          products={HAITECH_SHOP_LATEST_PRODUCTS}
          ariaLabel="Lo último en HAITECH"
          className="sm:px-1 md:px-2"
        />
      </div>
    </section>
  );
}
