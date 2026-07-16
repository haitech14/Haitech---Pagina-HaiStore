import { useMemo } from 'react';

import { CategoryPage } from '@/pages/category';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildStoreJsonLd } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const STORE_SEO = {
  title: 'Tienda online | Fotocopiadoras, Impresoras y Suministros Ricoh | HaiStore',
  description:
    'Catálogo HaiStore: fotocopiadoras y multifuncionales Ricoh, impresoras, tóner, tintas, repuestos y accesorios. Precios en USD, stock y asesoría en Perú.',
};

/** Vista principal de tienda: catálogo completo (sin categoría fija). */
export function StorePage() {
  const storeSeo = useMemo(
    () => ({
      title: STORE_SEO.title,
      description: STORE_SEO.description,
      canonical: buildAbsoluteUrl('/tienda'),
      robots: 'index,follow' as const,
      ogType: 'website' as const,
      jsonLd: buildStoreJsonLd(SITE_ORIGIN),
    }),
    [],
  );

  useSeo(storeSeo);

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
