import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, Printer, Settings2, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSeo } from '@/hooks/use-seo';
import { categoryLandingPath } from '@/lib/category-path';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

const PATHNAME = '/distribuidor-autorizado-ricoh';

const PAGE_TITLE = 'Distribuidor Autorizado Ricoh | Haitech';
const PAGE_DESCRIPTION =
  'Haitech es Distribuidor Autorizado Ricoh en Perú. Compra o alquila fotocopiadoras, impresoras, tóner original y repuestos con garantía, instalación en Lima y envío nacional.';

const CLUSTERS = [
  {
    icon: Printer,
    title: 'Fotocopiadoras e impresoras Ricoh',
    body: 'Multifuncionales A4/A3 nuevas, seminuevas y remanufacturadas para oficina y producción. Asesoría según páginas mensuales, color y formato.',
    to: categoryLandingPath('multifuncionales'),
    cta: 'Ver fotocopiadoras',
  },
  {
    icon: Settings2,
    title: 'Tóner y repuestos',
    body: 'Tóner original y compatible, unidades de imagen, fusores y recambios para mantener tu flota Ricoh operativa sin paradas.',
    to: categoryLandingPath('toner-suministros'),
    cta: 'Ver tóner y suministros',
  },
  {
    icon: Truck,
    title: 'Alquiler y cobertura nacional',
    body: 'Planes mensuales con mantenimiento y tóner según contrato. Delivery en Lima e instalación; envío de equipos e insumos a todo el Perú.',
    to: serviceHubPath('alquiler'),
    cta: 'Cotizar alquiler',
  },
  {
    icon: Building2,
    title: 'Soporte técnico especializado',
    body: 'Técnicos Ricoh para diagnóstico, mantenimiento preventivo y correctivo. Atención comercial desde Lince, Lima, con alcance a empresas en provincia.',
    to: serviceHubPath('servicio-tecnico'),
    cta: 'Servicio técnico',
  },
] as const;

const LANDING_FAQ = [
  {
    id: 'que-es-distribuidor',
    question: '¿Qué significa ser Distribuidor Autorizado Ricoh?',
    answer:
      'Significa que HaiStore (HaiTech) comercializa equipos, tóner y repuestos Ricoh con respaldo de canal autorizado en Perú: garantía, asesoría de modelo y soporte técnico especializado, no un intermediario genérico.',
  },
  {
    id: 'donde-comprar',
    question: '¿Dónde comprar fotocopiadora, impresora o tóner Ricoh en Perú?',
    answer:
      'En HaiStore puedes cotizar y comprar online fotocopiadoras, impresoras láser, tóner y repuestos Ricoh, con envío a Lima y provincias. También atendemos empresas por WhatsApp y en Av. Petit Thouars 1935, Lince.',
  },
  {
    id: 'repuestos-y-toner',
    question: '¿Venden tóner original y repuestos Ricoh?',
    answer:
      'Sí. Ofrecemos tóner original y compatible, tintas y repuestos (unidades de imagen, cilindros, fusores y más) con asesoría para el código correcto según tu modelo de fotocopiadora o impresora.',
  },
];

export function DistribuidorAutorizadoRicohPage() {
  const faq = buildFaqPageJsonLd(LANDING_FAQ);
  const breadcrumbs = buildBreadcrumbJsonLd(
    [
      { label: 'Inicio', href: '/' },
      { label: 'Distribuidor Autorizado Ricoh', href: PATHNAME },
    ],
    SITE_ORIGIN,
  );
  const jsonLd = [
    buildWebPageJsonLd(
      {
        pathname: PATHNAME,
        pageName: 'Distribuidor Autorizado Ricoh en Perú',
        description: PAGE_DESCRIPTION,
      },
      SITE_ORIGIN,
    ),
    buildOrganizationJsonLd(SITE_ORIGIN),
    ...(breadcrumbs ? [breadcrumbs] : []),
    ...(faq ? [faq] : []),
  ];

  useSeo({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: buildAbsoluteUrl(PATHNAME),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd,
  });

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
          <BadgeCheck className="size-4" aria-hidden="true" />
          Canal autorizado · Perú
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Distribuidor Autorizado Ricoh
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          HaiStore es el canal de <strong>HaiTech</strong> para empresas que buscan{' '}
          <strong>fotocopiadora</strong>, <strong>impresora</strong>, <strong>tóner</strong> y{' '}
          <strong>repuesto</strong> Ricoh con stock, precio claro y postventa. Como{' '}
          <strong>Distribuidor Autorizado Ricoh</strong> te ayudamos a comprar o alquilar el equipo
          correcto y a reponer consumibles sin detener la impresión.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CLUSTERS.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <section
                key={cluster.title}
                className="rounded-xl border border-border/70 bg-white p-5 shadow-sm"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <h2 className="mt-3 text-lg font-semibold text-[#0f1f3d]">{cluster.title}</h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {cluster.body}
                </p>
                <Link
                  to={cluster.to}
                  className="mt-3 inline-block text-sm font-medium text-red-600 underline-offset-4 hover:underline"
                >
                  {cluster.cta}
                </Link>
              </section>
            );
          })}
        </div>

        <section className="mt-12" aria-labelledby="autorizado-faq-heading">
          <h2 id="autorizado-faq-heading" className="text-xl font-semibold text-[#0f1f3d]">
            Preguntas frecuentes
          </h2>
          <dl className="mt-4 space-y-5">
            {LANDING_FAQ.map((item) => (
              <div key={item.id}>
                <dt className="font-medium text-[#0f1f3d]">{item.question}</dt>
                <dd className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          También puedes leer{' '}
          <Link
            to="/por-que-comprar-con-nosotros"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            por qué comprar con nosotros
          </Link>
          , explorar el{' '}
          <Link to="/tienda" className="font-medium text-primary underline-offset-4 hover:underline">
            catálogo Ricoh
          </Link>{' '}
          o{' '}
          <Link
            to="/contacto"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            contactar ventas
          </Link>{' '}
          con el modelo de tu fotocopiadora o el código de tóner.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
              Cotizar por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to={categoryLandingPath('repuestos')}>Ver repuestos Ricoh</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
