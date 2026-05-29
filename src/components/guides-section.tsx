import { Link } from 'react-router-dom';

import { SectionHeading } from '@/components/section-heading';
import { guides } from '@/data/guides';

export function GuidesSection() {
  return (
    <section aria-labelledby="guias-titulo">
      <SectionHeading title="Guías y novedades" linkLabel="Ver todas las publicaciones" />
      <span id="guias-titulo" className="sr-only">
        Guías y novedades
      </span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <article
            key={guide.id}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-black">
              <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {guide.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-semibold leading-snug">
                <Link
                  to="/"
                  className="transition-colors group-hover:text-red-600 focus-visible:underline focus-visible:outline-none"
                >
                  {guide.title}
                </Link>
              </h3>
              <p className="mt-auto text-xs text-muted-foreground">{guide.date}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
