import { Link } from 'react-router-dom';
import { Building2, MapPin, Printer, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSeo } from '@/hooks/use-seo';
import { categoryLandingPath } from '@/lib/category-path';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildOrganizationJsonLd, buildWebPageJsonLd } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

const PATHNAME = '/sobre-nosotros';
const PAGE_TITLE = 'Sobre Nosotros | Haitech';
const PAGE_DESCRIPTION =
  'Haitech es Distribuidor Autorizado Ricoh en Perú. Conoce quiénes somos: venta y alquiler de fotocopiadoras e impresoras, tóner y soporte técnico desde Lima.';

const SECTIONS = [
  {
    icon: Building2,
    title: 'Quiénes somos',
    body: 'Haitech es el canal de impresión de empresas en Perú. Comercializamos fotocopiadoras e impresoras Ricoh con asesoría de modelo, stock real y postventa especializada — no un intermediario genérico.',
  },
  {
    icon: ShieldCheck,
    title: 'Distribuidor Autorizado Ricoh',
    body: 'Operamos como Distribuidor Autorizado Ricoh: equipos, tóner y repuestos con respaldo de canal, garantía documentada y técnicos que conocen la marca.',
  },
  {
    icon: Printer,
    title: 'Fotocopiadoras e impresoras',
    body: 'Venta y alquiler de multifuncionales e impresoras láser nuevas, seminuevas y remanufacturadas. Te ayudamos a dimensionar volumen, color y formato A4/A3.',
  },
  {
    icon: MapPin,
    title: 'Presencia en Lima y cobertura nacional',
    body: 'Atención comercial desde Av. Petit Thouars 1935, Lince (Lima), con envío e instalación en Lima Metropolitana y despacho de equipos e insumos a todo el Perú.',
  },
] as const;

export function SobreNosotrosPage() {
  const jsonLd = [
    buildWebPageJsonLd(
      {
        pathname: PATHNAME,
        pageName: 'Sobre Nosotros',
        description: PAGE_DESCRIPTION,
      },
      SITE_ORIGIN,
    ),
    buildOrganizationJsonLd(SITE_ORIGIN),
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
        <p className="text-sm font-medium text-red-600">Haitech · Empresa</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Sobre Nosotros
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Somos <strong>Haitech</strong>, <strong>Distribuidor Autorizado Ricoh</strong> en Perú.
          Acompañamos a empresas que necesitan <strong>fotocopiadoras</strong> e{' '}
          <strong>impresoras</strong> con venta, alquiler, tóner y soporte técnico en un solo canal.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="flex gap-4">
                <span
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f1f3d]">{section.title}</h2>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {section.body}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-10 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Explora{' '}
          <Link
            to="/distribuidor-autorizado-ricoh"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Distribuidor Autorizado Ricoh
          </Link>
          ,{' '}
          <Link
            to="/fotocopiadoras-ricoh"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            fotocopiadoras
          </Link>
          ,{' '}
          <Link
            to={categoryLandingPath('impresoras')}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            impresoras
          </Link>{' '}
          o el{' '}
          <Link to="/tienda" className="font-medium text-primary underline-offset-4 hover:underline">
            catálogo de productos
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
              Hablar con un asesor
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/tienda">Nuestros Productos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contacto">Contacto</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
