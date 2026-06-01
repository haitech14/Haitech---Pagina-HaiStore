import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { clients, type Client } from '@/data/clients';
import { cn } from '@/lib/utils';

function ClientCard({ client }: { client: Client }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <article className="flex h-full flex-col items-center rounded-xl bg-white px-4 py-8 shadow-[0_4px_24px_rgba(15,23,42,0.07)] sm:px-5 sm:py-9">
      <div className="flex size-20 items-center justify-center rounded-full bg-red-600 sm:size-[5.5rem]">
        <div className="flex size-[calc(100%-6px)] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white">
          {!logoError ? (
            <img
              src={client.logo}
              alt=""
              className="size-full object-contain p-1.5"
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-red-600 text-lg font-bold text-white">
              {client.initials}
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-5 text-center text-sm font-bold leading-snug text-neutral-700 sm:text-[0.95rem]">
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
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
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

        <div className="flex flex-col gap-6">
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="flex touch-pan-y gap-4 sm:gap-5">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_calc((100%-5rem)/6)]"
                >
                  <ClientCard client={client} />
                </li>
              ))}
            </ul>
          </div>

          {scrollSnaps.length > 1 && (
            <div
              className="flex items-center justify-center gap-2"
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
