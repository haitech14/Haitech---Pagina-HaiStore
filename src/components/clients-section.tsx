import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { clients, type Client } from '@/data/clients';
import { cn } from '@/lib/utils';

function ClientCard({ client }: { client: Client }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <article className="flex h-full flex-col items-center rounded-lg bg-white px-2.5 py-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)] sm:px-3 sm:py-5">
      <div className="flex size-12 items-center justify-center rounded-full bg-red-600 ring-2 ring-red-600/20 sm:size-14">
        <div className="flex size-[calc(100%-4px)] items-center justify-center overflow-hidden rounded-full border border-white bg-white">
          {!logoError ? (
            <img
              src={client.logo}
              alt=""
              className="size-full object-contain p-1"
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-red-600 text-xs font-bold text-white sm:text-sm">
              {client.initials}
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-center text-[0.7rem] font-bold leading-snug text-neutral-700 sm:mt-3 sm:text-xs">
        {client.name}
      </h3>
    </article>
  );
}

export function ClientsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    updateSnaps();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateSnaps);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateSnaps);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      aria-labelledby="clientes-titulo"
      className="relative overflow-hidden bg-background py-12 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-1/2 size-64 -translate-y-1/2 rounded-full bg-neutral-100/80 blur-3xl"
      />

      <div className="container relative">
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-8 bg-sky-400 sm:w-12" aria-hidden="true" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-500 sm:text-xs">
              Empresas que confían en nosotros
            </p>
            <span className="h-px w-8 bg-sky-400 sm:w-12" aria-hidden="true" />
          </div>

          <h2
            id="clientes-titulo"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl lg:text-[2rem]"
          >
            Algunos de nuestros clientes
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Trabajamos junto a organizaciones líderes que confían en nuestro equipo para impulsar su
            crecimiento y transformación digital.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="flex touch-pan-y gap-2 sm:gap-2.5 md:gap-3">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="min-w-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-1.25rem)/3)] md:flex-[0_0_calc((100%-2.25rem)/4)] lg:flex-[0_0_calc((100%-3rem)/5)] xl:flex-[0_0_calc((100%-3.75rem)/6)]"
                >
                  <ClientCard client={client} />
                </li>
              ))}
            </ul>
          </div>

          {scrollSnaps.length > 1 && (
            <div
              className="flex items-center justify-center gap-1.5"
              role="tablist"
              aria-label="Paginación de clientes"
            >
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Ir al grupo ${index + 1} de clientes`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                    index === selectedIndex ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
