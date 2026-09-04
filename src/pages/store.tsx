import { useLayoutEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { HaitechHomeEquipmentShowcase } from '@/components/haitech-home/haitech-home-equipment-showcase';
import { StorePromoHeroBanner } from '@/components/store-storefront/store-promo-hero-banner';
import { ProductDetailPage } from '@/pages/product-detail';
import { CategoryPage } from '@/pages/category';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildStoreJsonLd, STORE_SITE_DESCRIPTION, STORE_SITE_TITLE } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import {
  isStoreShowcaseCategorySlug,
  STORE_SHOWCASE_HASH,
} from '@/lib/store-showcase-path';
import { vitrinaCanonicalPath } from '../../shared/seo/public-paths.js';
import { cn } from '@/lib/utils';

/** Vista principal de tienda: banner + vitrina de equipos. */
export function StorePage() {
  const location = useLocation();
  const { slug: vitrinaSlug } = useParams<{ slug?: string }>();
  const isVitrinaCategory = isStoreShowcaseCategorySlug(vitrinaSlug);

  const canonicalPath = isVitrinaCategory
    ? vitrinaCanonicalPath(vitrinaSlug)
    : '/tienda';

  const storeSeo = useMemo(
    () => ({
      title: STORE_SITE_TITLE,
      description: STORE_SITE_DESCRIPTION,
      canonical: buildAbsoluteUrl(canonicalPath),
      robots: 'index,follow' as const,
      ogType: 'website' as const,
      jsonLd: buildStoreJsonLd(SITE_ORIGIN),
    }),
    [canonicalPath],
  );

  useSeo(storeSeo);

  useLayoutEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (hash === STORE_SHOWCASE_HASH) return;
    if (isVitrinaCategory) {
      const el = document.getElementById(STORE_SHOWCASE_HASH);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, location.hash, isVitrinaCategory]);

  return (
    <div className={cn('store-storefront home-landing-sans flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <StorePromoHeroBanner />
      <HaitechHomeEquipmentShowcase />
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

/**
 * Una sola entrada lazy para /tienda y /categoria/:slug (evita re-Suspense al cruzar rutas).
 */
export function StorefrontRoutePage() {
  const { slug } = useParams<{ slug?: string }>();
  if (slug) return <CategoryStorefrontPage />;
  return <StorePage />;
}

/** /tienda/:slug — vitrina de categoría o ficha de producto. */
export function TiendaSlugRoutePage() {
  const { slug } = useParams<{ slug?: string }>();
  if (isStoreShowcaseCategorySlug(slug)) {
    return <StorePage />;
  }
  return <ProductDetailPage />;
}
