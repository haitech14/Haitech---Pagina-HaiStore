import { StorePrefetchLink } from '@/components/store-prefetch-link';
import { cn } from '@/lib/utils';

const STRIP_BANNER_ASPECT = 'aspect-[2172/724]';
const GRID_GAP_CLASS = 'gap-2.5 sm:gap-3';

const HOME_QUICK_ACTIONS = [
  {
    id: 'comprar',
    title: 'Comprar equipo',
    href: '/tienda',
    image: '/home/quick-actions/comprar-equipo.png',
    imageAlt: 'Comprar equipos — Explora impresoras y fotocopiadoras listas para entrega.',
  },
  {
    id: 'alquilar',
    title: 'Alquilar equipo',
    href: '/servicios?seccion=alquiler',
    image: '/home/quick-actions/alquilar-equipo.png',
    imageAlt: 'Alquiler de equipos — Planes flexibles para oficina con soporte incluido.',
  },
  {
    id: 'servicio',
    title: 'Soporte técnico',
    href: '/servicios?seccion=servicio-tecnico',
    image: '/home/quick-actions/servicio-tecnico.png',
    imageAlt: 'Soporte técnico — Atención especializada para diagnóstico y mantenimiento.',
  },
] as const;

const stripLinkBaseClass =
  'group relative block w-full overflow-hidden rounded-xl bg-[#F8F9FA] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2';

const bannerImageClass =
  'absolute inset-0 h-full w-full rounded-xl object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]';

export function HomeHeroPromoStrip() {
  return (
    <section
      aria-label="Accesos rápidos de servicios"
      className="home-landing-sans relative z-20 bg-[#F8F9FA]"
    >
      <div className="container pb-2 pt-1 sm:pb-3 sm:pt-1.5">
        <ul
          className={cn(
            'grid grid-cols-1 items-stretch min-[480px]:grid-cols-3',
            GRID_GAP_CLASS,
          )}
          role="list"
          aria-label="Accesos rápidos de servicios"
        >
          {HOME_QUICK_ACTIONS.map((action, index) => (
            <li key={action.id} className="min-w-0">
              <StorePrefetchLink
                to={action.href}
                className={cn(stripLinkBaseClass, STRIP_BANNER_ASPECT)}
                aria-label={action.imageAlt}
              >
                <img
                  src={action.image}
                  alt=""
                  className={bannerImageClass}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  {...(index === 0 ? { fetchPriority: 'high' as const } : {})}
                  decoding="async"
                />
                <span className="sr-only">{action.title}</span>
              </StorePrefetchLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
