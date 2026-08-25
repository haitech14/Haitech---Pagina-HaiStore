import { Gift } from 'lucide-react';

import { QtcProductCarousel } from '@/components/qtc-replica/qtc-product-carousel';
import { QTC, QTC_LATEST_PRODUCTS } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

/**
 * Sección “Lo último” + segundo carrusel de productos.
 */
export function QtcLatestSection({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full', className)}
      style={{ backgroundColor: QTC.grayBg }}
      aria-labelledby="qtc-latest-title"
    >
      <div
        className="mx-auto px-4 py-[35px] xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <div className="mb-5 flex items-center gap-2.5 sm:mb-6">
          <Gift
            className="size-7 shrink-0 sm:size-8"
            style={{ color: QTC.orange }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <h2
            id="qtc-latest-title"
            className="text-[22px] font-bold text-black"
          >
            Lo último
          </h2>
        </div>

        <QtcProductCarousel
          products={QTC_LATEST_PRODUCTS}
          ariaLabel="Lo último en QTC"
          className="px-1 sm:px-2"
        />
      </div>
    </section>
  );
}
