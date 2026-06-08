import { ServiceInfoboxGrid } from '@/components/service-infobox-cards';

export function NuestrasSolucionesSection() {
  return (
    <section
      aria-labelledby="nuestras-soluciones-titulo"
      className="border-y border-white/5 bg-neutral-950"
    >
      <div className="container py-10 sm:py-14">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-2" aria-hidden="true">
            <span className="h-px w-8 bg-red-600 sm:w-10" />
            <span className="size-2 rounded-full bg-red-600" />
            <span className="h-px w-8 bg-red-600 sm:w-10" />
          </div>
          <h2
            id="nuestras-soluciones-titulo"
            className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Nuestras Soluciones
          </h2>
          <p className="mt-3 text-pretty text-sm text-white/70 sm:text-base">
            Tecnología, soporte y servicios diseñados para impulsar la productividad de tu negocio.
          </p>
        </header>

        <ServiceInfoboxGrid />
      </div>
    </section>
  );
}
