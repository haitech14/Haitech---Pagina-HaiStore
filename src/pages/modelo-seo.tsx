import { Link, Navigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  getSeoModelHub,
  modelHubPath,
  modelHubProductHref,
  SEO_MODEL_HUBS,
} from '@/data/seo-model-hubs';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

export function ModeloSeoPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const hub = getSeoModelHub(slug);

  const pathname = hub ? modelHubPath(hub.slug) : '/modelos';
  const title = hub?.title ?? 'Modelos Ricoh | HaiStore';
  const description = hub?.description ?? '';
  const pageName = hub?.pageName ?? 'Modelos';
  const listItems =
    hub?.products.map((item) => ({
      name: item.label,
      url: buildAbsoluteUrl(modelHubProductHref(item.productSlug)),
    })) ?? [];
  const itemList = buildItemListJsonLd({
    name: hub ? `${hub.modelName} — opciones en HaiStore` : 'Modelos',
    description,
    url: buildAbsoluteUrl(pathname),
    items: listItems,
  });
  const breadcrumbs = buildBreadcrumbJsonLd(
    [
      { label: 'Inicio', href: '/' },
      { label: 'Modelos Ricoh', href: '/fotocopiadoras-ricoh' },
      { label: pageName, href: pathname },
    ],
    SITE_ORIGIN,
  );

  useSeo({
    title,
    description,
    canonical: buildAbsoluteUrl(pathname),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd: [
      buildWebPageJsonLd({ pathname, pageName, description }, SITE_ORIGIN),
      buildOrganizationJsonLd(SITE_ORIGIN),
      ...(breadcrumbs ? [breadcrumbs] : []),
      ...(itemList ? [itemList] : []),
    ],
  });

  if (!hub) {
    return <Navigate to="/fotocopiadoras-ricoh" replace />;
  }

  const related = hub.relatedModelSlugs
    .map((relatedSlug) => getSeoModelHub(relatedSlug))
    .filter(Boolean);

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-red-600">Modelo · Distribuidor Autorizado Ricoh</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          {hub.h1}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">{hub.lead}</p>

        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground sm:text-base">
          {hub.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <div className="mt-6 space-y-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {hub.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-10" aria-labelledby="modelo-productos-heading">
          <h2 id="modelo-productos-heading" className="text-xl font-semibold text-[#0f1f3d]">
            Ver en tienda
          </h2>
          <ul className="mt-4 space-y-3">
            {hub.products.map((item) => (
              <li key={item.productSlug}>
                <Link
                  to={modelHubProductHref(item.productSlug)}
                  className="font-medium text-red-600 underline-offset-4 hover:underline"
                >
                  {item.label}
                  {item.condition ? ` (${item.condition})` : ''}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            También puedes explorar toda la{' '}
            <Link
              to={hub.categoryHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              categoría de multifuncionales
            </Link>
            .
          </p>
        </section>

        {related.length > 0 ? (
          <nav className="mt-10" aria-label="Modelos relacionados">
            <h2 className="text-lg font-semibold text-[#0f1f3d]">Modelos relacionados</h2>
            <ul className="mt-3 flex flex-wrap gap-3 text-sm">
              {related.map((item) =>
                item ? (
                  <li key={item.slug}>
                    <Link
                      to={modelHubPath(item.slug)}
                      className="font-medium text-red-600 underline-offset-4 hover:underline"
                    >
                      {item.modelName}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
              Cotizar {hub.modelName}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/fotocopiadoras-ricoh">Más fotocopiadoras Ricoh</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

export function ModelosIndexPage() {
  useSeo({
    title: 'Modelos Ricoh | Multifuncionales destacados | HaiStore Perú',
    description:
      'Hubs por modelo Ricoh: IM 550F, IM 430F, IM C300F, IM C320F y más. Compra con Distribuidor Autorizado HaiStore.',
    canonical: buildAbsoluteUrl('/modelos'),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd: [
      buildWebPageJsonLd(
        {
          pathname: '/modelos',
          pageName: 'Modelos Ricoh',
          description: 'Guías por modelo de multifuncionales Ricoh en HaiStore.',
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
          Modelos Ricoh destacados
        </h1>
        <p className="mt-4 text-muted-foreground">
          Fichas resumen con enlaces a productos en stock. Distribuidor Autorizado Ricoh en Perú.
        </p>
        <ul className="mt-8 space-y-3">
          {SEO_MODEL_HUBS.map((hub) => (
            <li key={hub.slug}>
              <Link
                to={modelHubPath(hub.slug)}
                className="text-lg font-medium text-red-600 underline-offset-4 hover:underline"
              >
                {hub.modelName}
              </Link>
              <p className="text-sm text-muted-foreground">{hub.lead}</p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
