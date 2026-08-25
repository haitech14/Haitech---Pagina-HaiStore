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
        className="mx-auto px-4 py-[35px] xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <div className="mb-5 flex items-center gap-2.5 sm:mb-6">
          <Gift
            className="size-7 shrink-0 sm:size-8"
            style={{ color: HAITECH_SHOP.brand }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <h2 id="haitech-latest-title" className="font-[family-name:var(--font-infobox)] text-[22px] font-bold text-black">
            Lo último
          </h2>
        </div>

        <HaitechHomeProductCarousel
          products={HAITECH_SHOP_LATEST_PRODUCTS}
          ariaLabel="Lo último en HAITECH"
          className="px-1 sm:px-2"
        />
      </div>
    </section>
  );
}
