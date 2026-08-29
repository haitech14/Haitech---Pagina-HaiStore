import { Link } from 'react-router-dom';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import { cn } from '@/lib/utils';

const CATALOG_BOXES = [
  {
    id: 'nuevos',
    title: 'Catálogo Nuevos',
    subtitle: 'Última tecnología para tu empresa.',
    image: '/catalog/haitech-home/catalogo-nuevos.png',
    to: storeShowcasePath({ categoryId: 'multifuncionales', condition: 'nuevas' }),
  },
  {
    id: 'seminuevos',
    title: 'Catálogo Seminuevos',
    subtitle: 'Equipos verificados y garantizados.',
    image: '/catalog/haitech-home/catalogo-seminuevos.png',
    to: storeShowcasePath({ categoryId: 'multifuncionales', condition: 'seminuevas' }),
  },
  {
    id: 'remanufacturado',
    title: 'Catálogo Remanufacturado',
    subtitle: 'Rendimiento y ahorro para tu negocio.',
    image: '/catalog/haitech-home/catalogo-remanufacturado.png',
    to: storeShowcasePath({ categoryId: 'multifuncionales', condition: 'remanufacturadas' }),
  },
] as const;

/** Tres banners de catálogo — mismo ancho y altura visual que el hero principal. */
export function HaitechHomeBrandIntro({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white px-3 pb-2 pt-2 sm:px-4 sm:pb-2.5 sm:pt-3 lg:px-5', className)}
      aria-labelledby="haitech-brand-intro-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-3 sm:mb-4">
          <h2
            id="haitech-brand-intro-title"
            className="flex items-center gap-2.5 font-[family-name:var(--font-infobox)] text-[20px] font-bold text-[#111111] sm:text-[24px] lg:text-[26px]"
          >
            <span
              className="inline-block h-6 w-1 shrink-0 rounded-full bg-[#E30613]"
              aria-hidden="true"
            />
            Nuestros equipos
          </h2>
        </header>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
          {CATALOG_BOXES.map((box) => (
            <li key={box.id}>
              <Link
                to={box.to}
                aria-label={box.title}
                className={cn(
                  'group relative block w-full overflow-hidden rounded-lg bg-neutral-100 shadow-[0_8px_28px_rgba(15,23,42,0.08)]',
                  'aspect-[2172/724]',
                  'sm:rounded-xl',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
              >
                <img
                  src={box.image}
                  alt={`${box.title}. ${box.subtitle}`}
                  width={2172}
                  height={724}
                  className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
