import { Navigate, useParams } from 'react-router-dom';

import { SeoCommercialLandingView } from '@/components/seo/seo-content-landing';
import { getSeoCommercialLanding } from '@/data/seo-commercial-landings';
import { useSeo } from '@/hooks/use-seo';
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';

type CommercialSeoLandingPageProps = {
  landingSlug?: string;
};

export function CommercialSeoLandingPage({ landingSlug }: CommercialSeoLandingPageProps) {
  const params = useParams<{ slug?: string }>();
  const slug = landingSlug ?? params.slug ?? '';
  const landing = getSeoCommercialLanding(slug);

  const pathname = landing?.pathname ?? '/fotocopiadoras-peru';
  const title = landing?.title ?? 'HaiStore';
  const description = landing?.description ?? '';
  const pageName = landing?.pageName ?? 'HaiStore';
  const faqItems = landing?.faq ?? [];

  const faq = buildFaqPageJsonLd(faqItems);
  const breadcrumbs = buildBreadcrumbJsonLd(
    [
      { label: 'Inicio', href: '/' },
      { label: pageName, href: pathname },
    ],
    SITE_ORIGIN,
  );
  const jsonLd = [
    buildWebPageJsonLd({ pathname, pageName, description }, SITE_ORIGIN),
    buildOrganizationJsonLd(SITE_ORIGIN),
    ...(breadcrumbs ? [breadcrumbs] : []),
    ...(faq ? [faq] : []),
  ];

  useSeo({
    title,
    description,
    canonical: buildAbsoluteUrl(pathname),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd,
  });

  if (!landing) {
    return <Navigate to="/fotocopiadoras-peru" replace />;
  }

  return <SeoCommercialLandingView landing={landing} />;
}
