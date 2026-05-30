import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';

import { ricohPublications } from '@/data/ricoh-publications';

export function GuidesSection() {
  return (
    <section aria-labelledby="ricoh-publicaciones-titulo" className="bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="ricoh-publicaciones-titulo"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Noticias y publicaciones RICOH
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-[0.95rem]">
            Lo más reciente de la marca Ricoh en 2026: innovación, sostenibilidad y actualidad
            corporativa.
          </p>
        </div>

        <Link
          to="/tienda"
          className="group inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ver todas las publicaciones
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-5">
        {ricohPublications.map((publication) => (
          <article
            key={publication.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={publication.image}
                alt={publication.imageAlt}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                {publication.tag}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              <h3 className="text-pretty text-sm font-bold leading-snug text-foreground sm:text-[0.95rem]">
                <Link
                  to={publication.href}
                  className="transition-colors hover:text-red-600 focus-visible:underline focus-visible:outline-none"
                >
                  {publication.title}
                </Link>
              </h3>

              <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                <time dateTime={publication.isoDate}>{publication.date}</time>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
