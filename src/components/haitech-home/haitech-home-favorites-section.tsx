import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';

import { HaitechHomeProductCarousel } from '@/components/haitech-home/haitech-home-product-carousel';
import {
  HAITECH_SHOP,
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  HAITECH_SHOP_PRODUCT_TABS,
  type HaitechShopProductTabId,
} from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

function productsForTab(tab: HaitechShopProductTabId) {
  const filtered = HAITECH_SHOP_FAVORITE_PRODUCTS.filter((p) => p.tabIds.includes(tab));
  return filtered.length > 0 ? filtered : HAITECH_SHOP_FAVORITE_PRODUCTS;
}

/**
 * Productos destacados — ¡Encuentra tu favorito en HAITECH!
 */
export function HaitechHomeFavoritesSection({ className }: { className?: string }) {
  const [active, setActive] = useState<HaitechShopProductTabId>('ofertas');
  const products = useMemo(() => productsForTab(active), [active]);

  return (
    <section
      id="productos-destacados"
      className={cn('w-full', className)}
      style={{ backgroundColor: HAITECH_SHOP.grayBg }}
      aria-labelledby="haitech-favorites-title"
    >
      <div
        className="mx-auto px-4 py-[35px] xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="haitech-favorites-title"
            className="font-[family-name:var(--font-infobox)] text-[22px] font-bold text-black sm:text-[24px] lg:text-[26px]"
          >
            ¡Encuentra tu favorito en{' '}
            <span style={{ color: HAITECH_SHOP.brand }}>HAITECH</span>!
          </h2>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Categorías de productos destacados"
          >
            {HAITECH_SHOP_PRODUCT_TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    'inline-flex h-[35px] shrink-0 items-center gap-1.5 rounded px-3.5 text-[13px] font-semibold transition-colors duration-200',
                    isActive
                      ? 'text-white'
                      : 'border border-[#D0D0D0] bg-white text-black hover:border-[#BDBDBD]',
                  )}
                  style={isActive ? { backgroundColor: HAITECH_SHOP.brand } : undefined}
                >
                  {isActive && tab.id === 'ofertas' ? (
                    <Star className="size-3.5 fill-white" strokeWidth={0} aria-hidden="true" />
                  ) : null}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <HaitechHomeProductCarousel
          products={products}
          ariaLabel="Productos destacados"
          className="px-1 sm:px-2"
        />
      </div>
    </section>
  );
}
