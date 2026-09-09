import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { RENTAL_CATALOG_MACHINES } from '@/data/rental-landing-models';
import { formatRentalPen } from '@/data/rental-landing-pricing';
import { categoryLandingPath } from '@/lib/category-path';

export function RentalMachinesSection() {
  return (
    <section aria-labelledby="rental-machines-title" className="bg-white py-12 sm:py-16">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E30613]">
              Nuestros equipos
            </p>
            <h2 id="rental-machines-title" className="mt-1 text-2xl font-bold text-[#111111] sm:text-3xl">
              Equipos RICOH en alquiler
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7280] sm:text-base">
              Soluciones para cada tipo de negocio. Equipos confiables, eficientes y listos para tu
              operación.
            </p>
          </div>
          <Link
            to={categoryLandingPath('multifuncionales')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E30613] hover:underline"
          >
            Ver todo el catálogo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {RENTAL_CATALOG_MACHINES.map((machine) => (
            <li key={machine.id}>
              <article className="flex h-full flex-col rounded-2xl border border-[#E7E7E7] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="mx-auto h-36 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="mt-4 text-base font-bold text-[#111111]">{machine.name}</h3>
                <p className="text-sm text-[#6B7280]">{machine.description}</p>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {machine.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] text-[#374151]">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#E30613]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-[#6B7280]">
                  Desde{' '}
                  <span className="text-lg font-bold text-[#111111]">
                    {formatRentalPen(machine.fromMonthlyPen)}
                  </span>{' '}
                  / mes
                </p>
                <Link
                  to={machine.href}
                  className="mt-3 inline-flex h-11 min-h-11 items-center justify-center gap-1 rounded-xl border border-[#E7E7E7] text-sm font-semibold text-[#111111] hover:border-[#E30613] hover:text-[#E30613]"
                >
                  Ver detalles
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
