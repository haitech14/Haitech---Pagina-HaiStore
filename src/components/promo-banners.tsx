import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Sparkles, Gamepad2 } from 'lucide-react';

const promos = [
  {
    icon: Tag,
    title: 'Hasta 30% de descuento',
    subtitle: 'en productos seleccionados',
    cta: 'Ver ofertas',
    to: '/tienda',
  },
  {
    icon: Sparkles,
    title: 'Lo más nuevo en tecnología',
    subtitle: 'Descubre los últimos lanzamientos',
    cta: 'Descubrir novedades',
    to: '/tienda',
  },
  {
    icon: Gamepad2,
    title: 'Arma tu setup ideal',
    subtitle: 'y lleva tu juego al máximo',
    cta: 'Ver combos',
    to: '/tienda',
  },
] as const;

export function PromoBanners() {
  return (
    <section aria-label="Promociones" className="grid gap-4 md:grid-cols-3">
      {promos.map((promo) => (
        <div
          key={promo.title}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-6 text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-red-600/30 blur-3xl"
          />
          <promo.icon className="mb-4 size-8 text-red-500" aria-hidden="true" />
          <h3 className="text-xl font-bold">{promo.title}</h3>
          <p className="mt-1 text-sm text-white/70">{promo.subtitle}</p>
          <Link
            to={promo.to}
            className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {promo.cta}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      ))}
    </section>
  );
}
