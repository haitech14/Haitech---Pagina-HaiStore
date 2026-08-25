import { Link } from 'react-router-dom';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { categoryPathWithCondition } from '@/lib/category-path';
import { cn } from '@/lib/utils';

const CATALOG_BOXES = [
  {
    id: 'nuevos',
    title: 'Catálogo Nuevos',
    image: '/A1.png',
    to: categoryPathWithCondition('multifuncionales', 'originales'),
  },
  {
    id: 'seminuevos',
    title: 'Catálogo Seminuevos',
    image: '/A2.png',
    to: categoryPathWithCondition('multifuncionales', 'compatibles'),
  },
  {
    id: 'remanufacturado',
    title: 'Catálogo Remanufacturado',
    image: '/A3.png',
    to: categoryPathWithCondition('multifuncionales', 'remanufacturados'),
  },
] as const;

/** Tres infoboxes de catálogo (nuevos / seminuevos / remanufacturado). */
export function HaitechHomeBrandIntro({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white px-4 pb-6 pt-3 sm:px-6', className)}
      aria-label="Catálogos por condición de equipo"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.maxWidth }}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {CATALOG_BOXES.map((box) => (
            <li key={box.id}>
              <Link
                to={box.to}
                aria-label={box.title}
                className={cn(
                  'group relative block aspect-[8/3] w-full overflow-hidden rounded-xl bg-white',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
              >
                <img
                  src={box.image}
                  alt={box.title}
                  width={2048}
                  height={768}
                  className="size-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
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
