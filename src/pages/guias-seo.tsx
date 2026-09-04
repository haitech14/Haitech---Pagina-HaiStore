import { Link, Navigate, useParams } from 'react-router-dom';

import { SeoContentLanding } from '@/components/seo/seo-content-landing';
import { getSeoGuide, SEO_GUIDES } from '@/data/seo-guides';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';

export function GuiaSeoPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const guide = getSeoGuide(slug);

  const pathname = guide?.pathname ?? '/guias';
  const title = guide?.title ?? 'Guías HaiStore';
  const description = guide?.description ?? '';
  const pageName = guide?.pageName ?? 'Guías';

  const breadcrumbs = buildBreadcrumbJsonLd(
    [
      { label: 'Inicio', href: '/' },
      { label: 'Guías', href: '/guias' },
      { label: pageName, href: pathname },
    ],
    SITE_ORIGIN,
  );

  useSeo({
    title,
    description,
    canonical: buildAbsoluteUrl(pathname),
    robots: 'index,follow',
    ogType: 'article',
    jsonLd: [
      buildWebPageJsonLd({ pathname, pageName, description }, SITE_ORIGIN),
      buildOrganizationJsonLd(SITE_ORIGIN),
      ...(breadcrumbs ? [breadcrumbs] : []),
    ],
  });

  if (!guide) {
    return <Navigate to="/guias" replace />;
  }

  return (
    <SeoContentLanding
      eyebrow="Guía HaiStore · Ricoh"
      h1={guide.h1}
      lead={guide.lead}
      paragraphs={guide.paragraphs}
      relatedLinks={guide.relatedLinks}
      ctas={[
        { label: 'Ver fotocopiadoras', to: '/fotocopiadoras-ricoh' },
        { label: 'Todas las guías', to: '/guias' },
      ]}
    />
  );
}

export function GuiasIndexPage() {
  useSeo({
    title: 'Guías Ricoh | Fotocopiadoras, Tóner y Alquiler | HaiStore',
    description:
      'Guías prácticas HaiStore: cómo elegir multifuncional Ricoh, tóner original vs compatible, alquiler vs compra y mantenimiento.',
    canonical: buildAbsoluteUrl('/guias'),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd: [
      buildWebPageJsonLd(
        {
          pathname: '/guias',
          pageName: 'Guías HaiStore',
          description: 'Contenido editorial sobre fotocopiadoras y consumibles Ricoh.',
        },
        SITE_ORIGIN,
      ),
      buildOrganizationJsonLd(SITE_ORIGIN),
    ],
  });

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Guías Ricoh para empresas
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          Contenido práctico de HaiStore, Distribuidor Autorizado Ricoh en Perú, para decidir con
          información clara antes de comprar o alquilar.
        </p>
        <ul className="mt-8 space-y-5">
          {SEO_GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                to={guide.pathname}
                className="text-lg font-semibold text-red-600 underline-offset-4 hover:underline"
              >
                {guide.pageName}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{guide.lead}</p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
