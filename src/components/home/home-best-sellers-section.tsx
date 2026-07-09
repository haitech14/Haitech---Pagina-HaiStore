import { useId, useState } from 'react';
import { Laptop, Monitor, Printer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { HomeBestSellerProductCard } from '@/components/home/home-best-seller-product-card';
import {
  HOME_BEST_SELLER_CATEGORIES,
  getHomeBestSellers,
  type HomeBestSellerCategoryId,
} from '@/data/home-best-sellers';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<HomeBestSellerCategoryId, LucideIcon> = {
  laptops: Laptop,
  impresoras: Printer,
  monitores: Monitor,
};

const BEST_SELLERS_GRID_CLASS =
  'flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3.5 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-5 lg:gap-4 [&::-webkit-scrollbar]:hidden';

export function HomeBestSellersSection() {
  const baseId = useId();
  const [activeCategory, setActiveCategory] = useState<HomeBestSellerCategoryId>('monitores');
  const products = getHomeBestSellers(activeCategory);

  return (
    <section aria-labelledby={`${baseId}-title`} className="home-landing-sans bg-white">
      <div className="container pb-8 pt-4 sm:pb-10 sm:pt-6">
        <h2
          id={`${baseId}-title`}
          className="home-section-title mb-5 text-balance text-center text-xl font-bold tracking-tight text-[#111111] sm:mb-6 sm:text-2xl lg:text-[1.75rem] lg:leading-tight"
        >
          Lo más cotizado por empresas
        </h2>

        <div
          role="tablist"
          aria-label="Categorías de productos más vendidos"
          className="mb-5 flex justify-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-6 sm:gap-2.5 [&::-webkit-scrollbar]:hidden"
        >
          {HOME_BEST_SELLER_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const isActive = activeCategory === category.id;
            const tabId = `${baseId}-tab-${category.id}`;
            const panelId = `${baseId}-panel-${category.id}`;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
                  isActive
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                    : 'border-border/80 bg-white text-[#444444] hover:border-[#2563EB]/40 hover:text-[#2563EB]',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeCategory}`}
          aria-labelledby={`${baseId}-tab-${activeCategory}`}
        >
          <ul className={cn(BEST_SELLERS_GRID_CLASS, 'items-stretch')} role="list">
            {products.map((product) => (
              <li key={product.id} className="flex w-[calc(50%-0.375rem)] shrink-0 md:w-auto md:min-w-0">
                <HomeBestSellerProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
