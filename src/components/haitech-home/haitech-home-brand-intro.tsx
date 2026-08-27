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
    objectPosition: 'object-center',
  },
  {
    id: 'remanufacturado',
    title: 'Catálogo Remanufacturado',
    image: '/A3.png',
    to: categoryPathWithCondition('multifuncionales', 'remanufacturados'),
    objectPosition: 'object-[62%_center]',
  },
  {
    id: 'seminuevos',
    title: 'Catálogo Seminuevos',
    image: '/A2.png',
    to: categoryPathWithCondition('multifuncionales', 'compatibles'),
    objectPosition: 'object-center',
  },
] as const;

/** Tres banners de catálogo — mismo ancho y altura visual que el hero principal. */
export function HaitechHomeBrandIntro({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white px-3 pb-2 pt-2 sm:px-4 sm:pb-2.5 sm:pt-3 lg:px-5', className)}
      aria-label="Catálogos por condición de equipo"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
          {CATALOG_BOXES.map((box) => (
            <li key={box.id}>
              <Link
                to={box.to}
                aria-label={box.title}
                className={cn(
                  'group relative block w-full overflow-hidden rounded-lg bg-neutral-100 shadow-[0_8px_28px_rgba(15,23,42,0.08)]',
                  'h-[110px] min-h-[100px]',
                  'sm:h-[160px] sm:min-h-[140px] sm:rounded-xl',
                  'lg:h-[200px] lg:min-h-[180px]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
              >
                <img
                  src={box.image}
                  alt={box.title}
                  width={2048}
                  height={768}
                  className={cn(
                    'size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
                    box.objectPosition,
                  )}
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
