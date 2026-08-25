import { useMemo, useState } from 'react';

import { QtcProductCarousel } from '@/components/qtc-replica/qtc-product-carousel';
import {
  QTC,
  QTC_FAVORITE_PRODUCTS,
  QTC_PRODUCT_TABS,
  type QtcProductTab,
} from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

function filterByTab(tab: QtcProductTab) {
  if (tab === 'Ofertas top' || tab === 'Más vendidos') return QTC_FAVORITE_PRODUCTS;
  if (tab === 'Scooters') {
    return QTC_FAVORITE_PRODUCTS.filter((p) => /scooter/i.test(p.name));
  }
  if (tab === 'Celulares') {
    return QTC_FAVORITE_PRODUCTS.filter((p) =>
      /honor|oppo|redmi|note|magic|reno|pad/i.test(p.name),
    );
  }
  if (tab === 'Hogar') {
    return QTC_FAVORITE_PRODUCTS.filter((p) =>
      /dreame|monitor|aspiradora|vacuum/i.test(p.name),
    );
  }
  return QTC_FAVORITE_PRODUCTS;
}

/**
 * Sección “¡Encuentra tu favorito en QTC!” + tabs + carrusel de 6 productos.
 */
export function QtcFavoritesSection({ className }: { className?: string }) {
  const [active, setActive] = useState<QtcProductTab>('Ofertas top');
  const products = useMemo(() => {
    const filtered = filterByTab(active);
    return filtered.length > 0 ? filtered : QTC_FAVORITE_PRODUCTS;
  }, [active]);

  return (
    <section
      className={cn('w-full', className)}
      style={{ backgroundColor: QTC.grayBg }}
      aria-labelledby="qtc-favorites-title"
    >
      <div
        className="mx-auto px-4 py-[35px] xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="qtc-favorites-title"
            className="text-[22px] font-bold text-black sm:text-[24px] lg:text-[26px]"
          >
            ¡Encuentra tu favorito en QTC!
          </h2>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Categorías de productos"
          >
            {QTC_PRODUCT_TABS.map((tab) => {
              const isActive = tab === active;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab)}
                  className={cn(
                    'h-[35px] shrink-0 rounded px-3.5 text-[13px] font-semibold transition-colors duration-200',
                    isActive
                      ? 'text-white'
                      : 'border border-[#D0D0D0] bg-white text-black hover:border-[#BDBDBD]',
                  )}
                  style={isActive ? { backgroundColor: QTC.orangeActive } : undefined}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <QtcProductCarousel
          products={products}
          ariaLabel={`Productos — ${active}`}
          className="px-1 sm:px-2"
        />
      </div>
    </section>
  );
}
