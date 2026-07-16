import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { HOME_FAQ_ITEMS } from '@/data/home-faq';
import { useSeo } from '@/hooks/use-seo';
import { categoryLandingPath } from '@/lib/category-path';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildFaqPageJsonLd, buildOrganizationJsonLd } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

const PAGE_TITLE = 'Preguntas frecuentes | Fotocopiadoras Ricoh | HaiStore';
const PAGE_DESCRIPTION =
  'Respuestas sobre venta y alquiler de fotocopiadoras Ricoh, garantía, delivery, tóner, repuestos y soporte técnico. Distribuidor Autorizado en Perú.';

export function PreguntasFrecuentesPage() {
  const jsonLd = useMemo(() => {
    const faq = buildFaqPageJsonLd();
    const org = buildOrganizationJsonLd(SITE_ORIGIN);
    return faq ? [faq, org] : [org];
  }, []);

  useSeo({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: buildAbsoluteUrl('/preguntas-frecuentes'),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd,
  });

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-red-600">HaiStore · Ayuda</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Preguntas frecuentes sobre fotocopiadoras Ricoh
        </h1>
        <div className="mt-4 space-y-4 text-pretty text-base leading-relaxed text-muted-foreground">
          <p>
            En esta página reunimos las dudas más frecuentes antes de comprar o alquilar
            fotocopiadoras e impresoras Ricoh con HaiStore (HaiTech), Distribuidor Autorizado en
            Perú. Aquí aclaramos garantía, delivery e instalación, factura electrónica, equipos
            seminuevos, tóner, repuestos y soporte técnico especializado.
          </p>
          <p>
            Si buscas{' '}
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
            o un{' '}
            <Link
              to={serviceHubPath('alquiler')}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              plan de alquiler
            </Link>
            , estas respuestas te ayudan a decidir con información clara. También puedes revisar{' '}
            <Link
              to="/por-que-comprar-con-nosotros"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              por qué comprar con nosotros
            </Link>{' '}
            o escribirnos por WhatsApp con el modelo y tu ciudad.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {HOME_FAQ_ITEMS.map((item) => (
            <section key={item.id} className="border-b border-border/60 pb-6 last:border-0">
              <h2 className="text-lg font-semibold text-[#0f1f3d]">{item.question}</h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.answer}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          ¿No encontraste tu duda? Cotiza venta o alquiler de equipos Ricoh, consulta stock de tóner
          y repuestos, o agenda soporte técnico. Atendemos empresas en Lima y enviamos a todo el
          Perú.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
              Cotizar por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to={serviceHubPath('alquiler')}>Ver alquiler de equipos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/tienda">Ir a la tienda</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
