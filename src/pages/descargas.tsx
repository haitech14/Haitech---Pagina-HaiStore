import { Download } from 'lucide-react';

import { SupportDownloadsGrid } from '@/components/downloads/support-downloads-grid';
import { useSeo } from '@/hooks/use-seo';
import {
  SUPPORT_DOWNLOADS_INTRO,
  SUPPORT_DOWNLOAD_ITEMS,
} from '@/data/support-downloads';
import { buildAbsoluteUrl } from '@/lib/site-url';

export function DescargasPage() {
  useSeo({
    title: 'Descargas | HaiTech',
    description: SUPPORT_DOWNLOADS_INTRO.description,
    canonical: buildAbsoluteUrl('/descargas'),
    robots: 'index,follow',
  });

  return (
    <div className="flex flex-col">
      <section
        aria-labelledby="descargas-titulo"
        className="border-b border-border/60 bg-muted/20"
      >
        <div className="container py-8 sm:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground/5 text-foreground"
              aria-hidden="true"
            >
              <Download className="size-7" strokeWidth={1.75} />
            </div>
            <h1
              id="descargas-titulo"
              className="text-balance text-2xl font-bold text-foreground sm:text-3xl"
            >
              {SUPPORT_DOWNLOADS_INTRO.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
              {SUPPORT_DOWNLOADS_INTRO.description}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="descargas-lista-titulo" className="py-8 sm:py-10">
        <div className="container">
          <h2 id="descargas-lista-titulo" className="sr-only">
            Listado de utilidades
          </h2>
          <SupportDownloadsGrid items={SUPPORT_DOWNLOAD_ITEMS} />
          <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
            Si tienes problemas con la descarga, escríbenos por{' '}
            <a href="/contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
              contacto
            </a>{' '}
            o WhatsApp.
          </p>
        </div>
      </section>
    </div>
  );
}
