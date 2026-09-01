import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { HaitechHomeProductCard } from '@/components/haitech-home/haitech-home-product-card';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  HAITECH_HOME_FEATURED_CATEGORY_CHIPS,
  HAITECH_HOME_FEATURED_DEFAULT_CHIP,
} from '@/data/haitech-home-featured-section';
import {
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { cn } from '@/lib/utils';

const FEATURED_DISPLAY_LIMIT = 4;

const DEFAULT_CHIP =
  HAITECH_HOME_FEATURED_CATEGORY_CHIPS.find(
    (chip) => chip.id === HAITECH_HOME_FEATURED_DEFAULT_CHIP,
  ) ?? HAITECH_HOME_FEATURED_CATEGORY_CHIPS[0]!;

function resolveFeaturedProducts(catalog: readonly HaitechShopProduct[]): HaitechShopProduct[] {
  const fixedIds = DEFAULT_CHIP.fixedProductIds ?? [];
  const byId = new Map(catalog.map((product) => [product.id, product]));
  return fixedIds
    .map((id) => byId.get(id))
    .filter((product): product is HaitechShopProduct => product != null)
    .slice(0, FEATURED_DISPLAY_LIMIT);
}

/**
 * Productos destacados — grid de 4 tarjetas (mockup home).
 */
export function HaitechHomeFavoritesSection({ className }: { className?: string }) {
  const products = useMemo(
    () => resolveFeaturedProducts(HAITECH_SHOP_FAVORITE_PRODUCTS),
    [],
  );

  return (
    <section
      id="productos-destacados"
      className={cn('w-full bg-white', className)}
      aria-labelledby="haitech-favorites-title"
    >
      <div
        className="mx-auto px-3 pb-6 pt-2 sm:px-4 sm:pb-8 sm:pt-3 lg:px-5 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
      >
        <header className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <h2
            id="haitech-favorites-title"
            className="flex min-w-0 items-center gap-2.5 font-[family-name:var(--font-infobox)] text-[20px] font-bold text-[#111111] sm:text-[24px] lg:text-[26px]"
          >
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Productos Destacados
          </h2>

          <Link
            to={DEFAULT_CHIP.href}
            className="shrink-0 text-[13px] font-semibold text-[#E30613] transition-colors hover:text-[#c90511] sm:text-[14px]"
          >
            Ver todos →
          </Link>
        </header>

        {products.length > 0 ? (
          <ul
            className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-4 md:gap-4"
            role="list"
            aria-label="Productos destacados"
          >
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <HaitechHomeProductCard product={product} variant="featured" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D9DEE7] bg-[#FAFBFC] px-4 py-10 text-center">
            <p className="text-sm text-[#666666]">No hay productos destacados por el momento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
