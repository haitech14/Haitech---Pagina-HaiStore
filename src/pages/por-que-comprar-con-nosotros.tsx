import { Link } from 'react-router-dom';
import { Award, Headphones, MapPin, ShieldCheck, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSeo } from '@/hooks/use-seo';
import { categoryLandingPath } from '@/lib/category-path';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildOrganizationJsonLd, buildWebPageJsonLd } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

const PAGE_TITLE = 'Por qué comprar con nosotros | Distribuidor Autorizado Ricoh | HaiStore';
const PAGE_DESCRIPTION =
  'Distribuidor Autorizado Ricoh en Perú: venta y alquiler de fotocopiadoras, tóner, repuestos, cobertura nacional y soporte técnico especializado.';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Distribuidor Autorizado Ricoh',
    body: 'Equipos, tóner y repuestos con respaldo oficial. Asesoría comercial y técnica para elegir la fotocopiadora o multifuncional correcta según tu volumen de impresión.',
  },
  {
    icon: Award,
    title: 'Garantía y equipos revisados',
    body: 'Nuevos con garantía de fábrica; seminuevos y remanufacturados con inspección técnica, prueba de impresión y garantía documentada según modelo.',
  },
  {
    icon: Truck,
    title: 'Envío e instalación en Perú',
    body: 'Delivery en Lima Metropolitana y envíos a provincia. Coordinamos instalación y puesta en marcha de multifuncionales e impresoras Ricoh.',
  },
  {
    icon: Headphones,
    title: 'Soporte técnico especializado',
    body: 'Mantenimiento preventivo y correctivo, firmware, repuestos originales y compatibles. Mantén tu flota operativa con técnicos que conocen Ricoh.',
  },
  {
    icon: MapPin,
    title: 'Presencia en Lima y cobertura nacional',
    body: 'Atención comercial desde Av. Petit Thouars 1935, Lince (Lima), con alcance a empresas en todo el Perú. Cotiza venta o alquiler según tu ciudad.',
  },
] as const;

export function PorQueComprarConNosotrosPage() {
  const jsonLd = [
    buildWebPageJsonLd(
      {
        pathname: '/por-que-comprar-con-nosotros',
        pageName: 'Por qué comprar con nosotros',
        description: PAGE_DESCRIPTION,
      },
      SITE_ORIGIN,
    ),
    buildOrganizationJsonLd(SITE_ORIGIN),
  ];

  useSeo({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: buildAbsoluteUrl('/por-que-comprar-con-nosotros'),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd,
  });

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-red-600">HaiStore · Confianza</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Por qué comprar o alquilar con nosotros
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          En HaiStore (HaiTech) ayudamos a empresas a comprar y alquilar fotocopiadoras Ricoh con
          stock real, precios claros y soporte postventa. Somos Distribuidor Autorizado: no solo
          vendemos equipos; acompañamos tóner, repuestos y servicio técnico para que tu impresión no
          se detenga.
        </p>

        <div className="mt-10 space-y-8">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <section key={reason.title} className="flex gap-4">
                <span
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f1f3d]">{reason.title}</h2>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {reason.body}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-10 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Explora{' '}
          <Link
            to={categoryLandingPath('multifuncionales')}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            fotocopiadoras y multifuncionales
          </Link>
          ,{' '}
          <Link
            to={categoryLandingPath('toner-suministros')}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            tóner y suministros
          </Link>{' '}
          o{' '}
          <Link
            to={serviceHubPath('alquiler')}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            planes de alquiler
          </Link>
          . Si prefieres hablar con un asesor, escríbenos por WhatsApp con el modelo o el volumen de
          páginas mensuales.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
              Hablar con un asesor
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/tienda">Ver catálogo</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
