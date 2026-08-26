import { useMemo, useState } from 'react';
import {
  Droplets,
  Flame,
  Headphones,
  Lock,
  Monitor,
  Package,
  Printer,
  ShieldCheck,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { HaitechHomeProductCarousel } from '@/components/haitech-home/haitech-home-product-carousel';
import {
  HAITECH_SHOP,
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  HAITECH_SHOP_PRODUCT_TABS,
  HAITECH_SHOP_TRUST_ITEMS,
  type HaitechShopProductTabId,
} from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

const TAB_ICONS: Record<(typeof HAITECH_SHOP_PRODUCT_TABS)[number]['icon'], LucideIcon> = {
  star: Star,
  flame: Flame,
  printer: Printer,
  monitor: Monitor,
  droplet: Droplets,
  package: Package,
};

const TRUST_ICONS: Record<(typeof HAITECH_SHOP_TRUST_ITEMS)[number]['icon'], LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  headset: Headphones,
  lock: Lock,
};

function productsForTab(tab: HaitechShopProductTabId) {
  const filtered = HAITECH_SHOP_FAVORITE_PRODUCTS.filter((p) => p.tabIds.includes(tab));
  return filtered.length > 0 ? filtered : HAITECH_SHOP_FAVORITE_PRODUCTS;
}

/**
 * Productos destacados — mockup ¡Encuentra tu favorito en HAITECH!
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
        className="mx-auto px-3 py-8 sm:px-4 sm:py-10 xl:px-6"
        style={{ maxWidth: HAITECH_SHOP.maxWidth }}
      >
        <header className="mb-5 text-center sm:mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A8A8A] sm:text-[12px]">
            Tecnología para tu empresa
          </p>
          <h2
            id="haitech-favorites-title"
            className="mt-2 font-[family-name:var(--font-infobox)] text-[22px] font-bold leading-snug text-black sm:text-[28px] lg:text-[32px]"
          >
            ¡Encuentra tu favorito en{' '}
            <span style={{ color: HAITECH_SHOP.brand }}>HAITECH</span>!
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6B6B6B] sm:text-[14px]">
            Equipos originales Ricoh con garantía, soporte técnico y precios especiales para tu
            negocio.
          </p>
        </header>

        <div
          className="mb-5 flex items-center justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-7 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Categorías de productos destacados"
        >
          {HAITECH_SHOP_PRODUCT_TABS.map((tab) => {
            const isActive = tab.id === active;
            const TabIcon = TAB_ICONS[tab.icon];
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold transition-colors duration-200 sm:h-10 sm:px-4 sm:text-[13px]',
                  isActive
                    ? 'text-white shadow-[0_6px_16px_rgba(227,6,19,0.28)]'
                    : 'border border-[#D8D8D8] bg-white text-[#333] hover:border-[#BDBDBD]',
                )}
                style={isActive ? { backgroundColor: HAITECH_SHOP.brand } : undefined}
              >
                <TabIcon
                  className={cn('size-3.5', isActive && tab.icon === 'star' && 'fill-white')}
                  strokeWidth={isActive && tab.icon === 'star' ? 0 : 1.75}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <HaitechHomeProductCarousel
          products={products}
          ariaLabel="Productos destacados"
          className="sm:px-1 md:px-2"
        />

        <div className="mt-7 rounded-2xl border border-[#E8E8E8] bg-white px-4 py-4 shadow-[0_4px_16px_rgba(15,31,61,0.05)] sm:mt-9 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <ul className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
              {HAITECH_SHOP_TRUST_ITEMS.map((item) => {
                const TrustIcon = TRUST_ICONS[item.icon];
                return (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        color: HAITECH_SHOP.brand,
                        backgroundColor: 'rgba(227,6,19,0.08)',
                      }}
                    >
                      <TrustIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-bold text-[#111] sm:text-[13px]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-[#7A7A7A] sm:text-[12px]">
                        {item.subtitle}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 items-center justify-center border-t border-[#EEE] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <img
                src="/brands/ricoh.png"
                alt="RICOH — imagine. change."
                width={120}
                height={36}
                className="h-8 w-auto object-contain sm:h-9"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
