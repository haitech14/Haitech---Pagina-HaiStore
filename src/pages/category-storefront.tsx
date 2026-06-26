import { CategoryPage } from '@/pages/category';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { cn } from '@/lib/utils';

/** Catálogo de categoría con el mismo layout storefront que `/tienda`. */
export function CategoryStorefrontPage() {
  return (
    <div className={cn('store-storefront flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <CategoryPage storefrontMode />
    </div>
  );
}
