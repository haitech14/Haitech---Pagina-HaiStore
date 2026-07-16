import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { HOME_FAQ_ITEMS } from '@/data/home-faq';
import { useSeo } from '@/hooks/use-seo';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { buildFaqPageJsonLd } from '@/lib/seo';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

const PAGE_TITLE = 'Preguntas frecuentes | Fotocopiadoras Ricoh | HaiStore';
const PAGE_DESCRIPTION =
  'Respuestas sobre venta y alquiler de fotocopiadoras Ricoh, garantía, delivery, tóner, repuestos y soporte técnico. Distribuidor Autorizado en Perú.';

export function PreguntasFrecuentesPage() {
  useSeo({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    canonical: buildAbsoluteUrl('/preguntas-frecuentes'),
    robots: 'index,follow',
    ogType: 'website',
    jsonLd: buildFaqPageJsonLd(),
  });

  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-red-600">HaiStore · Ayuda</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Preguntas frecuentes
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Todo lo que necesitas saber antes de comprar o alquilar fotocopiadoras e impresoras Ricoh
          con HaiStore, Distribuidor Autorizado en Perú: garantía, envíos, instalación, factura y
          soporte técnico.
        </p>

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

        <div className="mt-10 flex flex-wrap gap-3">
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
