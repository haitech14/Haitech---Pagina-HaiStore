import { useMemo } from 'react';

import { CategoryPage } from '@/pages/category';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildStoreJsonLd, STORE_SITE_DESCRIPTION, STORE_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

/** Vista principal de tienda: catálogo completo (sin categoría fija). */
export function StorePage() {
  const storeSeo = useMemo(
    () => ({
      title: STORE_SITE_TITLE,
      description: STORE_SITE_DESCRIPTION,
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
