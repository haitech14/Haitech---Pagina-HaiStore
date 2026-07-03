import { CategoryPage } from '@/pages/category';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const STORE_SEO = {
  title: 'Tienda online',
  description:
    'Catálogo HaiStore: multifuncionales Ricoh, impresoras, suministros, equipos y accesorios con precios en USD y asesoría especializada en Perú.',
};

/** Vista principal de tienda: catálogo completo (sin categoría fija). */
export function StorePage() {
  useSeo({
    title: STORE_SEO.title,
    description: STORE_SEO.description,
    canonical: buildAbsoluteUrl('/tienda'),
    robots: 'index,follow',
  });

  return (
    <div className={cn('store-storefront home-landing-sans flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <CategoryPage storefrontMode />
    </div>
  );
}

/** Catálogo de categoría con el mismo layout storefront que `/tienda`. */
export function CategoryStorefrontPage() {
  return (
    <div className={cn('store-storefront home-landing-sans flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <CategoryPage storefrontMode />
    </div>
  );
}
